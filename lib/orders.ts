import "server-only";

import { and, asc, count, eq, inArray, sql } from "drizzle-orm";
import { getCart } from "@/lib/cart";
import { db } from "@/lib/db";
import {
  addresses,
  discounts,
  orderEvents,
  orderItems,
  orders,
  products,
  type OrderAddress,
  type PaymentMethod,
  type ShippingMethod,
} from "@/lib/db/schema";
import { orderConfirmationEmail, sendEmail } from "@/lib/email";
import { computeTotals, validateDiscountCode } from "@/lib/pricing";
import { getSettings } from "@/lib/settings";

/** Set after checkout so a guest can view their confirmation page. */
export const LAST_ORDER_COOKIE = "bp_last_order";

export type PlaceOrderInput = {
  userId: string | null;
  email: string;
  address: OrderAddress;
  saveAddress: boolean;
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
  customerNote?: string | null;
};

export type PlaceOrderResult = { ok: true; orderNumber: string } | { ok: false; error: string };

class CheckoutError extends Error {}

const FIRST_ORDER_NUMBER = 10001;

async function nextOrderNumber(tx: Pick<typeof db, "select">) {
  const [row] = await tx
    .select({ max: sql<number | null>`max(cast(substr(${orders.orderNumber}, 3) as integer))` })
    .from(orders);
  const next = Math.max(FIRST_ORDER_NUMBER, (row?.max ?? 0) + 1);
  return `BP${next}`;
}

/**
 * Turn the current cart into an order. Prices, stock and discounts are re-read
 * from the database — nothing from the client is trusted except the form fields.
 */
export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const [cart, settings] = await Promise.all([getCart(), getSettings()]);
  if (cart.lines.length === 0) return { ok: false, error: "Your bag is empty." };
  const limited = cart.lines.find((l) => l.limited);
  if (limited) {
    return {
      ok: false,
      error: `Only ${limited.product.stock} of ${limited.product.name} left — please review your bag.`,
    };
  }

  let discount = null;
  if (cart.discountCode) {
    const check = await validateDiscountCode(cart.discountCode, cart.subtotal);
    if (check.ok) discount = check.discount;
  }

  const totals = computeTotals({
    subtotal: cart.subtotal,
    shippingMethod: input.shippingMethod,
    settings,
    discount,
  });

  const email = input.email.trim().toLowerCase();
  let orderNumber = "";
  let orderId = "";

  const MAX_ATTEMPTS = 6;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const result = await db.transaction(async (tx) => {
        const number = await nextOrderNumber(tx);

        const [order] = await tx
          .insert(orders)
          .values({
            orderNumber: number,
            userId: input.userId,
            email,
            status: "pending_payment",
            paymentStatus: "unpaid",
            paymentMethod: input.paymentMethod,
            shippingMethod: input.shippingMethod,
            subtotal: totals.subtotal,
            discountTotal: totals.discountTotal,
            shippingTotal: totals.shippingTotal,
            total: totals.total,
            gstTotal: totals.gstTotal,
            discountCode: discount?.code ?? null,
            shippingAddress: input.address,
            customerNote: input.customerNote || null,
          })
          .returning({ id: orders.id });

        await tx.insert(orderItems).values(
          cart.lines.map((l) => ({
            orderId: order.id,
            productId: l.product.id,
            name: l.product.name,
            sku: l.product.sku,
            image: l.product.image,
            size: l.product.size,
            unitPrice: l.product.price,
            quantity: l.quantity,
            lineTotal: l.lineTotal,
          })),
        );

        // Reserve stock; fail the whole order if anything sold out in the meantime.
        for (const line of cart.lines) {
          const updated = await tx
            .update(products)
            .set({ stock: sql`${products.stock} - ${line.quantity}` })
            .where(and(eq(products.id, line.product.id), sql`${products.stock} >= ${line.quantity}`))
            .returning({ id: products.id });
          if (updated.length === 0) {
            throw new CheckoutError(`Sorry — ${line.product.name} just sold out. Please review your bag.`);
          }
        }

        if (discount) {
          await tx
            .update(discounts)
            .set({ usedCount: sql`${discounts.usedCount} + 1` })
            .where(eq(discounts.id, discount.id));
        }

        await tx.insert(orderEvents).values({
          orderId: order.id,
          type: "created",
          message: "Order placed — awaiting payment",
          visibleToCustomer: true,
          actor: "customer",
        });

        if (input.userId && input.saveAddress) {
          const [{ n }] = await tx
            .select({ n: count() })
            .from(addresses)
            .where(eq(addresses.userId, input.userId));
          await tx.insert(addresses).values({
            userId: input.userId,
            label: n === 0 ? "Home" : "Shipping",
            firstName: input.address.firstName,
            lastName: input.address.lastName,
            company: input.address.company || null,
            line1: input.address.line1,
            line2: input.address.line2 || null,
            suburb: input.address.suburb,
            state: input.address.state,
            postcode: input.address.postcode,
            country: input.address.country,
            phone: input.address.phone || null,
            isDefault: n === 0,
          });
        }

        return { id: order.id, number };
      });
      orderNumber = result.number;
      orderId = result.id;
      break;
    } catch (err) {
      if (err instanceof CheckoutError) return { ok: false, error: err.message };
      const message = err instanceof Error ? `${err.message} ${String((err as { code?: string }).code ?? "")}` : String(err);
      const retryable =
        // Two orders raced for the same number.
        /UNIQUE constraint failed: orders\.order_number/i.test(message) ||
        // SQLite file locked by another writer (local dev) — back off and retry.
        /SQLITE_BUSY|database is locked/i.test(message);
      if (retryable && attempt < MAX_ATTEMPTS - 1) {
        await new Promise((r) => setTimeout(r, 120 * (attempt + 1)));
        continue;
      }
      console.error("[checkout] failed to place order", err);
      return { ok: false, error: "We couldn't place your order. Please try again." };
    }
  }

  // Confirmation email (outside the transaction — a mail failure must not lose the order).
  try {
    const order = await db.query.orders.findFirst({ where: eq(orders.id, orderId), with: { items: true } });
    if (order) {
      const mail = orderConfirmationEmail(order, order.items, settings);
      await sendEmail({ to: order.email, ...mail });
      await db.insert(orderEvents).values({
        orderId,
        type: "email",
        message: `Confirmation email sent to ${order.email}`,
        visibleToCustomer: false,
        actor: "system",
      });
    }
  } catch (err) {
    console.error("[checkout] confirmation email failed", err);
  }

  return { ok: true, orderNumber };
}

