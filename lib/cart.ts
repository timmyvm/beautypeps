import "server-only";

import { and, eq, inArray } from "drizzle-orm";
import { cookies } from "next/headers";
import { cache } from "react";
import { db } from "@/lib/db";
import { products, type Product } from "@/lib/db/schema";

/*
 * The cart lives in a cookie so guests can shop without an account.
 * Only product ids + quantities are stored; prices are always re-read from the DB.
 */

export const CART_COOKIE = "bp_cart";
export const MAX_QTY_PER_LINE = 10;

export type CartCookie = { items: { id: string; q: number }[]; code?: string };

export type CartLine = {
  product: Pick<Product, "id" | "slug" | "name" | "subtitle" | "sku" | "price" | "compareAtPrice" | "image" | "size" | "stock">;
  quantity: number;
  lineTotal: number;
  /** Requested quantity exceeds stock (quantity has been clamped). */
  limited: boolean;
};

export type Cart = {
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  discountCode?: string;
};

export async function readCartCookie(): Promise<CartCookie> {
  const jar = await cookies();
  const raw = jar.get(CART_COOKIE)?.value;
  if (!raw) return { items: [] };
  try {
    const parsed = JSON.parse(raw) as CartCookie;
    const items = Array.isArray(parsed.items)
      ? parsed.items
          .filter((i) => typeof i?.id === "string" && Number.isInteger(i?.q) && i.q > 0)
          .map((i) => ({ id: i.id, q: Math.min(i.q, MAX_QTY_PER_LINE) }))
      : [];
    return { items, code: typeof parsed.code === "string" ? parsed.code : undefined };
  } catch {
    return { items: [] };
  }
}

/** Persist the cart. Only callable from Server Actions / Route Handlers. */
export async function writeCartCookie(cart: CartCookie) {
  const jar = await cookies();
  if (cart.items.length === 0 && !cart.code) {
    jar.delete(CART_COOKIE);
    return;
  }
  jar.set(CART_COOKIE, JSON.stringify(cart), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearCart() {
  const jar = await cookies();
  jar.delete(CART_COOKIE);
}

/** Header badge count — cookie only, no DB hit. */
export async function getCartCount() {
  const { items } = await readCartCookie();
  return items.reduce((sum, i) => sum + i.q, 0);
}

/** Hydrated cart with live prices and stock. Inactive / deleted products are dropped. */
export const getCart = cache(async (): Promise<Cart> => {
  const cookie = await readCartCookie();
  const ids = cookie.items.map((i) => i.id);
  if (ids.length === 0) return { lines: [], itemCount: 0, subtotal: 0, discountCode: cookie.code };

  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      subtitle: products.subtitle,
      sku: products.sku,
      price: products.price,
      compareAtPrice: products.compareAtPrice,
      image: products.image,
      size: products.size,
      stock: products.stock,
    })
    .from(products)
    .where(and(inArray(products.id, ids), eq(products.status, "active")));

  const byId = new Map(rows.map((r) => [r.id, r]));
  const lines: CartLine[] = [];
  for (const item of cookie.items) {
    const product = byId.get(item.id);
    if (!product || product.stock <= 0) continue;
    const quantity = Math.min(item.q, product.stock, MAX_QTY_PER_LINE);
    lines.push({ product, quantity, lineTotal: quantity * product.price, limited: quantity < item.q });
  }

  return {
    lines,
    itemCount: lines.reduce((s, l) => s + l.quantity, 0),
    subtotal: lines.reduce((s, l) => s + l.lineTotal, 0),
    discountCode: cookie.code,
  };
});
