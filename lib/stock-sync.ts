import "server-only";

import { and, eq, inArray, isNotNull, lt, notInArray, sql } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { aplConfigured, readAplStock, returnAplStock, takeAplStock } from "@/lib/apl";
import { TAGS } from "@/lib/cache-tags";
import { db } from "@/lib/db";
import { orderEvents, orderItems, orders, products } from "@/lib/db/schema";
import { orderStatusEmail, sendEmail } from "@/lib/email";
import { getSettings } from "@/lib/settings";

/*
 * Stock of a product linked to AuPeptideLabs = APL's stock of that variant, less what Beauty Peps orders still
 * hold: units in live orders that have not been taken off APL's shelf yet (awaiting payment, or paid while APL
 * could not be reached). A paid order takes its units ("apl_take" event); a cancelled or refunded one returns
 * them ("apl_return"). Run with revalidation allowed: a Server Action, a Route Handler or a script.
 */

const TAKEN = "apl_take";
const RETURNED = "apl_return";
const CLOSED = ["cancelled", "refunded"] as const;

export type SyncResult = { ok: boolean; linked: number; changed: number; error?: string; at: Date };

let last: SyncResult | null = null;
let running: Promise<SyncResult> | null = null;

/** Units of each linked product held by orders not yet taken off APL's shelf. */
async function heldByProduct() {
  const rows = await db
    .select({ productId: orderItems.productId, held: sql<number>`sum(${orderItems.quantity})` })
    .from(orderItems)
    .innerJoin(orders, eq(orders.id, orderItems.orderId))
    .innerJoin(products, eq(products.id, orderItems.productId))
    .where(
      and(
        isNotNull(products.aplVariantId),
        notInArray(orders.status, [...CLOSED]),
        sql`not exists (select 1 from ${orderEvents} e where e.order_id = ${orders.id} and e.type = ${TAKEN})`,
      ),
    )
    .groupBy(orderItems.productId);
  return new Map(rows.map((r) => [r.productId!, Number(r.held)]));
}

async function runSync(): Promise<SyncResult> {
  const linked = await db
    .select({ id: products.id, variant: products.aplVariantId, stock: products.stock })
    .from(products)
    .where(isNotNull(products.aplVariantId));
  if (linked.length === 0) return { ok: true, linked: 0, changed: 0, at: new Date() };
  if (!aplConfigured()) return { ok: false, linked: linked.length, changed: 0, error: "AuPeptideLabs stock is not configured.", at: new Date() };

  const [shelf, held] = await Promise.all([readAplStock(), heldByProduct()]);
  let changed = 0;
  for (const p of linked) {
    const v = shelf.get(p.variant!);
    // A variant APL no longer shares, or has forced out of stock, cannot be sold here either.
    const available = v && v.sellable ? Math.max(0, v.stock - (held.get(p.id) ?? 0)) : 0;
    if (available !== p.stock) {
      await db.update(products).set({ stock: available }).where(eq(products.id, p.id));
      changed++;
    }
  }
  if (changed > 0) revalidateTag(TAGS.catalog, "max");
  return { ok: true, linked: linked.length, changed, at: new Date() };
}

/**
 * Bring linked products' stock in line with APL's shelf. Cheap calls (adding to the bag) are throttled to one
 * read every 15 seconds per server; checkout and the admin force a fresh read. Never throws: if APL cannot be
 * reached the last known stock stands.
 */
export async function syncAplStock({ force = false }: { force?: boolean } = {}): Promise<SyncResult> {
  if (!force && last && Date.now() - last.at.getTime() < 15_000) return last;
  if (running) return running;
  running = runSync()
    .catch((e: unknown): SyncResult => {
      console.error("[apl] stock sync failed", e);
      return { ok: false, linked: 0, changed: 0, error: e instanceof Error ? e.message : String(e), at: new Date() };
    })
    .then((r) => {
      last = r;
      running = null;
      return r;
    });
  return running;
}

export function lastSync() {
  return last;
}

/** The order's lines that sell from APL's shelf. */
async function linkedLines(orderId: string) {
  const rows = await db
    .select({ variant: products.aplVariantId, qty: orderItems.quantity, name: orderItems.name })
    .from(orderItems)
    .innerJoin(products, eq(products.id, orderItems.productId))
    .where(and(eq(orderItems.orderId, orderId), isNotNull(products.aplVariantId)));
  return rows.map((r) => ({ variantId: r.variant!, qty: r.qty, name: r.name }));
}

async function hasEvent(orderId: string, type: string) {
  const e = await db.query.orderEvents.findFirst({ where: and(eq(orderEvents.orderId, orderId), eq(orderEvents.type, type)) });
  return Boolean(e);
}

export type StockMoveOutcome = { ok: boolean; message: string | null };

/**
 * The reference APL's ledger keys this order's moves by. Order numbers can restart (a fresh database), and APL
 * treats a reference it has seen as already taken, so the order's id rides along to keep it unique.
 */
const aplRef = (order: { id: string; orderNumber: string }) => `${order.orderNumber}/${order.id}`;

