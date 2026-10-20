"use server";

import { createHash, randomBytes } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { passwordResets, users } from "@/lib/db/schema";
import { passwordResetEmail, sendEmail } from "@/lib/email";
import type { FormState } from "@/lib/utils";

async function loadTarget(formData: FormData) {
  const id = String(formData.get("userId") ?? "");
  return db.query.users.findFirst({ where: eq(users.id, id), columns: { passwordHash: false } });
}

export async function sendPasswordResetAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const user = await loadTarget(formData);
  if (!user) return { ok: false, message: "Customer not found." };

  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  await db.insert(passwordResets).values({
    userId: user.id,
    tokenHash,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const result = await sendEmail({ to: user.email, ...passwordResetEmail(`${siteUrl}/reset-password?token=${token}`) });
  return result.status === "failed"
    ? { ok: false, message: `Email failed: ${result.error ?? "unknown error"}` }
    : { ok: true, message: `Password reset link ${result.status === "sent" ? "sent" : "logged"} to ${user.email}.` };
}

export async function toggleDisabledAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const user = await loadTarget(formData);
  if (!user) return { ok: false, message: "Customer not found." };
  if (user.id === admin.id) return { ok: false, message: "You can't disable your own account." };

  const disabled = !user.disabled;
  await db
    .update(users)
    .set(disabled ? { disabled, tokenVersion: sql`${users.tokenVersion} + 1` } : { disabled })
    .where(eq(users.id, user.id));
  revalidatePath("/admin", "layout");
  return { ok: true, message: disabled ? "Account disabled and signed out." : "Account re-enabled." };
}

export async function setRoleAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const user = await loadTarget(formData);
  if (!user) return { ok: false, message: "Customer not found." };
  const role = formData.get("role") === "admin" ? "admin" : "customer";
  if (user.id === admin.id && role !== "admin") return { ok: false, message: "You can't remove your own admin access." };
  if (user.role === role) return { ok: true, message: "No change." };

  // Bump tokenVersion so the role in their session cookie is refreshed on next sign-in.
  await db
    .update(users)
    .set({ role, tokenVersion: sql`${users.tokenVersion} + 1` })
    .where(eq(users.id, user.id));
  revalidatePath("/admin", "layout");
  return { ok: true, message: role === "admin" ? `${user.email} is now an admin.` : `${user.email} is now a customer.` };
}

export async function signOutEverywhereAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const user = await loadTarget(formData);
  if (!user) return { ok: false, message: "Customer not found." };
  await db
    .update(users)
    .set({ tokenVersion: sql`${users.tokenVersion} + 1` })
    .where(eq(users.id, user.id));
  revalidatePath("/admin", "layout");
  return {
    ok: true,
    message: user.id === admin.id ? "All your sessions were ended — sign in again." : "Signed out of all devices.",
  };
}

export async function updateCustomerNoteAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = String(formData.get("userId") ?? "");
  const note = String(formData.get("adminNote") ?? "").trim().slice(0, 4000);
  await db
    .update(users)
    .set({ adminNote: note || null })
    .where(eq(users.id, id));
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Note saved." };
}
