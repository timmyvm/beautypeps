import type { Metadata } from "next";
import Link from "next/link";
import { Suspense, ViewTransition } from "react";
import { SpecimenGrid } from "@/components/shop/specimen-grid";
import { FilterLink, ParamSelect, SortSelect } from "@/components/shop/sort-select";
import { buttonClasses } from "@/components/ui/button";
import { CONCERNS, concernLabel } from "@/lib/constants";
import { getCategories, getFeaturedProducts, listProducts, PRODUCT_SORTS, type ProductSort } from "@/lib/queries/catalog";
import { getActiveProducts, getPublishedPeptides } from "@/lib/queries/content";
import { cn } from "@/lib/utils";
import { SITE_CARD } from "@/lib/seo";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;

const SHOP_DESCRIPTION =
  "Every Beauty Peps formula, with its lead peptide, its concentration and that peptide's evidence grade: GHK-Cu, Matrixyl, Argireline, SNAP-8 and more.";

/*
 * Category and concern views are landing pages in their own right, so each is its own canonical URL.
 * Sorting, the stock toggle and free-text searches are views of those pages, so they point back to them.
 */
export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const sp = await searchParams;
  const categorySlug = str(sp.category);
  const concern = CONCERNS.some((c) => c.slug === str(sp.concern)) ? str(sp.concern) : undefined;
  // Sorted or stock-filtered views just point to their canonical; free-text results also stay unindexed.
  const robots = str(sp.q) ? { index: false, follow: true } : undefined;

  if (categorySlug) {
    const cat = (await getCategories()).find((c) => c.slug === categorySlug);
    if (cat) {
      const description = cat.tagline ?? cat.description ?? SHOP_DESCRIPTION;
      return {
        title: `${cat.name}: peptide serums`,
        description,
        alternates: { canonical: `/shop?category=${cat.slug}` },
        openGraph: { title: cat.name, description, url: `/shop?category=${cat.slug}`, images: [SITE_CARD] },
        robots,
      };
    }
    return { title: "Shop peptide serums", alternates: { canonical: "/shop" }, robots: { index: false, follow: true } };
  }
  if (concern) {
    const label = concernLabel(concern).toLowerCase();
    const description = `Beauty Peps formulas chosen for ${label}: the peptide doing the work in each, its concentration and its evidence grade.`;
    return {
      title: `Peptide serums for ${label}`,
      description,
      alternates: { canonical: `/shop?concern=${concern}` },
      openGraph: { title: `Peptide serums for ${label}`, description, url: `/shop?concern=${concern}`, images: [SITE_CARD] },
      robots,
    };
  }
  return {
    title: "Shop peptide serums",
    description: SHOP_DESCRIPTION,
    alternates: { canonical: "/shop" },
    openGraph: { title: "Shop peptide serums", description: SHOP_DESCRIPTION, url: "/shop", images: [SITE_CARD] },
    robots,
  };
}

/** The filters live in the URL, so the catalogue renders per request inside the page's static shell. */
export default function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<div className="container-bp min-h-dvh pt-10 md:pt-16" aria-busy="true" />}>
      <ShopContent searchParams={searchParams} />
    </Suspense>
  );
}

