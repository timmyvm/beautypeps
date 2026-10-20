"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { subscribers } from "@/lib/db/schema";
import type { FormState } from "@/lib/utils";

const schema = z.object({
  email: z.email("Enter a valid email address."),
  source: z.string().max(40).optional(),
});

export async function subscribeAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = schema.safeParse({
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    source: formData.get("source") ?? undefined,
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };

  await db
    .insert(subscribers)
    .values({ email: parsed.data.email, source: parsed.data.source ?? "footer" })
    .onConflictDoNothing();

  return { ok: true, message: "You're on the list. Welcome to Beauty Peps." };
}
