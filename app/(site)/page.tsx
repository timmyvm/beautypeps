import type { Metadata } from "next";
import { CatalogueGuide } from "@/components/home/catalogue-guide";
import { BlueByCopper, FaqCards, LibraryList, PowderToSkin, ReviewSlips } from "@/components/home/sections";
import { SpecimenHero } from "@/components/home/specimen-hero";
import { CONCERNS } from "@/lib/constants";
import { getTopReviews, listProducts } from "@/lib/queries/catalog";
import { getPublishedPeptides } from "@/lib/queries/content";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: { absolute: "Beauty Peps — Peptide serums, graded" },
  description:
    "Small-batch Melbourne serums from 13 cosmetic peptides, with the concentration on every label and an evidence grade for every peptide. GHK-Cu, Matrixyl, Argireline, SNAP-8 and more.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [settings, products, peptides, reviews] = await Promise.all([
    getSettings(),
    listProducts({ sort: "featured" }),
    getPublishedPeptides(),
    getTopReviews(3),
  ]);

  const bySlug = (slug: string) => products.find((p) => p.slug === slug);
  const grades = Object.fromEntries(peptides.map((p) => [p.slug, { name: p.name, grade: p.evidenceLevel }]));

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.storeName,
    url: siteUrl,
    logo: `${siteUrl}/images/brand/logo-wordmark.png`,
    email: settings.supportEmail,
    sameAs: [settings.instagram, settings.tiktok].filter(Boolean),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd).replace(/</g, "\\u003c") }}
      />

      <SpecimenHero products={products} />

      <section className="container-bp mt-24 pt-3 lg:mt-40" aria-labelledby="catalogue-title">
        <h2 id="catalogue-title" className="display-type mb-4 text-head" data-reveal="">
          All {products.length} formulas
        </h2>
        <CatalogueGuide
          products={products}
          concerns={CONCERNS.map((c) => ({ slug: c.slug, label: c.label }))}
          grades={grades}
        />
      </section>

      <BlueByCopper products={products} />
      <LibraryList peptides={peptides} vial={bySlug("ghk-cu-pure-powder")} />
      <PowderToSkin powder={bySlug("matrixyl-pure-powder")} serum={bySlug("multi-peptide-complex")} />
      <ReviewSlips reviews={reviews} />
      <FaqCards settings={settings} />
    </>
  );
}
