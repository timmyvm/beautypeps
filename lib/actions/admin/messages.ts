"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { contactMessages, type MessageStatus } from "@/lib/db/schema";
import { sendEmail } from "@/lib/email";
import type { FormState } from "@/lib/utils";

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function setMessageStatusAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const raw = String(formData.get("status") ?? "");
  const status: MessageStatus = raw === "archived" ? "archived" : raw === "new" ? "new" : "read";
  await db.update(contactMessages).set({ status }).where(eq(contactMessages.id, id));
  revalidatePath("/admin", "layout");
  return { ok: true, message: status === "archived" ? "Archived." : status === "new" ? "Marked as new." : "Moved to inbox." };
}

export async function deleteMessageAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await db.delete(contactMessages).where(eq(contactMessages.id, id));
  revalidatePath("/admin", "layout");
  redirect("/admin/messages");
}

export async function replyMessageAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const archive = formData.get("archive") === "on";
  if (!subject) return { ok: false, message: "Add a subject.", errors: { subject: "Required" } };
  if (!body) return { ok: false, message: "Write a reply.", errors: { body: "Required" } };

  const msg = await db.query.contactMessages.findFirst({ where: eq(contactMessages.id, id) });
  if (!msg) return { ok: false, message: "Message not found." };

  const paragraphs = body
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 14px">${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
    .join("");
  const quoted = `<blockquote style="margin:24px 0 0;padding:12px 16px;border-left:3px solid #e1d5c6;color:#6b5a4e;font-size:13px">${escapeHtml(msg.message).replace(/\n/g, "<br>")}</blockquote>`;
  const html = `<!doctype html><html><body style="margin:0;background:#f6f1ea;font-family:Helvetica,Arial,sans-serif;color:#2b211c">
<div style="max-width:560px;margin:32px auto;background:#fbf8f4;border:1px solid #e1d5c6;border-radius:16px;padding:32px;font-size:15px;line-height:1.6">
<div style="font-family:Georgia,serif;font-size:22px;margin-bottom:24px">beauty peps</div>${paragraphs}${quoted}</div></body></html>`;

  const result = await sendEmail({ to: msg.email, subject, html });
  if (result.status === "failed") return { ok: false, message: `Email failed: ${result.error ?? "unknown error"}` };

  await db
    .update(contactMessages)
    .set({ status: archive ? "archived" : "read" })
    .where(eq(contactMessages.id, id));
  revalidatePath("/admin", "layout");
  return {
    ok: true,
    message: `Reply ${result.status === "sent" ? "sent" : "logged"} to ${msg.email} by ${admin.email}${archive ? " and archived" : ""}.`,
  };
}
