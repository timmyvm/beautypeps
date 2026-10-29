import type { ReactNode } from "react";
import { SpecimenTile, type TileTone } from "@/components/product/product-card";

const reveal = (i: number) => ({ "data-reveal": "", style: { ["--reveal-i" as string]: i } });

// Three house specimens on their tiles, named like catalogue entries.
const SPECIMENS: { slug: string; name: string; fact: string; tone: TileTone }[] = [
  { slug: "ghk-cu-50mg", name: "GHK-Cu 50 mg", fact: "Copper tripeptide-1", tone: "stone" },
  { slug: "snap-8-10mg", name: "SNAP-8 10 mg", fact: "Acetyl octapeptide-3", tone: "sapphire" },
  { slug: "glutathione-600mg", name: "Glutathione 600 mg", fact: "L-glutathione", tone: "frost" },
];

/**
 * Frame for sign in / register / password pages: one heading with the sentence that says what the
 * page is for, the form, and the house specimens beside it.
 */
export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="container-bp py-8 md:py-12">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col lg:pt-12">
          <div className="w-full max-w-md">
            <h1 className="display-type text-head text-ink">{title}</h1>
            {description && (
              <p className="mt-4 text-lead text-ink" {...reveal(0)}>
                {description}
              </p>
            )}
            <div className="mt-8" {...reveal(1)}>
              {children}
            </div>
            {footer && (
              <div className="mt-10 text-body text-ink" {...reveal(2)}>
                {footer}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {/* The house specimen holds the first screen; two more sit beneath it */}
          {SPECIMENS.slice(0, 1).map((s) => (
            <figure key={s.slug} {...reveal(1)}>
              <SpecimenTile
                product={{ slug: s.slug, name: s.name, image: `/images/products/${s.slug}.webp` }}
                tone={s.tone}
                priority
                sizes="(min-width: 1024px) 48vw, 100vw"
                className="aspect-[4/5] w-full lg:aspect-auto lg:h-[min(76vh,46rem)]"
              />
              <figcaption className="mt-2 flex items-baseline justify-between gap-3 text-small text-ink">
                <span className="font-medium">{s.name}</span>
                <span className="tabular-nums text-muted">{s.fact}</span>
              </figcaption>
            </figure>
          ))}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {SPECIMENS.slice(1).map((s, i) => (
              <figure key={s.slug} {...reveal(i + 2)}>
                <SpecimenTile
                  product={{ slug: s.slug, name: s.name, image: `/images/products/${s.slug}.webp` }}
                  tone={s.tone}
                  sizes="(min-width: 1024px) 24vw, 50vw"
                  className="aspect-[4/5] w-full"
                />
                <figcaption className="mt-2 flex flex-wrap items-baseline justify-between gap-x-3 text-small text-ink">
                  <span className="font-medium">{s.name}</span>
                  <span className="tabular-nums text-muted">{s.fact}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
