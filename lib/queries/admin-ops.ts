import "server-only";

import { and, count, desc, eq, gte, inArray, like, lt, lte, notInArray, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  addresses,
  contactMessages,
  orderItems,
  orders,
  products,
  reviews,
  subscribers,
  users,
  wishlistItems,
  type OrderStatus,
} from "@/lib/db/schema";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export const STORE_TZ = "Australia/Melbourne";
const dayFmt = new Intl.DateTimeFormat("en-CA", { timeZone: STORE_TZ, year: "numeric", month: "2-digit", day: "2-digit" });

/** YYYY-MM-DD in the store's timezone. */
export function dayKey(d: Date) {
  return dayFmt.format(d);
}

export const RANGES = [7, 30, 90] as const;
export type RangeDays = (typeof RANGES)[number];

export function parseRange(raw: string | undefined): RangeDays {
  const n = Number(raw);
  return (RANGES as readonly number[]).includes(n) ? (n as RangeDays) : 30;
}

export function parsePage(raw: string | undefined) {
  const n = Math.floor(Number(raw));
  return Number.isFinite(n) && n > 0 ? n : 1;
}

/** Parse a YYYY-MM-DD date input. `endOfDay` makes the bound inclusive. */
function parseDateInput(raw: string | undefined, endOfDay = false) {
  if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return undefined;
  const d = new Date(`${raw}T00:00:00`);
  if (Number.isNaN(d.getTime())) return undefined;
  if (endOfDay) d.setDate(d.getDate() + 1);
  return d;
}

const CLOSED: OrderStatus[] = ["cancelled", "refunded"];

/* ------------------------------------------------------------------ */
/* Dashboard                                                           */
/* ------------------------------------------------------------------ */

export async function getDashboardData(days: RangeDays) {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));

  const inRange = gte(orders.createdAt, start);
  const paidInRange = and(inRange, eq(orders.paymentStatus, "paid"), notInArray(orders.status, CLOSED));

  const [
    paidOrders,
    [placed],
    [newCustomers],
    [awaiting],
    [toFulfil],
    recentOrders,
    lowStock,
    topProducts,
    [pendingReviews],
    [newMessages],
    [subsTotal],
    [subsNew],
  ] = await Promise.all([
    db.select({ total: orders.total, createdAt: orders.createdAt }).from(orders).where(paidInRange),
    db.select({ n: count() }).from(orders).where(inRange),
    db
      .select({ n: count() })
      .from(users)
      .where(and(eq(users.role, "customer"), gte(users.createdAt, start))),
    db
      .select({ n: count(), value: sql<number>`coalesce(sum(${orders.total}), 0)` })
      .from(orders)
      .where(eq(orders.status, "pending_payment")),
    db
      .select({ n: count() })
      .from(orders)
      .where(inArray(orders.status, ["paid", "processing"])),
    db.query.orders.findMany({ orderBy: desc(orders.createdAt), limit: 8, with: { items: true } }),
    db
      .select({
        id: products.id,
        name: products.name,
        sku: products.sku,
        stock: products.stock,
        threshold: products.lowStockThreshold,
        image: products.image,
      })
      .from(products)
      .where(and(eq(products.status, "active"), lte(products.stock, products.lowStockThreshold)))
      .orderBy(products.stock)
      .limit(8),
    db
      .select({
        productId: orderItems.productId,
        name: orderItems.name,
        image: sql<string | null>`max(${orderItems.image})`,
        units: sql<number>`sum(${orderItems.quantity})`,
        revenue: sql<number>`sum(${orderItems.lineTotal})`,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(paidInRange)
      .groupBy(orderItems.productId, orderItems.name)
      .orderBy(desc(sql`sum(${orderItems.quantity})`))
      .limit(6),
    db.select({ n: count() }).from(reviews).where(eq(reviews.status, "pending")),
    db.select({ n: count() }).from(contactMessages).where(eq(contactMessages.status, "new")),
    db.select({ n: count() }).from(subscribers),
    db.select({ n: count() }).from(subscribers).where(gte(subscribers.createdAt, start)),
  ]);

  // Revenue by day — every day in the range present, zero-filled.
  const byDay = new Map<string, { revenue: number; orders: number }>();
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    byDay.set(dayKey(d), { revenue: 0, orders: 0 });
  }
  for (const o of paidOrders) {
    const bucket = byDay.get(dayKey(o.createdAt));
    if (bucket) {
      bucket.revenue += o.total;
      bucket.orders += 1;
    }
  }

  const revenue = paidOrders.reduce((s, o) => s + o.total, 0);
  return {
    start,
    revenue,
    paidCount: paidOrders.length,
    ordersPlaced: placed.n,
    aov: paidOrders.length ? Math.round(revenue / paidOrders.length) : 0,
    newCustomers: newCustomers.n,
    awaitingPayment: { count: awaiting.n, value: Number(awaiting.value) },
    toFulfil: toFulfil.n,
    series: [...byDay.entries()].map(([day, v]) => ({ day, ...v })),
    recentOrders,
    lowStock,
    topProducts: topProducts.map((p) => ({ ...p, units: Number(p.units), revenue: Number(p.revenue) })),
    pendingReviews: pendingReviews.n,
    newMessages: newMessages.n,
    subscribers: { total: subsTotal.n, new: subsNew.n },
  };
}

