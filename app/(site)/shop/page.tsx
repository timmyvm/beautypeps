import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FilterChip, SpecimenGrid } from "@/components/shop/specimen-grid";
import { SortSelect } from "@/components/shop/sort-select";
import { buttonClasses } from "@/components/ui/button";
import { CONCERNS, concernLabel } from "@/lib/constants";
import { getCategories, listProducts, PRODUCT_SORTS, type ProductSort } from "@/lib/queries/catalog";
import { getPublishedPeptides } from "@/lib/queries/content";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const sp = await searchParams;
  const categorySlug = str(sp.category);
  const concern = str(sp.concern);
  if (categorySlug) {
    const cat = (await getCategories()).find((c) => c.slug === categorySlug);
    if (cat) return { title: cat.name, description: cat.tagline ?? cat.description ?? undefined };
  }
  if (concern) return { title: `Peptides for ${concernLabel(concern).toLowerCase()}` };
  return {
    title: "Shop peptide serums",
    description:
      "Every Beauty Peps formula, with its lead peptide, its concentration and that peptide's evidence grade: GHK-Cu, Matrixyl, Argireline, SNAP-8 and more.",
  };
}

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const categorySlug = str(sp.category);
  const concern = str(sp.concern);
  const q = str(sp.q);
  const inStock = str(sp.instock) === "1";
  const sortParam = str(sp.sort);
  const sort: ProductSort = PRODUCT_SORTS.some((s) => s.value === sortParam) ? (sortParam as ProductSort) : "featured";

  const [categories, products, peptides] = await Promise.all([
    getCategories(),
    listProducts({ category: categorySlug, concern, q, sort, inStock }),
    getPublishedPeptides(),
  ]);
  const category = categories.find((c) => c.slug === categorySlug);
  const grades = Object.fromEntries(peptides.map((p) => [p.slug, { name: p.name, grade: p.evidenceLevel }]));

  const href = (patch: Record<string, string | undefined>) => {
    const qs = new URLSearchParams();
    const merged = {
      category: categorySlug,
      concern,
      q,
      sort: sort === "featured" ? undefined : sort,
      instock: inStock ? "1" : undefined,
      ...patch,
    };
    for (const [k, v] of Object.entries(merged)) if (v) qs.set(k, v);
    const s = qs.toString();
    return s ? `/shop?${s}` : "/shop";
  };

  const heading = category?.name ?? (concern ? `For ${concernLabel(concern).toLowerCase()}` : "All formulas");
  const intro =
    category?.description ??
    (concern
      ? `Formulas chosen for ${concernLabel(concern).toLowerCase()}. Under each one: the peptide doing the work, its concentration, and how strong the evidence for it is.`
      : "Every formula we make, shown plainly. Under each one: the peptide doing the work, its concentration, and how strong the evidence for it is, graded 1 to 5.");
  const count = `${products.length} ${products.length === 1 ? "formula" : "formulas"}`;

  return (
    <div className="container-bp pt-10 md:pt-16">
      {/* Heading and its first sentence at opposite ends of one baseline */}
      <header className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-[var(--gutter)]">
        <h1 className="display-type text-head lg:col-span-6" data-reveal="">
          {heading}
        </h1>
        <p className="max-w-[52ch] text-body lg:col-span-5 lg:col-start-8" data-reveal="" style={{ ["--reveal-i" as string]: 1 }}>
          {intro}
        </p>
      </header>

      {/* Filters: plain, filled controls at text size */}
      <div className="mt-12 space-y-3">
        <nav aria-label="Categories" className="flex flex-wrap gap-2">
          <FilterChip href={href({ category: undefined })} active={!categorySlug}>
            Everything
          </FilterChip>
          {categories.map((c) => (
            <FilterChip key={c.id} href={href({ category: c.slug })} active={c.slug === categorySlug}>
              {c.name}
            </FilterChip>
          ))}
        </nav>
        <nav aria-label="Concerns" className="flex flex-wrap gap-2">
          {CONCERNS.map((c) => (
            <FilterChip key={c.slug} href={href({ concern: c.slug === concern ? undefined : c.slug })} active={c.slug === concern}>
              {c.label}
            </FilterChip>
          ))}
        </nav>
      </div>

      <div className="mt-8 flex flex-col gap-4 bg-surface px-4 py-3 md:flex-row md:items-center md:justify-between">
        <p className="text-body" aria-live="polite">
          {count}
          {q ? (
            <>
              {" "}
              matching “{q}”.{" "}
              <Link href={href({ q: undefined })} className="underline underline-offset-4">
                Clear search
              </Link>
            </>
          ) : (
            "."
          )}
        </p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link
            href={href({ instock: inStock ? undefined : "1" })}
            aria-pressed={inStock}
            className="text-body underline-offset-4 hover:underline"
          >
            {inStock ? "Showing in-stock only (show all)" : "In stock only"}
          </Link>
          <form action="/shop" role="search" className="flex">
            {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
            {concern && <input type="hidden" name="concern" value={concern} />}
            <label htmlFor="shop-q" className="sr-only">
              Search the catalogue
            </label>
            <input
              id="shop-q"
              name="q"
              defaultValue={q}
              placeholder="Search the catalogue"
              className="h-11 w-56 min-w-0 bg-white px-4 text-body text-ink placeholder:text-taupe focus:outline-2 focus:outline-accent"
            />
          </form>
          <Suspense>
            <SortSelect options={PRODUCT_SORTS} value={sort} />
          </Suspense>
        </div>
      </div>

      <section className="mt-10" aria-label="Formulas">
        {products.length === 0 ? (
          <div className="grid gap-6 bg-surface p-8 md:grid-cols-[1fr_auto] md:items-end md:p-12">
            <div>
              <h2 className="display-type text-head">Nothing matches yet</h2>
              <p className="mt-4 max-w-[48ch] text-body">
                No formula fits every filter you&apos;ve chosen. Remove one, or start again from the whole catalogue.
              </p>
            </div>
            <Link href="/shop" className={buttonClasses({ size: "lg" })}>
              See all formulas
            </Link>
          </div>
        ) : (
          <SpecimenGrid products={products} grades={grades} priority={4} />
        )}
      </section>
    </div>
  );
}
