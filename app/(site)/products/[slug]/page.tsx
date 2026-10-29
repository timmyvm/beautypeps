import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, ViewTransition, type ComponentProps } from "react";
import { JsonLd, siteUrl } from "@/components/info/json-ld";
import { Markdown } from "@/components/markdown";
import { SequenceStrand, StrandKey } from "@/components/peptides/sequence-strand";
import { AddToCart, StickyAddToCart } from "@/components/product/add-to-cart";
import { CompleteThePair } from "@/components/product/complete-the-pair";
import { PeptideRows } from "@/components/product/peptide-chip-card";
import { productFact, SpecimenTile, toneFor } from "@/components/product/product-card";
import { ReviewsSection } from "@/components/product/reviews-section";
import { WishlistButton } from "@/components/product/wishlist-button";
import { LoopVideo } from "@/components/site/loop-video";
import { SpecimenGrid } from "@/components/shop/specimen-grid";
import { Price, Stars } from "@/components/ui/misc";
import { getCurrentUser } from "@/lib/auth/session";
import { MAX_QTY_PER_LINE } from "@/lib/cart";
import { concernLabel } from "@/lib/constants";
import { formatMoney } from "@/lib/format";
import { getActiveProducts } from "@/lib/queries/content";
import {
  getApprovedReviews,
  getPeptidesBySlugs,
  getProductBySlug,
  getRelatedProducts,
  getUserReviewForProduct,
  isInWishlist,
} from "@/lib/queries/catalog";
import { getSettings } from "@/lib/settings";

type Props = { params: Promise<{ slug: string }> };

// The product name holds its half of the first screen; section headings, two or three words each, set larger.
const TITLE = "display-type text-[clamp(1.75rem,1rem+2.6vw,3.5rem)]";
const HEAD = "display-type text-[clamp(2.25rem,1.1rem+3.4vw,4.75rem)]";
// The lead active's amount, set as the page's one figure.
const FIGURE = "display-type tabular text-[clamp(4.5rem,1rem+11vw,11.5rem)] leading-[0.92] tracking-[-0.045em]";

/** "8% complex" → ["8%", "complex"]; "1 g" → ["1 g", ""]. */
function splitAmount(amount: string): [string, string] {
  const m = amount.match(/^([\d.,]+\s?(?:%|mg|g|mL))\s*(.*)$/);
  return m ? [m[1], m[2]] : [amount, ""];
}

/** Every active formula is prerendered at build; one added later is rendered on its first visit and kept. */
export async function generateStaticParams() {
  const products = await getActiveProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const description = product.seoDescription || product.shortDescription;
  return {
    title: product.seoTitle || `${product.name}${product.subtitle ? `: ${product.subtitle}` : ""}`,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    // The preview picture is this segment's opengraph-image: the specimen on its tile, named and graded.
    openGraph: {
      type: "website",
      url: `/products/${product.slug}`,
      title: product.name,
      description,
    },
    twitter: { card: "summary_large_image", title: product.name, description },
  };
}

// The slug is read before any Suspense boundary, so a page added after the build is rendered on its
// first visit and then kept as a static page (ISR) like the rest.
export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  return <ProductView slug={slug} />;
}

