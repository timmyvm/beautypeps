"use server";

import { and, eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { products, wishlistItems } from "@/lib/db/schema";

/** Add or remove a product from the signed-in user's wishlist. */
export async function toggleWishlistAction(
  productId: string,
): Promise<{ ok: boolean; wishlisted?: boolean; needsLogin?: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, needsLogin: true };

  const product = await db.query.products.findFirst({ where: eq(products.id, productId), columns: { id: true } });
  if (!product) return { ok: false };

  const where = and(eq(wishlistItems.userId, user.id), eq(wishlistItems.productId, productId));
  const existing = await db.query.wishlistItems.findFirst({ where });
  if (existing) {
    await db.delete(wishlistItems).where(where);
    refresh();
    return { ok: true, wishlisted: false };
  }
  await db.insert(wishlistItems).values({ userId: user.id, productId }).onConflictDoNothing();
  refresh();
  return { ok: true, wishlisted: true };
}
