import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FilterChip, SpecimenGrid } from "@/components/shop/specimen-grid";
import { ParamSelect, SortSelect } from "@/components/shop/sort-select";
import { buttonClasses } from "@/components/ui/button";
import { CONCERNS, concernLabel } from "@/lib/constants";
import { getCategories, getFeaturedProducts, listProducts, PRODUCT_SORTS, type ProductSort } from "@/lib/queries/catalog";
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
  const fallback = products.length === 0 ? await getFeaturedProducts(4) : [];
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
  const categoryOptions = [{ value: "", label: "Everything" }, ...categories.map((c) => ({ value: c.slug, label: c.name }))];
  const concernOptions = [{ value: "", label: "Any concern" }, ...CONCERNS.map((c) => ({ value: c.slug, label: c.label }))];

  return (
    <div className="container-bp pt-10 md:pt-16">
      {/* Heading and its first sentence at opposite ends of one baseline */}
      <header className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-end lg:gap-[var(--gutter)]">
        <h1 className="display-type text-[clamp(2.75rem,1rem+5vw,5.75rem)] lg:col-span-7" data-reveal="">
          {heading}
        </h1>
        <p className="max-w-[44ch] text-lead lg:col-span-5 lg:col-start-8" data-reveal="" style={{ ["--reveal-i" as string]: 1 }}>
          {intro}
        </p>
      </header>

      {/* Phones: the count and one control; every filter folds into it */}
      <details className="group mt-10 bg-surface md:hidden" data-reveal="" style={{ ["--reveal-i" as string]: 2 }}>
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 px-4 py-2 text-body [&::-webkit-details-marker]:hidden">
          <span aria-live="polite">
            {count}
            {q ? ` matching “${q}”` : ""}
          </span>
          <span className="underline underline-offset-4">
            <span className="group-open:hidden">Filter and sort</span>
            <span className="hidden group-open:inline">Close</span>
          </span>
        </summary>
        <div className="space-y-4 px-4 pt-2 pb-5">
          <Suspense>
            <ParamSelect name="category" label="Category" options={categoryOptions} value={categorySlug ?? ""} stacked />
            <ParamSelect name="concern" label="Concern" options={concernOptions} value={concern ?? ""} stacked />
            <SortSelect options={PRODUCT_SORTS} value={sort} stacked />
          </Suspense>
          <form action="/shop" role="search">
            {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
            {concern && <input type="hidden" name="concern" value={concern} />}
            <label htmlFor="shop-q-phone" className="mb-1.5 block text-body">
              Search
            </label>
            <input
              id="shop-q-phone"
              name="q"
              defaultValue={q}
              placeholder="Search the catalogue"
              className="h-11 w-full bg-white px-4 text-body text-ink placeholder:text-taupe focus:outline-2 focus:outline-accent"
            />
          </form>
          <p className="flex flex-wrap gap-x-6 gap-y-2 text-body">
            <Link href={href({ instock: inStock ? undefined : "1" })} aria-pressed={inStock} className="underline underline-offset-4">
              {inStock ? "Show sold-out formulas too" : "In stock only"}
            </Link>
            {q && (
              <Link href={href({ q: undefined })} className="underline underline-offset-4">
                Clear search
              </Link>
            )}
          </p>
        </div>
      </details>

      {/* Tablet and up: categories as filled chips, everything else in one toolbar */}
      <nav
        aria-label="Categories"
        className="mt-12 hidden flex-wrap gap-2 md:flex"
        data-reveal=""
        style={{ ["--reveal-i" as string]: 2 }}
      >
        <FilterChip href={href({ category: undefined })} active={!categorySlug}>
          Everything
        </FilterChip>
        {categories.map((c) => (
          <FilterChip key={c.id} href={href({ category: c.slug })} active={c.slug === categorySlug}>
            {c.name}
          </FilterChip>
        ))}
      </nav>

      <div
        className="mt-3 hidden flex-wrap items-center justify-between gap-x-6 gap-y-3 bg-surface px-4 py-3 md:flex"
        data-reveal=""
        style={{ ["--reveal-i" as string]: 3 }}
      >
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
          <Suspense>
            <ParamSelect name="concern" label="Concern" options={concernOptions} value={concern ?? ""} />
          </Suspense>
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

      <section className="mt-8 md:mt-10" aria-label="Formulas">
        {products.length === 0 ? (
          <div className="grid gap-6 bg-surface p-8 md:grid-cols-[1fr_auto] md:items-end md:p-12" data-reveal="">
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

      {fallback.length > 0 && (
        <section className="mt-24 md:mt-32" aria-labelledby="fallback-heading">
          <h2 id="fallback-heading" className="display-type mb-10 text-head" data-reveal="">
            What most people start with
          </h2>
          <SpecimenGrid products={fallback} grades={grades} doubles={false} />
        </section>
      )}
    </div>
  );
}
