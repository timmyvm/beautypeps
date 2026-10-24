import type { Metadata } from "next";
import { JsonLd, siteUrl } from "@/components/info/json-ld";
import { CatalogueGuide } from "@/components/home/catalogue-guide";
import { CopperScene, type CopperFrame } from "@/components/home/scenes/copper-scene";
import { PowderScene } from "@/components/home/scenes/powder-scene";
import { FaqCards, LibraryList, ReviewSlips } from "@/components/home/sections";
import { SequenceScene, type SequenceBeat } from "@/components/home/scenes/sequence-scene";
import { SpecimenHero } from "@/components/home/specimen-hero";
import { specimenTrimSrc } from "@/components/product/product-card";
import { CONCERNS } from "@/lib/constants";
import { getTopReviews, listProducts } from "@/lib/queries/catalog";
import { getPublishedPeptides } from "@/lib/queries/content";
import { pageMetadata } from "@/lib/seo";
import { formatMoney } from "@/lib/format";
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
  const seqOf = (slug: string) => peptides.find((p) => p.slug === slug)?.sequence ?? "";
  const imageOf = (slug: string) => {
    const p = bySlug(slug);
    return p ? (specimenTrimSrc(p.image) ?? p.image) : "";
  };
  const price = (slug: string) => {
    const p = bySlug(slug);
    return p ? formatMoney(p.price).replace(/\.00$/, "") : "";
  };
  const copperFrames: CopperFrame[] = [
    {
      src: "/images/found/chalcanthite.webp",
      alt: "A cluster of deep blue chalcanthite crystals, copper sulfate, on a white table",
      name: "Copper, as a mineral",
      fact: "Chalcanthite",
      ratio: 1920 / 1558,
    },
    {
      src: "/video/copper-drop-poster.webp",
      video: "/video/copper-drop.mp4",
      alt: "Drops of blue copper peptide serum on a brushed copper plate",
      name: "A drop of it",
      fact: "Blue from the copper ion",
      ratio: 3 / 2,
      href: "/learn/copper-peptides-ghk-cu-guide",
    },
    {
      src: "/images/editorial/ghk-cu-plinth.webp",
      alt: "GHK-Cu copper peptide serum, sapphire blue, on a travertine plinth",
      name: "GHK-Cu serum",
      fact: `1% · ${price("ghk-cu-copper-peptide-serum")}`,
      ratio: 1,
      href: "/products/ghk-cu-copper-peptide-serum",
      lifted: true,
    },
    {
      src: "/images/editorial/collar-macro.webp",
      alt: "The brushed copper collar of the serum bottle above the blue liquid",
      name: "The collar",
      fact: "Brushed copper",
      ratio: 4 / 5,
      href: "/products/ghk-cu-copper-peptide-serum",
    },
    {
      src: "/images/products/ghk-cu-pure-powder.webp",
      alt: "Amber vial of freeze-dried blue GHK-Cu powder",
      name: "GHK-Cu powder",
      fact: `1 g · ${price("ghk-cu-pure-powder")}`,
      ratio: 4 / 5,
      href: "/products/ghk-cu-pure-powder",
    },
    {
      src: "/images/products/scalp-peptide-serum.webp",
      alt: "Pale blue scalp serum with copper and biotinoyl tripeptide-1",
      name: "Scalp serum",
      fact: `60 mL · ${price("scalp-peptide-serum")}`,
      ratio: 4 / 5,
      href: "/products/scalp-peptide-serum",
    },
    {
      src: "/images/products/copper-ritual-kit.webp",
      alt: "The Copper Ritual Kit: GHK-Cu serum, night cream and eye gel in a gift box",
      name: "Copper Ritual Kit",
      fact: price("copper-ritual-kit"),
      ratio: 4 / 5,
      href: "/products/copper-ritual-kit",
    },
  ];

  const beats: SequenceBeat[] = [
    {
      slug: "ghk-cu-copper-peptide-serum",
      image: imageOf("ghk-cu-copper-peptide-serum"),
      product: "GHK-Cu Copper Peptide Serum",
      figure: "1%",
      of: "Copper tripeptide-1",
      line: "Three amino acids holding one copper ion. Glycine, histidine and lysine are also the three circles of our mark.",
      strands: [{ label: "GHK-Cu", sequence: seqOf("ghk-cu") }],
      tone: "stone",
    },
    {
      slug: "argireline-10-serum",
      image: imageOf("argireline-10-serum"),
      product: "Argireline 10% Expression Line Serum",
      figure: "10%",
      of: "Argireline solution",
      line: "Six amino acids, capped at both ends so the enzymes in skin leave the chain alone for longer.",
      strands: [{ label: "Acetyl hexapeptide-8", sequence: seqOf("acetyl-hexapeptide-8") }],
      tone: "frost",
    },
    {
      slug: "matrixyl-3000-serum",
      image: imageOf("matrixyl-3000-serum"),
      product: "Matrixyl 3000 Collagen Peptide Serum",
      figure: "8%",
      of: "Matrixyl 3000 complex",
      line: "Two short chains, each on a 16-carbon fatty tail that helps it through the skin's oily outer layer.",
      strands: [
        { label: "Palmitoyl tripeptide-1", sequence: seqOf("palmitoyl-tripeptide-1") },
        { label: "Palmitoyl tetrapeptide-7", sequence: seqOf("palmitoyl-tetrapeptide-7") },
      ],
      tone: "sapphire",
    },
  ];
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

      <SpecimenHero products={products} ghkSequence={seqOf("ghk-cu")} />

      <div className="mt-24 lg:mt-40">
        <SequenceScene beats={beats} />
      </div>

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

      <div className="mt-40 lg:mt-60">
        <CopperScene frames={copperFrames} />
      </div>
      <LibraryList peptides={peptides} vial={bySlug("ghk-cu-pure-powder")} />
      <div className="mt-40 lg:mt-60">
        <PowderScene powderImage={imageOf("matrixyl-pure-powder")} />
      </div>
      <ReviewSlips reviews={reviews} />
      <FaqCards settings={settings} />
    </>
  );
}
