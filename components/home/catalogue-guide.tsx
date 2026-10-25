"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SpecimenTile, toneFor, type ProductCardData } from "@/components/product/product-card";
import { Price } from "@/components/ui/misc";
import { cn } from "@/lib/utils";

type Concern = { slug: string; label: string };
type Grade = { name: string; grade: number };

/*
 * The catalogue, as a field guide. The live thing: choose what you're treating and the guide narrows to
 * the formulas that address it, each naming its lead peptide, its concentration and that peptide's grade.
 * Without script the concern chips are plain links to the filtered shop.
 */
export function CatalogueGuide({
  products,
  concerns,
  grades,
}: {
  products: ProductCardData[];
  concerns: Concern[];
  grades: Record<string, Grade>;
}) {
  const [concern, setConcern] = useState<string | null>(null);
  const visible = useMemo(
    () => (concern ? products.filter((p) => p.concerns?.includes(concern)) : products),
    [concern, products],
  );
  const label = concerns.find((c) => c.slug === concern)?.label;

  return (
    <div>
      <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-baseline lg:justify-between">
        <p className="text-body text-ink" aria-live="polite">
          {concern ? (
            <>
              {visible.length} {visible.length === 1 ? "formula" : "formulas"} for{" "}
              <span className="font-medium">{label?.toLowerCase()}</span>.
            </>
          ) : (
            "What are you treating? The guide narrows to the formulas that address it."
          )}
        </p>
      </div>

      <ul className="mb-12 flex flex-wrap gap-2" aria-label="Filter by concern">
        <li>
          <button
            type="button"
            onClick={() => setConcern(null)}
            aria-pressed={concern === null}
            className={cn(
              "press h-11 px-4 text-body",
              concern === null ? "bg-ink text-white" : "bg-surface text-ink hover:bg-surface-2",
            )}
          >
            Everything
          </button>
        </li>
        {concerns.map((c) => (
          <li key={c.slug}>
            <a
              href={`/shop?concern=${c.slug}`}
              onClick={(e) => {
                e.preventDefault();
                setConcern(c.slug === concern ? null : c.slug);
              }}
              aria-pressed={concern === c.slug}
              role="button"
              className={cn(
                "press inline-flex h-11 items-center px-4 text-body",
                concern === c.slug ? "bg-ink text-white" : "bg-surface text-ink hover:bg-surface-2",
              )}
            >
              {c.label}
            </a>
          </li>
        ))}
      </ul>

      <ul className="grid grid-flow-dense grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4">
        {visible.map((p, i) => {
          const lead = p.keyActives?.[0];
          const grade = p.peptideSlugs?.[0] ? grades[p.peptideSlugs[0]] : undefined;
          const big = i % 9 === 0 && visible.length > 8;
          return (
            <li key={p.id} className={cn(big && "col-span-2 md:row-span-2")}>
              <Link href={`/products/${p.slug}`} className="group flex h-full flex-col">
                <SpecimenTile
                  product={p}
                  tone={toneFor(p.slug, i)}
                  morph
                  sizes={big ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
                  className={cn("w-full", big ? "aspect-[4/5] md:flex-1 md:aspect-auto" : "aspect-[4/5]")}
                />
                <div className="mt-3 flex flex-col gap-x-4 lg:flex-row lg:items-baseline lg:justify-between">
                  <h3 className="text-body leading-snug font-medium text-ink group-hover:underline group-hover:underline-offset-4">
                    {p.name}
                  </h3>
                  <Price cents={p.price} compareAt={p.compareAtPrice} className="shrink-0 text-body text-ink" />
                </div>
                <p className="mt-1 text-small text-muted">
                  {lead ? `${lead.amount} ${lead.name}` : p.subtitle}
                  {grade ? ` · evidence grade ${grade.grade} of 5` : ""}
                  {p.stock <= 0 ? <span className="text-danger"> · Sold out</span> : null}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
