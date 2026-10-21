import { eq } from "drizzle-orm";
import type { MetadataRoute } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { TAGS } from "@/lib/cache-tags";
import { db } from "@/lib/db";
import { articles, peptides, products } from "@/lib/db/schema";

type Freq = MetadataRoute.Sitemap[number]["changeFrequency"];

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: Freq; from?: "catalog" | "peptides" | "articles" | "all" }[] = [
  { path: "", priority: 1, changeFrequency: "daily", from: "all" },
  { path: "/shop", priority: 0.9, changeFrequency: "daily", from: "catalog" },
  { path: "/peptides", priority: 0.9, changeFrequency: "weekly", from: "peptides" },
  { path: "/learn", priority: 0.8, changeFrequency: "weekly", from: "articles" },
  { path: "/science", priority: 0.8, changeFrequency: "monthly" },
  { path: "/compare", priority: 0.7, changeFrequency: "monthly", from: "peptides" },
  { path: "/routine-builder", priority: 0.7, changeFrequency: "monthly", from: "catalog" },
  { path: "/glossary", priority: 0.6, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.6, changeFrequency: "monthly" },
  { path: "/about", priority: 0.5, changeFrequency: "yearly" },
  { path: "/contact", priority: 0.4, changeFrequency: "yearly" },
  { path: "/policies/shipping", priority: 0.3, changeFrequency: "yearly" },
  { path: "/policies/returns", priority: 0.3, changeFrequency: "yearly" },
  { path: "/policies/terms", priority: 0.2, changeFrequency: "yearly" },
  { path: "/policies/privacy", priority: 0.2, changeFrequency: "yearly" },
];

async function sitemapRows() {
  "use cache";
  cacheLife("days");
  cacheTag(TAGS.catalog, TAGS.content);
  const [productRows, peptideRows, articleRows] = await Promise.all([
    db
      .select({ slug: products.slug, updatedAt: products.updatedAt, image: products.image, gallery: products.gallery })
      .from(products)
      .where(eq(products.status, "active")),
    db.select({ slug: peptides.slug, updatedAt: peptides.updatedAt }).from(peptides).where(eq(peptides.published, true)),
    db
      .select({ slug: articles.slug, updatedAt: articles.updatedAt, coverImage: articles.coverImage })
      .from(articles)
      .where(eq(articles.published, true)),
  ]);
  return { productRows, peptideRows, articleRows };
}

const latest = (dates: Date[]) => (dates.length ? new Date(Math.max(...dates.map((d) => d.getTime()))) : undefined);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const abs = (src: string) => (/^https?:\/\//.test(src) ? src : `${base}${src.startsWith("/") ? src : `/${src}`}`);
  const { productRows, peptideRows, articleRows } = await sitemapRows();

  // A listing page changed when the newest thing on it did; pages of fixed copy carry no date rather than a made-up one.
  const changed = {
    catalog: latest(productRows.map((p) => p.updatedAt)),
    peptides: latest(peptideRows.map((p) => p.updatedAt)),
    articles: latest(articleRows.map((a) => a.updatedAt)),
  };
  const lastModified = (from?: "catalog" | "peptides" | "articles" | "all") =>
    from === "all" ? latest(Object.values(changed).filter((d): d is Date => !!d)) : from ? changed[from] : undefined;

  return [
    ...STATIC_ROUTES.map((r) => ({
      url: `${base}${r.path}`,
      lastModified: lastModified(r.from),
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    })),
    ...productRows.map((p) => ({
      url: `${base}/products/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      images: [p.image, ...p.gallery.filter((g) => g && g !== p.image)].map(abs),
    })),
    ...peptideRows.map((p) => ({
      url: `${base}/peptides/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...articleRows.map((a) => ({
      url: `${base}/learn/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
      images: a.coverImage ? [abs(a.coverImage)] : undefined,
    })),
  ];
}
