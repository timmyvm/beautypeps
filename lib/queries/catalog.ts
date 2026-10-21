import "server-only";

import { and, asc, desc, eq, inArray, or, sql, type AnyColumn, type SQL } from "drizzle-orm";
import { cache } from "react";
import type { ProductCardData } from "@/components/product/product-card";
import { db } from "@/lib/db";
import { articles, categories, peptides, products, reviews } from "@/lib/db/schema";

export type Rating = { average: number; count: number };
export type ProductSort = "featured" | "price-asc" | "price-desc" | "newest" | "rating";

export const PRODUCT_SORTS: { value: ProductSort; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "rating", label: "Top rated" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

const cardColumns = {
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
  keyActives: products.keyActives,
  concerns: products.concerns,
  peptideSlugs: products.peptideSlugs,
  featured: products.featured,
  sortOrder: products.sortOrder,
  createdAt: products.createdAt,
};

/** Approved review averages keyed by product id. */
export async function getRatingsMap(productIds?: string[]): Promise<Map<string, Rating>> {
  if (productIds && productIds.length === 0) return new Map();
  const rows = await db
    .select({
      productId: reviews.productId,
      average: sql<number>`avg(${reviews.rating})`,
      count: sql<number>`count(*)`,
    })
    .from(reviews)
    .where(
      productIds
        ? and(eq(reviews.status, "approved"), inArray(reviews.productId, productIds))
        : eq(reviews.status, "approved"),
    )
    .groupBy(reviews.productId);
  return new Map(rows.map((r) => [r.productId, { average: Number(r.average), count: Number(r.count) }]));
}

export const getCategories = cache(async () => {
  return db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.name));
});

export async function getCategoryBySlug(slug: string) {
  return db.query.categories.findFirst({ where: eq(categories.slug, slug) });
}

function escapeLike(term: string) {
  return term.replace(/[\\%_]/g, (c) => `\\${c}`);
}

export async function listProducts(opts: {
  category?: string;
  concern?: string;
  q?: string;
  sort?: ProductSort;
  inStock?: boolean;
  limit?: number;
}): Promise<ProductCardData[]> {
  const where: SQL[] = [eq(products.status, "active")];

  if (opts.category) {
    const cat = await getCategoryBySlug(opts.category);
    if (!cat) return [];
    where.push(eq(products.categoryId, cat.id));
  }
  if (opts.concern) {
    where.push(sql`exists (select 1 from json_each(${products.concerns}) where json_each.value = ${opts.concern})`);
  }
  if (opts.inStock) where.push(sql`${products.stock} > 0`);
  if (opts.q?.trim()) {
    const term = `%${escapeLike(opts.q.trim().toLowerCase())}%`;
    where.push(
      or(
        sql`lower(${products.name}) like ${term} escape '\\'`,
        sql`lower(coalesce(${products.subtitle}, '')) like ${term} escape '\\'`,
        sql`lower(${products.shortDescription}) like ${term} escape '\\'`,
        sql`lower(coalesce(${products.ingredients}, '')) like ${term} escape '\\'`,
        sql`lower(${products.peptideSlugs}) like ${term} escape '\\'`,
      )!,
    );
  }

  const sort = opts.sort ?? "featured";
  const orderBy =
    sort === "price-asc"
      ? [asc(products.price)]
      : sort === "price-desc"
        ? [desc(products.price)]
        : sort === "newest"
          ? [desc(products.createdAt), asc(products.sortOrder)]
          : [desc(products.featured), asc(products.sortOrder), asc(products.name)];

  const rows = await db
    .select(cardColumns)
    .from(products)
    .where(and(...where))
    .orderBy(...orderBy)
    .limit(opts.limit ?? 200);

  const ratings = await getRatingsMap(rows.map((r) => r.id));
  const result = rows.map((r) => ({ ...r, rating: ratings.get(r.id) ?? null }));

  if (sort === "rating") {
    result.sort(
      (a, b) =>
        (b.rating?.average ?? 0) - (a.rating?.average ?? 0) || (b.rating?.count ?? 0) - (a.rating?.count ?? 0),
    );
  }
  return result;
}

/** Featured products first (admin "featured" flag), topped up with the rest of the range. */
export async function getFeaturedProducts(limit = 8): Promise<ProductCardData[]> {
  const all = await listProducts({ sort: "featured", inStock: true });
  return all.slice(0, limit);
}

export const getProductBySlug = cache(async (slug: string) => {
  const product = await db.query.products.findFirst({
    where: and(eq(products.slug, slug), eq(products.status, "active")),
    with: { category: true },
  });
  return product ?? null;
});

export async function getApprovedReviews(productId: string) {
  return db
    .select()
    .from(reviews)
    .where(and(eq(reviews.productId, productId), eq(reviews.status, "approved")))
    .orderBy(desc(reviews.createdAt));
}

