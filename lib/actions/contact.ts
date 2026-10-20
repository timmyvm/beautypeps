"use server";

import { z } from "zod";
import { CONTACT_SUBJECTS } from "@/components/shop/contact-subjects";
import { db } from "@/lib/db";
import { contactMessages } from "@/lib/db/schema";
import { contactAutoReplyEmail, sendEmail } from "@/lib/email";
import { fieldErrors, type FormState } from "@/lib/utils";

const schema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(100),
  email: z.email("Enter a valid email address."),
  orderNumber: z
    .string()
    .trim()
    .max(20)
    .optional()
    .transform((v) => (v ? v.toUpperCase() : null)),
  subject: z.enum(CONTACT_SUBJECTS, { message: "Choose a topic." }),
  message: z.string().trim().min(10, "Please write a little more (at least 10 characters).").max(5000),
  // Honeypot — bots fill every field.
  website: z.string().max(0).optional(),
});

export async function contactAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    orderNumber: formData.get("orderNumber") ?? undefined,
    subject: formData.get("subject"),
    message: formData.get("message"),
    website: formData.get("website") ?? undefined,
  });
  if (!parsed.success) {
    // Silently "succeed" for the honeypot so bots get no signal.
    if (parsed.error.issues.some((i) => i.path[0] === "website")) {
      return { ok: true, message: "Thanks — we'll be in touch within 1 business day." };
    }
    return { ok: false, message: "Please check the highlighted fields.", errors: fieldErrors(parsed.error.issues) };
  }

  const { name, email, orderNumber, subject, message } = parsed.data;
  await db.insert(contactMessages).values({ name, email, orderNumber, subject, message });

  try {
    await sendEmail({ to: email, ...contactAutoReplyEmail(name) });
  } catch (err) {
    console.error("[contact] auto-reply failed", err);
  }

  return { ok: true, message: `Thanks, ${name.split(" ")[0]} — we'll reply to ${email} within 1 business day.` };
}
