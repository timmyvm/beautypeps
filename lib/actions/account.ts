"use server";

import { and, eq, ne, sql } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSession, destroySession, hashPassword, requireUser, verifyPassword } from "@/lib/auth/session";
import { TAGS } from "@/lib/cache-tags";
import { AU_STATES } from "@/lib/constants";
import { db } from "@/lib/db";
import {
  addresses,
  orderEvents,
  orderItems,
  orders,
  passwordResets,
  products,
  reviews,
  users,
  wishlistItems,
} from "@/lib/db/schema";
import { orderStatusEmail, sendEmail } from "@/lib/email";
import { getSettings } from "@/lib/settings";
import { fieldErrors, type FormState } from "@/lib/utils";
import { syncAplStock } from "@/lib/stock-sync";

export type AccountFormState = FormState & { values?: Record<string, string> };

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const optional = (v: string) => (v === "" ? null : v);

/* ------------------------------------------------------------------ */
/* Orders                                                              */
/* ------------------------------------------------------------------ */

/** Customer cancels an unpaid order: restock, log it, email them. */
export async function cancelOrderAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const orderNumber = str(formData, "orderNumber");

  // Guarded update — only flips orders that are still awaiting payment.
  const [order] = await db
    .update(orders)
    .set({ status: "cancelled", cancelledAt: new Date() })
    .where(and(eq(orders.orderNumber, orderNumber), eq(orders.userId, user.id), eq(orders.status, "pending_payment")))
    .returning();
  if (!order) return { ok: false, message: "This order can no longer be cancelled online — please contact us." };

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  for (const item of items) {
    if (!item.productId) continue;
    await db
      .update(products)
      .set({ stock: sql`${products.stock} + ${item.quantity}` })
      .where(eq(products.id, item.productId));
  }
  revalidateTag(TAGS.catalog, "max");
  await syncAplStock({ force: true });

  await db.insert(orderEvents).values({
    orderId: order.id,
    type: "status",
    message: "Order cancelled by customer.",
    actor: "customer",
    visibleToCustomer: true,
  });

  try {
    await sendEmail({ to: order.email, ...orderStatusEmail(order, await getSettings()) });
  } catch (e) {
    console.error("[cancel-order] email failed", e);
  }

  revalidatePath("/account", "layout");
  return { ok: true, message: "Your order has been cancelled." };
}

/* ------------------------------------------------------------------ */
/* Addresses                                                           */
/* ------------------------------------------------------------------ */

const addressSchema = z.object({
  label: z.string().max(40).transform((v) => v || "Home"),
  firstName: z.string().min(1, "Enter a first name.").max(60),
  lastName: z.string().min(1, "Enter a last name.").max(60),
  company: z.string().max(100),
  line1: z.string().min(1, "Enter a street address.").max(150),
  line2: z.string().max(150),
  suburb: z.string().min(1, "Enter a suburb.").max(80),
  state: z.enum(AU_STATES, { message: "Choose a state." }),
  postcode: z.string().regex(/^\d{4}$/, "Postcodes are 4 digits."),
  phone: z
    .string()
    .max(30)
    .refine((v) => v === "" || /^[+()\d\s-]{8,}$/.test(v), "Enter a valid phone number."),
  isDefault: z.boolean(),
});

