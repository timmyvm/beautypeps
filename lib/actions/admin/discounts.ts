"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { discounts } from "@/lib/db/schema";
import { parseMoney } from "@/lib/format";
import { fieldErrors, type FormState } from "@/lib/utils";

const optionalDate = z
  .string()
  .trim()
  .optional()
  .transform((v, ctx) => {
    if (!v) return null;
    const d = new Date(`${v}T00:00:00`);
    if (Number.isNaN(d.getTime())) {
      ctx.addIssue({ code: "custom", message: "Invalid date" });
      return z.NEVER;
    }
    return d;
  });

const schema = z
  .object({
    id: z.string().optional(),
    code: z
      .string()
      .trim()
      .toUpperCase()
      .min(3, "At least 3 characters")
      .max(32, "Max 32 characters")
      .regex(/^[A-Z0-9_-]+$/, "Letters, numbers, - and _ only"),
    description: z.string().trim().max(200).optional(),
    type: z.enum(["percent", "fixed", "free_shipping"]),
    value: z.string().trim().optional(),
    minSubtotal: z.string().trim().optional(),
    maxUses: z.string().trim().optional(),
    startsAt: optionalDate,
    endsAt: optionalDate,
    active: z.boolean(),
  })
  .transform((d, ctx) => {
    let value = 0;
    if (d.type === "percent") {
      value = Math.round(Number(d.value));
      if (!Number.isFinite(value) || value < 1 || value > 100) {
        ctx.addIssue({ code: "custom", path: ["value"], message: "Enter a percentage from 1 to 100" });
      }
    } else if (d.type === "fixed") {
      value = parseMoney(d.value);
      if (!Number.isFinite(value) || value <= 0) {
        ctx.addIssue({ code: "custom", path: ["value"], message: "Enter a dollar amount" });
      }
    }
    const minSubtotal = d.minSubtotal ? parseMoney(d.minSubtotal) : 0;
    if (!Number.isFinite(minSubtotal) || minSubtotal < 0) {
      ctx.addIssue({ code: "custom", path: ["minSubtotal"], message: "Enter a dollar amount" });
    }
    let maxUses: number | null = null;
    if (d.maxUses) {
      maxUses = Math.floor(Number(d.maxUses));
      if (!Number.isFinite(maxUses) || maxUses < 1) {
        ctx.addIssue({ code: "custom", path: ["maxUses"], message: "Whole number, or leave blank" });
      }
    }
    if (d.startsAt && d.endsAt && d.endsAt < d.startsAt) {
      ctx.addIssue({ code: "custom", path: ["endsAt"], message: "Ends before it starts" });
    }
    // Inclusive end date: valid until the end of that day.
    const endsAt = d.endsAt ? new Date(d.endsAt.getTime() + 24 * 60 * 60 * 1000 - 1000) : null;
    return { ...d, value, minSubtotal, maxUses, endsAt, description: d.description || null };
  });

export async function saveDiscountAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = schema.safeParse({
    id: formData.get("id") || undefined,
    code: formData.get("code") ?? "",
    description: formData.get("description") ?? undefined,
    type: formData.get("type"),
    value: formData.get("value") ?? undefined,
    minSubtotal: formData.get("minSubtotal") ?? undefined,
    maxUses: formData.get("maxUses") ?? undefined,
    startsAt: formData.get("startsAt") ?? undefined,
    endsAt: formData.get("endsAt") ?? undefined,
    active: formData.get("active") === "on",
  });
  if (!parsed.success) {
    return { ok: false, message: "Please fix the highlighted fields.", errors: fieldErrors(parsed.error.issues) };
  }
  const { id, ...data } = parsed.data;

  const clash = await db.query.discounts.findFirst({
    where: id ? and(eq(discounts.code, data.code), ne(discounts.id, id)) : eq(discounts.code, data.code),
  });
  if (clash) return { ok: false, message: "That code already exists.", errors: { code: "Already in use" } };

  if (id) {
    await db.update(discounts).set(data).where(eq(discounts.id, id));
  } else {
    await db.insert(discounts).values(data);
  }
  revalidatePath("/admin/discounts");
  redirect(`/admin/discounts?saved=${encodeURIComponent(data.code)}`);
}

export async function toggleDiscountAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const discount = await db.query.discounts.findFirst({ where: eq(discounts.id, id) });
  if (!discount) return { ok: false, message: "Discount not found." };
  await db.update(discounts).set({ active: !discount.active }).where(eq(discounts.id, id));
  revalidatePath("/admin/discounts");
  return { ok: true, message: `${discount.code} ${discount.active ? "disabled" : "enabled"}.` };
}

export async function deleteDiscountAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await db.delete(discounts).where(eq(discounts.id, id));
  revalidatePath("/admin/discounts");
  return { ok: true, message: "Discount deleted." };
}
