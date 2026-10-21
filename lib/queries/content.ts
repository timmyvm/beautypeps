import "server-only";

import { and, asc, desc, eq, inArray, ne } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { TAGS } from "@/lib/cache-tags";
import { db } from "@/lib/db";
import { articles, categories, peptides, products, type Article, type Peptide } from "@/lib/db/schema";

/* Read-only queries for the Peptide Library, Journal and other educational pages. */

export async function getPublishedPeptides(): Promise<Peptide[]> {
  "use cache";
  cacheLife("days");
  cacheTag(TAGS.content);
  return db
    .select()
    .from(peptides)
    .where(eq(peptides.published, true))
    .orderBy(asc(peptides.sortOrder), asc(peptides.name));
}

export async function filterPeptides(opts: { peptideClass?: string; concern?: string }) {
  const all = await getPublishedPeptides();
  return all.filter(
    (p) =>
      (!opts.peptideClass || p.peptideClass === opts.peptideClass) &&
      (!opts.concern || p.concerns.includes(opts.concern)),
  );
}

export async function getPeptideBySlug(slug: string) {
  "use cache";
  cacheLife("days");
  cacheTag(TAGS.content);
  return db.query.peptides.findFirst({ where: and(eq(peptides.slug, slug), eq(peptides.published, true)) });
}

export async function getPeptidesBySlugs(slugs: string[]) {
  "use cache";
  cacheLife("days");
  cacheTag(TAGS.content);
  if (slugs.length === 0) return [];
  return db
    .select()
    .from(peptides)
    .where(and(inArray(peptides.slug, slugs), eq(peptides.published, true)))
    .orderBy(asc(peptides.sortOrder));
}

export async function getRelatedPeptides(peptide: Peptide, limit = 3) {
  const all = await getPublishedPeptides();
  const others = all.filter((p) => p.id !== peptide.id);
  const sameClass = others.filter((p) => p.peptideClass === peptide.peptideClass);
  const sharedConcern = others.filter(
    (p) => p.peptideClass !== peptide.peptideClass && p.concerns.some((c) => peptide.concerns.includes(c)),
  );
  return [...sameClass, ...sharedConcern].slice(0, limit);
}

const productCardColumns = {
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
  concerns: products.concerns,
  peptideSlugs: products.peptideSlugs,
  skinTypes: products.skinTypes,
  routineStep: products.routineStep,
  featured: products.featured,
  categorySlug: categories.slug,
  categoryName: categories.name,
};

export type CatalogProduct = Awaited<ReturnType<typeof getActiveProducts>>[number];

export async function getActiveProducts() {
  "use cache";
  cacheLife("days");
  cacheTag(TAGS.catalog);
  return db
    .select(productCardColumns)
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.status, "active"))
    .orderBy(asc(products.sortOrder), asc(products.name));
}

/** Active products whose formula includes the given peptide. */
export async function getProductsWithPeptide(slug: string) {
  const all = await getActiveProducts();
  return all.filter((p) => p.peptideSlugs.includes(slug));
}

/* ------------------------------------------------------------------ */
/* Journal                                                             */
/* ------------------------------------------------------------------ */

export async function getPublishedArticles(): Promise<Article[]> {
  "use cache";
  cacheLife("days");
  cacheTag(TAGS.content);
  return db
    .select()
    .from(articles)
    .where(eq(articles.published, true))
    .orderBy(desc(articles.publishedAt), desc(articles.createdAt));
}

export async function getArticleBySlug(slug: string) {
  "use cache";
  cacheLife("days");
  cacheTag(TAGS.content);
  return db.query.articles.findFirst({ where: and(eq(articles.slug, slug), eq(articles.published, true)) });
}

export async function getRelatedArticles(article: Pick<Article, "id" | "category">, limit = 3) {
  "use cache";
  cacheLife("days");
  cacheTag(TAGS.content);
  const rows = await db
    .select()
    .from(articles)
    .where(and(eq(articles.published, true), ne(articles.id, article.id)))
    .orderBy(desc(articles.publishedAt));
  const same = rows.filter((a) => a.category === article.category);
  const rest = rows.filter((a) => a.category !== article.category);
  return [...same, ...rest].slice(0, limit);
}

/** For each peptide, the first active formula that contains it (its specimen in the field guide). */
export async function getPeptideSpecimens(): Promise<Record<string, { slug: string; name: string; image: string }>> {
  const all = await getActiveProducts();
  const map: Record<string, { slug: string; name: string; image: string }> = {};
  for (const p of all) {
    for (const s of p.peptideSlugs) {
      if (!map[s]) map[s] = { slug: p.slug, name: p.name, image: p.image };
    }
  }
  return map;
}

/** Journal articles that name any of the given terms, most mentions first; falls back to the newest. */
export async function getArticlesMentioning(terms: string[], limit = 2) {
  const all = await getPublishedArticles();
  const needles = terms.filter((t) => t.length > 2).map((t) => t.toLowerCase());
  const scored = all
    .map((a) => {
      const hay = `${a.title} ${a.excerpt} ${a.body}`.toLowerCase();
      return { a, score: needles.reduce((n, t) => n + hay.split(t).length - 1, 0) };
    })
    .filter((s) => s.score > 0)
    .sort((x, y) => y.score - x.score)
    .map((s) => s.a);
  const rest = all.filter((a) => !scored.includes(a));
  return [...scored, ...rest].slice(0, limit);
}

/** Formulas carrying the peptides an article talks about, those with the most mentioned peptides first. */
export async function getProductsForArticle(article: Pick<Article, "title" | "body">, limit = 4) {
  const [peptideList, all] = await Promise.all([getPublishedPeptides(), getActiveProducts()]);
  const text = `${article.title} ${article.body}`.toLowerCase();
  const mentioned = new Set(
    peptideList
      .filter((p) => [p.name, p.inciName, ...p.aliases].some((t) => t.length > 2 && text.includes(t.toLowerCase())))
      .map((p) => p.slug),
  );
  if (mentioned.size === 0) return [];
  return all
    .map((p) => ({ p, n: p.peptideSlugs.filter((s) => mentioned.has(s)).length }))
    .filter((x) => x.n > 0)
    .sort((x, y) => y.n - x.n)
    .slice(0, limit)
    .map((x) => x.p);
}