/* ------------------------------------------------------------------ */
/* Orders                                                              */
/* ------------------------------------------------------------------ */

export type OrderFilters = { status?: string; q?: string; from?: string; to?: string };

const ORDER_STATUS_VALUES: OrderStatus[] = [
  "pending_payment",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

export type OrderTransition = "paid" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";

/** Which admin actions are allowed from each status. "paid" = mark payment received. */
const TRANSITIONS: Record<OrderStatus, OrderTransition[]> = {
  pending_payment: ["paid", "cancelled"],
  paid: ["processing", "shipped", "cancelled", "refunded"],
  processing: ["shipped", "cancelled", "refunded"],
  shipped: ["delivered", "refunded"],
  delivered: ["refunded"],
  cancelled: ["refunded"],
  refunded: [],
};

export function allowedTransitions(order: { status: OrderStatus; paymentStatus: string }): OrderTransition[] {
  // Refunds only make sense once money has been received.
  return TRANSITIONS[order.status].filter((t) => t !== "refunded" || order.paymentStatus === "paid");
}

export function isOrderStatus(s: unknown): s is OrderStatus {
  return typeof s === "string" && (ORDER_STATUS_VALUES as string[]).includes(s);
}

function orderSearchConditions({ q, from, to }: OrderFilters): SQL[] {
  const conds: SQL[] = [];
  const terms = (q ?? "").trim().split(/\s+/).filter(Boolean).slice(0, 5);
  for (const term of terms) {
    const pattern = `%${term.replace(/[%_]/g, "")}%`;
    conds.push(
      or(
        like(orders.orderNumber, pattern),
        like(orders.email, pattern),
        like(sql`${orders.shippingAddress}`, pattern),
        like(orders.trackingNumber, pattern),
      )!,
    );
  }
  const fromDate = parseDateInput(from);
  const toDate = parseDateInput(to, true);
  if (fromDate) conds.push(gte(orders.createdAt, fromDate));
  if (toDate) conds.push(lt(orders.createdAt, toDate));
  return conds;
}

export function orderWhere(filters: OrderFilters) {
  const conds = orderSearchConditions(filters);
  if (isOrderStatus(filters.status)) conds.push(eq(orders.status, filters.status));
  return conds.length ? and(...conds) : undefined;
}

export const ORDERS_PAGE_SIZE = 25;

export async function listOrders(filters: OrderFilters & { page: number }) {
  const where = orderWhere(filters);
  const searchOnly = orderSearchConditions(filters);

  const [rows, [{ n: total }], statusRows] = await Promise.all([
    db
      .select()
      .from(orders)
      .where(where)
      .orderBy(desc(orders.createdAt))
      .limit(ORDERS_PAGE_SIZE)
      .offset((filters.page - 1) * ORDERS_PAGE_SIZE),
    db.select({ n: count() }).from(orders).where(where),
    db
      .select({ status: orders.status, n: count() })
      .from(orders)
      .where(searchOnly.length ? and(...searchOnly) : undefined)
      .groupBy(orders.status),
  ]);

  const itemCounts = new Map<string, number>();
  if (rows.length) {
    const counts = await db
      .select({ orderId: orderItems.orderId, units: sql<number>`sum(${orderItems.quantity})` })
      .from(orderItems)
      .where(
        inArray(
          orderItems.orderId,
          rows.map((r) => r.id),
        ),
      )
      .groupBy(orderItems.orderId);
    for (const c of counts) itemCounts.set(c.orderId, Number(c.units));
  }

  const statusCounts: Record<string, number> = { all: 0 };
  for (const r of statusRows) {
    statusCounts[r.status] = r.n;
    statusCounts.all += r.n;
  }

  return {
    rows,
    total,
    pageCount: Math.max(1, Math.ceil(total / ORDERS_PAGE_SIZE)),
    statusCounts,
    itemCounts,
  };
}

/** Orders + items for CSV export (capped to keep responses bounded). */
export async function ordersForExport(where: SQL | undefined, limit = 5000) {
  return db.query.orders.findMany({
    where,
    orderBy: desc(orders.createdAt),
    limit,
    with: { items: true },
  });
}

export async function getOrderDetail(id: string) {
  const order = await db.query.orders.findFirst({
    where: eq(orders.id, id),
    with: { items: true, events: true, user: { columns: { passwordHash: false } } },
  });
  if (!order) return null;
  const [{ n: customerOrderCount }] = await db
    .select({ n: count() })
    .from(orders)
    .where(order.userId ? eq(orders.userId, order.userId) : eq(orders.email, order.email));
  return { order, customerOrderCount };
}

/* ------------------------------------------------------------------ */
/* Customers                                                           */
/* ------------------------------------------------------------------ */

export type CustomerFilters = { q?: string; filter?: string; sort?: string };
export const CUSTOMERS_PAGE_SIZE = 25;

function customerWhere({ q, filter }: CustomerFilters) {
  const conds: SQL[] = [];
  if (filter === "customers") conds.push(eq(users.role, "customer"));
  if (filter === "admins") conds.push(eq(users.role, "admin"));
  if (filter === "disabled") conds.push(eq(users.disabled, true));
  const terms = (q ?? "").trim().split(/\s+/).filter(Boolean).slice(0, 5);
  for (const term of terms) {
    const pattern = `%${term.replace(/[%_]/g, "")}%`;
    conds.push(
      or(
        like(users.email, pattern),
        like(users.firstName, pattern),
        like(users.lastName, pattern),
        like(users.phone, pattern),
      )!,
    );
  }
  return conds.length ? and(...conds) : undefined;
}

const spentExpr = sql<number>`coalesce(sum(case when ${orders.paymentStatus} = 'paid' then ${orders.total} else 0 end), 0)`;
const lastOrderExpr = sql<number | null>`max(${orders.createdAt})`;

function customerSelect() {
  return db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      phone: users.phone,
      role: users.role,
      disabled: users.disabled,
      marketingOptIn: users.marketingOptIn,
      createdAt: users.createdAt,
      lastLoginAt: users.lastLoginAt,
      orderCount: sql<number>`count(${orders.id})`,
      spent: spentExpr,
      lastOrder: lastOrderExpr,
    })
    .from(users)
    .leftJoin(orders, eq(orders.userId, users.id));
}

