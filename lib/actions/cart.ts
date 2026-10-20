"use server";

import { and, eq, inArray } from "drizzle-orm";
import { refresh } from "next/cache";
import { getCart, MAX_QTY_PER_LINE, readCartCookie, writeCartCookie } from "@/lib/cart";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { validateDiscountCode } from "@/lib/pricing";
import type { FormState } from "@/lib/utils";

export type CartActionResult = { ok: boolean; message: string; count: number };

const countOf = (items: { q: number }[]) => items.reduce((s, i) => s + i.q, 0);

/** Add one product (or more units of it). Callable directly from client components. */
export async function addToCart(productId: string, quantity = 1): Promise<CartActionResult> {
  const qty = Math.max(1, Math.min(MAX_QTY_PER_LINE, Math.floor(quantity)));
  const product = await db.query.products.findFirst({
    where: and(eq(products.id, productId), eq(products.status, "active")),
    columns: { id: true, name: true, stock: true },
  });
  const cart = await readCartCookie();
  if (!product) return { ok: false, message: "That product is no longer available.", count: countOf(cart.items) };
  if (product.stock <= 0) return { ok: false, message: `${product.name} is sold out.`, count: countOf(cart.items) };

  const existing = cart.items.find((i) => i.id === productId);
  const limit = Math.min(product.stock, MAX_QTY_PER_LINE);
  if (existing) existing.q = Math.min(existing.q + qty, limit);
  else cart.items.push({ id: productId, q: Math.min(qty, limit) });

  await writeCartCookie(cart);
  refresh();
  return { ok: true, message: `${product.name} added to your bag.`, count: countOf(cart.items) };
}

/** Add several products at once (routine builder, "buy again"). One unit each unless already in the cart. */
export async function addManyToCart(productIds: string[]): Promise<CartActionResult> {
  const ids = [...new Set(productIds)].slice(0, 30);
  const cart = await readCartCookie();
  if (ids.length === 0) return { ok: false, message: "Nothing to add.", count: countOf(cart.items) };

  const rows = await db
    .select({ id: products.id, stock: products.stock })
    .from(products)
    .where(and(inArray(products.id, ids), eq(products.status, "active")));

  let added = 0;
  for (const row of rows) {
    if (row.stock <= 0) continue;
    const existing = cart.items.find((i) => i.id === row.id);
    if (existing) continue;
    cart.items.push({ id: row.id, q: 1 });
    added++;
  }
  await writeCartCookie(cart);
  refresh();
  return {
    ok: added > 0,
    message: added > 0 ? `${added} ${added === 1 ? "item" : "items"} added to your bag.` : "Those items are already in your bag.",
    count: countOf(cart.items),
  };
}

/** Set a line's quantity. 0 removes the line. */
export async function updateCartQuantity(productId: string, quantity: number): Promise<CartActionResult> {
  const cart = await readCartCookie();
  const q = Math.max(0, Math.min(MAX_QTY_PER_LINE, Math.floor(quantity)));
  if (q === 0) cart.items = cart.items.filter((i) => i.id !== productId);
  else {
    const line = cart.items.find((i) => i.id === productId);
    if (line) line.q = q;
  }
  await writeCartCookie(cart);
  refresh();
  return { ok: true, message: q === 0 ? "Removed from your bag." : "Bag updated.", count: countOf(cart.items) };
}

export async function removeFromCart(productId: string): Promise<CartActionResult> {
  return updateCartQuantity(productId, 0);
}

/** <form action> compatible: field "code". */
export async function applyDiscountAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const code = String(formData.get("code") ?? "")
    .trim()
    .toUpperCase();
  const cart = await getCart();
  const check = await validateDiscountCode(code, cart.subtotal);
  if (!check.ok) return { ok: false, message: check.error };

  const cookie = await readCartCookie();
  await writeCartCookie({ ...cookie, code: check.discount.code });
  refresh();
  return { ok: true, message: `Code ${check.discount.code} applied.` };
}

export async function removeDiscountAction() {
  const cookie = await readCartCookie();
  await writeCartCookie({ items: cookie.items });
  refresh();
}
