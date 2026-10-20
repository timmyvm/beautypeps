import "server-only";

import { and, asc, count, desc, eq, like, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  articles,
  categories,
  orderItems,
  peptides,
  products,
  reviews,
  type ProductStatus,
  type ReviewStatus,
} from "@/lib/db/schema";

/* ------------------------------------------------------------------ */
/* Products                                                            */
/* ------------------------------------------------------------------ */

export const ADMIN_PAGE_SIZE = 25;

export type ProductListFilters = {
  q?: string;
  status?: string;
  category?: string;
  low?: string;
  page?: number;
};

export async function listAdminProducts(filters: ProductListFilters) {
  const conditions: SQL[] = [];
  if (filters.q) {
    const term = `%${filters.q.toLowerCase()}%`;
    conditions.push(
      or(
        like(sql`lower(${products.name})`, term),
        like(sql`lower(${products.sku})`, term),
        like(sql`lower(${products.slug})`, term),
      )!,
    );
  }
  if (filters.status && ["active", "draft", "archived"].includes(filters.status)) {
    conditions.push(eq(products.status, filters.status as ProductStatus));
  }
  if (filters.category === "none") conditions.push(sql`${products.categoryId} is null`);
  else if (filters.category) conditions.push(eq(products.categoryId, filters.category));
  if (filters.low) conditions.push(sql`${products.stock} <= ${products.lowStockThreshold}`);

  const where = conditions.length ? and(...conditions) : undefined;
  const page = Math.max(1, filters.page ?? 1);

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: products.id,
        slug: products.slug,
        name: products.name,
        sku: products.sku,
        image: products.image,
        price: products.price,
        compareAtPrice: products.compareAtPrice,
        stock: products.stock,
        lowStockThreshold: products.lowStockThreshold,
        status: products.status,
        featured: products.featured,
        updatedAt: products.updatedAt,
        categoryName: categories.name,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(where)
      .orderBy(asc(products.sortOrder), asc(products.name))
      .limit(ADMIN_PAGE_SIZE)
      .offset((page - 1) * ADMIN_PAGE_SIZE),
    db.select({ total: count() }).from(products).where(where),
  ]);

  return { rows, total, page, pageCount: Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE)) };
}

export async function productStatusCounts() {
  const rows = await db.select({ status: products.status, n: count() }).from(products).groupBy(products.status);
  const counts = { all: 0, active: 0, draft: 0, archived: 0 } as Record<"all" | ProductStatus, number>;
  for (const r of rows) {
    counts[r.status] = r.n;
    counts.all += r.n;
  }
  return counts;
}

export async function lowStockCount() {
  const [{ n }] = await db
    .select({ n: count() })
    .from(products)
    .where(and(sql`${products.stock} <= ${products.lowStockThreshold}`, eq(products.status, "active")));
  return n;
}

export async function getAdminProduct(id: string) {
  return db.query.products.findFirst({ where: eq(products.id, id) });
}

export async function productOrderCount(productId: string) {
  const [{ n }] = await db.select({ n: count() }).from(orderItems).where(eq(orderItems.productId, productId));
  return n;
}

/* ------------------------------------------------------------------ */
/* Categories                                                          */
/* ------------------------------------------------------------------ */

export async function listCategoryOptions() {
  return db
    .select({ id: categories.id, name: categories.name, slug: categories.slug })
    .from(categories)
    .orderBy(asc(categories.sortOrder), asc(categories.name));
}

export async function listCategoriesWithCounts() {
  return db
    .select({
      id: categories.id,
      slug: categories.slug,
      name: categories.name,
      tagline: categories.tagline,
      image: categories.image,
      sortOrder: categories.sortOrder,
      productCount: sql<number>`(select count(*) from ${products} where ${products.categoryId} = ${categories.id})`,
    })
    .from(categories)
    .orderBy(asc(categories.sortOrder), asc(categories.name));
}

/* ------------------------------------------------------------------ */
/* Peptides                                                            */
/* ------------------------------------------------------------------ */

export async function listPeptideOptions() {
  return db
    .select({ slug: peptides.slug, name: peptides.name, inciName: peptides.inciName })
    .from(peptides)
    .orderBy(asc(peptides.sortOrder), asc(peptides.name));
}

/** Peptides with how many products reference each slug (peptideSlugs is a JSON array). */
export async function listPeptidesWithUsage() {
  const [rows, productRows] = await Promise.all([
    db.select().from(peptides).orderBy(asc(peptides.sortOrder), asc(peptides.name)),
    db.select({ peptideSlugs: products.peptideSlugs }).from(products),
  ]);
  const usage = new Map<string, number>();
  for (const p of productRows) for (const slug of p.peptideSlugs) usage.set(slug, (usage.get(slug) ?? 0) + 1);
  return rows.map((r) => ({ ...r, productCount: usage.get(r.slug) ?? 0 }));
}