export async function getRelatedProducts(
  product: { id: string; categoryId: string | null; concerns: string[] },
  limit = 4,
): Promise<ProductCardData[]> {
  const candidates = await db
    .select({ ...cardColumns, categoryId: products.categoryId, concerns: products.concerns })
    .from(products)
    .where(and(eq(products.status, "active"), sql`${products.id} != ${product.id}`));

  const scored = candidates
    .map((c) => {
      const shared = c.concerns.filter((x) => product.concerns.includes(x)).length;
      const sameCat = c.categoryId && c.categoryId === product.categoryId ? 1 : 0;
      return { c, score: shared * 2 + sameCat + (c.featured ? 0.5 : 0) };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.c);

  const ratings = await getRatingsMap(scored.map((s) => s.id));
  return scored.map((s) => ({ ...s, rating: ratings.get(s.id) ?? null }));
}

export async function getPeptidesBySlugs(slugs: string[]) {
  if (slugs.length === 0) return [];
  const rows = await db
    .select({
      slug: peptides.slug,
      name: peptides.name,
      inciName: peptides.inciName,
      peptideClass: peptides.peptideClass,
      summary: peptides.summary,
      evidenceLevel: peptides.evidenceLevel,
    })
    .from(peptides)
    .where(and(inArray(peptides.slug, slugs), eq(peptides.published, true)));
  return slugs.map((s) => rows.find((r) => r.slug === s)).filter((r): r is (typeof rows)[number] => !!r);
}

export async function getPeptideTeasers(limit = 6) {
  return db
    .select({
      slug: peptides.slug,
      name: peptides.name,
      inciName: peptides.inciName,
      peptideClass: peptides.peptideClass,
      summary: peptides.summary,
      evidenceLevel: peptides.evidenceLevel,
    })
    .from(peptides)
    .where(eq(peptides.published, true))
    .orderBy(asc(peptides.sortOrder), asc(peptides.name))
    .limit(limit);
}

export async function getLatestArticles(limit = 3) {
  return db
    .select({
      slug: articles.slug,
      title: articles.title,
      excerpt: articles.excerpt,
      coverImage: articles.coverImage,
      category: articles.category,
      readMinutes: articles.readMinutes,
      publishedAt: articles.publishedAt,
    })
    .from(articles)
    .where(eq(articles.published, true))
    .orderBy(desc(articles.publishedAt), desc(articles.createdAt))
    .limit(limit);
}

/** Approved high-rated reviews with their product, for social proof. */
export async function getTopReviews(limit = 6) {
  return db
    .select({
      id: reviews.id,
      authorName: reviews.authorName,
      rating: reviews.rating,
      title: reviews.title,
      body: reviews.body,
      verifiedPurchase: reviews.verifiedPurchase,
      productName: products.name,
      productSlug: products.slug,
      productImage: products.image,
    })
    .from(reviews)
    .innerJoin(products, eq(products.id, reviews.productId))
    .where(and(eq(reviews.status, "approved"), sql`${reviews.rating} >= 5`, eq(products.status, "active")))
    .orderBy(desc(reviews.createdAt))
    .limit(limit);
}

export async function getUserReviewForProduct(userId: string, productId: string) {
  return db.query.reviews.findFirst({
    where: and(eq(reviews.userId, userId), eq(reviews.productId, productId)),
  });
}

export async function searchAll(q: string) {
  const term = q.trim().toLowerCase();
  if (!term) return { products: [], peptides: [], articles: [] };
  const pattern = `%${escapeLike(term)}%`;
  const likeCi = (col: AnyColumn) => sql`lower(coalesce(${col}, '')) like ${pattern} escape '\\'`;

  const [productResults, peptideResults, articleResults] = await Promise.all([
    listProducts({ q: term, limit: 24 }),
    db
      .select({
        slug: peptides.slug,
        name: peptides.name,
        inciName: peptides.inciName,
        peptideClass: peptides.peptideClass,
        summary: peptides.summary,
      })
      .from(peptides)
      .where(
        and(
          eq(peptides.published, true),
          or(
            likeCi(peptides.name),
            likeCi(peptides.inciName),
            sql`lower(${peptides.aliases}) like ${pattern} escape '\\'`,
            likeCi(peptides.summary),
          ),
        ),
      )
      .orderBy(asc(peptides.sortOrder))
      .limit(12),
    db
      .select({
        slug: articles.slug,
        title: articles.title,
        excerpt: articles.excerpt,
        coverImage: articles.coverImage,
        category: articles.category,
        readMinutes: articles.readMinutes,
      })
      .from(articles)
      .where(and(eq(articles.published, true), or(likeCi(articles.title), likeCi(articles.excerpt), likeCi(articles.category))))
      .orderBy(desc(articles.publishedAt))
      .limit(12),
  ]);

  return { products: productResults, peptides: peptideResults, articles: articleResults };
}

/** Is the product in the signed-in user's wishlist? */
export async function isInWishlist(userId: string, productId: string) {
  const row = await db.query.wishlistItems.findFirst({
    where: (w, { and: a, eq: e }) => a(e(w.userId, userId), e(w.productId, productId)),
  });
  return !!row;
}
