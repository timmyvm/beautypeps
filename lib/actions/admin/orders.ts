"use server";

import { and, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { AU_STATES, ORDER_STATUSES } from "@/lib/constants";
import { db } from "@/lib/db";
import { orderEvents, orderItems, orders, products } from "@/lib/db/schema";
import { orderConfirmationEmail, orderStatusEmail, sendEmail } from "@/lib/email";
import { getSettings } from "@/lib/settings";
import { allowedTransitions } from "@/lib/queries/admin-ops";
import { fieldErrors, type FormState } from "@/lib/utils";

const transitionSchema = z.object({
  orderId: z.string().min(1),
  to: z.enum(["paid", "processing", "shipped", "delivered", "cancelled", "refunded"]),
  notify: z.boolean(),
  restock: z.boolean(),
  trackingCarrier: z.string().trim().max(60).optional(),
  trackingNumber: z.string().trim().max(60).optional(),
});

async function restockOrder(orderId: string, actor: string) {
  const already = await db.query.orderEvents.findFirst({
    where: and(eq(orderEvents.orderId, orderId), eq(orderEvents.type, "restock")),
  });
  if (already) return false;
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  for (const item of items) {
    if (!item.productId) continue;
    await db
      .update(products)
      .set({ stock: sql`${products.stock} + ${item.quantity}` })
      .where(eq(products.id, item.productId));
  }
  await db.insert(orderEvents).values({
    orderId,
    type: "restock",
    message: `Restocked ${items.reduce((s, i) => s + i.quantity, 0)} units`,
    visibleToCustomer: false,
    actor,
  });
  return true;
}

async function emailCustomer(orderId: string, actor: string) {
  const [order, settings] = await Promise.all([db.query.orders.findFirst({ where: eq(orders.id, orderId) }), getSettings()]);
  if (!order) return;
  const email = orderStatusEmail(order, settings);
  const result = await sendEmail({ to: order.email, ...email });
  await db.insert(orderEvents).values({
    orderId,
    type: "email",
    message: `Email ${result.status === "failed" ? "failed" : "sent"}: “${email.subject}”`,
    visibleToCustomer: false,
    actor,
  });
}

export async function updateOrderStatusAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const parsed = transitionSchema.safeParse({
    orderId: formData.get("orderId"),
    to: formData.get("to"),
    notify: formData.get("notify") === "on",
    restock: formData.get("restock") === "on",
    trackingCarrier: formData.get("trackingCarrier") ?? undefined,
    trackingNumber: formData.get("trackingNumber") ?? undefined,
  });
  if (!parsed.success) return { ok: false, message: "Invalid request.", errors: fieldErrors(parsed.error.issues) };
  const { orderId, to, notify, restock, trackingCarrier, trackingNumber } = parsed.data;

  const order = await db.query.orders.findFirst({ where: eq(orders.id, orderId) });
  if (!order) return { ok: false, message: "Order not found." };
  if (!allowedTransitions(order).includes(to)) {
    return { ok: false, message: `Can't move an order from “${ORDER_STATUSES[order.status].label}” to “${ORDER_STATUSES[to].label}”.` };
  }

  const now = new Date();
  const patch: Partial<typeof orders.$inferInsert> = {};
  let message = "";

  switch (to) {
    case "paid":
      patch.paymentStatus = "paid";
      patch.paidAt = now;
      patch.status = "paid";
      message = "Payment received — thank you! Your order is queued for packing.";
      break;
    case "processing":
      patch.status = "processing";
      message = "Your order is being packed.";
      break;
    case "shipped": {
      if (!trackingNumber) return { ok: false, message: "Add a tracking number.", errors: { trackingNumber: "Required" } };
      const carrier = trackingCarrier || "Australia Post";
      patch.status = "shipped";
      patch.shippedAt = now;
      patch.trackingCarrier = carrier;
      patch.trackingNumber = trackingNumber;
      message = `Shipped with ${carrier} — tracking number ${trackingNumber}.`;
      break;
    }
    case "delivered":
      patch.status = "delivered";
      patch.deliveredAt = now;
      message = "Delivered. Enjoy your peptides!";
      break;
    case "cancelled":
      patch.status = "cancelled";
      patch.cancelledAt = now;
      message = "Order cancelled.";
      break;
    case "refunded":
      patch.status = "refunded";
      patch.paymentStatus = "refunded";
      message = `Refund of the order total issued to your original payment method.`;
      break;
  }

  await db.update(orders).set(patch).where(eq(orders.id, orderId));
  await db.insert(orderEvents).values({
    orderId,
    type: to === "paid" ? "payment" : to === "shipped" ? "shipment" : "status",
    message,
    visibleToCustomer: true,
    actor: admin.email,
  });

  let restocked = false;
  if ((to === "cancelled" || to === "refunded") && restock) restocked = await restockOrder(orderId, admin.email);
  if (notify) await emailCustomer(orderId, admin.email);

  revalidatePath("/admin", "layout");
  return {
    ok: true,
    message: `Order marked “${ORDER_STATUSES[to].label}”${restocked ? ", items restocked" : ""}${notify ? ", customer emailed" : ""}.`,
  };
}