export async function saveAddressAction(_prev: AccountFormState, formData: FormData): Promise<AccountFormState> {
  const user = await requireUser("/account/addresses");
  const id = str(formData, "id");
  const raw = {
    label: str(formData, "label"),
    firstName: str(formData, "firstName"),
    lastName: str(formData, "lastName"),
    company: str(formData, "company"),
    line1: str(formData, "line1"),
    line2: str(formData, "line2"),
    suburb: str(formData, "suburb"),
    state: str(formData, "state"),
    postcode: str(formData, "postcode"),
    phone: str(formData, "phone"),
    isDefault: formData.get("isDefault") === "on",
  };
  const values = { ...raw, isDefault: raw.isDefault ? "on" : "" };

  const parsed = addressSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error.issues), values };
  const data = parsed.data;

  const existing = await db.select({ id: addresses.id }).from(addresses).where(eq(addresses.userId, user.id));
  // The first address is always the default.
  const makeDefault = data.isDefault || existing.length === 0 || (existing.length === 1 && existing[0].id === id);

  const row = {
    label: data.label,
    firstName: data.firstName,
    lastName: data.lastName,
    company: optional(data.company),
    line1: data.line1,
    line2: optional(data.line2),
    suburb: data.suburb,
    state: data.state,
    postcode: data.postcode,
    country: "AU",
    phone: optional(data.phone),
    isDefault: makeDefault,
  };

  let savedId = id;
  if (id) {
    const [updated] = await db
      .update(addresses)
      .set(row)
      .where(and(eq(addresses.id, id), eq(addresses.userId, user.id)))
      .returning({ id: addresses.id });
    if (!updated) return { ok: false, message: "That address couldn't be found.", values };
  } else {
    if (existing.length >= 20) return { ok: false, message: "You can save up to 20 addresses.", values };
    const [inserted] = await db
      .insert(addresses)
      .values({ ...row, userId: user.id })
      .returning({ id: addresses.id });
    savedId = inserted.id;
  }

  if (makeDefault) {
    await db
      .update(addresses)
      .set({ isDefault: false })
      .where(and(eq(addresses.userId, user.id), ne(addresses.id, savedId)));
  }

  revalidatePath("/account", "layout");
  redirect(`/account/addresses?saved=1`);
}

export async function deleteAddressAction(formData: FormData) {
  const user = await requireUser("/account/addresses");
  const id = str(formData, "id");
  const [removed] = await db
    .delete(addresses)
    .where(and(eq(addresses.id, id), eq(addresses.userId, user.id)))
    .returning();

  // Promote another address if the default was removed.
  if (removed?.isDefault) {
    const next = await db.query.addresses.findFirst({ where: eq(addresses.userId, user.id) });
    if (next) await db.update(addresses).set({ isDefault: true }).where(eq(addresses.id, next.id));
  }
  revalidatePath("/account", "layout");
}

export async function setDefaultAddressAction(formData: FormData) {
  const user = await requireUser("/account/addresses");
  const id = str(formData, "id");
  const target = await db.query.addresses.findFirst({
    where: and(eq(addresses.id, id), eq(addresses.userId, user.id)),
  });
  if (!target) return;
  await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, user.id));
  await db.update(addresses).set({ isDefault: true }).where(eq(addresses.id, target.id));
  revalidatePath("/account", "layout");
}

/* ------------------------------------------------------------------ */
/* Wishlist & reviews                                                  */
/* ------------------------------------------------------------------ */

export async function removeFromWishlistAction(formData: FormData) {
  const user = await requireUser("/account/wishlist");
  const productId = str(formData, "productId");
  await db
    .delete(wishlistItems)
    .where(and(eq(wishlistItems.userId, user.id), eq(wishlistItems.productId, productId)));
  revalidatePath("/account", "layout");
}

export async function deleteReviewAction(formData: FormData) {
  const user = await requireUser("/account/reviews");
  const id = str(formData, "id");
  await db.delete(reviews).where(and(eq(reviews.id, id), eq(reviews.userId, user.id)));
  revalidatePath("/account", "layout");
}

/* ------------------------------------------------------------------ */
/* Profile                                                             */
/* ------------------------------------------------------------------ */

const profileSchema = z.object({
  firstName: z.string().min(1, "Enter your first name.").max(60),
  lastName: z.string().min(1, "Enter your last name.").max(60),
  phone: z
    .string()
    .max(30)
    .refine((v) => v === "" || /^[+()\d\s-]{8,}$/.test(v), "Enter a valid phone number."),
  marketing: z.boolean(),
});

export async function updateProfileAction(_prev: AccountFormState, formData: FormData): Promise<AccountFormState> {
  const user = await requireUser("/account/profile");
  const raw = {
    firstName: str(formData, "firstName"),
    lastName: str(formData, "lastName"),
    phone: str(formData, "phone"),
    marketing: formData.get("marketing") === "on",
  };
  const values = { ...raw, marketing: raw.marketing ? "on" : "" };
  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error.issues), values };

  await db
    .update(users)
    .set({
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      phone: optional(parsed.data.phone),
      marketingOptIn: parsed.data.marketing,
    })
    .where(eq(users.id, user.id));

  revalidatePath("/account", "layout");
  return { ok: true, message: "Your details have been saved.", values };
}

