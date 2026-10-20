import { eq } from "drizzle-orm";
import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { articles, peptides, products } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "", priority: 1, changeFrequency: "daily" },
  { path: "/shop", priority: 0.9, changeFrequency: "daily" },
  { path: "/peptides", priority: 0.9, changeFrequency: "weekly" },
  { path: "/learn", priority: 0.8, changeFrequency: "weekly" },
  { path: "/science", priority: 0.8, changeFrequency: "monthly" },
  { path: "/compare", priority: 0.7, changeFrequency: "monthly" },
  { path: "/routine-builder", priority: 0.7, changeFrequency: "monthly" },
  { path: "/glossary", priority: 0.6, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.6, changeFrequency: "monthly" },
  { path: "/about", priority: 0.5, changeFrequency: "yearly" },
  { path: "/contact", priority: 0.4, changeFrequency: "yearly" },
  { path: "/track", priority: 0.3, changeFrequency: "yearly" },
  { path: "/policies/shipping", priority: 0.3, changeFrequency: "yearly" },
  { path: "/policies/returns", priority: 0.3, changeFrequency: "yearly" },
  { path: "/policies/terms", priority: 0.2, changeFrequency: "yearly" },
  { path: "/policies/privacy", priority: 0.2, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const now = new Date();
  const abs = (src: string) => (/^https?:\/\//.test(src) ? src : `${base}${src.startsWith("/") ? src : `/${src}`}`);

  const [productRows, peptideRows, articleRows] = await Promise.all([
    db.select({ slug: products.slug, updatedAt: products.updatedAt, image: products.image }).from(products).where(eq(products.status, "active")),
    db.select({ slug: peptides.slug, updatedAt: peptides.updatedAt }).from(peptides).where(eq(peptides.published, true)),
    db
      .select({ slug: articles.slug, updatedAt: articles.updatedAt, coverImage: articles.coverImage })
      .from(articles)
      .where(eq(articles.published, true)),
  ]);

  return [
    ...STATIC_ROUTES.map((r) => ({
      url: `${base}${r.path}`,
      lastModified: now,
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    })),
    ...productRows.map((p) => ({
      url: `${base}/products/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      images: p.image ? [abs(p.image)] : undefined,
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
