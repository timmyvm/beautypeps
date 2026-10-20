import type { Metadata } from "next";
import {
  ActivesBand,
  Bestsellers,
  ConcernTiles,
  FaqTeaser,
  Hero,
  JournalTeaser,
  MeetThePeptides,
  NewsletterBand,
  ReviewsGrid,
  RitualSection,
  RoutineBuilderCta,
  ScienceBand,
  Spotlight,
  TrustStrip,
} from "@/components/home/sections";
import {
  getFeaturedProducts,
  getLatestArticles,
  getPeptideTeasers,
  getProductBySlug,
  getTopReviews,
} from "@/lib/queries/catalog";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: { absolute: "Beauty Peps — Clinical Beauty Peptides, Made in Australia" },
  description:
    "High-concentration peptide serums and pure cosmetic-grade actives — GHK-Cu, Matrixyl, Argireline, SNAP-8 and more — plus a free, evidence-led Peptide Library.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [settings, bestsellers, peptides, spotlight, articles, reviews] = await Promise.all([
    getSettings(),
    getFeaturedProducts(8),
    getPeptideTeasers(6),
    getProductBySlug("ghk-cu-copper-peptide-serum"),
    getLatestArticles(3),
    getTopReviews(6),
  ]);

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
      <Hero />
      <TrustStrip freeShippingThreshold={settings.freeShippingThreshold} />
      <Bestsellers products={bestsellers.slice(0, 8)} />
      <ConcernTiles />
      <MeetThePeptides peptides={peptides} />
      <ScienceBand />
      <Spotlight product={spotlight} />
      <RitualSection />
      <RoutineBuilderCta />
      <JournalTeaser articles={articles} />
      <ReviewsGrid reviews={reviews} />
      <ActivesBand />
      <FaqTeaser />
      <NewsletterBand />
    </>
  );
}
