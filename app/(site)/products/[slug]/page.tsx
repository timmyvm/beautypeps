import { ChevronRight, CreditCard, Package, RotateCcw, Truck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/markdown";
import { AddToCart, StickyAddToCart } from "@/components/product/add-to-cart";
import { PeptideCard } from "@/components/product/peptide-chip-card";
import { ProductCard } from "@/components/product/product-card";
import { ProductGallery } from "@/components/product/product-gallery";
import { ReviewsSection } from "@/components/product/reviews-section";
import { WishlistButton } from "@/components/product/wishlist-button";
import { Price, SectionHeading, Stars } from "@/components/ui/misc";
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.seoTitle || `${product.name}${product.subtitle ? ` — ${product.subtitle}` : ""}`,
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

  const images = [product.image, ...product.gallery.filter((g) => g && g !== product.image)];
  const maxQuantity = Math.min(product.stock, MAX_QTY_PER_LINE);
  const reviewCount = reviews.length;
  const average = reviewCount ? reviews.reduce((s, r) => s + r.rating, 0) / reviewCount : 0;
  const lowStock = product.stock > 0 && product.stock <= product.lowStockThreshold;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    image: images.map((i) => (i.startsWith("http") ? i : `${siteUrl}${i}`)),
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
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: average.toFixed(1),
        reviewCount,
      },
    }),
  };

  const details: { id: string; title: string; content: React.ReactNode; open?: boolean }[] = [
    { id: "description", title: "Description", content: <Markdown>{product.description}</Markdown>, open: true },
  ];
  if (product.keyActives.length > 0) {
    details.push({
      id: "actives",
      title: "Key actives",
      content: (
        <div className="overflow-hidden rounded-xl border border-stone/70">
          <table className="w-full text-left text-sm">
            <thead className="bg-ivory text-[11px] tracking-wider text-cocoa uppercase">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Active</th>
                <th className="px-4 py-2.5 font-semibold">Amount</th>
                <th className="hidden px-4 py-2.5 font-semibold sm:table-cell">Why it&apos;s there</th>
              </tr>
            </thead>
            <tbody>
              {product.keyActives.map((a) => (
                <tr key={a.name} className="border-t border-stone/50 align-top">
                  <td className="px-4 py-3 font-medium text-espresso">
                    {a.name}
                    {a.note && <span className="mt-1 block text-xs font-normal text-cocoa sm:hidden">{a.note}</span>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-copper-dark">{a.amount}</td>
                  <td className="hidden px-4 py-3 text-cocoa sm:table-cell">{a.note ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ),
    });
  }
  if (product.howToUse) {
    details.push({ id: "how-to-use", title: "How to use", content: <Markdown>{product.howToUse}</Markdown> });
  }
  if (product.ingredients) {
    details.push({
      id: "ingredients",
      title: "Full ingredients (INCI)",
      content: (
        <>
          <p className="text-sm leading-relaxed text-cocoa">{product.ingredients}</p>
          <p className="mt-3 text-xs text-taupe">
            Ingredient lists can change between batches. Always refer to the pack you receive.
          </p>
        </>
      ),
    });
  }
  const specs = [
    ["Size", product.size],
    ["Texture", product.texture],
    ["pH", product.phRange],
    ["Routine step", product.routineStep],
    ["Skin types", product.skinTypes.join(", ")],
    ["Targets", product.concerns.map(concernLabel).join(", ")],
  ].filter(([, v]) => !!v) as [string, string][];
  if (specs.length > 0) {
    details.push({
      id: "specs",
      title: "Texture, pH & routine",
      content: (
        <dl className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
          {specs.map(([k, v]) => (
            <div key={k} className="border-b border-stone/50 pb-3">
              <dt className="text-xs tracking-wide text-taupe uppercase">{k}</dt>
              <dd className="mt-1 text-espresso">{v}</dd>
            </div>
          ))}
        </dl>
      ),
    });
  }
  if (product.faqs.length > 0) {
    details.push({
      id: "faqs",
      title: "FAQs",
      content: (
        <dl className="space-y-5">
          {product.faqs.map((f) => (
            <div key={f.q}>
              <dt className="font-medium text-espresso">{f.q}</dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-cocoa">{f.a}</dd>
            </div>
          ))}
        </dl>
      ),
    });
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <div className="container-bp pt-6 pb-24 lg:pb-0">
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1 text-xs text-cocoa">
          <Link href="/" className="hover:text-espresso">
            Home
          </Link>
          <ChevronRight className="size-3" aria-hidden />
          <Link href="/shop" className="hover:text-espresso">
            Shop
          </Link>
          {product.category && (
            <>
              <ChevronRight className="size-3" aria-hidden />
              <Link href={`/shop?category=${product.category.slug}`} className="hover:text-espresso">
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="size-3" aria-hidden />
          <span className="text-espresso" aria-current="page">
            {product.name}
          </span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 [&>*]:min-w-0">
          <ProductGallery images={images} name={product.name} badge={product.stock > 0 ? product.badge : "Sold out"} />

          <div className="lg:py-4">
            {product.category && <p className="eyebrow mb-3">{product.category.name}</p>}
            <h1 className="font-display text-4xl leading-tight text-espresso md:text-5xl">{product.name}</h1>
            {product.subtitle && <p className="mt-2 text-lg text-cocoa">{product.subtitle}</p>}

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
              {reviewCount > 0 ? (
                <a href="#reviews" className="flex items-center gap-2 text-sm text-cocoa hover:text-espresso">
                  <Stars rating={average} size={14} />
                  <span>
                    {average.toFixed(1)} · {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
                  </span>
                </a>
              ) : (
                <a href="#reviews" className="text-sm text-cocoa underline-offset-4 hover:underline">
                  Be the first to review
                </a>
              )}
            </div>

            <div className="mt-6 flex items-baseline gap-3">
              <Price cents={product.price} compareAt={product.compareAtPrice} className="text-2xl text-espresso" />
              {product.size && <span className="text-sm text-taupe">/ {product.size}</span>}
            </div>
            <p className="mt-1 text-xs text-taupe">Includes GST</p>

            <p className="mt-6 text-base leading-relaxed text-cocoa">{product.shortDescription}</p>

            {product.keyActives.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-2" aria-label="Key actives">
                {product.keyActives.map((a) => (
                  <li
                    key={a.name}
                    className="rounded-full border border-copper/30 bg-copper-light/30 px-3 py-1 text-xs text-copper-dark"
                  >
                    {a.name} <span className="opacity-70">· {a.amount}</span>
                  </li>
                ))}
              </ul>
            )}

            <p className="mt-6 flex items-center gap-2 text-sm" aria-live="polite">
              <span
                className={
                  product.stock <= 0
                    ? "size-2 rounded-full bg-danger"
                    : lowStock
                      ? "size-2 rounded-full bg-amber"
                      : "size-2 rounded-full bg-sage"
                }
                aria-hidden
              />
              {product.stock <= 0 ? (
                <span className="text-danger">Sold out — check back soon</span>
              ) : lowStock ? (
                <span className="text-amber">Only {product.stock} left</span>
              ) : (
                <span className="text-sage">In stock · ready to ship</span>
              )}
            </p>

            <div className="mt-5 flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <AddToCart
                  productId={product.id}
                  productName={product.name}
                  price={product.price}
                  maxQuantity={maxQuantity}
                />
              </div>
              <WishlistButton productId={product.id} productSlug={product.slug} initial={wishlisted} />
            </div>

            <ul className="mt-8 grid gap-3 rounded-2xl bg-ivory p-5 text-sm text-cocoa sm:grid-cols-2">
              <li className="flex gap-3">
                <Truck className="mt-0.5 size-4 shrink-0 text-copper" aria-hidden />
                <span>
                  {settings.freeShippingThreshold > 0
                    ? `Free standard shipping over ${formatMoney(settings.freeShippingThreshold).replace(/\.00$/, "")}`
                    : `Standard shipping ${formatMoney(settings.standardShipping)}`}
                </span>
              </li>
              <li className="flex gap-3">
                <Package className="mt-0.5 size-4 shrink-0 text-copper" aria-hidden />
                <span>{settings.dispatchTime}</span>
              </li>
              <li className="flex gap-3">
                <CreditCard className="mt-0.5 size-4 shrink-0 text-copper" aria-hidden />
                <span>Pay securely by bank transfer or PayID</span>
              </li>
              <li className="flex gap-3">
                <RotateCcw className="mt-0.5 size-4 shrink-0 text-copper" aria-hidden />
                <span>
                  Unopened returns within 30 days.{" "}
                  <Link href="/policies/shipping" className="underline underline-offset-2">
                    Details
                  </Link>
                </span>
              </li>
            </ul>

            <div className="mt-10 divide-y divide-stone/70 border-y border-stone/70">
              {details.map((d) => (
                <details key={d.id} open={d.open} className="group py-1" id={d.id}>
                  <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-sm font-medium tracking-wide text-espresso [&::-webkit-details-marker]:hidden">
                    {d.title}
                    <span
                      className="grid size-6 place-items-center rounded-full border border-stone text-cocoa transition-transform group-open:rotate-45"
                      aria-hidden
                    >
                      +
                    </span>
                  </summary>
                  <div className="pb-6">{d.content}</div>
                </details>
              ))}
            </div>
          </div>
        </div>

        {peptides.length > 0 && (
          <section className="mt-20 md:mt-28" aria-labelledby="peptides-heading">
            <SectionHeading
              eyebrow="Inside the formula"
              title={<span id="peptides-heading">The peptides in {product.name}</span>}
              description="Every peptide we use has its own monograph in the Peptide Library — what it is, how it works and what the research actually shows."
              action={
                <Link href="/peptides" className="text-sm font-medium text-copper-dark underline underline-offset-4">
                  Explore the library
                </Link>
              }
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {peptides.map((p) => (
                <PeptideCard key={p.slug} peptide={p} />
              ))}
            </div>
          </section>
        )}

        <div className="mt-20 md:mt-28">
          <ReviewsSection
            product={{ id: product.id, name: product.name, slug: product.slug }}
            reviews={reviews}
            signedIn={!!user}
            alreadyReviewed={!!myReview}
          />
        </div>

        {related.length > 0 && (
          <section className="border-t border-stone/70 pt-16 md:pt-20" aria-labelledby="related-heading">
            <SectionHeading eyebrow="Pairs well with" title={<span id="related-heading">Complete the ritual</span>} />
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      <StickyAddToCart
        productId={product.id}
        productName={product.name}
        price={product.price}
        maxQuantity={maxQuantity}
        image={product.image}
      />
    </>
  );
}
