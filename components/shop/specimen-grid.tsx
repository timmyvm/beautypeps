import Link from "next/link";
import { SpecimenTile, toneFor, type ProductCardData } from "@/components/product/product-card";
import { Price } from "@/components/ui/misc";
import { cn } from "@/lib/utils";

export type Grades = Record<string, { name: string; grade: number }>;

/**
 * The catalogue as a field guide: one specimen per flat colour tile, the name and one fact beneath,
 * aligned to the tile's left edge. One tile in nine is double size (only when the grid is long enough).
 */
export function SpecimenGrid({
  products,
  grades,
  priority = 0,
  doubles = true,
}: {
  products: ProductCardData[];
  grades?: Grades;
  priority?: number;
  doubles?: boolean;
}) {
  return (
    <ul className="grid grid-flow-dense grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4">
      {products.map((p, i) => {
        const lead = p.keyActives?.[0];
        const grade = grades && p.peptideSlugs?.[0] ? grades[p.peptideSlugs[0]] : undefined;
        const big = doubles && i % 9 === 0 && products.length > 8;
        return (
          <li
            key={p.id}
            className={cn(big && "col-span-2 md:row-span-2")}
            data-reveal=""
            style={{ ["--reveal-i" as string]: i % 4 }}
          >
            <Link href={`/products/${p.slug}`} className="group flex h-full flex-col">
              <SpecimenTile
                product={p}
                tone={toneFor(p.slug, i)}
                priority={i < priority}
                sizes={big ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 25vw, 50vw"}
                className={cn("w-full", big ? "aspect-[4/5] md:aspect-auto md:flex-1" : "aspect-[4/5]")}
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
  );
}

/** Filled, square filter control used across the shop (same look as the home page's concern chips). */
export function FilterChip({
  href,
  active,
  children,
  className,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "press inline-flex h-11 shrink-0 items-center px-4 text-body whitespace-nowrap",
        active ? "bg-ink text-white" : "bg-surface text-ink hover:bg-surface-2",
        className,
      )}
    >
      {children}
    </Link>
  );
}