/** A paid order takes its units off APL's shelf. Short lines are reported for the person packing it. */
export async function takeOrderFromApl(orderId: string, actor: string): Promise<StockMoveOutcome> {
  const order = await db.query.orders.findFirst({ where: eq(orders.id, orderId), columns: { id: true, orderNumber: true } });
  if (!order) return { ok: false, message: null };
  const lines = await linkedLines(orderId);
  if (lines.length === 0 || (await hasEvent(orderId, TAKEN))) return { ok: true, message: null };
  try {
    const taken = await takeAplStock(
      aplRef(order),
      lines.map((l) => ({ variantId: l.variantId, qty: l.qty })),
    );
    const short = taken.filter((t) => t.taken < t.requested);
    const total = taken.reduce((s, t) => s + t.taken, 0);
    const message = short.length
      ? `Took ${total} units off AuPeptideLabs stock. Short: ${short.map((t) => `${t.variantId} (${t.taken} of ${t.requested})`).join(", ")} — check the shelf before packing.`
      : `Took ${total} ${total === 1 ? "unit" : "units"} off AuPeptideLabs stock (${taken.map((t) => `${t.variantId} ×${t.taken}`).join(", ")}).`;
    await db.insert(orderEvents).values({ orderId, type: TAKEN, message, visibleToCustomer: false, actor });
    await syncAplStock({ force: true });
    return { ok: short.length === 0, message };
  } catch (e) {
    const message = `Could not take this order off AuPeptideLabs stock yet (${e instanceof Error ? e.message : String(e)}). It will be retried automatically; the units stay held here.`;
    await db.insert(orderEvents).values({ orderId, type: "note", message, visibleToCustomer: false, actor: "system" });
    return { ok: false, message };
  }
}

/** A cancelled or refunded order puts back what it took from APL's shelf. */
export async function returnOrderToApl(orderId: string, actor: string): Promise<StockMoveOutcome> {
  const order = await db.query.orders.findFirst({ where: eq(orders.id, orderId), columns: { id: true, orderNumber: true } });
  if (!order || !(await hasEvent(orderId, TAKEN)) || (await hasEvent(orderId, RETURNED))) {
    await syncAplStock({ force: true });
    return { ok: true, message: null };
  }
  try {
    const back = await returnAplStock(aplRef(order));
    const total = back.reduce((s, b) => s + b.returned, 0);
    const message = `Returned ${total} ${total === 1 ? "unit" : "units"} to AuPeptideLabs stock.`;
    await db.insert(orderEvents).values({ orderId, type: RETURNED, message, visibleToCustomer: false, actor });
    await syncAplStock({ force: true });
    return { ok: true, message };
  } catch (e) {
    const message = `Could not return this order's units to AuPeptideLabs stock (${e instanceof Error ? e.message : String(e)}). Adjust the APL shelf by hand.`;
    await db.insert(orderEvents).values({ orderId, type: "note", message, visibleToCustomer: false, actor: "system" });
    return { ok: false, message };
  }
}

/** Paid orders whose take failed earlier (APL unreachable): try again. */
export async function retryPendingTakes() {
  const rows = await db
    .selectDistinct({ id: orders.id })
    .from(orders)
    .innerJoin(orderItems, eq(orderItems.orderId, orders.id))
    .innerJoin(products, eq(products.id, orderItems.productId))
    .where(
      and(
        inArray(orders.status, ["paid", "processing", "shipped", "delivered"]),
        isNotNull(products.aplVariantId),
        sql`not exists (select 1 from ${orderEvents} e where e.order_id = ${orders.id} and e.type = ${TAKEN})`,
      ),
    );
  for (const r of rows) await takeOrderFromApl(r.id, "system");
  return rows.length;
}

/**
 * Orders still unpaid after the payment window are cancelled, as the payment policy says, and their stock
 * released. Each customer gets the cancellation email.
 */
export async function expireUnpaidOrders() {
  const settings = await getSettings();
  const cutoff = new Date(Date.now() - settings.paymentWindowDays * 24 * 60 * 60 * 1000);
  const expired = await db
    .update(orders)
    .set({ status: "cancelled", cancelledAt: new Date() })
    .where(and(eq(orders.status, "pending_payment"), lt(orders.createdAt, cutoff)))
    .returning();
  for (const order of expired) {
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
    for (const item of items) {
      if (!item.productId) continue;
      await db
        .update(products)
        .set({ stock: sql`${products.stock} + ${item.quantity}` })
        .where(eq(products.id, item.productId));
    }
    await db.insert(orderEvents).values({
      orderId: order.id,
      type: "status",
      message: `Cancelled automatically: not paid within ${settings.paymentWindowDays} days.`,
      visibleToCustomer: true,
      actor: "system",
    });
    try {
      await sendEmail({ to: order.email, ...orderStatusEmail(order, settings) });
    } catch (e) {
      console.error("[expire] email failed", e);
    }
  }
  if (expired.length > 0) revalidateTag(TAGS.catalog, "max");
  return expired.length;
}
