import "server-only";

/*
 * One shelf, two shops. Products linked to an AuPeptideLabs variant (products.apl_variant_id) sell from APL's
 * stock: Beauty Peps reads it, a paid order takes its units off it, and a cancelled or refunded one puts them back.
 *
 * APL's database exposes three functions for this (beautypeps_stock / _take_stock / _return_stock). Each refuses
 * a call without the Beauty Peps token and only sees the variants APL has shared, so this site never holds a key
 * that can read APL's customers or orders. Calls go through APL's public API with its publishable key.
 */

const url = process.env.APL_SUPABASE_URL?.replace(/\/$/, "");
const key = process.env.APL_SUPABASE_PUBLISHABLE_KEY;
const token = process.env.APL_STOCK_TOKEN;

export function aplConfigured() {
  return Boolean(url && key && token);
}

export type AplVariantStock = {
  variantId: string;
  productName: string;
  variantName: string;
  stock: number;
  /** False when APL has forced the variant (or its product) out of stock. */
  sellable: boolean;
  priceAud: number | null;
};

export type AplTake = { variantId: string; requested: number; taken: number; stockAfter: number; already: boolean };
export type AplReturn = { variantId: string; returned: number; stockAfter: number };

class AplError extends Error {}

async function rpc<T>(fn: string, body: Record<string, unknown>): Promise<T> {
  if (!aplConfigured()) throw new AplError("AuPeptideLabs stock is not configured (APL_SUPABASE_URL, APL_SUPABASE_PUBLISHABLE_KEY, APL_STOCK_TOKEN).");
  const res = await fetch(`${url}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: { apikey: key!, "Content-Type": "application/json" },
    body: JSON.stringify({ p_token: token, ...body }),
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new AplError(`AuPeptideLabs ${fn} failed (${res.status}): ${detail.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

/** Current stock of every variant APL shares with Beauty Peps, keyed by variant id. */
export async function readAplStock(): Promise<Map<string, AplVariantStock>> {
  const rows = await rpc<
    { variant_id: string; product_name: string | null; variant_name: string; stock: number; sellable: boolean; price_aud: number | null }[]
  >("beautypeps_stock", {});
  return new Map(
    rows.map((r) => [
      r.variant_id,
      {
        variantId: r.variant_id,
        productName: r.product_name ?? r.variant_id,
        variantName: r.variant_name,
        stock: Math.max(0, r.stock),
        sellable: r.sellable,
        priceAud: r.price_aud,
      },
    ]),
  );
}

/** Take a paid order's units off APL's shelf. Safe to repeat: APL remembers each (order, variant). */
export async function takeAplStock(orderRef: string, lines: { variantId: string; qty: number }[]): Promise<AplTake[]> {
  if (lines.length === 0) return [];
  const rows = await rpc<{ variant_id: string; requested: number; taken: number; stock_after: number; already: boolean }[]>(
    "beautypeps_take_stock",
    { p_order_ref: orderRef, p_lines: lines.map((l) => ({ variant_id: l.variantId, qty: l.qty })) },
  );
  return rows.map((r) => ({ variantId: r.variant_id, requested: r.requested, taken: r.taken, stockAfter: r.stock_after, already: r.already }));
}

/** Put back whatever an order took. Safe to repeat. */
export async function returnAplStock(orderRef: string): Promise<AplReturn[]> {
  const rows = await rpc<{ variant_id: string; returned: number; stock_after: number }[]>("beautypeps_return_stock", {
    p_order_ref: orderRef,
  });
  return rows.map((r) => ({ variantId: r.variant_id, returned: r.returned, stockAfter: r.stock_after }));
}