export function normaliseOrderNumber(input: string) {
  const cleaned = input.trim().toUpperCase().replace(/[\s#-]/g, "");
  if (/^\d+$/.test(cleaned)) return `BP${cleaned}`;
  return cleaned;
}

/** Full order with items and timeline. */
export async function getOrderByNumber(orderNumber: string) {
  const order = await db.query.orders.findFirst({
    where: eq(orders.orderNumber, normaliseOrderNumber(orderNumber)),
    with: {
      items: { orderBy: asc(orderItems.name) },
      events: { orderBy: asc(orderEvents.createdAt) },
    },
  });
  return order ?? null;
}

/** Guest order lookup — requires both the order number and the email used at checkout. */
export async function findOrderForTracking(orderNumber: string, email: string) {
  const order = await getOrderByNumber(orderNumber);
  if (!order) return null;
  if (order.email.toLowerCase() !== email.trim().toLowerCase()) return null;
  return order;
}

/** Has this user bought the product (paid or later)? Used for "verified purchase" reviews. */
export async function userHasPurchased(userId: string, productId: string) {
  const [row] = await db
    .select({ n: count() })
    .from(orderItems)
    .innerJoin(orders, eq(orders.id, orderItems.orderId))
    .where(
      and(
        eq(orders.userId, userId),
        eq(orderItems.productId, productId),
        inArray(orders.status, ["paid", "processing", "shipped", "delivered"]),
      ),
    );
  return (row?.n ?? 0) > 0;
}

/** The cart's discount code, re-validated against the current subtotal. */
export async function resolveCartDiscount(code: string | undefined, subtotal: number) {
  if (!code) return { discount: null, code: undefined, invalidReason: undefined };
  const check = await validateDiscountCode(code, subtotal);
  return check.ok
    ? { discount: check.discount, code, invalidReason: undefined }
    : { discount: null, code, invalidReason: check.error };
}
