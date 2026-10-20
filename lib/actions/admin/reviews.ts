"use server";

import { eq, inArray } from "drizzle-orm";
import { refresh, revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { products, reviews, type ReviewStatus } from "@/lib/db/schema";

async function revalidateReview(reviewId: string) {
  const row = await db
    .select({ slug: products.slug })
    .from(reviews)
    .innerJoin(products, eq(reviews.productId, products.id))
    .where(eq(reviews.id, reviewId));
  if (row[0]) revalidatePath(`/products/${row[0].slug}`);
  revalidatePath("/admin/reviews");
}

export async function setReviewStatusAction(reviewId: string, status: ReviewStatus) {
  await requireAdmin();
  await db.update(reviews).set({ status }).where(eq(reviews.id, reviewId));
  await revalidateReview(reviewId);
  refresh();
  return { ok: true, message: status === "approved" ? "Approved" : status === "rejected" ? "Rejected" : "Moved to pending" };
}

/** Form action: approves every checked "ids" value. */
export async function bulkApproveReviewsAction(formData: FormData) {
  await requireAdmin();
  const ids = formData.getAll("ids").map(String).filter(Boolean);
  if (ids.length === 0) return;
  await db.update(reviews).set({ status: "approved" }).where(inArray(reviews.id, ids));
  revalidatePath("/admin/reviews");
  revalidatePath("/products/[slug]", "page");
  refresh();
}

/** Form action bound to a review id: reads `reply-<id>`; an empty reply removes it. */
export async function replyToReviewAction(reviewId: string, formData: FormData) {
  await requireAdmin();
  const reply = String(formData.get(`reply-${reviewId}`) ?? "").trim().slice(0, 2000);
  await db
    .update(reviews)
    .set({ adminReply: reply || null })
    .where(eq(reviews.id, reviewId));
  await revalidateReview(reviewId);
  refresh();
}

export async function deleteReviewAction(reviewId: string) {
  await requireAdmin();
  await revalidateReview(reviewId);
  await db.delete(reviews).where(eq(reviews.id, reviewId));
  refresh();
  return { ok: true, message: "Deleted" };
}