function normaliseCustomerRow<T extends { orderCount: number; spent: number; lastOrder: number | null }>(r: T) {
  return {
    ...r,
    orderCount: Number(r.orderCount),
    spent: Number(r.spent),
    lastOrder: r.lastOrder ? new Date(Number(r.lastOrder) * 1000) : null,
  };
}

export async function listCustomers(filters: CustomerFilters & { page: number }) {
  const where = customerWhere(filters);
  const order = filters.sort === "spent" ? desc(spentExpr) : filters.sort === "orders" ? desc(sql`count(${orders.id})`) : desc(users.createdAt);

  const [rows, [{ n: total }], tabCounts] = await Promise.all([
    customerSelect()
      .where(where)
      .groupBy(users.id)
      .orderBy(order)
      .limit(CUSTOMERS_PAGE_SIZE)
      .offset((filters.page - 1) * CUSTOMERS_PAGE_SIZE),
    db.select({ n: count() }).from(users).where(where),
    db
      .select({
        all: count(),
        customers: sql<number>`sum(case when ${users.role} = 'customer' then 1 else 0 end)`,
        admins: sql<number>`sum(case when ${users.role} = 'admin' then 1 else 0 end)`,
        disabled: sql<number>`sum(case when ${users.disabled} = 1 then 1 else 0 end)`,
      })
      .from(users)
      .where(customerWhere({ q: filters.q })),
  ]);

  const c = tabCounts[0];
  return {
    rows: rows.map(normaliseCustomerRow),
    total,
    pageCount: Math.max(1, Math.ceil(total / CUSTOMERS_PAGE_SIZE)),
    counts: {
      all: Number(c?.all ?? 0),
      customers: Number(c?.customers ?? 0),
      admins: Number(c?.admins ?? 0),
      disabled: Number(c?.disabled ?? 0),
    },
  };
}