export async function productsUsingPeptide(slug: string) {
  const rows = await db.select({ id: products.id, name: products.name, peptideSlugs: products.peptideSlugs }).from(products);
  return rows.filter((r) => r.peptideSlugs.includes(slug));
}

/* ------------------------------------------------------------------ */
/* Reviews                                                             */
/* ------------------------------------------------------------------ */

export async function listAdminReviews(filters: { status?: string; rating?: string; product?: string; page?: number }) {
  const conditions: SQL[] = [];
  const status = filters.status ?? "pending";
  if (status !== "all" && ["pending", "approved", "rejected"].includes(status)) {
    conditions.push(eq(reviews.status, status as ReviewStatus));
  }
  const rating = Number(filters.rating);
  if (rating >= 1 && rating <= 5) conditions.push(eq(reviews.rating, rating));
  if (filters.product) conditions.push(eq(reviews.productId, filters.product));
  const where = conditions.length ? and(...conditions) : undefined;
  const page = Math.max(1, filters.page ?? 1);

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        title: reviews.title,
        body: reviews.body,
        authorName: reviews.authorName,
        skinType: reviews.skinType,
        verifiedPurchase: reviews.verifiedPurchase,
        status: reviews.status,
        adminReply: reviews.adminReply,
        createdAt: reviews.createdAt,
        productId: products.id,
        productName: products.name,
        productSlug: products.slug,
        productImage: products.image,
      })
      .from(reviews)
      .innerJoin(products, eq(reviews.productId, products.id))
      .where(where)
      .orderBy(desc(reviews.createdAt))
      .limit(ADMIN_PAGE_SIZE)
      .offset((page - 1) * ADMIN_PAGE_SIZE),
    db.select({ total: count() }).from(reviews).where(where),
  ]);
  return { rows, total, page, pageCount: Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE)) };
}

export async function reviewStatusCounts() {
  const rows = await db.select({ status: reviews.status, n: count() }).from(reviews).groupBy(reviews.status);
  const counts = { all: 0, pending: 0, approved: 0, rejected: 0 } as Record<"all" | ReviewStatus, number>;
  for (const r of rows) {
    counts[r.status] = r.n;
    counts.all += r.n;
  }
  return counts;
}

export async function listProductOptions() {
  return db.select({ id: products.id, name: products.name }).from(products).orderBy(asc(products.name));
}

/* ------------------------------------------------------------------ */
/* Articles                                                            */
/* ------------------------------------------------------------------ */

export async function listAdminArticles(filters: { q?: string; status?: string }) {
  const conditions: SQL[] = [];
  if (filters.q) conditions.push(like(sql`lower(${articles.title})`, `%${filters.q.toLowerCase()}%`));
  if (filters.status === "published") conditions.push(eq(articles.published, true));
  if (filters.status === "draft") conditions.push(eq(articles.published, false));
  return db
    .select({
      id: articles.id,
      slug: articles.slug,
      title: articles.title,
      category: articles.category,
      coverImage: articles.coverImage,
      published: articles.published,
      featured: articles.featured,
      publishedAt: articles.publishedAt,
      readMinutes: articles.readMinutes,
      updatedAt: articles.updatedAt,
    })
    .from(articles)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(sql`coalesce(${articles.publishedAt}, ${articles.createdAt})`));
}

/* ------------------------------------------------------------------ */
/* FormData helpers shared by the catalogue server actions             */
/* ------------------------------------------------------------------ */

export function str(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

/** Empty string → null. */
export function optStr(formData: FormData, key: string) {
  const v = str(formData, key);
  return v === "" ? null : v;
}

export function bool(formData: FormData, key: string) {
  const v = formData.get(key);
  return v === "on" || v === "true" || v === "1";
}

export function int(formData: FormData, key: string, fallback = 0) {
  const raw = str(formData, key);
  if (raw === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? Math.trunc(n) : NaN;
}

/** Repeated checkbox values, de-duplicated. */
export function list(formData: FormData, key: string) {
  return [...new Set(formData.getAll(key).map((v) => String(v).trim()).filter(Boolean))];
}

/** One item per line (textarea). */
export function lines(formData: FormData, key: string) {
  return str(formData, key)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

/** JSON array posted by a hidden input; anything malformed becomes []. */
export function jsonArray<T = unknown>(formData: FormData, key: string): T[] {
  try {
    const parsed = JSON.parse(str(formData, key) || "[]");
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