export async function updateTrackingAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const orderId = String(formData.get("orderId") ?? "");
  const trackingCarrier = String(formData.get("trackingCarrier") ?? "").trim() || "Australia Post";
  const trackingNumber = String(formData.get("trackingNumber") ?? "").trim();
  if (!trackingNumber) return { ok: false, message: "Add a tracking number.", errors: { trackingNumber: "Required" } };
  await db.update(orders).set({ trackingCarrier, trackingNumber }).where(eq(orders.id, orderId));
  await db.insert(orderEvents).values({
    orderId,
    type: "shipment",
    message: `Tracking updated: ${trackingCarrier} ${trackingNumber}`,
    visibleToCustomer: true,
    actor: admin.email,
  });
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Tracking updated." };
}

export async function resendConfirmationAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const orderId = String(formData.get("orderId") ?? "");
  const order = await db.query.orders.findFirst({ where: eq(orders.id, orderId), with: { items: true } });
  if (!order) return { ok: false, message: "Order not found." };
  const email = orderConfirmationEmail(order, order.items, await getSettings());
  const result = await sendEmail({ to: order.email, ...email });
  await db.insert(orderEvents).values({
    orderId,
    type: "email",
    message: `Order confirmation re-sent (${result.status})`,
    visibleToCustomer: false,
    actor: admin.email,
  });
  revalidatePath("/admin", "layout");
  return result.status === "failed"
    ? { ok: false, message: `Email failed: ${result.error ?? "unknown error"}` }
    : { ok: true, message: `Confirmation ${result.status === "sent" ? "sent" : "logged"} to ${order.email}.` };
}

export async function addOrderNoteAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const orderId = String(formData.get("orderId") ?? "");
  const message = String(formData.get("message") ?? "").trim();
  const visibleToCustomer = formData.get("visibleToCustomer") === "on";
  if (!message) return { ok: false, message: "Write a note first.", errors: { message: "Required" } };
  if (message.length > 2000) return { ok: false, message: "Notes are limited to 2000 characters." };
  await db.insert(orderEvents).values({ orderId, type: "note", message, visibleToCustomer, actor: admin.email });
  revalidatePath("/admin", "layout");
  return { ok: true, message: visibleToCustomer ? "Note added (visible to customer)." : "Internal note added." };
}

export async function updateAdminNoteAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const orderId = String(formData.get("orderId") ?? "");
  const adminNote = String(formData.get("adminNote") ?? "").trim().slice(0, 4000);
  await db
    .update(orders)
    .set({ adminNote: adminNote || null })
    .where(eq(orders.id, orderId));
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Admin note saved." };
}

const addressSchema = z.object({
  firstName: z.string().trim().min(1, "Required").max(60),
  lastName: z.string().trim().min(1, "Required").max(60),
  company: z.string().trim().max(80).optional(),
  line1: z.string().trim().min(1, "Required").max(80),
  line2: z.string().trim().max(80).optional(),
  suburb: z.string().trim().min(1, "Required").max(60),
  state: z.enum(AU_STATES, "Choose a state"),
  postcode: z.string().trim().regex(/^\d{4}$/, "4-digit postcode"),
  phone: z.string().trim().max(30).optional(),
});

export async function updateShippingAddressAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const orderId = String(formData.get("orderId") ?? "");
  const parsed = addressSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, message: "Please fix the highlighted fields.", errors: fieldErrors(parsed.error.issues) };
  }
  const a = parsed.data;
  await db
    .update(orders)
    .set({
      shippingAddress: {
        ...a,
        company: a.company || null,
        line2: a.line2 || null,
        phone: a.phone || null,
        country: "AU",
      },
    })
    .where(eq(orders.id, orderId));
  await db.insert(orderEvents).values({
    orderId,
    type: "note",
    message: "Shipping address updated",
    visibleToCustomer: false,
    actor: admin.email,
  });
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Shipping address updated." };
}

/** Bulk: move selected paid orders to "Packing" (used from the Australia Post export screen). */
export async function markOrdersPackingAction(formData: FormData) {
  const admin = await requireAdmin();
  const ids = formData
    .getAll("id")
    .map(String)
    .filter(Boolean)
    .slice(0, 500);
  let marked = 0;
  if (ids.length) {
    const rows = await db.query.orders.findMany({ where: inArray(orders.id, ids), columns: { id: true, status: true } });
    for (const row of rows) {
      if (row.status !== "paid") continue;
      await db.update(orders).set({ status: "processing" }).where(eq(orders.id, row.id));
      await db.insert(orderEvents).values({
        orderId: row.id,
        type: "status",
        message: "Your order is being packed.",
        visibleToCustomer: true,
        actor: admin.email,
      });
      marked++;
    }
  }
  revalidatePath("/admin", "layout");
  redirect(`/admin/orders/auspost?marked=${marked}`);
}
