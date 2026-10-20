"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { parseMoney } from "@/lib/format";
import { saveSettings } from "@/lib/settings";
import { fieldErrors, type FormState } from "@/lib/utils";

const text = (max: number) => z.string().trim().max(max, `Max ${max} characters`);
const money = z
  .string()
  .trim()
  .transform((v, ctx) => {
    const cents = parseMoney(v || "0");
    if (!Number.isFinite(cents) || cents < 0) {
      ctx.addIssue({ code: "custom", message: "Enter a dollar amount" });
      return z.NEVER;
    }
    return cents;
  });
const url = z
  .string()
  .trim()
  .refine((v) => v === "" || /^https?:\/\//.test(v), "Must start with http:// or https://");

const schema = z.object({
  storeName: text(80).min(1, "Required"),
  supportEmail: z.email("Enter a valid email"),
  supportPhone: text(40),
  businessAddress: text(200),
  abn: text(20),
  announcement: text(160),
  bankAccountName: text(80),
  bankBsb: text(10),
  bankAccountNumber: text(20),
  payId: text(80),
  paymentWindowDays: z.coerce.number().int("Whole days").min(1, "At least 1 day").max(30, "At most 30 days"),
  standardShipping: money,
  expressShipping: money,
  freeShippingThreshold: money,
  dispatchTime: text(200),
  instagram: url,
  tiktok: url,
});

export async function saveSettingsAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const raw = Object.fromEntries([...formData.entries()].filter(([k]) => !k.startsWith("$")));
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: "Please fix the highlighted fields.", errors: fieldErrors(parsed.error.issues) };
  }
  await saveSettings(parsed.data);
  // Settings feed the storefront header/footer, checkout and emails.
  revalidatePath("/", "layout");
  return { ok: true, message: "Settings saved." };
}
