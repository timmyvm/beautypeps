import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import { Price } from "@/components/ui/misc";
import type { KeyActive, Product } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

export type ProductCardData = Pick<
  Product,
  "id" | "slug" | "name" | "subtitle" | "price" | "compareAtPrice" | "image" | "badge" | "size" | "stock"
> & { keyActives?: KeyActive[]; concerns?: string[]; peptideSlugs?: string[]; rating?: { average: number; count: number } | null };

/* ------------------------------------------------------------------ */
/* Specimens: every product stands alone on a flat colour tile.        */
/* ------------------------------------------------------------------ */

export type TileTone = "sapphire" | "frost" | "stone" | "ink";

export const TILE_BG: Record<TileTone, string> = {
  sapphire: "bg-field-sapphire",
  frost: "bg-field-frost",
  stone: "bg-field-stone",
  ink: "bg-field-ink",
};

const ROTATION: TileTone[] = ["stone", "sapphire", "frost", "ink"];
// Copper formulas are blue themselves; they never sit on the sapphire field.
const BLUE = /ghk|scalp|copper/;

export function toneFor(slug: string, index?: number): TileTone {
  let i = index;
  if (i === undefined) {
    i = 0;
    for (const ch of slug) i = (i * 31 + ch.charCodeAt(0)) >>> 0;
  }
  const tone = ROTATION[i % ROTATION.length];
  return tone === "sapphire" && BLUE.test(slug) ? "frost" : tone;
}

/** Cut-out version of a catalogue photo, when one exists (uploaded photos fall back to the original). */
export function specimenSrc(image: string): string | null {
  const m = image.match(/^\/images\/products\/([\w-]+)\.webp$/);
  return m ? `/images/specimens/${m[1]}.webp` : null;
}

/** Tightly cropped cut-out, for places where one object should fill its space. */
export function specimenTrimSrc(image: string): string | null {
  const m = image.match(/^\/images\/products\/([\w-]+)\.webp$/);
  return m ? `/images/specimens/trim/${m[1]}.webp` : null;
}

/** The one fact under a specimen: the lead active and its concentration. */
export function productFact(p: Pick<ProductCardData, "keyActives" | "subtitle" | "size">) {
  const lead = p.keyActives?.[0];
  if (lead) return `${lead.amount} ${lead.name}`;
  return p.subtitle ?? p.size ?? "";
}

export function SpecimenTile({
  product,
  tone,
  priority,
  sizes = "(min-width: 1024px) 25vw, 50vw",
  morph,
  className,
}: {
  product: Pick<ProductCardData, "slug" | "name" | "image">;
  tone: TileTone;
  priority?: boolean;
  sizes?: string;
  /** Morph this tile into the product page's own when it is opened. Only one tile per product on a page. */
  morph?: boolean;
  className?: string;
}) {
  const cutout = specimenSrc(product.image);
  const tile = (
    <div className={cn("specimen relative overflow-hidden", TILE_BG[tone], className)}>
      {/* `priority` marks a likely largest paint: fetched first and never lazy (next/image's own prop is deprecated). */}
      <Image
        src={cutout ?? product.image}
        alt={product.name}
        fill
        loading={priority ? "eager" : undefined}
        fetchPriority={priority ? "high" : undefined}
        sizes={sizes}
        className={cutout ? "object-contain" : "object-cover"}
      />
    </div>
  );
  return morph ? (
    <ViewTransition name={`specimen-${product.slug}`} share="morph" default="none">
      {tile}
    </ViewTransition>
  ) : (
    tile
  );
}

export function ProductCard({
  product,
  className,
  priority,
  tone,
  index,
}: {
  product: ProductCardData;
  className?: string;
  priority?: boolean;
  tone?: TileTone;
  index?: number;
}) {
  const soldOut = product.stock <= 0;
  const fact = productFact(product);
  const note = soldOut ? "Sold out" : product.badge;
  return (
    <Link href={`/products/${product.slug}`} className={cn("group flex flex-col", className)}>
      <SpecimenTile product={product} tone={tone ?? toneFor(product.slug, index)} priority={priority} morph className="aspect-[4/5]" />
      <div className="mt-3 flex flex-col gap-x-4 lg:flex-row lg:items-baseline lg:justify-between">
        <h3 className="text-body leading-snug font-medium text-ink group-hover:underline group-hover:underline-offset-4">
          {product.name}
        </h3>
        <Price cents={product.price} compareAt={product.compareAtPrice} className="shrink-0 text-body text-ink" />
      </div>
      <p className="mt-1 text-small text-muted">
        {fact}
        {note ? <span className={soldOut ? "text-danger" : undefined}> · {note}</span> : null}
      </p>
    </Link>
  );
}
