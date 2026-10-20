"use server";

import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { clearCart } from "@/lib/cart";
import { AU_STATES } from "@/lib/constants";
import { db } from "@/lib/db";
import { addresses, type OrderAddress } from "@/lib/db/schema";
import { LAST_ORDER_COOKIE, placeOrder } from "@/lib/orders";
import { fieldErrors, type FormState } from "@/lib/utils";

const text = (max: number, msg: string) => z.string().trim().min(1, msg).max(max);
const optional = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => v || null);

const addressSchema = z.object({
  firstName: text(60, "Enter your first name."),
  lastName: text(60, "Enter your last name."),
  company: optional(100),
  line1: text(120, "Enter your street address."),
  line2: optional(120),
  suburb: text(80, "Enter your suburb."),
  state: z.enum(AU_STATES, { message: "Choose a state." }),
  postcode: z.string().trim().regex(/^\d{4}$/, "Enter a 4-digit postcode."),
  phone: z
    .string()
    .trim()
    .max(20)
    .regex(/^[0-9 +()-]*$/, "Enter a valid phone number.")
    .optional()
    .transform((v) => v || null),
});

const checkoutSchema = z.object({
  email: z.email("Enter a valid email address."),
  shippingMethod: z.enum(["standard", "express"], { message: "Choose a shipping method." }),
  paymentMethod: z.enum(["bank_transfer", "payid"], { message: "Choose a payment method." }),
  customerNote: optional(500),
  terms: z.literal("on", { message: "Please accept the Terms of Sale to continue." }),
  saveAddress: z.boolean(),
  addressId: z.string().optional(),
});

export async function placeOrderAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  const get = (k: string) => {
    const v = formData.get(k);
    return typeof v === "string" ? v : undefined;
  };

  const parsed = checkoutSchema.safeParse({
    email: (user?.email ?? get("email") ?? "").trim().toLowerCase(),
    shippingMethod: get("shippingMethod"),
    paymentMethod: get("paymentMethod"),
    customerNote: get("customerNote"),
    terms: get("terms"),
    saveAddress: get("saveAddress") === "on",
    addressId: get("addressId"),
  });
  if (!parsed.success) {
    return { ok: false, message: "Please check the highlighted fields.", errors: fieldErrors(parsed.error.issues) };
  }

  // Resolve the shipping address: a saved one (signed-in only) or the typed one.
  let address: OrderAddress;
  const savedId = user && parsed.data.addressId && parsed.data.addressId !== "new" ? parsed.data.addressId : null;
  if (savedId && user) {
    const saved = await db.query.addresses.findFirst({
      where: and(eq(addresses.id, savedId), eq(addresses.userId, user.id)),
    });
    if (!saved) return { ok: false, message: "That saved address could not be found.", errors: { addressId: "Choose an address." } };
    address = {
      firstName: saved.firstName,
      lastName: saved.lastName,
      company: saved.company,
      line1: saved.line1,
      line2: saved.line2,
      suburb: saved.suburb,
      state: saved.state,
      postcode: saved.postcode,
      country: saved.country,
      phone: saved.phone,
    };
  } else {
    const addr = addressSchema.safeParse({
      firstName: get("firstName"),
      lastName: get("lastName"),
      company: get("company"),
      line1: get("line1"),
      line2: get("line2"),
      suburb: get("suburb"),
      state: get("state"),
      postcode: get("postcode"),
      phone: get("phone"),
    });
    if (!addr.success) {
      return { ok: false, message: "Please check your shipping address.", errors: fieldErrors(addr.error.issues) };
    }
    address = { ...addr.data, country: "AU" };
  }

  const result = await placeOrder({
    userId: user?.id ?? null,
    email: parsed.data.email,
    address,
    saveAddress: !!user && !savedId && parsed.data.saveAddress,
    shippingMethod: parsed.data.shippingMethod,
    paymentMethod: parsed.data.paymentMethod,
    customerNote: parsed.data.customerNote,
  });

  if (!result.ok) return { ok: false, message: result.error };

  await clearCart();
  const jar = await cookies();
  jar.set(LAST_ORDER_COOKIE, result.orderNumber, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  redirect(`/checkout/success/${result.orderNumber}`);
}
