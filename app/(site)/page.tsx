import type { Metadata } from "next";
import { JsonLd, siteUrl } from "@/components/info/json-ld";
import { CatalogueGuide } from "@/components/home/catalogue-guide";
import { BlueByCopper, FaqCards, LibraryList, PowderToSkin, ReviewSlips } from "@/components/home/sections";
import { SpecimenHero } from "@/components/home/specimen-hero";
import { CONCERNS } from "@/lib/constants";
import { getTopReviews, listProducts } from "@/lib/queries/catalog";
import { getPublishedPeptides } from "@/lib/queries/content";
import { pageMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Beauty Peps: peptide serums, graded",
    description:
      "Small-batch Melbourne serums from 13 cosmetic peptides, with the concentration on every label and an evidence grade for every peptide. GHK-Cu, Matrixyl, Argireline, SNAP-8 and more.",
    path: "/",
  }),
  title: { absolute: "Beauty Peps — Peptide serums, graded" },
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

  // The shop as an organisation (who sells, where, how to reach it, returns) and the site itself (its name in results).
  const base = siteUrl();
  const storeJsonLd = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "@id": `${base}/#store`,
    name: settings.storeName,
    url: `${base}/`,
    logo: `${base}/images/brand/logo-wordmark.png`,
    image: `${base}/opengraph-image`,
    description: metadata.description,
    email: settings.supportEmail,
    ...(settings.supportPhone && { telephone: settings.supportPhone }),
    address: { "@type": "PostalAddress", addressLocality: "Melbourne", addressRegion: "VIC", addressCountry: "AU" },
    areaServed: { "@type": "Country", name: "Australia" },
    currenciesAccepted: "AUD",
    paymentAccepted: "Bank transfer, PayID",
    contactPoint: { "@type": "ContactPoint", contactType: "customer support", email: settings.supportEmail, availableLanguage: "en-AU" },
    hasMerchantReturnPolicy: {
      "@type": "MerchantReturnPolicy",
      applicableCountry: "AU",
      returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
      merchantReturnDays: 30,
      returnMethod: "https://schema.org/ReturnByMail",
      returnFees: "https://schema.org/ReturnShippingFees",
    },
    sameAs: [settings.instagram, settings.tiktok].filter((u) => u && !/^https?:\/\/[^/]+\/?$/.test(u)),
  };
  const siteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${base}/#website`,
    name: settings.storeName,
    url: `${base}/`,
    inLanguage: "en-AU",
    publisher: { "@id": `${base}/#store` },
  };

  return (
    <>
      <JsonLd data={storeJsonLd} />
      <JsonLd data={siteJsonLd} />

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