async function ProductView({ slug }: { slug: string }) {
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [settings, reviews, peptides, related] = await Promise.all([
    getSettings(),
    getApprovedReviews(product.id),
    getPeptidesBySlugs(product.peptideSlugs),
    getRelatedProducts({ id: product.id, categoryId: product.categoryId, concerns: product.concerns }, 5),
  ]);

  const photos = [product.image, ...product.gallery.filter((g) => g && g !== product.image)];
  const maxQuantity = Math.min(product.stock, MAX_QTY_PER_LINE);
  const reviewCount = reviews.length;
  const average = reviewCount ? reviews.reduce((s, r) => s + r.rating, 0) / reviewCount : 0;
  const lowStock = product.stock > 0 && product.stock <= product.lowStockThreshold;
  const lead = product.keyActives[0];
  const leadPeptide = peptides[0];
  const isCopper = product.peptideSlugs.includes("ghk-cu");
  const category = product.category?.slug;
  const isPowder = category === "pure-actives";
  const isResearch = category === "research-peptides";
  // The blue GHK-Cu serum itself is in these, so its pictures are honest here.
  const blueSerum = product.slug === "ghk-cu-copper-peptide-serum" || product.slug === "copper-ritual-kit";
  const drawn = peptides.filter((p) => p.sequence);
  const figurePeptides = product.peptideSlugs.length <= 2 ? drawn : drawn.slice(0, 1);
  const [figure, figureRest] = lead ? splitAmount(lead.amount) : ["", ""];
  const COLLAR = "/images/editorial/collar-macro.webp";
  const thumbs = [...new Set([product.image, ...(product.slug === "ghk-cu-copper-peptide-serum" ? [COLLAR] : []), ...photos])].slice(0, 3);
  // A pair is a different peptide studied for the same thing; research peptides are never upsold.
  const firstWord = (n: string) => n.split(" ")[0].toLowerCase();
  const pair =
    product.stock > 0 && category !== "research-peptides"
      ? related.find(
          (r) =>
            r.stock > 0 &&
            firstWord(r.name) !== firstWord(product.name) &&
            (r.concerns ?? []).some((c) => product.concerns.includes(c)),
        )
      : undefined;
  // One full row of four after the pair; research peptides only ever point to other research peptides
  const others = related
    .filter((r) => r.id !== pair?.id && (!isResearch || (r as { categoryId?: string | null }).categoryId === product.categoryId))
    .slice(0, 4);
  const sharedConcerns = pair ? product.concerns.filter((c) => pair.concerns?.includes(c)).slice(0, 2) : [];
  const base = siteUrl();
  const url = `${base}/products/${product.slug}`;
  const abs = (src: string) => (src.startsWith("http") ? src : `${base}${src}`);

  // Product + Offer with shipping and returns, as Google's merchant listings read them.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.name,
    description: product.shortDescription,
    url,
    image: photos.map(abs),
    sku: product.sku,
    brand: { "@type": "Brand", name: settings.storeName },
    category: product.category?.name,
    ...(product.size && { size: product.size }),
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "AUD",
      price: (product.price / 100).toFixed(2),
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: settings.storeName, url: base },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: (product.price >= settings.freeShippingThreshold && settings.freeShippingThreshold > 0 ? 0 : settings.standardShipping / 100).toFixed(2),
          currency: "AUD",
        },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "AU" },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: 2, maxValue: 8, unitCode: "DAY" },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "AU",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 30,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/ReturnShippingFees",
      },
    },
    ...(reviewCount > 0 && {
      aggregateRating: { "@type": "AggregateRating", ratingValue: average.toFixed(1), reviewCount, bestRating: 5, worstRating: 1 },
      review: reviews.slice(0, 5).map((r) => ({
        "@type": "Review",
        author: { "@type": "Person", name: r.authorName },
        datePublished: r.createdAt.toISOString().slice(0, 10),
        reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5, worstRating: 1 },
        ...(r.title && { name: r.title }),
        reviewBody: r.body,
      })),
    }),
  };
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${base}/` },
      { "@type": "ListItem", position: 2, name: "Shop", item: `${base}/shop` },
      ...(product.category
        ? [{ "@type": "ListItem", position: 3, name: product.category.name, item: `${base}/shop?category=${product.category.slug}` }]
        : []),
      { "@type": "ListItem", position: product.category ? 4 : 3, name: product.name },
    ],
  };

  const specs = [
    ["Size", product.size],
    ["Texture", product.texture],
    ["pH", product.phRange],
    ["When to use it", product.routineStep],
    ["Skin types", product.skinTypes.join(", ")],
    ["What it targets", product.concerns.map(concernLabel).join(", ")],
  ].filter(([, v]) => !!v) as [string, string][];

  const stock =
    product.stock <= 0
      ? { text: "Sold out for now. Stock is counted live, so it shows here the moment it is back.", cls: "text-danger" }
      : lowStock
        ? { text: `Only ${product.stock} left in this batch.`, cls: "text-amber" }
        : { text: "In stock and ready to ship from Melbourne.", cls: "text-sage" };

  return (
    <>
      <JsonLd data={jsonLd} />
      <JsonLd data={breadcrumbs} />

      <div className="container-bp pt-6 pb-28 md:pt-10 lg:pb-0">
        {/* The specimen, and everything needed to buy it */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-[var(--gutter)]">
          <div className="lg:col-span-6 lg:row-start-1">
            <div className="shutter-now">
              {/* The catalogue tile of this formula morphs into this one on the way in */}
              <ViewTransition name={`specimen-${product.slug}`} share="morph" default="none">
                <SpecimenTile
                  product={product}
                  tone={toneFor(product.slug)}
                  priority
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="aspect-[4/5] w-full md:aspect-[4/3] lg:aspect-auto lg:h-[min(80vh,860px)]"
                />
              </ViewTransition>
            </div>
          </div>

          <div className="lg:col-span-6 lg:col-start-7 lg:row-span-2 lg:row-start-1 lg:pl-[4%]">
            <div className="lg:sticky lg:top-8">
              <h1 className={TITLE}>{product.name}</h1>
              {product.subtitle && <p className="mt-4 max-w-[40ch] text-lead">{product.subtitle}</p>}

              <p className="mt-6 flex flex-wrap items-baseline gap-x-3">
                <Price cents={product.price} compareAt={product.compareAtPrice} className="text-lead font-medium" />
                <span className="text-small text-muted">
                  {product.size ? `${product.size}, ` : ""}includes GST
                </span>
              </p>

              <dl className="mt-6 space-y-2 text-body">
                {lead && (
                  <div>
                    <dt className="sr-only">Lead active</dt>
                    <dd className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <span>
                        <span className="font-medium">{lead.amount}</span> {lead.name}
                      </span>
                      {drawn[0]?.sequence && <SequenceStrand sequence={drawn[0].sequence} size="sm" label={drawn[0].name} />}
                    </dd>
                  </div>
                )}
                {leadPeptide?.evidenceLevel && (
                  <div>
                    <dt className="sr-only">Evidence</dt>
                    <dd>
                      Evidence grade {leadPeptide.evidenceLevel} of 5 for {leadPeptide.name}.{" "}
                      <Link href={`/peptides/${leadPeptide.slug}`} className="text-accent underline underline-offset-4">
                        Read the monograph
                      </Link>
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="sr-only">Reviews</dt>
                  <dd>
                    {reviewCount > 0 ? (
                      <a href="#reviews" className="inline-flex items-center gap-2 underline-offset-4 hover:underline">
                        <Stars rating={average} size={16} />
                        {average.toFixed(1)} from {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
                      </a>
                    ) : (
                      <a href="#reviews" className="underline underline-offset-4">
                        No reviews yet
                      </a>
                    )}
                  </dd>
                </div>
              </dl>

              <p className="mt-6 max-w-[52ch] text-body">{product.shortDescription}</p>
              <p className={`mt-6 text-body font-medium ${stock.cls}`} aria-live="polite">
                {stock.text}
              </p>

              <div id="buy" className="mt-4">
                <AddToCart productId={product.id} productName={product.name} price={product.price} maxQuantity={maxQuantity} />
              </div>
              <Suspense fallback={<WishlistButton productId={product.id} productSlug={product.slug} initial={false} className="mt-4" />}>
                <ViewerWishlistButton productId={product.id} productSlug={product.slug} />
              </Suspense>

              <ul className="mt-8 space-y-1 bg-surface px-5 py-4 text-small">
                <li>
                  {settings.freeShippingThreshold > 0
                    ? `Free standard shipping over ${formatMoney(settings.freeShippingThreshold).replace(/\.00$/, "")}; express ${formatMoney(settings.expressShipping)}.`
                    : `Standard shipping ${formatMoney(settings.standardShipping)}.`}
                </li>
                <li>{settings.dispatchTime}</li>
                <li>Pay by bank transfer or PayID; no card details needed.</li>
                <li>
                  Unopened returns within 30 days.{" "}
                  <Link href="/policies/shipping" className="underline underline-offset-2">
                    Shipping and returns
                  </Link>
                </li>
              </ul>
              {product.category && (
                <Link href={`/shop?category=${product.category.slug}`} className="mt-6 inline-block text-body underline underline-offset-4">
                  More {product.category.name.toLowerCase()}
                </Link>
              )}
            </div>
          </div>
          {thumbs.length > 0 && (
            <div className="lg:col-span-6 lg:row-start-2">
              <ul className="grid grid-cols-3 gap-2" aria-label="Photographs">
                {thumbs.map((src, i) => (
                  <li key={src + i} className="group relative aspect-square overflow-hidden bg-surface" data-reveal="" style={{ ["--reveal-i" as string]: i }}>
                    <Image
                      src={src}
                      alt={
                        i === 0
                          ? `${product.name}, photographed on its stone plinth`
                          : src === COLLAR
                            ? "The brushed copper collar of the bottle above the blue serum"
                            : `${product.name}: detail`
                      }
                      fill
                      sizes="(min-width: 1024px) 16vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* The formula: heading in the left third, the text in the right two thirds */}
        <section className="mt-32 grid grid-cols-1 gap-8 lg:mt-48 lg:grid-cols-12 lg:gap-[var(--gutter)]" aria-labelledby="formula-heading">
          <h2 id="formula-heading" className={`${HEAD} lg:sticky lg:top-28 lg:col-span-4 lg:self-start`} data-reveal="">
            {isResearch ? "The vial" : isPowder ? "The ingredient" : "The formula"}
          </h2>
          <div className="lg:col-span-7 lg:col-start-6" data-reveal="" style={{ ["--reveal-i" as string]: 1 }}>
            <Markdown>{product.description}</Markdown>
          </div>
        </section>

        {/* What's in it: the lead amount set as one big figure with the peptide drawn beside it; the actives
            as a real table and the specifics on a stone field */}
        {(product.keyActives.length > 0 || specs.length > 0 || product.ingredients) && (
          <section className="mt-32 lg:mt-48" aria-labelledby="inside-heading">
            <h2 id="inside-heading" className={HEAD} data-reveal="">
              What&apos;s in it
            </h2>
            <div className="mt-12 grid grid-cols-1 gap-14 lg:mt-16 lg:grid-cols-12 lg:gap-[var(--gutter)]">
              {lead && (
                <div className="lg:col-span-5" data-reveal="" style={{ ["--reveal-i" as string]: 1 }}>
                  <p className={FIGURE}>{figure}</p>
                  <p className="mt-4 max-w-[30ch] text-lead font-medium">
                    {lead.name}
                    {figureRest ? `, ${figureRest}` : ""}
                  </p>
                  {lead.note && <p className="mt-2 max-w-[44ch] text-body">{lead.note}</p>}
                  {figurePeptides.length > 0 && (
                    <div className="mt-10 space-y-8">
                      {figurePeptides.map((p) => (
                        <SequenceStrand
                          key={p.slug}
                          sequence={p.sequence!}
                          size="md"
                          interactive
                          label={p.name}
                          caption={`${p.name}, drawn from its sequence. Choose a bead to name it.`}
                        />
                      ))}
                      <StrandKey />
                    </div>
                  )}
                </div>
              )}
              <div className={lead ? "lg:col-span-6 lg:col-start-7" : "lg:col-span-7"} data-reveal="" style={{ ["--reveal-i" as string]: 2 }}>
                {product.keyActives.length > 0 && (
                  <table className="tabular w-full text-left text-body">
                    <caption className="sr-only">Key actives and their amounts</caption>
                    <thead>
                      <tr className="bg-surface">
                        <th scope="col" className="px-4 py-3 font-medium">
                          Active
                        </th>
                        <th scope="col" className="px-4 py-3 font-medium">
                          Amount
                        </th>
                        <th scope="col" className="hidden px-4 py-3 font-medium sm:table-cell">
                          Why it&apos;s there
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.keyActives.map((a) => (
                        <tr key={a.name} /* taste-skill-ignore: rows of a real table */ className="border-b border-stone align-top">
                          <td className="px-4 py-4 font-medium">
                            {a.name}
                            {a.note && <span className="mt-1 block text-small font-normal sm:hidden">{a.note}</span>}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">{a.amount}</td>
                          <td className="hidden px-4 py-4 sm:table-cell">{a.note ?? ""}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {specs.length > 0 && (
                  <dl className="mt-10 grid grid-cols-1 gap-x-8 gap-y-5 bg-field-stone p-6 sm:grid-cols-2 md:p-8">
                    {specs.map(([k, v]) => (
                      <div key={k}>
                        <dt className="text-small">{k}</dt>
                        <dd className="mt-0.5 text-body font-medium">{v}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {product.ingredients && (
                  <div className="mt-10">
                    <h3 className="text-lead font-medium">Full ingredients (INCI)</h3>
                    <p className="mt-3 max-w-[70ch] text-body">{product.ingredients}</p>
                    <p className="mt-3 text-small text-muted">
                      Ingredient lists can change between batches. The pack you receive is always the reference.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* How to use: the steps on the left, a photograph closing the right */}
        {product.howToUse && (
          <section className="mt-32 grid grid-cols-1 gap-10 lg:mt-48 lg:grid-cols-12 lg:items-start lg:gap-[var(--gutter)]" aria-labelledby="use-heading">
            <div className="lg:col-span-6" data-reveal="">
              <h2 id="use-heading" className={HEAD}>
                How to use it
              </h2>
              <Markdown className="mt-8">{product.howToUse}</Markdown>
            </div>
            <figure className="lg:col-span-5 lg:col-start-8" data-reveal="" style={{ ["--reveal-i" as string]: 1 }}>
              <div className="relative aspect-[4/5] overflow-hidden bg-surface">
                {blueSerum ? (
                  <LoopVideo src="/video/applied.mp4" poster="/video/applied-poster.webp" label="Fingertips pressing two drops of blue serum into the back of a hand" />
                ) : isPowder && isCopper ? (
                  <LoopVideo
                    src="/video/powder-dissolve.mp4"
                    poster="/video/powder-dissolve-poster.webp"
                    label="Blue copper peptide powder falling into a beaker of water and dissolving"
                  />
                ) : isPowder ? (
                  <LoopVideo
                    src="/video/white-dissolve.mp4"
                    poster="/video/white-dissolve-poster.webp"
                    label="White peptide powder falling from a steel spatula into a beaker of clear water"
                  />
                ) : isCopper ? (
                  <LoopVideo src="/video/copper-drop.mp4" poster="/video/copper-drop-poster.webp" label="Drops of blue copper peptide serum on a brushed copper plate" />
                ) : (
                  <Image
                    src={photos[1] ?? "/images/editorial/ritual.webp"}
                    alt={photos[1] ? `${product.name}: texture and detail` : "Serum pressed onto the cheekbone from a glass dropper"}
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="drift object-cover"
                  />
                )}
              </div>
              {isPowder && (
                <figcaption className="mt-3 text-body">
                  {isCopper ? "It turns the water blue as it goes in." : "It goes into a water base below 40 °C."} Keep the vial at 2–8 °C,
                  sealed and away from light.
                </figcaption>
              )}
              {blueSerum && <figcaption className="mt-3 text-body">Pressed in after cleansing, before moisturiser.</figcaption>}
            </figure>
          </section>
        )}

        {peptides.length > 0 && (
          <section className="mt-32 lg:mt-48" aria-labelledby="peptides-heading">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between" data-reveal="">
              <h2 id="peptides-heading" className={HEAD}>
                The peptides inside
              </h2>
              <Link href="/peptides" className="text-body underline underline-offset-4">
                The whole peptide library
              </Link>
            </div>
            {/* A single peptide is already drawn large under "What's in it"; two or more are drawn here, row by row. */}
            <PeptideRows peptides={peptides.length > 1 ? peptides : peptides.map((p) => ({ ...p, sequence: null }))} />
            {peptides.length > 1 && drawn.length > 0 && <StrandKey className="mt-6" />}
          </section>
        )}

        {product.faqs.length > 0 && (
          <section className="mt-32 grid grid-cols-1 gap-8 lg:mt-48 lg:grid-cols-12 lg:gap-[var(--gutter)]" aria-labelledby="faq-heading">
            <h2 id="faq-heading" className={`${HEAD} lg:col-span-4`} data-reveal="">
              Questions people ask
            </h2>
            <div className="space-y-2 lg:col-span-7 lg:col-start-6">
              {product.faqs.map((f, i) => (
                <details key={f.q} name="product-faq" open={i === 0} className="group bg-surface" data-reveal="" style={{ ["--reveal-i" as string]: Math.min(i, 3) }}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-6 py-5 text-lead font-medium [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span aria-hidden className="transition-transform duration-300 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="max-w-[60ch] px-6 pb-6 text-body">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* Research peptides take no reviews: nobody should be describing using them on themselves. */}
        {!isResearch && (
        <div className="mt-32 lg:mt-48">
          {/* The reviews are in the static page; whether this visitor can write one streams in. */}
          <Suspense
            fallback={
              <ReviewsSection
                product={{ id: product.id, name: product.name, slug: product.slug }}
                reviews={reviews}
                signedIn={false}
                alreadyReviewed={false}
                headingClass={HEAD}
              />
            }
          >
            <ViewerReviewsSection
              product={{ id: product.id, name: product.name, slug: product.slug }}
              reviews={reviews}
              headingClass={HEAD}
            />
          </Suspense>
        </div>
        )}

        {pair && (
          <CompleteThePair
            first={{ id: product.id, slug: product.slug, name: product.name, image: product.image, price: product.price, fact: productFact(product) }}
            second={{ id: pair.id, slug: pair.slug, name: pair.name, image: pair.image, price: pair.price, fact: productFact(pair) }}
            reason={[
              `Both are studied for ${sharedConcerns.map((c) => concernLabel(c).toLowerCase()).join(" and ")}.`,
              isPowder ? "" : "Apply the thinner texture first and let it settle before the next.",
            ]
              .filter(Boolean)
              .join(" ")}
            headingClass={HEAD}
          />
        )}

        {others.length > 0 && (
          <section className="mt-32 lg:mt-48" aria-labelledby="related-heading">
            <h2 id="related-heading" className={`${HEAD} mb-10`} data-reveal="">
              {isResearch ? "More research peptides" : pair ? "Also pairs well" : "Pairs well with"}
            </h2>
            <SpecimenGrid products={others} doubles={false} />
          </section>
        )}
      </div>

      <StickyAddToCart productId={product.id} productName={product.name} price={product.price} maxQuantity={maxQuantity} />
    </>
  );
}

async function ViewerWishlistButton({ productId, productSlug }: { productId: string; productSlug: string }) {
  const user = await getCurrentUser();
  const wishlisted = user ? await isInWishlist(user.id, productId) : false;
  return <WishlistButton productId={productId} productSlug={productSlug} initial={wishlisted} className="mt-4" />;
}

async function ViewerReviewsSection(props: Omit<ComponentProps<typeof ReviewsSection>, "signedIn" | "alreadyReviewed">) {
  const user = await getCurrentUser();
  const mine = user ? await getUserReviewForProduct(user.id, props.product.id) : null;
  return <ReviewsSection {...props} signedIn={!!user} alreadyReviewed={!!mine} />;
}