export async function changeEmailAction(_prev: AccountFormState, formData: FormData): Promise<AccountFormState> {
  const user = await requireUser("/account/profile");
  const email = str(formData, "email").toLowerCase();
  const password = String(formData.get("currentPassword") ?? "");
  const values = { email };

  const parsed = z.email("Enter a valid email address.").max(200).safeParse(email);
  if (!parsed.success) return { ok: false, errors: { email: parsed.error.issues[0].message }, values };
  if (email === user.email.toLowerCase()) return { ok: false, errors: { email: "That's already your email." }, values };

  const full = await db.query.users.findFirst({ where: eq(users.id, user.id) });
  if (!full || !(await verifyPassword(password, full.passwordHash))) {
    return { ok: false, errors: { currentPassword: "Your current password is incorrect." }, values };
  }

  const taken = await db.query.users.findFirst({ where: sql`lower(${users.email}) = ${email}` });
  if (taken) return { ok: false, errors: { email: "Another account already uses this email." }, values };

  await db.update(users).set({ email }).where(eq(users.id, user.id));
  revalidatePath("/account", "layout");
  return { ok: true, message: `Your email is now ${email}. Use it next time you sign in.`, values: { email } };
}

/* ------------------------------------------------------------------ */
/* Security                                                            */
/* ------------------------------------------------------------------ */

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    password: z.string().min(8, "Use at least 8 characters.").max(200),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Passwords don't match." })
  .refine((d) => d.password !== d.currentPassword, {
    path: ["password"],
    message: "Choose a password you haven't used here before.",
  });

export async function changePasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser("/account/security");
  const parsed = changePasswordSchema.safeParse({
    currentPassword: String(formData.get("currentPassword") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirm: String(formData.get("confirm") ?? ""),
  });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error.issues) };

  const full = await db.query.users.findFirst({ where: eq(users.id, user.id) });
  if (!full || !(await verifyPassword(parsed.data.currentPassword, full.passwordHash))) {
    return { ok: false, errors: { currentPassword: "Your current password is incorrect." } };
  }

  const [updated] = await db
    .update(users)
    .set({ passwordHash: await hashPassword(parsed.data.password), tokenVersion: sql`${users.tokenVersion} + 1` })
    .where(eq(users.id, user.id))
    .returning();
  // Re-issue this device's session; every other device is now signed out.
  await createSession(updated);
  await db.delete(passwordResets).where(eq(passwordResets.userId, user.id));

  return { ok: true, message: "Password updated. You've been signed out on your other devices." };
}

export async function signOutOtherDevicesAction(_prev: FormState, _formData: FormData): Promise<FormState> {
  void _formData;
  const user = await requireUser("/account/security");
  const [updated] = await db
    .update(users)
    .set({ tokenVersion: sql`${users.tokenVersion} + 1` })
    .where(eq(users.id, user.id))
    .returning();
  await createSession(updated);
  return { ok: true, message: "You've been signed out everywhere else." };
}

export async function deleteAccountAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser("/account/security");
  if (str(formData, "confirm") !== "DELETE") {
    return { ok: false, errors: { confirm: 'Type DELETE in capitals to confirm.' } };
  }
  if (user.role === "admin") {
    return { ok: false, message: "Admin accounts can't be deleted here. Ask another admin to remove your access first." };
  }

  const full = await db.query.users.findFirst({ where: eq(users.id, user.id) });
  if (!full || !(await verifyPassword(String(formData.get("password") ?? ""), full.passwordHash))) {
    return { ok: false, errors: { password: "Your password is incorrect." } };
  }

  // Orders and reviews are kept for records/tax but detached from the account.
  await db.update(orders).set({ userId: null }).where(eq(orders.userId, user.id));
  await db.update(reviews).set({ userId: null }).where(eq(reviews.userId, user.id));
  await db.delete(wishlistItems).where(eq(wishlistItems.userId, user.id));
  await db.delete(addresses).where(eq(addresses.userId, user.id));
  await db.delete(passwordResets).where(eq(passwordResets.userId, user.id));
  await db.delete(users).where(eq(users.id, user.id));

  await destroySession();
  redirect("/?account-deleted=1");
}
