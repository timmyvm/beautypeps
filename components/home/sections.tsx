import Image from "next/image";
import Link from "next/link";
import { specimenSrc, specimenTrimSrc, type ProductCardData } from "@/components/product/product-card";
import { formatMoney } from "@/lib/format";
import type { Peptide } from "@/lib/db/schema";
import type { StoreSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

const reveal = (i: number) => ({ "data-reveal": "", style: { ["--reveal-i" as string]: i } });

/* ------------------------------------------------------------------ */
/* List — "Object riding down the schedule": the graded library        */
/* ------------------------------------------------------------------ */

const CLASS_SHORT: Record<string, string> = {
  signal: "Signal",
  carrier: "Carrier",
  "neurotransmitter-inhibitor": "Neurotransmitter-inhibiting",
  "enzyme-inhibitor": "Enzyme-inhibiting",
};

export function LibraryList({ peptides, vial }: { peptides: Peptide[]; vial?: ProductCardData }) {
  const flagship = "ghk-cu";
  const vialSrc = vial ? specimenTrimSrc(vial.image) : null;

  return (
    <section className="mt-40 bg-field-ink pt-24 pb-30 text-field-ink-ink lg:mt-60 lg:pt-32" aria-labelledby="library-title">
      <div className="container-bp relative">
        {/* The vial travels down the centre line, over the empty middle of each row (desktop only) */}
        {vialSrc && (
          <div
            className="pointer-events-none absolute inset-y-0 left-1/2 z-10 hidden w-[16%] -translate-x-1/2 lg:block"
            aria-hidden
          >
            <div className="sticky top-[12vh] h-[46vh] w-full">
              <Image src={vialSrc} alt="" fill sizes="16vw" className="object-contain" />
            </div>
          </div>
        )}

        <h2
          id="library-title"
          className="display-type relative mb-16 flex items-center justify-center gap-[22%] pt-[4vh] text-head lg:mb-24"
        >
          <span>Peptide</span>
          <span>library</span>
        </h2>
        {vialSrc && (
          <div className="relative mx-auto -mt-6 mb-10 h-[52vw] w-[30%] lg:hidden" aria-hidden>
            <Image src={vialSrc} alt="" fill sizes="30vw" className="object-contain" />
          </div>
        )}

        <ol className="relative">
          {peptides.map((p, i) => {
            const accent = p.slug === flagship;
            return (
              <li key={p.id} data-reveal="row" style={{ ["--reveal-i" as string]: Math.min(i, 8) }}>
                <Link
                  href={`/peptides/${p.slug}`}
                  className={cn(
                    "grid min-h-[84px] grid-cols-1 items-center gap-1 px-4 py-4 transition-colors sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-8 lg:px-6",
                    accent
                      ? "bg-accent text-accent-ink"
                      : i % 2 === 0
                        ? "bg-field-ink hover:bg-white/10"
                        : "bg-white/[0.06] hover:bg-white/10",
                  )}
                >
                  <span className="lg:max-w-[36%]">
                    <span className="block text-lead font-medium">{p.name}</span>
                    <span className={cn("block text-small", accent ? "text-white/85" : "text-white/70")}>
                      {p.inciName} · {CLASS_SHORT[p.peptideClass] ?? p.peptideClass} peptide
                    </span>
                  </span>
                  <span className="tabular text-body sm:text-right">
                    Evidence grade {p.evidenceLevel} of 5
                    {p.typicalConcentration ? (
                      <span className="block text-small opacity-80">Used at {p.typicalConcentration}</span>
                    ) : null}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
        <p className="mt-12 max-w-[60ch] text-body">
          Grade 1 means laboratory data only; grade 5 means repeated, independent human trials.{" "}
          <Link href="/peptides" className="underline underline-offset-4">
            Read every monograph
          </Link>
          .
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Testimonial — "Quotes on paper slips"                               */
/* ------------------------------------------------------------------ */

type ReviewSlip = {
  id: string;
  authorName: string;
  title: string;
  body: string;
  verifiedPurchase: boolean;
  productName: string;
  productSlug: string;
  productImage: string;
};

const SLIP_TEAR =
  "polygon(0 8px, 4% 0, 8% 8px, 12% 0, 16% 8px, 20% 0, 24% 8px, 28% 0, 32% 8px, 36% 0, 40% 8px, 44% 0, 48% 8px, 52% 0, 56% 8px, 60% 0, 64% 8px, 68% 0, 72% 8px, 76% 0, 80% 8px, 84% 0, 88% 8px, 92% 0, 96% 8px, 100% 0, 100% calc(100% - 8px), 96% 100%, 92% calc(100% - 8px), 88% 100%, 84% calc(100% - 8px), 80% 100%, 76% calc(100% - 8px), 72% 100%, 68% calc(100% - 8px), 64% 100%, 60% calc(100% - 8px), 56% 100%, 52% calc(100% - 8px), 48% 100%, 44% calc(100% - 8px), 40% 100%, 36% calc(100% - 8px), 32% 100%, 28% calc(100% - 8px), 24% 100%, 20% calc(100% - 8px), 16% 100%, 12% calc(100% - 8px), 8% 100%, 4% calc(100% - 8px), 0 100%)";

export function ReviewSlips({ reviews }: { reviews: ReviewSlip[] }) {
  if (reviews.length === 0) return null;
  const slips = reviews.slice(0, 3);
  const shapes = [
    { rotate: -4, height: 440, offset: "lg:mt-10" },
    { rotate: 2, height: 520, offset: "lg:ml-6 lg:mt-24" },
    { rotate: 5, height: 600, offset: "lg:ml-6 lg:mt-4" },
  ];

  return (
    <section
      className="mt-40 overflow-hidden bg-field-sapphire pt-24 text-field-sapphire-ink lg:mt-60 lg:pt-32"
      aria-labelledby="slips-title"
    >
      <div className="container-bp">
        <h2 id="slips-title" className="display-type text-head" {...reveal(0)}>
          In their words
        </h2>
        <p className="mt-4 max-w-[52ch] text-body" {...reveal(1)}>
          Reviews from customers who bought the formula, shown as they were written.
        </p>
        <ul className="mt-14 pb-24 lg:pb-32 flex flex-col items-start gap-0 lg:mx-[8.33%] lg:flex-row lg:items-start lg:justify-center">
          {slips.map((r, i) => {
            const s = shapes[i];
            const cutout = specimenSrc(r.productImage);
            return (
              <li
                key={r.id}
                className={cn(
                  "relative w-[78%] max-w-[320px] shrink-0 lg:w-[320px]",
                  i % 2 === 1 ? "self-end lg:self-auto" : "",
                  i > 0 && "-mt-8 lg:mt-0",
                  s.offset,
                )}
                style={{ transform: `rotate(${s.rotate}deg)`, zIndex: i }}
              >
                <div {...reveal(i + 2)}>
                  <figure
                    className="flex flex-col bg-white px-6 pt-8 pb-10 text-ink lg:min-h-[var(--h)]"
                    style={{ clipPath: SLIP_TEAR, ["--h" as string]: `${s.height}px` }}
                  >
                    <figcaption className="text-center">
                      <span className="block text-body font-semibold">{r.authorName}</span>
                      <span className="block text-small">
                        {r.verifiedPurchase ? "Verified buyer" : "Customer"} ·{" "}
                        <Link href={`/products/${r.productSlug}`} className="underline underline-offset-2">
                          {r.productName}
                        </Link>
                      </span>
                    </figcaption>
                    <div className="relative mx-auto my-6 size-[120px] bg-surface">
                      <Image
                        src={cutout ?? r.productImage}
                        alt={r.productName}
                        fill
                        sizes="120px"
                        className={cn("grayscale", cutout ? "object-contain" : "object-cover")}
                      />
                    </div>
                    <blockquote className="text-body">
                      <p className="font-medium">{r.title}</p>
                      <p className="mt-2">{r.body}</p>
                    </blockquote>
                  </figure>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* FAQ — "Tabbed index cards"                                          */
/* ------------------------------------------------------------------ */

const CARD_FIELDS = ["bg-field-stone", "bg-field-frost", "bg-surface-2"];

export function FaqCards({ settings }: { settings: StoreSettings }) {
  const freeOver =
    settings.freeShippingThreshold > 0 ? `, and standard is free over ${formatMoney(settings.freeShippingThreshold)}` : "";
  const cards = [
    {
      topic: "Results",
      q: "How long until I see a difference?",
      a: "Peptides work slowly. Most studies measure change after 8 to 12 weeks of twice-daily use; skin usually feels smoother within the first few weeks.",
    },
    {
      topic: "Layering",
      q: "Can I use peptides with retinol or vitamin C?",
      a: "Yes. Apply peptides after cleansing and before moisturiser. Keep GHK-Cu apart from L-ascorbic acid and strong acids: copper at night, vitamin C in the morning.",
    },
    {
      topic: "Payment",
      q: "How do I pay?",
      a: `By bank transfer or PayID. After you order we email the details; use your order number as the reference and we ship once it clears. Unpaid orders are released after ${settings.paymentWindowDays} days.`,
    },
    {
      topic: "Shipping",
      q: "How quickly will it arrive?",
      a: `Australia Post from Melbourne. ${settings.dispatchTime} Standard is ${formatMoney(settings.standardShipping)} and express ${formatMoney(settings.expressShipping)}${freeOver}.`,
    },
    {
      topic: "Returns",
      q: "What if it isn't right for me?",
      a: "Unopened items can be returned within 30 days. Faulty or damaged items are always replaced or refunded.",
    },
    {
      topic: "Formulators",
      q: "Can I make my own serum with the pure actives?",
      a: "Yes. They are cosmetic-grade, freeze-dried powders and come with a formulation sheet: use level, pH window, and add them below 40 °C.",
    },
  ];

  return (
    <section className="container-bp mt-40 pt-3 lg:mt-60" aria-labelledby="faq-title">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-[var(--gutter)]">
        {/* The heading and the place it all leaves from; the index cards take the wider side */}
        <div className="flex flex-col lg:col-span-5">
          <div {...reveal(0)}>
            <h2 id="faq-title" className="display-type text-head">
              Before you order
            </h2>
            <p className="mt-6 max-w-[36ch] text-lead">
              Six answers people ask for most. The rest are filed under{" "}
              <Link href="/faq" className="underline underline-offset-4">
                every question
              </Link>
              .
            </p>
          </div>
          <figure className="mt-12 hidden lg:mt-auto lg:block lg:pt-16" {...reveal(1)}>
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface lg:w-[86%]">
              <Image
                src="/images/editorial/melbourne-sill.webp"
                alt="Three amber vials of peptide powder on a bluestone window sill, the Melbourne skyline behind the glass"
                fill
                sizes="(min-width: 1024px) 34vw, 100vw"
                className="drift object-cover"
              />
            </div>
            <figcaption className="mt-3 text-body">Weighed by this window in Melbourne, sent by Australia Post.</figcaption>
          </figure>
        </div>

        <div className="index-cards lg:col-span-7" {...reveal(2)}>
          {cards.map((c, i) => (
            <details
              key={c.topic}
              name="home-faq"
              open={i === 0}
              className={cn("index-card group relative", CARD_FIELDS[i % CARD_FIELDS.length])}
              style={{ ["--tab-x" as string]: `${i}`, zIndex: i + 1 }}
            >
              <summary className="flex min-h-[112px] cursor-pointer list-none flex-col justify-center px-6 pt-[64px] pb-[52px] md:px-8 [&::-webkit-details-marker]:hidden">
                {/* The open card's tab turns ink, so the drawer shows which card is pulled */}
                <span className="index-tab absolute top-0 flex items-center px-5 text-body font-medium transition-colors group-open:bg-ink group-open:text-white">
                  {c.topic}
                </span>
                <span className="flex items-center justify-between gap-6 text-lead font-medium">
                  {c.q}
                  <span aria-hidden className="text-lead leading-none transition-transform duration-300 group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="-mt-6 max-w-[52ch] px-6 pb-16 text-body md:px-8">{c.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
