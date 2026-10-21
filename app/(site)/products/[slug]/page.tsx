import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/markdown";
import { AddToCart, StickyAddToCart } from "@/components/product/add-to-cart";
import { PeptideRows } from "@/components/product/peptide-chip-card";
import { SpecimenTile, toneFor } from "@/components/product/product-card";
import { ReviewsSection } from "@/components/product/reviews-section";
import { WishlistButton } from "@/components/product/wishlist-button";
import { SpecimenGrid } from "@/components/shop/specimen-grid";
import { Price, Stars } from "@/components/ui/misc";
import { getCurrentUser } from "@/lib/auth/session";
import { MAX_QTY_PER_LINE } from "@/lib/cart";
import { concernLabel } from "@/lib/constants";
import { formatMoney } from "@/lib/format";
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

// One heading size for this page: the product name and every section heading.
const HEAD = "display-type text-[clamp(1.75rem,1rem+2.6vw,3.5rem)]";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.seoTitle || `${product.name}${product.subtitle ? `: ${product.subtitle}` : ""}`,
    description: product.seoDescription || product.shortDescription,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.seoDescription || product.shortDescription,
      images: [product.image],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [user, settings, reviews, peptides, related] = await Promise.all([
    getCurrentUser(),
    getSettings(),
    getApprovedReviews(product.id),
    getPeptidesBySlugs(product.peptideSlugs),
    getRelatedProducts(product),
  ]);
  const [wishlisted, myReview] = user
    ? await Promise.all([isInWishlist(user.id, product.id), getUserReviewForProduct(user.id, product.id)])
    : [false, null];

  const photos = [product.image, ...product.gallery.filter((g) => g && g !== product.image)];
  const maxQuantity = Math.min(product.stock, MAX_QTY_PER_LINE);
  const reviewCount = reviews.length;
  const average = reviewCount ? reviews.reduce((s, r) => s + r.rating, 0) / reviewCount : 0;
  const lowStock = product.stock > 0 && product.stock <= product.lowStockThreshold;
  const lead = product.keyActives[0];
  const leadPeptide = peptides[0];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    image: photos.map((i) => (i.startsWith("http") ? i : `${siteUrl}${i}`)),
    sku: product.sku,
    brand: { "@type": "Brand", name: "Beauty Peps" },
    category: product.category?.name,
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/products/${product.slug}`,
      priceCurrency: "AUD",
      price: (product.price / 100).toFixed(2),
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
    ...(reviewCount > 0 && {
      aggregateRating: { "@type": "AggregateRating", ratingValue: average.toFixed(1), reviewCount },
    }),
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
      ? { text: "Sold out for now. We restock small batches every few weeks.", cls: "text-danger" }
      : lowStock
        ? { text: `Only ${product.stock} left in this batch.`, cls: "text-amber" }
        : { text: "In stock and ready to ship from Melbourne.", cls: "text-sage" };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <div className="container-bp pt-6 pb-28 md:pt-10 lg:pb-0">
        {/* The specimen, and everything needed to buy it */}
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-[var(--gutter)]">
          <div className="lg:col-span-6">
            <div className="shutter">
              <SpecimenTile
                product={product}
                tone={toneFor(product.slug)}
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="aspect-[4/5] w-full lg:aspect-auto lg:h-[min(80vh,860px)]"
              />
            </div>
            {photos.length > 0 && (
              <ul className="mt-2 grid grid-cols-3 gap-2" aria-label="Photographs">
                {photos.slice(0, 3).map((src, i) => (
                  <li key={src + i} className="relative aspect-square overflow-hidden bg-surface" data-reveal="" style={{ ["--reveal-i" as string]: i }}>
                    <Image
                      src={src}
                      alt={i === 0 ? `${product.name}, photographed on its stone plinth` : `${product.name}: detail`}
                      fill
                      sizes="(min-width: 1024px) 16vw, 33vw"
                      className="object-cover"
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="lg:col-span-6 lg:col-start-7 lg:pl-[4%]">
            <div className="lg:sticky lg:top-8">
              {product.category && (
                <Link href={`/shop?category=${product.category.slug}`} className="text-small underline-offset-4 hover:underline">
                  Back to {product.category.name.toLowerCase()}
                </Link>
              )}
              <h1 className={`${HEAD} mt-4`}>{product.name}</h1>
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
                    <dd>
                      <span className="font-medium">{lead.amount}</span> {lead.name}
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

              <div className="mt-4">
                <AddToCart productId={product.id} productName={product.name} price={product.price} maxQuantity={maxQuantity} />
              </div>
              <WishlistButton productId={product.id} productSlug={product.slug} initial={wishlisted} className="mt-4" />

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
            </div>
          </div>
        </div>

        {/* The formula: heading in the left third, the text in the right two thirds */}
        <section className="mt-32 grid gap-8 lg:mt-48 lg:grid-cols-12 lg:gap-[var(--gutter)]" aria-labelledby="formula-heading">
          <h2 id="formula-heading" className={`${HEAD} lg:col-span-4`} data-reveal="">
            The formula
          </h2>
          <div className="lg:col-span-7 lg:col-start-6" data-reveal="" style={{ ["--reveal-i" as string]: 1 }}>
            <Markdown>{product.description}</Markdown>
          </div>
        </section>

        {/* What's in it: the actives as a real table, the specifics on a stone field */}
        {(product.keyActives.length > 0 || specs.length > 0 || product.ingredients) && (
          <section className="mt-32 lg:mt-48" aria-labelledby="inside-heading">
            <h2 id="inside-heading" className={HEAD} data-reveal="">
              What&apos;s in it
            </h2>
            <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:gap-[var(--gutter)]">
              <div className="lg:col-span-7" data-reveal="" style={{ ["--reveal-i" as string]: 1 }}>
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
                        <tr key={a.name} className="border-b border-stone align-top">
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
              {specs.length > 0 && (
                <dl className="h-fit space-y-5 bg-field-stone p-6 md:p-8 lg:col-span-4 lg:col-start-9" data-reveal="" style={{ ["--reveal-i" as string]: 2 }}>
                  {specs.map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-small">{k}</dt>
                      <dd className="mt-0.5 text-body font-medium">{v}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          </section>
        )}

        {/* How to use: the steps on the left, a photograph closing the right */}
        {product.howToUse && (
          <section className="mt-32 grid gap-10 lg:mt-48 lg:grid-cols-12 lg:items-start lg:gap-[var(--gutter)]" aria-labelledby="use-heading">
            <div className="lg:col-span-6" data-reveal="">
              <h2 id="use-heading" className={HEAD}>
                How to use it
              </h2>
              <Markdown className="mt-8">{product.howToUse}</Markdown>
            </div>
            <div className="relative aspect-[4/5] overflow-hidden bg-surface lg:col-span-5 lg:col-start-8" data-reveal="" style={{ ["--reveal-i" as string]: 1 }}>
              <Image
                src={photos[1] ?? "/images/editorial/ritual.webp"}
                alt={photos[1] ? `${product.name}: texture and detail` : "Serum pressed onto the cheekbone from a glass dropper"}
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="drift object-cover"
              />
            </div>
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
            <PeptideRows peptides={peptides} />
          </section>
        )}

        {product.faqs.length > 0 && (
          <section className="mt-32 grid gap-8 lg:mt-48 lg:grid-cols-12 lg:gap-[var(--gutter)]" aria-labelledby="faq-heading">
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

        <div className="mt-32 lg:mt-48">
          <ReviewsSection
            product={{ id: product.id, name: product.name, slug: product.slug }}
            reviews={reviews}
            signedIn={!!user}
            alreadyReviewed={!!myReview}
            headingClass={HEAD}
          />
        </div>

        {related.length > 0 && (
          <section className="mt-32 lg:mt-48" aria-labelledby="related-heading">
            <h2 id="related-heading" className={`${HEAD} mb-10`} data-reveal="">
              Pairs well with
            </h2>
            <SpecimenGrid products={related} doubles={false} />
          </section>
        )}
      </div>

      <StickyAddToCart productId={product.id} productName={product.name} price={product.price} maxQuantity={maxQuantity} />
    </>
  );
}