export async function customersForExport(filters: CustomerFilters) {
  const rows = await customerSelect().where(customerWhere(filters)).groupBy(users.id).orderBy(desc(users.createdAt));
  return rows.map(normaliseCustomerRow);
}

export async function getCustomerDetail(id: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
    columns: { passwordHash: false },
  });
  if (!user) return null;

  const [customerOrders, customerAddresses, customerReviews, [wishlist]] = await Promise.all([
    db.query.orders.findMany({ where: eq(orders.userId, id), orderBy: desc(orders.createdAt), with: { items: true } }),
    db.query.addresses.findMany({ where: eq(addresses.userId, id), orderBy: desc(addresses.isDefault) }),
    db.query.reviews.findMany({
      where: eq(reviews.userId, id),
      orderBy: desc(reviews.createdAt),
      with: { product: { columns: { id: true, name: true, slug: true } } },
    }),
    db.select({ n: count() }).from(wishlistItems).where(eq(wishlistItems.userId, id)),
  ]);

  const paid = customerOrders.filter((o) => o.paymentStatus === "paid" && !CLOSED.includes(o.status));
  const lifetimeValue = paid.reduce((s, o) => s + o.total, 0);
  return {
    user,
    orders: customerOrders,
    addresses: customerAddresses,
    reviews: customerReviews,
    wishlistCount: wishlist.n,
    stats: {
      orderCount: customerOrders.length,
      lifetimeValue,
      aov: paid.length ? Math.round(lifetimeValue / paid.length) : 0,
      lastOrder: customerOrders[0]?.createdAt ?? null,
    },
  };
}

/* ------------------------------------------------------------------ */
/* Messages / subscribers / emails                                     */
/* ------------------------------------------------------------------ */

export async function messageCounts() {
  const rows = await db.select({ status: contactMessages.status, n: count() }).from(contactMessages).groupBy(contactMessages.status);
  const out: Record<string, number> = { new: 0, read: 0, archived: 0 };
  for (const r of rows) out[r.status] = r.n;
  return out;
}

export async function orderIdByNumber(orderNumber: string | null) {
  if (!orderNumber) return null;
  const row = await db.query.orders.findFirst({
    where: eq(orders.orderNumber, orderNumber.trim().toUpperCase()),
    columns: { id: true, orderNumber: true },
  });
  return row ?? null;
}