async function ShopContent({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const categorySlug = str(sp.category);
  const concern = str(sp.concern);
  const q = str(sp.q);
  const inStock = str(sp.instock) === "1";
  const sortParam = str(sp.sort);
  const sort: ProductSort = PRODUCT_SORTS.some((s) => s.value === sortParam) ? (sortParam as ProductSort) : "featured";

  const [categories, products, peptides, catalogue] = await Promise.all([
    getCategories(),
    listProducts({ category: categorySlug, concern, q, sort, inStock }),
    getPublishedPeptides(),
    getActiveProducts(),
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

  // Each concern chip says how many formulas it would show within the current category and stock view.
  const pool = catalogue.filter((p) => (!categorySlug || p.categorySlug === categorySlug) && (!inStock || p.stock > 0));
  const concernCounts = CONCERNS.map((c) => ({ ...c, count: pool.filter((p) => p.concerns.includes(c.slug)).length })).filter(
    (c) => c.count > 0 || c.slug === concern,
  );
  const categoryCounts = new Map(categories.map((c) => [c.slug, catalogue.filter((p) => p.categorySlug === c.slug).length]));

  const scope = [
    concern && `for ${concernLabel(concern).toLowerCase()}`,
    category && `in ${category.name.toLowerCase()}`,
    inStock && "in stock",
    q && `matching “${q}”`,
  ]
    .filter(Boolean)
    .join(", ");
  const count = `${products.length} ${products.length === 1 ? "formula" : "formulas"}${scope ? ` ${scope}` : ""}`;
  const categoryOptions = [{ value: "", label: "Everything" }, ...categories.map((c) => ({ value: c.slug, label: c.name }))];
  // Same filters, different view: the grid crossfades instead of cutting.
  const resultsKey = [categorySlug, concern, q, sort, inStock].join("|");

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

      {/* The field guide's first question: what are you treating? Concerns are the way in, on every screen. */}
      <nav aria-labelledby="concern-question" className="mt-12 md:mt-20" data-reveal="" style={{ ["--reveal-i" as string]: 2 }}>
        <p id="concern-question" className="text-lead font-medium">
          What are you treating?
        </p>
        <ul className="scrollbar-none -mx-[var(--margin)] mt-5 flex gap-2 overflow-x-auto px-[var(--margin)] md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
          <li>
            <FilterLink href={href({ concern: undefined })} active={!concern} count={pool.length}>
              Everything
            </FilterLink>
          </li>
          {concernCounts.map((c) => (
            <li key={c.slug}>
              <FilterLink href={href({ concern: c.slug === concern ? undefined : c.slug })} active={c.slug === concern} count={c.count}>
                {c.label}
              </FilterLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Phones: the rest of the filters fold into one control */}
      <details className="group mt-6 bg-surface md:hidden" data-reveal="" style={{ ["--reveal-i" as string]: 3 }}>
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 px-4 py-2 text-body [&::-webkit-details-marker]:hidden">
          <span>{category ? category.name : "Every category"}</span>
          <span className="underline underline-offset-4">
            <span className="group-open:hidden">Category, sort, search</span>
            <span className="hidden group-open:inline">Close</span>
          </span>
        </summary>
        <div className="space-y-4 px-4 pt-2 pb-5">
          <Suspense>
            <ParamSelect name="category" label="Category" options={categoryOptions} value={categorySlug ?? ""} stacked />
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
          <Link href={href({ instock: inStock ? undefined : "1" })} scroll={false} aria-pressed={inStock} className="inline-block text-body underline underline-offset-4">
            {inStock ? "Show sold-out formulas too" : "In stock only"}
          </Link>
        </div>
      </details>

      {/* Tablet and up: the categories as quiet links, then stock, search and sort, on one line */}
      <div
        className="mt-6 hidden flex-wrap items-center justify-between gap-x-8 gap-y-3 bg-surface px-5 py-3 md:flex"
        data-reveal=""
        style={{ ["--reveal-i" as string]: 3 }}
      >
        <nav aria-label="Categories" className="flex flex-wrap items-center gap-x-6 gap-y-2 text-body">
          {[{ slug: undefined, name: "Every category" }, ...categories].map((c) => {
            const active = c.slug === categorySlug;
            return (
              <Link
                key={c.slug ?? "all"}
                href={href({ category: c.slug })}
                scroll={false}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-11 items-center gap-2 underline-offset-[6px] transition-colors",
                  active ? "font-medium underline decoration-2" : "text-ink hover:underline",
                )}
              >
                {c.name}
                {c.slug && <span className="tabular text-muted">{categoryCounts.get(c.slug)}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link
            href={href({ instock: inStock ? undefined : "1" })}
            scroll={false}
            aria-pressed={inStock}
            className="text-body underline underline-offset-4 hover:text-accent"
          >
            {inStock ? "Show sold-out formulas too" : "In stock only"}
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

      <p className="mt-10 text-body md:mt-12" aria-live="polite">
        {count}.
        {q && (
          <>
            {" "}
            <Link href={href({ q: undefined })} scroll={false} className="underline underline-offset-4">
              Clear search
            </Link>
          </>
        )}
      </p>

      <section className="mt-6" aria-label="Formulas">
        <ViewTransition key={resultsKey} name="shop-results" share="auto" enter="auto" default="none">
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
            <div>
              <SpecimenGrid products={products} grades={grades} priority={4} />
            </div>
          )}
        </ViewTransition>
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
