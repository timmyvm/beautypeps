import "server-only";

import { createHash } from "node:crypto";
import { and, count, desc, eq, gt, inArray, isNull, notInArray, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  addresses,
  orderItems,
  orders,
  passwordResets,
  products,
  reviews,
  wishlistItems,
  type OrderStatus,
  type UserRole,
} from "@/lib/db/schema";
import { safeRedirectPath } from "@/lib/utils";

/** Where to send a user after sign-in / when they're already signed in. */
export function authDestination(role: UserRole, next?: string | null) {
  const fallback = role === "admin" ? "/admin" : "/account";
  const dest = safeRedirectPath(next, fallback);
  // Never bounce back onto an auth page (would loop).
  if (/^\/(login|register|forgot-password|reset-password)(\/|\?|$)/.test(dest)) return fallback;
  return dest;
}

export function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

/** A password-reset row that is unused and unexpired, or null. */
export async function getValidPasswordReset(token: string | undefined | null) {
  if (!token || token.length < 20 || token.length > 200) return null;
  const row = await db.query.passwordResets.findFirst({
    where: and(
      eq(passwordResets.tokenHash, hashResetToken(token)),
      isNull(passwordResets.usedAt),
      gt(passwordResets.expiresAt, new Date()),
    ),
  });
  return row ?? null;
}

/* ------------------------------------------------------------------ */
/* Orders                                                              */
/* ------------------------------------------------------------------ */

export const ACCOUNT_ORDERS_PAGE_SIZE = 10;

export async function getUserOrders(userId: string, page = 1, pageSize = ACCOUNT_ORDERS_PAGE_SIZE) {
  const safePage = Math.max(1, Math.floor(page) || 1);
  const [[{ total }], rows] = await Promise.all([
    db.select({ total: count() }).from(orders).where(eq(orders.userId, userId)),
    db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt))
      .limit(pageSize)
      .offset((safePage - 1) * pageSize),
  ]);

  const ids = rows.map((o) => o.id);
  const items = ids.length
    ? await db
        .select({
          orderId: orderItems.orderId,
          name: orderItems.name,
          image: orderItems.image,
          quantity: orderItems.quantity,
        })
        .from(orderItems)
        .where(inArray(orderItems.orderId, ids))
    : [];

  return {
    orders: rows.map((o) => {
      const own = items.filter((i) => i.orderId === o.id);
      return {
        ...o,
        itemCount: own.reduce((s, i) => s + i.quantity, 0),
        previews: own.slice(0, 4).map((i) => ({ name: i.name, image: i.image })),
      };
    }),
    total,
    page: safePage,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export type AccountOrderRow = Awaited<ReturnType<typeof getUserOrders>>["orders"][number];

/** A single order owned by `userId`, with items, events and live product slugs. */
export async function getUserOrder(userId: string, orderNumber: string) {
  const order = await db.query.orders.findFirst({
    where: and(eq(orders.orderNumber, orderNumber), eq(orders.userId, userId)),
    with: { items: true, events: true },
  });
  if (!order) return null;

  const productIds = order.items.map((i) => i.productId).filter((id): id is string => !!id);
  const live = productIds.length
    ? await db
        .select({ id: products.id, slug: products.slug, status: products.status })
        .from(products)
        .where(inArray(products.id, productIds))
    : [];
  const slugs = new Map(live.filter((p) => p.status === "active").map((p) => [p.id, p.slug]));

  return {
    ...order,
    items: order.items.map((i) => ({ ...i, productSlug: i.productId ? (slugs.get(i.productId) ?? null) : null })),
  };
}

const NOT_SPENT: OrderStatus[] = ["pending_payment", "cancelled", "refunded"];

export async function getUserStats(userId: string) {
  const [[orderAgg], [spentAgg], [wish], pending] = await Promise.all([
    db
      .select({ n: count() })
      .from(orders)
      .where(and(eq(orders.userId, userId), notInArray(orders.status, ["cancelled"]))),
    db
      .select({ spent: sql<number>`coalesce(sum(${orders.total}), 0)` })
      .from(orders)
      .where(and(eq(orders.userId, userId), notInArray(orders.status, NOT_SPENT))),
    db.select({ n: count() }).from(wishlistItems).where(eq(wishlistItems.userId, userId)),
    db
      .select()
      .from(orders)
      .where(and(eq(orders.userId, userId), eq(orders.status, "pending_payment")))
      .orderBy(desc(orders.createdAt)),
  ]);
  return {
    orderCount: orderAgg.n,
    totalSpent: Number(spentAgg.spent) || 0,
    wishlistCount: wish.n,
    pendingPayment: pending,
  };
}

/* ------------------------------------------------------------------ */
/* Addresses, wishlist, reviews                                        */
/* ------------------------------------------------------------------ */

export async function getUserAddresses(userId: string) {
  return db
    .select()
    .from(addresses)
    .where(eq(addresses.userId, userId))
    .orderBy(desc(addresses.isDefault), desc(addresses.createdAt));
}

export async function getUserAddress(userId: string, id: string) {
  const row = await db.query.addresses.findFirst({
    where: and(eq(addresses.id, id), eq(addresses.userId, userId)),
  });
  return row ?? null;
}

export async function getWishlist(userId: string) {
  return db
    .select({
      addedAt: wishlistItems.createdAt,
      id: products.id,
      slug: products.slug,
      name: products.name,
      subtitle: products.subtitle,
      price: products.price,
      compareAtPrice: products.compareAtPrice,
      image: products.image,
      badge: products.badge,
      size: products.size,
      stock: products.stock,
    })
    .from(wishlistItems)
    .innerJoin(products, eq(products.id, wishlistItems.productId))
    .where(and(eq(wishlistItems.userId, userId), eq(products.status, "active")))
    .orderBy(desc(wishlistItems.createdAt));
}

export async function getUserReviews(userId: string) {
  return db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      title: reviews.title,
      body: reviews.body,
      status: reviews.status,
      adminReply: reviews.adminReply,
      verifiedPurchase: reviews.verifiedPurchase,
      createdAt: reviews.createdAt,
      productName: products.name,
      productSlug: products.slug,
      productImage: products.image,
    })
    .from(reviews)
    .innerJoin(products, eq(products.id, reviews.productId))
    .where(eq(reviews.userId, userId))
    .orderBy(desc(reviews.createdAt));
}
