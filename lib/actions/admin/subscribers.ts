"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { subscribers } from "@/lib/db/schema";
import type { FormState } from "@/lib/utils";

export async function deleteSubscriberAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const row = await db.query.subscribers.findFirst({ where: eq(subscribers.id, id) });
  if (!row) return { ok: false, message: "Subscriber not found." };
  await db.delete(subscribers).where(eq(subscribers.id, id));
  revalidatePath("/admin/subscribers");
  return { ok: true, message: `${row.email} removed.` };
}
