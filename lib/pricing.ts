import "server-only";

import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { discounts, type Discount, type ShippingMethod } from "@/lib/db/schema";
import type { StoreSettings } from "@/lib/settings";

export type Totals = {
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  total: number;
  gstTotal: number; // GST component of total (prices are GST-inclusive)
  freeShippingApplied: boolean;
  amountToFreeShipping: number; // 0 when already qualified or disabled
};

/** Prices are GST-inclusive, so GST = total / 11. */
export function gstComponent(totalCents: number) {
  return Math.round(totalCents / 11);
}

export function computeTotals(opts: {
  subtotal: number;
  shippingMethod: ShippingMethod;
  settings: StoreSettings;
  discount?: Discount | null;
}): Totals {
  const { subtotal, shippingMethod, settings, discount } = opts;

  let discountTotal = 0;
  if (discount?.type === "percent") discountTotal = Math.round((subtotal * discount.value) / 100);
  if (discount?.type === "fixed") discountTotal = Math.min(discount.value, subtotal);

  const threshold = settings.freeShippingThreshold;
  const qualifiesFree = threshold > 0 && subtotal >= threshold;
  const freeShippingApplied =
    subtotal > 0 && shippingMethod === "standard" && (qualifiesFree || discount?.type === "free_shipping");

  let shippingTotal = 0;
  if (subtotal > 0) {
    shippingTotal = shippingMethod === "express" ? settings.expressShipping : settings.standardShipping;
    if (freeShippingApplied) shippingTotal = 0;
    // Free-shipping codes also take the standard rate off express.
    if (shippingMethod === "express" && discount?.type === "free_shipping") {
      shippingTotal = Math.max(0, settings.expressShipping - settings.standardShipping);
    }
  }

  const total = Math.max(0, subtotal - discountTotal + shippingTotal);
  return {
    subtotal,
    discountTotal,
    shippingTotal,
    total,
    gstTotal: gstComponent(total),
    freeShippingApplied,
    amountToFreeShipping: threshold > 0 && !qualifiesFree ? threshold - subtotal : 0,
  };
}

export type DiscountCheck = { ok: true; discount: Discount } | { ok: false; error: string };

/** Validate a discount code against the current cart subtotal. */
export async function validateDiscountCode(rawCode: string, subtotal: number): Promise<DiscountCheck> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false, error: "Enter a code." };
  const discount = await db.query.discounts.findFirst({ where: eq(discounts.code, code) });
  const now = new Date();
  if (!discount || !discount.active) return { ok: false, error: "That code isn't valid." };
  if (discount.startsAt && discount.startsAt > now) return { ok: false, error: "That code isn't active yet." };
  if (discount.endsAt && discount.endsAt < now) return { ok: false, error: "That code has expired." };
  if (discount.maxUses !== null && discount.usedCount >= discount.maxUses) {
    return { ok: false, error: "That code has reached its usage limit." };
  }
  if (subtotal < discount.minSubtotal) {
    return {
      ok: false,
      error: `Spend $${(discount.minSubtotal / 100).toFixed(2)} or more to use this code.`,
    };
  }
  return { ok: true, discount };
}

export async function incrementDiscountUsage(discountId: string) {
  await db
    .update(discounts)
    .set({ usedCount: sql`${discounts.usedCount} + 1` })
    .where(eq(discounts.id, discountId));
}
