"use server";

import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { products, reviews } from "@/lib/db/schema";
import { userHasPurchased } from "@/lib/orders";
import { fieldErrors, type FormState } from "@/lib/utils";

const schema = z.object({
  productId: z.string().min(1),
  rating: z.coerce.number().int().min(1, "Choose a star rating.").max(5),
  title: z.string().trim().min(2, "Add a short headline.").max(100),
  body: z.string().trim().min(20, "Tell us a little more (at least 20 characters).").max(3000),
  skinType: z
    .string()
    .trim()
    .max(40)
    .optional()
    .transform((v) => v || null),
});

export async function submitReviewAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in to write a review." };

  const parsed = schema.safeParse({
    productId: formData.get("productId"),
    rating: formData.get("rating") ?? 0,
    title: formData.get("title"),
    body: formData.get("body"),
    skinType: formData.get("skinType") ?? undefined,
  });
  if (!parsed.success) {
    return { ok: false, message: "Please check your review.", errors: fieldErrors(parsed.error.issues) };
  }

  const product = await db.query.products.findFirst({
    where: and(eq(products.id, parsed.data.productId), eq(products.status, "active")),
    columns: { id: true },
  });
  if (!product) return { ok: false, message: "That product is no longer available." };

  const existing = await db.query.reviews.findFirst({
    where: and(eq(reviews.userId, user.id), eq(reviews.productId, product.id)),
    columns: { id: true },
  });
  if (existing) return { ok: false, message: "You've already reviewed this product — thank you!" };

  const lastInitial = user.lastName ? ` ${user.lastName.charAt(0).toUpperCase()}.` : "";
  await db.insert(reviews).values({
    productId: product.id,
    userId: user.id,
    authorName: `${user.firstName || "Beauty Peps customer"}${lastInitial}`,
    rating: parsed.data.rating,
    title: parsed.data.title,
    body: parsed.data.body,
    skinType: parsed.data.skinType,
    verifiedPurchase: await userHasPurchased(user.id, product.id),
    status: "pending",
  });

  return { ok: true, message: "Thanks — your review will appear once it's been approved." };
}
