import { ArrowRight, BadgeCheck, FlaskConical, Leaf, MapPin, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { QuickAdd } from "@/components/product/add-to-cart";
import { PeptideCard, type PeptideTeaser } from "@/components/product/peptide-chip-card";
import { ProductCard, type ProductCardData } from "@/components/product/product-card";
import { NewsletterForm } from "@/components/site/newsletter-form";
import { buttonClasses } from "@/components/ui/button";
import { Price, SectionHeading, Stars } from "@/components/ui/misc";
import { CONCERNS, PEPTIDE_CLASSES } from "@/lib/constants";
import type { KeyActive } from "@/lib/db/schema";
import { formatDate, formatMoney } from "@/lib/format";

/* ------------------------------------------------------------------ */

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-ivory" aria-labelledby="hero-heading">
      {/* Mobile: image first, cropped to the products. Desktop: full-bleed with copy on the empty wall. */}
      <div className="relative aspect-[4/3] md:absolute md:inset-0 md:aspect-auto">
        <Image
          src="/images/editorial/hero.webp"
          alt="Beauty Peps GHK-Cu copper peptide serum and peptide serums on travertine in warm sunlight"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[78%_center] md:object-[70%_center]"
        />
        <div className="absolute inset-0 hidden bg-gradient-to-r from-ivory/85 via-ivory/40 to-transparent md:block" />
      </div>

      <div className="container-bp relative py-12 md:flex md:min-h-[min(84vh,760px)] md:items-center md:py-24">
        <div className="max-w-xl animate-fade-up">
          <p className="eyebrow mb-5">Clinical beauty peptides · Made in Australia</p>
          <h1 id="hero-heading" className="font-display text-[2.6rem] leading-[1.05] text-espresso md:text-6xl lg:text-7xl">
            Skin science,
            <br />
            <span className="italic text-copper-dark">beautifully</span> distilled.
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-cocoa md:text-lg">
            High-concentration peptide serums built around GHK-Cu, Matrixyl, Argireline and SNAP-8 — with a free,
            evidence-led library that explains exactly what each one does.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/shop" className={buttonClasses({ size: "lg" })}>
              Shop the collection
            </Link>
            <Link href="/peptides" className={buttonClasses({ variant: "outline", size: "lg", className: "bg-cream/60 backdrop-blur" })}>
              Explore the Peptide Library
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export function TrustStrip({ freeShippingThreshold }: { freeShippingThreshold: number }) {
  const items = [
    { icon: MapPin, label: "Formulated in Australia" },
    { icon: FlaskConical, label: "Clinically studied peptides" },
    { icon: Leaf, label: "Cruelty-free & vegan" },
    {
      icon: Truck,
      label: freeShippingThreshold > 0 ? `Free shipping over ${formatMoney(freeShippingThreshold).replace(/\.00$/, "")}` : "Fast Australia Post delivery",
    },
  ];
  return (
    <section className="border-y border-stone/60 bg-cream" aria-label="Why Beauty Peps">
      <ul className="container-bp grid grid-cols-2 gap-y-5 py-6 md:grid-cols-4">
        {items.map((i) => (
          <li key={i.label} className="flex items-center justify-center gap-3 text-center text-xs font-medium tracking-wide text-espresso md:text-sm">
            <i.icon className="size-5 shrink-0 text-copper" aria-hidden />
            <span>{i.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export function Bestsellers({ products }: { products: ProductCardData[] }) {
  if (products.length === 0) return null;
  return (
    <section className="container-bp py-20 md:py-28" aria-labelledby="bestsellers-heading">
      <SectionHeading
        eyebrow="Most loved"
        title={<span id="bestsellers-heading">Bestselling peptide formulas</span>}
        description="Our most-reordered formulas — each built around peptides with published human data, at concentrations that match the research."
        action={
          <Link href="/shop" className="inline-flex items-center gap-1.5 text-sm font-medium text-copper-dark hover:gap-2.5">
            Shop all <ArrowRight className="size-4 transition-all" aria-hidden />
          </Link>
        }
      />
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} priority={i < 2} />
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

const CONCERN_IMAGES: Record<string, string> = {
  "fine-lines": "/images/products/matrixyl-3000-serum.webp",
  "expression-lines": "/images/products/argireline-10-serum.webp",
  firmness: "/images/products/multi-peptide-complex.webp",
  dullness: "/images/products/ghk-cu-copper-peptide-serum.webp",
  "dark-spots": "/images/products/nonapeptide-brightening-serum.webp",
  "under-eye": "/images/products/eye-peptide-gel.webp",
  lips: "/images/products/lip-peptide-plumping-balm.webp",
  barrier: "/images/products/peptide-night-cream.webp",
  "hair-density": "/images/products/scalp-peptide-serum.webp",
};

export function ConcernTiles() {
  return (
    <section className="bg-ivory py-20 md:py-28" aria-labelledby="concerns-heading">
      <div className="container-bp">
        <SectionHeading
          eyebrow="Shop by concern"
          title={<span id="concerns-heading">Start with what you want to change</span>}
          description="Different peptides send different signals. Pick a concern and we'll show you the formulas with the strongest evidence behind them."
        />
        <ul className="scrollbar-none -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 lg:grid-cols-3">
          {CONCERNS.map((c) => (
            <li key={c.slug} className="w-[78%] shrink-0 snap-start sm:w-[45%] md:w-auto">
              <Link
                href={`/shop?concern=${c.slug}`}
                className="group flex items-center gap-4 rounded-2xl border border-stone/70 bg-cream p-3 pr-5 transition-colors hover:border-copper/50"
              >
                <span className="relative aspect-square w-16 shrink-0 overflow-hidden rounded-xl bg-sand md:w-20">
                  {CONCERN_IMAGES[c.slug] && (
                    <Image
                      src={CONCERN_IMAGES[c.slug]}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  )}
                </span>
                <span className="flex-1 font-display text-lg leading-snug text-espresso">{c.label}</span>
                <ArrowRight className="size-4 shrink-0 text-copper transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export function MeetThePeptides({ peptides }: { peptides: PeptideTeaser[] }) {
  if (peptides.length === 0) return null;
  return (
    <section className="container-bp py-20 md:py-28" aria-labelledby="peptides-heading">
      <SectionHeading
        eyebrow="The Peptide Library"
        title={<span id="peptides-heading">Meet the peptides</span>}
        description="Free, referenced monographs on every peptide we formulate with — mechanism, evidence, ideal concentration and what to pair it with."
        action={
          <Link href="/peptides" className="inline-flex items-center gap-1.5 text-sm font-medium text-copper-dark hover:gap-2.5">
            Browse all peptides <ArrowRight className="size-4 transition-all" aria-hidden />
          </Link>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {peptides.map((p) => (
          <PeptideCard key={p.slug} peptide={p} />
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export function ScienceBand() {
  const classes = Object.entries(PEPTIDE_CLASSES);
  return (
    <section className="bg-espresso text-cream" aria-labelledby="science-heading">
      <div className="grid lg:grid-cols-2">
        <div className="relative aspect-[16/10] lg:aspect-auto">
          <Image
            src="/images/editorial/science.webp"
            alt="A serum droplet beside an illustrated peptide chain"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="px-4 py-16 sm:px-8 md:py-24 lg:px-16">
          <p className="mb-4 text-[0.7rem] font-semibold tracking-[0.22em] text-copper-light uppercase">The science</p>
          <h2 id="science-heading" className="max-w-lg font-display text-3xl leading-tight md:text-5xl">
            Peptides are messages. We choose what they say.
          </h2>
          <p className="mt-5 max-w-lg text-cream/70">
            Short chains of amino acids that skin already recognises. Each class of cosmetic peptide works through a
            different pathway — which is why we combine them deliberately rather than at random.
          </p>
          <ol className="mt-10 grid gap-6 sm:grid-cols-2">
            {classes.map(([key, c], i) => (
              <li key={key} className="border-t border-cream/15 pt-5">
                <span className="font-display text-sm text-copper-light">0{i + 1}</span>
                <h3 className="mt-1 font-display text-xl">{c.label}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cream/65">{c.description}</p>
              </li>
            ))}
          </ol>
          <Link href="/science" className={buttonClasses({ variant: "light", className: "mt-10" })}>
            How peptides work <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export function Spotlight({
  product,
}: {
  product: {
    id: string;
    slug: string;
    name: string;
    subtitle: string | null;
    image: string;
    price: number;
    compareAtPrice: number | null;
    shortDescription: string;
    keyActives: KeyActive[];
    size: string | null;
    stock: number;
  } | null;
}) {
  if (!product) return null;
  const facts = product.keyActives.slice(0, 3);
  return (
    <section className="container-bp py-20 md:py-28" aria-labelledby="spotlight-heading">
      <div className="grid items-center gap-10 overflow-hidden rounded-[2rem] bg-sapphire-light/40 lg:grid-cols-2 lg:gap-0">
        <Link href={`/products/${product.slug}`} className="relative block aspect-[4/5] lg:aspect-auto lg:h-full lg:min-h-[640px]">
          <Image src={product.image} alt={product.name} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </Link>
        <div className="px-6 pb-12 lg:px-16 lg:py-16">
          <p className="eyebrow mb-4">Spotlight · The copper peptide</p>
          <h2 id="spotlight-heading" className="font-display text-4xl leading-tight text-espresso md:text-5xl">
            {product.name}
          </h2>
          {product.subtitle && <p className="mt-2 text-lg text-cocoa">{product.subtitle}</p>}
          <p className="mt-6 leading-relaxed text-cocoa">{product.shortDescription}</p>
          {facts.length > 0 && (
            <dl className="mt-8 grid grid-cols-3 gap-4 border-y border-sapphire/15 py-6">
              {facts.map((f) => (
                <div key={f.name}>
                  <dt className="text-[11px] tracking-wider text-cocoa uppercase">{f.name}</dt>
                  <dd className="mt-1 font-display text-2xl text-sapphire">{f.amount}</dd>
                </div>
              ))}
            </dl>
          )}
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Price cents={product.price} compareAt={product.compareAtPrice} className="text-xl text-espresso" />
            {product.size && <span className="text-sm text-taupe">{product.size}</span>}
          </div>
          <div className="mt-6 flex flex-wrap items-start gap-3">
            {product.stock > 0 ? <QuickAdd productId={product.id} /> : null}
            <Link href={`/products/${product.slug}`} className={buttonClasses({ variant: "outline" })}>
              Learn more
            </Link>
          </div>
          <Link href="/peptides/ghk-cu" className="mt-6 inline-flex items-center gap-1.5 text-sm text-copper-dark underline-offset-4 hover:underline">
            Read the GHK-Cu monograph <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export function RitualSection() {
  const steps = [
    { title: "Cleanse", body: "Start on clean, slightly damp skin so water-soluble peptides spread evenly." },
    { title: "Signal & smooth", body: "Thin, water-based serums first — Argireline, SNAP-8 or Matrixyl." },
    { title: "Repair", body: "GHK-Cu in the evening, kept apart from strong acids and vitamin C." },
    { title: "Seal", body: "A peptide night cream or moisturiser locks everything in. SPF every morning." },
  ];
  return (
    <section className="bg-ivory" aria-labelledby="ritual-heading">
      <div className="container-bp grid items-center gap-12 py-20 md:py-28 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem]">
          <Image
            src="/images/editorial/ritual.webp"
            alt="Applying a peptide serum with a glass dropper"
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover"
          />
        </div>
        <div>
          <p className="eyebrow mb-4">The ritual</p>
          <h2 id="ritual-heading" className="font-display text-4xl leading-tight text-espresso md:text-5xl">
            How to layer peptides
          </h2>
          <p className="mt-5 max-w-lg text-cocoa">
            Peptides are gentle team players, but order still matters. Thinnest to thickest, water before oil — and a
            little patience: most studies measure results at 4 to 12 weeks.
          </p>
          <ol className="mt-10 space-y-6">
            {steps.map((s, i) => (
              <li key={s.title} className="flex gap-5">
                <span className="grid size-10 shrink-0 place-items-center rounded-full border border-copper/40 font-display text-copper-dark">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-display text-xl text-espresso">{s.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-cocoa">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/learn/how-to-layer-peptides" className={buttonClasses()}>
              Read the layering guide
            </Link>
            <Link href="/routine-builder" className={buttonClasses({ variant: "outline" })}>
              Build my routine
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export function RoutineBuilderCta() {
  return (
    <section className="container-bp py-20 md:py-28" aria-labelledby="rb-heading">
      <div className="relative overflow-hidden rounded-[2rem] bg-espresso">
        <Image src="/images/editorial/texture.webp" alt="" fill sizes="100vw" className="object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-r from-espresso via-espresso/80 to-espresso/30" />
        <div className="relative max-w-2xl px-6 py-16 text-cream md:px-14 md:py-20">
          <p className="mb-4 text-[0.7rem] font-semibold tracking-[0.22em] text-copper-light uppercase">Routine builder</p>
          <h2 id="rb-heading" className="font-display text-3xl leading-tight md:text-5xl">
            Your peptide routine, mapped in 60 seconds.
          </h2>
          <p className="mt-5 text-cream/75">
            Answer three questions about your skin and goals. We&apos;ll build a morning and evening routine using the
            peptides with the strongest evidence for you — and explain why.
          </p>
          <Link href="/routine-builder" className={buttonClasses({ variant: "copper", size: "lg", className: "mt-8" })}>
            Start now <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export function JournalTeaser({
  articles,
}: {
  articles: {
    slug: string;
    title: string;
    excerpt: string;
    coverImage: string | null;
    category: string;
    readMinutes: number;
    publishedAt: Date | null;
  }[];
}) {
  if (articles.length === 0) return null;
  return (
    <section className="container-bp pb-20 md:pb-28" aria-labelledby="journal-heading">
      <SectionHeading
        eyebrow="The journal"
        title={<span id="journal-heading">Read before you apply</span>}
        description="Guides, routines and research summaries from our formulation team."
        action={
          <Link href="/learn" className="inline-flex items-center gap-1.5 text-sm font-medium text-copper-dark hover:gap-2.5">
            All articles <ArrowRight className="size-4 transition-all" aria-hidden />
          </Link>
        }
      />
      <div className="grid gap-8 md:grid-cols-3">
        {articles.map((a) => (
          <Link key={a.slug} href={`/learn/${a.slug}`} className="group">
            <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-ivory">
              {a.coverImage && (
                <Image
                  src={a.coverImage}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
              )}
            </div>
            <p className="mt-4 text-[11px] font-semibold tracking-wider text-copper-dark uppercase">
              {a.category} · {a.readMinutes} min read
            </p>
            <h3 className="mt-2 font-display text-xl leading-snug text-espresso group-hover:text-copper-dark">{a.title}</h3>
            <p className="mt-2 line-clamp-2 text-sm text-cocoa">{a.excerpt}</p>
            {a.publishedAt && <p className="mt-2 text-xs text-taupe">{formatDate(a.publishedAt)}</p>}
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export function ReviewsGrid({
  reviews,
}: {
  reviews: {
    id: string;
    authorName: string;
    rating: number;
    title: string;
    body: string;
    verifiedPurchase: boolean;
    productName: string;
    productSlug: string;
  }[];
}) {
  if (reviews.length === 0) return null;
  return (
    <section className="bg-ivory py-20 md:py-28" aria-labelledby="reviews-home-heading">
      <div className="container-bp">
        <SectionHeading
          align="center"
          eyebrow="Real results"
          title={<span id="reviews-home-heading">In their words</span>}
          description="Unedited reviews from verified Beauty Peps customers."
        />
        <ul className="scrollbar-none -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
          {reviews.slice(0, 6).map((r) => (
            <li key={r.id} className="w-[85%] shrink-0 snap-start sm:w-[60%] md:w-auto">
              <figure className="flex h-full flex-col rounded-2xl border border-stone/70 bg-cream p-6">
                <Stars rating={r.rating} />
                <blockquote className="mt-4 flex-1">
                  <p className="font-display text-lg leading-snug text-espresso">“{r.title}”</p>
                  <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-cocoa">{r.body}</p>
                </blockquote>
                <figcaption className="mt-6 flex items-center justify-between gap-3 border-t border-stone/60 pt-4 text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-espresso">
                    {r.authorName}
                    {r.verifiedPurchase && <BadgeCheck className="size-3.5 text-sage" aria-label="Verified purchase" />}
                  </span>
                  <Link href={`/products/${r.productSlug}`} className="truncate text-copper-dark hover:underline">
                    {r.productName}
                  </Link>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export function ActivesBand() {
  return (
    <section className="container-bp py-20 md:py-28" aria-labelledby="actives-heading">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="lg:order-last">
          <div className="relative aspect-[3/2] overflow-hidden rounded-[2rem]">
            <Image
              src="/images/editorial/actives.webp"
              alt="Amber vials of lyophilised cosmetic peptide powders beside a precision scale"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
        <div>
          <p className="eyebrow mb-4">For formulators</p>
          <h2 id="actives-heading" className="font-display text-4xl leading-tight text-espresso md:text-5xl">
            Pure actives, lab-grade.
          </h2>
          <p className="mt-5 max-w-lg leading-relaxed text-cocoa">
            Making your own serums? Our cosmetic-grade lyophilised peptides — GHK-Cu, Argireline, Matrixyl and SNAP-8 —
            ship with a certificate of analysis and a formulation sheet covering dissolution, use level and pH.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-cocoa">
            {["Batch-tested for identity and purity", "Recommended use levels & pH windows", "Cold-chain packed, stored dry"].map((t) => (
              <li key={t} className="flex items-center gap-2.5">
                <span className="size-1.5 rounded-full bg-copper" aria-hidden />
                {t}
              </li>
            ))}
          </ul>
          <Link href="/shop?category=pure-actives" className={buttonClasses({ className: "mt-8" })}>
            Shop pure actives
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

const HOME_FAQS = [
  {
    q: "Do topical peptides actually work?",
    a: "Several cosmetic peptides have published, placebo-controlled human studies showing measurable improvements in wrinkle depth, firmness or expression lines over 4–12 weeks. Results depend on the peptide, its concentration and the formula — which is why we publish the evidence for each one in our Peptide Library.",
  },
  {
    q: "Can I use peptides with retinol or vitamin C?",
    a: "Yes, with a little planning. Most signal and neuropeptides layer happily with retinoids. Copper peptides (GHK-Cu) are best kept apart from strong acids and L-ascorbic acid — use vitamin C in the morning and GHK-Cu at night.",
  },
  {
    q: "How do I pay?",
    a: "We accept bank transfer and PayID. After you place your order you'll get our details on screen and by email — use your order number as the reference and we'll dispatch as soon as payment clears.",
  },
  {
    q: "How long does shipping take?",
    a: "Orders dispatch from Melbourne within one business day of payment clearing. Australia Post standard takes 2–6 business days; Express is 1–3.",
  },
];

export function FaqTeaser() {
  return (
    <section className="container-bp pb-20 md:pb-28" aria-labelledby="faq-home-heading">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
        <div>
          <p className="eyebrow mb-4">Questions</p>
          <h2 id="faq-home-heading" className="font-display text-4xl leading-tight text-espresso">
            Good questions, honest answers
          </h2>
          <p className="mt-4 text-cocoa">Everything about peptides, ordering and shipping is covered in our FAQ.</p>
          <Link href="/faq" className={buttonClasses({ variant: "outline", className: "mt-8" })}>
            Read all FAQs
          </Link>
        </div>
        <div className="divide-y divide-stone/70 border-y border-stone/70">
          {HOME_FAQS.map((f) => (
            <details key={f.q} className="group py-1">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-display text-lg text-espresso [&::-webkit-details-marker]:hidden">
                {f.q}
                <span
                  className="grid size-7 shrink-0 place-items-center rounded-full border border-stone font-sans text-sm text-cocoa transition-transform group-open:rotate-45"
                  aria-hidden
                >
                  +
                </span>
              </summary>
              <p className="pb-6 text-sm leading-relaxed text-cocoa">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export function NewsletterBand() {
  return (
    <section className="container-bp" aria-labelledby="newsletter-heading">
      <div className="grid items-center gap-8 rounded-[2rem] border border-stone/70 bg-blush/40 px-6 py-12 md:grid-cols-2 md:px-14 md:py-16">
        <div>
          <p className="eyebrow mb-3">The Peptide Letter</p>
          <h2 id="newsletter-heading" className="font-display text-3xl leading-tight text-espresso md:text-4xl">
            Research, not hype — twice a month.
          </h2>
          <p className="mt-3 text-sm text-cocoa">
            New studies decoded, formulation notes and early access to launches. Unsubscribe anytime.
          </p>
        </div>
        <NewsletterForm tone="light" source="home" />
      </div>
    </section>
  );
}
