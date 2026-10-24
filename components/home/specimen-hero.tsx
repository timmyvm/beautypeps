import Link from "next/link";
import { SequenceStrand } from "@/components/peptides/sequence-strand";
import { SpecimenTile, type ProductCardData, type TileTone } from "@/components/product/product-card";
import { LoopVideo } from "@/components/site/loop-video";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/*
 * Hero — "Statement beside specimen mosaic".
 * The screen splits 50/50 by tone alone. Left: the statement and, at the foot, one sentence and the action.
 * Right: seven specimens on a 4 × 3 grid with two cells left empty; the last column runs off the edge.
 */

type Placement = { slug: string; tone: TileTone; area: string; big?: boolean; phone?: boolean };

const MOSAIC: Placement[] = [
  { slug: "ghk-cu-copper-peptide-serum", tone: "stone", area: "lg:col-start-2 lg:col-span-2 lg:row-start-1 lg:row-span-2", big: true, phone: true },
  { slug: "argireline-10-serum", tone: "frost", area: "lg:col-start-4 lg:row-start-1", phone: true },
  { slug: "matrixyl-3000-serum", tone: "sapphire", area: "lg:col-start-1 lg:row-start-2", phone: true },
  { slug: "eye-peptide-gel", tone: "ink", area: "lg:col-start-1 lg:row-start-3", phone: true },
  { slug: "ghk-cu-pure-powder", tone: "frost", area: "lg:col-start-2 lg:row-start-3" },
  { slug: "peptide-night-cream", tone: "sapphire", area: "lg:col-start-3 lg:row-start-3", phone: true },
  { slug: "lip-peptide-plumping-balm", tone: "stone", area: "lg:col-start-4 lg:row-start-3" },
];

export function SpecimenHero({ products, ghkSequence }: { products: ProductCardData[]; ghkSequence: string }) {
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const tiles = MOSAIC.map((m) => ({ ...m, product: bySlug.get(m.slug) })).filter((t) => t.product);

  return (
    <section className="grid lg:h-[calc(100svh-7.5rem)] lg:min-h-[620px] lg:max-h-[1000px] lg:grid-cols-2" aria-labelledby="hero-title">
      {/* Statement side */}
      <div className="flex flex-col justify-between gap-10 px-[var(--margin)] pt-10 pb-12 lg:pt-14 lg:pb-[var(--margin)]">
        <h1 id="hero-title" className="display-type max-w-[11ch] text-[10.5vw] text-ink sm:text-[clamp(2.75rem,5.9vw,5.75rem)]" style={{ textWrap: "balance" }}>
          Peptide serums, graded
        </h1>
        {/* The mark, drawn from the molecule it is named after: choose a bead to name it */}
        <SequenceStrand
          sequence={ghkSequence}
          label="GHK-Cu"
          interactive
          caption="GHK-Cu: glycine, histidine and lysine holding one copper ion, and the three circles of our mark. Choose one to name it."
          className="hero-strand hidden lg:block"
        />
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between lg:gap-10">
          <p className="max-w-[34ch] text-lead text-ink">
            Small-batch Melbourne serums from 13 cosmetic peptides, with the concentration on every label and an
            evidence grade for every peptide.
          </p>
          <Link href="/shop" className={buttonClasses({ size: "lg", className: "shrink-0 self-start sm:self-auto" })}>
            Shop serums
          </Link>
        </div>
      </div>

      {/* Specimen side: one tone step darker, the mosaic bleeding off the right edge */}
      <div className="relative overflow-hidden bg-surface">
        {/* Desktop mosaic */}
        <div className="hidden w-[112%] grid-cols-4 gap-3.5 p-8 pr-0 lg:grid">
          {tiles.map((t, i) => (
            <Link
              key={t.slug}
              href={`/products/${t.slug}`}
              aria-label={t.product!.name}
              className={cn("block", t.area)}
              data-reveal={t.big ? undefined : ""}
              style={{ ["--reveal-i" as string]: i }}
            >
              {t.big ? (
                // The flagship on its plinth, with the day's light drifting across the copper
                <div className="shutter-now relative aspect-[3/4] w-full overflow-hidden bg-field-stone">
                  <LoopVideo
                    src="/video/ghk-cu-light.mp4"
                    poster="/images/editorial/ghk-cu-plinth.webp"
                    label={`${t.product!.name} on its travertine plinth, window light drifting across it`}
                    priority
                  />
                </div>
              ) : (
                <SpecimenTile product={t.product!} tone={t.tone} sizes="15vw" className="aspect-[3/4] w-full" />
              )}
            </Link>
          ))}
        </div>

        {/* Phone mosaic: two columns, the right one started lower, the last row cropped by the screen */}
        <div className="grid max-h-[118vw] grid-cols-2 gap-2.5 p-[var(--margin)] lg:hidden">
          {[0, 1].map((col) => (
            <div key={col} className={cn("flex flex-col gap-2.5", col === 1 && "pt-12")}>
              {tiles
                .filter((t) => t.phone)
                .filter((_, i) => i % 2 === col)
                .map((t, row) => (
                  <Link key={t.slug} href={`/products/${t.slug}`} aria-label={t.product!.name}>
                    {/* The top pair is the phone's first screen (and its largest paint): fetched straight away. */}
                    <SpecimenTile product={t.product!} tone={t.tone} priority={row === 0} sizes="50vw" className="aspect-[3/4] w-full" />
                  </Link>
                ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
