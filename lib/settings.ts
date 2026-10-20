import "server-only";

import { cache } from "react";
import { db } from "@/lib/db";
import { settings as settingsTable } from "@/lib/db/schema";

/** Store-wide settings, editable in Admin → Settings. Stored as key/value JSON rows. */
export type StoreSettings = {
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  businessAddress: string;
  abn: string;
  announcement: string; // top-of-site bar; empty hides it
  // Payments (manual)
  bankAccountName: string;
  bankBsb: string;
  bankAccountNumber: string;
  payId: string;
  paymentWindowDays: number;
  // Shipping (cents)
  standardShipping: number;
  expressShipping: number;
  freeShippingThreshold: number; // 0 disables free shipping
  dispatchTime: string;
  // Social
  instagram: string;
  tiktok: string;
};

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: "Beauty Peps",
  supportEmail: "hello@beautypeps.com.au",
  supportPhone: "",
  businessAddress: "Melbourne, VIC, Australia",
  abn: "",
  announcement: "Free standard shipping on Australian orders over $150",
  bankAccountName: "Beauty Peps Pty Ltd",
  bankBsb: "000-000",
  bankAccountNumber: "00000000",
  payId: "pay@beautypeps.com.au",
  paymentWindowDays: 3,
  standardShipping: 995,
  expressShipping: 1495,
  freeShippingThreshold: 15000,
  dispatchTime: "Orders dispatch within 1 business day of payment clearing.",
  instagram: "https://instagram.com/",
  tiktok: "https://tiktok.com/",
};

export const getSettings = cache(async (): Promise<StoreSettings> => {
  const rows = await db.select().from(settingsTable);
  const merged: Record<string, unknown> = { ...DEFAULT_SETTINGS };
  for (const row of rows) {
    if (row.key in DEFAULT_SETTINGS) merged[row.key] = row.value;
  }
  return merged as StoreSettings;
});

export async function saveSettings(patch: Partial<StoreSettings>) {
  for (const [key, value] of Object.entries(patch)) {
    if (!(key in DEFAULT_SETTINGS) || value === undefined) continue;
    await db
      .insert(settingsTable)
      .values({ key, value })
      .onConflictDoUpdate({ target: settingsTable.key, set: { value, updatedAt: new Date() } });
  }
}
