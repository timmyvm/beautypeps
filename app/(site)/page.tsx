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
    title: "Beauty Peps: beauty peptides, graded",
    description:
      "GHK-Cu, SNAP-8 and glutathione by the vial, sent from Melbourne, with an open library grading the evidence for 13 cosmetic peptides.",
    path: "/",
  }),
  title: { absolute: "Beauty Peps — Beauty peptides, graded" },
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
      alt: "Drops of blue copper peptide solution on a brushed copper plate",
      name: "A drop of it",
      fact: "Blue from the copper ion",
      ratio: 3 / 2,
      href: "/learn/copper-peptides-ghk-cu-guide",
    },
    {
      src: "/images/products/ghk-cu-50mg.webp",
      alt: "A vial of GHK-Cu, blue freeze-dried powder, on a travertine plinth beside a spatula of powder",
      name: "GHK-Cu 50 mg",
      fact: `Freeze-dried · ${price("ghk-cu-50mg")}`,
      ratio: 4 / 5,
      href: "/products/ghk-cu-50mg",
      lifted: true,
    },
    {
      src: "/video/powder-dissolve-poster.webp",
      video: "/video/powder-dissolve.mp4",
      alt: "Blue GHK-Cu powder falling into a beaker of water and blooming into blue clouds",
      name: "Into water",
      fact: "It dissolves blue",
      ratio: 5 / 4,
      href: "/peptides/ghk-cu",
    },
    {
      src: "/images/products/ghk-cu-100mg.webp",
      alt: "A vial of GHK-Cu, 100 mg of blue freeze-dried powder",
      name: "GHK-Cu 100 mg",
      fact: `Freeze-dried · ${price("ghk-cu-100mg")}`,
      ratio: 4 / 5,
      href: "/products/ghk-cu-100mg",
    },
    {
      src: "/images/editorial/cold-chain.webp",
      alt: "Sealed amber vials of peptide powder on a refrigerator shelf beside a dial thermometer",
      name: "Kept cold",
      fact: "2–8 °C, sealed",
      ratio: 4 / 5,
      href: "/learn/storing-peptide-powders",
    },
  ];

  const beats = ([
    {
      slug: "ghk-cu-50mg",
      image: imageOf("ghk-cu-50mg"),
      product: "GHK-Cu 50 mg",
      figure: "50 mg",
      of: "Copper tripeptide-1",
      line: "Three amino acids holding one copper ion. Glycine, histidine and lysine are also the three circles of our mark.",
      strands: [{ label: "GHK-Cu", sequence: seqOf("ghk-cu") }],
      tone: "stone",
    },
    {
      slug: "snap-8-10mg",
      image: imageOf("snap-8-10mg"),
      product: "SNAP-8 10 mg",
      figure: "10 mg",
      of: "Acetyl octapeptide-3",
      line: "Eight amino acids, capped at both ends: Argireline with two more on the end of the chain.",
      strands: [{ label: "Acetyl octapeptide-3", sequence: seqOf("acetyl-octapeptide-3") }],
      tone: "frost",
    },
    {
      slug: "glutathione-600mg",
      image: imageOf("glutathione-600mg"),
      product: "Glutathione 600 mg",
      figure: "600 mg",
      of: "L-glutathione",
      line: "Three amino acids, the first joined through its side chain: the antioxidant every cell in the body makes.",
      strands: [{ label: "Glutathione (γ-Glu-Cys-Gly)", sequence: "Glu-Cys-Gly" }],
      tone: "sapphire",
    },
  ] satisfies SequenceBeat[]).filter((b) => bySlug(b.slug));
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
          All {products.length} vials
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
      <LibraryList peptides={peptides} vial={bySlug("ghk-cu-50mg")} />
      <div className="mt-40 lg:mt-60">
        <PowderScene powderImage={imageOf("glutathione-600mg")} />
      </div>
      <ReviewSlips reviews={reviews} />
      <FaqCards settings={settings} />
    </>
  );
}
