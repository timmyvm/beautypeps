import Image from "next/image";
import Link from "next/link";
import { specimenSrc, specimenTrimSrc, type ProductCardData } from "@/components/product/product-card";
import { LoopVideo } from "@/components/site/loop-video";
import { formatMoney } from "@/lib/format";
import type { Peptide } from "@/lib/db/schema";
import type { StoreSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

const reveal = (i: number) => ({ "data-reveal": "", style: { ["--reveal-i" as string]: i } });

/* ------------------------------------------------------------------ */
/* Showcase — "Frame run, one lifted": everything copper makes blue    */
/* ------------------------------------------------------------------ */

type Frame = { src: string; alt: string; name: string; fact: string; ratio: number; href: string; lifted?: boolean; video?: string };

export function BlueByCopper({ products }: { products: ProductCardData[] }) {
  const price = (slug: string) => {
    const p = products.find((x) => x.slug === slug);
    return p ? formatMoney(p.price) : "";
  };
  const frames: Frame[] = [
    {
      src: "/images/products/ghk-cu-copper-peptide-serum.webp",
      alt: "GHK-Cu copper peptide serum, sapphire blue, in a clear dropper bottle",
      name: "GHK-Cu serum",
      fact: `1% · ${price("ghk-cu-copper-peptide-serum")}`,
      ratio: 4 / 5,
      href: "/products/ghk-cu-copper-peptide-serum",
      lifted: true,
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
    {
      src: "/images/editorial/science.webp",
      alt: "A serum droplet beside a model of a peptide chain in copper and blue",
      name: "The tripeptide",
      fact: "Gly-His-Lys, 340 Da",
      ratio: 16 / 9,
      href: "/peptides/ghk-cu",
    },
  ];
  const lifted = frames.find((f) => f.lifted)!;
  const rest = frames.filter((f) => !f.lifted);

  return (
    <section className="mt-40 overflow-hidden pt-3 lg:mt-60" aria-labelledby="blue-title">
      <div className="container-bp grid gap-10 lg:grid-cols-12 lg:gap-[var(--gutter)]">
        {/* Nearly empty column: heading on top, notes further down beside the frames they describe */}
        <div className="lg:col-span-3">
          <div {...reveal(0)}>
            <h2 id="blue-title" className="display-type text-head">
              Blue by copper
            </h2>
            <Link href="/peptides/ghk-cu" className="mt-4 inline-block text-body text-accent underline underline-offset-4">
              Read the GHK-Cu monograph
            </Link>
          </div>
        </div>

        {/* The run: one frame lifted out of the row, bottoms aligned, leaving the right edge */}
        <div className="lg:col-span-9">
          <div className="hidden items-end gap-1.5 lg:flex">
            <FrameItem frame={lifted} index={0} />
            {/* The notes sit above the row, level with the frames they describe */}
            <div className="flex min-w-0 flex-col justify-between gap-10 self-stretch">
              <div className="max-w-[40ch] space-y-4 pt-1 pl-8 text-body" {...reveal(1)}>
                <p>
                  The blue is the copper ion held by the peptide, not a dye. Anything we make with GHK-Cu comes out
                  this colour.
                </p>
                <p>Use it at night, apart from vitamin C and strong acids, which loosen the copper.</p>
              </div>
              <div className="flex items-end gap-1.5">
                {rest.map((f, i) => (
                  <FrameItem key={f.src} frame={f} index={i + 2} />
                ))}
              </div>
            </div>
          </div>

          {/* Phone: the lifted frame first at full width, the rest two by two */}
          <div className="lg:hidden">
            <Link href={lifted.href} className="block md:w-2/3">
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface">
                <Image src={lifted.src} alt={lifted.alt} fill sizes="100vw" className="object-cover" />
              </div>
              <div className="mt-2 flex justify-between text-small">
                <span className="font-medium">{lifted.name}</span>
                <span className="text-muted">{lifted.fact}</span>
              </div>
            </Link>
            <ul className="mt-6 grid grid-cols-2 gap-x-1.5 gap-y-5 md:grid-cols-3">
              {rest.map((f, i) => (
                <li key={f.src} className={i === rest.length - 1 ? "col-span-2 md:col-span-1" : undefined}>
                  <Link href={f.href} className="block">
                    <div
                      className={cn(
                        "relative overflow-hidden bg-surface",
                        i === rest.length - 1 ? "aspect-[16/9] md:aspect-[4/5]" : "aspect-[4/5]",
                      )}
                    >
                      {f.video ? (
                        <LoopVideo src={f.video} poster={f.src} label={f.alt} />
                      ) : (
                        <Image src={f.src} alt={f.alt} fill sizes="50vw" className="object-cover" />
                      )}
                    </div>
                    <p className="mt-2 text-small font-medium">{f.name}</p>
                    <p className="text-small text-muted">{f.fact}</p>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8 space-y-4 text-body">
              <p>The blue is the copper ion held by the peptide, not a dye.</p>
              <p>Use it at night, apart from vitamin C and strong acids.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FrameItem({ frame: f, index }: { frame: Frame; index: number }) {
  return (
    <div className="shrink-0" {...reveal(index)}>
      <Link href={f.href} className="group block">
        <div className="relative overflow-hidden bg-surface" style={{ height: f.lifted ? "66vh" : "30vh", aspectRatio: f.ratio }}>
          {f.video ? (
            <LoopVideo src={f.video} poster={f.src} label={f.alt} />
          ) : (
            <Image
              src={f.src}
              alt={f.alt}
              fill
              sizes={f.lifted ? "40vw" : "25vw"}
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          )}
        </div>
        <div className="mt-2 flex justify-between gap-4 text-small">
          <span className="font-medium">{f.name}</span>
          <span className="text-muted">{f.fact}</span>
        </div>
      </Link>
    </div>
  );
}

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
          <div className="pointer-events-none absolute inset-y-0 left-1/2 z-10 hidden w-[16%] -translate-x-1/2 lg:block" aria-hidden>
            <div className="sticky top-[12vh] h-[46vh] w-full">
              <Image src={vialSrc} alt="" fill sizes="16vw" className="object-contain" />
            </div>
          </div>
        )}

        <h2 id="library-title" className="display-type relative mb-16 flex items-center justify-center gap-[22%] pt-[4vh] text-head lg:mb-24">
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
                    accent ? "bg-accent text-accent-ink" : i % 2 === 0 ? "bg-field-ink hover:bg-white/10" : "bg-white/[0.06] hover:bg-white/10",
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
                    {p.typicalConcentration ? <span className="block text-small opacity-80">Used at {p.typicalConcentration}</span> : null}
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
/* How it works — "Tiles that grow": powder to serum to skin           */
/* ------------------------------------------------------------------ */

export function PowderToSkin({ powder, serum }: { powder?: ProductCardData; serum?: ProductCardData }) {
  const stages = [
    {
      name: "Weighed",
      text: "Each peptide arrives freeze-dried and is weighed to the percentage printed on the label.",
      span: "lg:col-span-3",
      height: "lg:h-[30vh]",
      phoneHeight: "h-[34vw]",
    },
    {
      name: "Dissolved",
      text: "It goes into a water and glycerin base below 40 °C and is bottled in small batches.",
      span: "lg:col-span-4",
      height: "lg:h-[44vh]",
      phoneHeight: "h-[46vw]",
    },
    {
      name: "Applied",
      text: "Morning and night, for the 8 to 12 weeks in which studies measure change.",
      span: "lg:col-span-5",
      height: "lg:h-[60vh]",
      phoneHeight: "h-[62vw]",
    },
  ];

  return (
    <section className="container-bp mt-40 pt-3 lg:mt-60" aria-labelledby="powder-title">
      <div className="relative grid grid-cols-1 gap-7 lg:grid-cols-12 lg:items-end lg:gap-2.5">
        {/* The heading sits in the empty ground above the two smaller tiles */}
        <h2
          id="powder-title"
          className="display-type text-head lg:absolute lg:top-0 lg:left-0 lg:w-[58%]"
          {...reveal(0)}
        >
          From powder to skin
        </h2>
        {stages.map((s, i) => (
          <div key={s.name} className={s.span} {...reveal(i + 1)}>
            <div
              className={cn(
                "relative w-full overflow-hidden",
                s.phoneHeight,
                s.height,
                i === 0 ? "bg-field-frost" : i === 1 ? "bg-field-stone" : "bg-surface",
              )}
            >
              {i === 0 && powder && (
                <Image
                  src={specimenTrimSrc(powder.image) ?? powder.image}
                  alt="Amber vial of freeze-dried Matrixyl powder with a steel spatula"
                  fill
                  sizes="25vw"
                  className="object-contain p-[12%]"
                />
              )}
              {i === 1 && serum && (
                <Image
                  src={specimenTrimSrc(serum.image) ?? serum.image}
                  alt="Multi-Peptide 12 serum in a frosted glass bottle"
                  fill
                  sizes="33vw"
                  className="object-contain p-[9%]"
                />
              )}
              {i === 2 && (
                <Image
                  src="/images/editorial/ritual.webp"
                  alt="A woman pressing serum from a glass dropper onto her cheekbone"
                  fill
                  sizes="42vw"
                  className="drift object-cover object-[50%_30%]"
                />
              )}
            </div>
            <h3 className="mt-4 text-lead font-medium">{s.name}</h3>
            <p className="mt-1 max-w-[38ch] text-body">{s.text}</p>
          </div>
        ))}
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
    { rotate: 2, height: 520, offset: "lg:-ml-10 lg:mt-24" },
    { rotate: 5, height: 600, offset: "lg:-ml-10 lg:mt-4" },
  ];

  return (
    <section className="mt-40 overflow-hidden bg-field-sapphire pt-24 text-field-sapphire-ink lg:mt-60 lg:pt-32" aria-labelledby="slips-title">
      <div className="container-bp">
        <h2 id="slips-title" className="display-type text-head" {...reveal(0)}>
          In their words
        </h2>
        <p className="mt-4 max-w-[52ch] text-body" {...reveal(1)}>
          Reviews from customers who bought the formula, shown as they were written.
        </p>
        <ul className="mt-14 -mb-24 flex flex-col items-start gap-0 lg:mx-[8.33%] lg:flex-row lg:items-start lg:justify-center">
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
  const freeOver = settings.freeShippingThreshold > 0 ? `, and standard is free over ${formatMoney(settings.freeShippingThreshold)}` : "";
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
      <div className="lg:mx-[16.66%]">
        <div className="mb-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between" {...reveal(0)}>
          <h2 id="faq-title" className="display-type text-head">
            Before you order
          </h2>
          <Link href="/faq" className="text-body underline underline-offset-4">
            All questions
          </Link>
        </div>
        <div className="index-cards">
          {cards.map((c, i) => (
            <details
              key={c.topic}
              name="home-faq"
              open={i === 0}
              className={cn("index-card group relative", CARD_FIELDS[i % CARD_FIELDS.length])}
              style={{ ["--tab-x" as string]: `${i}`, zIndex: i + 1 }}
            >
              <summary className="flex min-h-[96px] cursor-pointer list-none flex-col justify-center px-6 pt-[56px] pb-[46px] [&::-webkit-details-marker]:hidden">
                <span className="index-tab absolute top-0 flex h-10 items-center px-5 text-small font-medium">{c.topic}</span>
                <span className="flex items-center justify-between gap-6 text-lead font-medium">
                  {c.q}
                  <span aria-hidden className="text-lead leading-none transition-transform duration-300 group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="-mt-6 max-w-[50ch] px-6 pb-16 text-body">{c.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
