import { Search, X } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ProductCard } from "@/components/product/product-card";
import { SortSelect } from "@/components/shop/sort-select";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { CONCERNS, concernLabel } from "@/lib/constants";
import { getCategories, listProducts, PRODUCT_SORTS, type ProductSort } from "@/lib/queries/catalog";
import { cn } from "@/lib/utils";

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
    title: "Shop beauty peptides",
    description:
      "Shop high-concentration peptide serums, targeted treatments, pure cosmetic-grade actives and kits — GHK-Cu, Matrixyl, Argireline, SNAP-8 and more.",
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

  const [categories, products] = await Promise.all([
    getCategories(),
    listProducts({ category: categorySlug, concern, q, sort, inStock }),
  ]);
  const category = categories.find((c) => c.slug === categorySlug);

  const href = (patch: Record<string, string | undefined>) => {
    const qs = new URLSearchParams();
    const merged = { category: categorySlug, concern, q, sort: sort === "featured" ? undefined : sort, instock: inStock ? "1" : undefined, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) qs.set(k, v);
    const s = qs.toString();
    return s ? `/shop?${s}` : "/shop";
  };

  const heading = category?.name ?? (concern ? `For ${concernLabel(concern).toLowerCase()}` : "All beauty peptides");
  const intro =
    category?.description ??
    (concern
      ? `Formulas chosen for ${concernLabel(concern).toLowerCase()}, each built around peptides with published evidence for this concern.`
      : "Every Beauty Peps formula is built around clinically studied peptides at meaningful concentrations — no fairy-dusting, no fillers dressed up as actives.");

  return (
    <div>
      <section className="border-b border-stone/60 bg-ivory">
        <div className="container-bp flex items-center justify-between gap-10 py-14 md:py-16">
          <div>
            <p className="eyebrow mb-3">{category?.tagline ?? "The shop"}</p>
            <h1 className="max-w-xl font-display text-4xl leading-tight text-espresso md:text-5xl">{heading}</h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-cocoa">{intro}</p>
          </div>
          {category?.image && (
            <div className="relative hidden aspect-[4/5] w-44 shrink-0 overflow-hidden rounded-2xl shadow-xl shadow-espresso/5 md:block lg:w-52">
              <Image src={category.image} alt="" fill sizes="208px" className="object-cover" priority />
            </div>
          )}
        </div>
      </section>

      <div className="container-bp py-10">
        {/* Category tabs */}
        <nav aria-label="Categories" className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          <FilterPill href={href({ category: undefined })} active={!categorySlug}>
            All
          </FilterPill>
          {categories.map((c) => (
            <FilterPill key={c.id} href={href({ category: c.slug })} active={c.slug === categorySlug}>
              {c.name}
            </FilterPill>
          ))}
        </nav>

        {/* Concern chips */}
        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
          <span className="text-xs font-semibold tracking-[0.18em] text-cocoa uppercase">Concern</span>
          <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
            {CONCERNS.map((c) => {
              const active = c.slug === concern;
              return (
                <Link
                  key={c.slug}
                  href={href({ concern: active ? undefined : c.slug })}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors",
                    active
                      ? "border-copper bg-copper-light/50 text-copper-dark"
                      : "border-stone text-cocoa hover:border-taupe",
                  )}
                  aria-pressed={active}
                >
                  {c.label}
                  {active && <X className="size-3" aria-hidden />}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Toolbar */}
        <div className="mt-8 flex flex-col gap-4 border-y border-stone/60 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3 text-sm text-cocoa">
            <span>
              <strong className="font-semibold text-espresso">{products.length}</strong>{" "}
              {products.length === 1 ? "product" : "products"}
            </span>
            {q && (
              <Link
                href={href({ q: undefined })}
                className="inline-flex items-center gap-1 rounded-full bg-sand px-3 py-1 text-xs text-espresso"
              >
                “{q}” <X className="size-3" aria-label="Clear search" />
              </Link>
            )}
            <Link
              href={href({ instock: inStock ? undefined : "1" })}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs",
                inStock ? "border-sage bg-sage-light text-sage" : "border-stone text-cocoa hover:border-taupe",
              )}
              aria-pressed={inStock}
            >
              <span className={cn("size-1.5 rounded-full", inStock ? "bg-sage" : "bg-taupe")} aria-hidden />
              In stock only
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <form action="/shop" className="relative hidden md:block" role="search">
              {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
              {concern && <input type="hidden" name="concern" value={concern} />}
              <label htmlFor="shop-q" className="sr-only">
                Search products
              </label>
              <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-taupe" aria-hidden />
              <input
                id="shop-q"
                name="q"
                defaultValue={q}
                placeholder="Search products"
                className="h-10 w-56 rounded-full border border-stone bg-cream pr-4 pl-10 text-sm focus:border-copper focus:outline-none"
              />
            </form>
            <Suspense>
              <SortSelect options={PRODUCT_SORTS} value={sort} />
            </Suspense>
          </div>
        </div>

        <div className="mt-10">
          {products.length === 0 ? (
            <EmptyState
              icon={<Search className="size-8" />}
              title="No products match those filters"
              description="Try removing a filter, or browse the full range."
              action={
                <Link href="/shop" className={buttonClasses({ variant: "outline" })}>
                  Clear all filters
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p} priority={i < 4} />
              ))}
            </div>
          )}
        </div>

        <aside className="mt-20 grid gap-6 rounded-2xl border border-stone/70 bg-ivory p-8 md:grid-cols-[1fr_auto] md:items-center md:p-10">
          <div>
            <p className="eyebrow mb-2">Not sure where to start?</p>
            <h2 className="font-display text-2xl text-espresso md:text-3xl">Build your peptide routine in 60 seconds</h2>
            <p className="mt-2 max-w-xl text-sm text-cocoa">
              Tell us your skin concerns and we&apos;ll map a morning and evening routine — with the peptides that have
              the strongest evidence for you.
            </p>
          </div>
          <Link href="/routine-builder" className={buttonClasses({ variant: "copper", size: "lg" })}>
            Start the routine builder
          </Link>
        </aside>
      </div>
    </div>
  );
}

function FilterPill({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "shrink-0 rounded-full border px-4 py-2 text-sm whitespace-nowrap transition-colors",
        active ? "border-espresso bg-espresso text-cream" : "border-stone bg-cream text-espresso hover:border-taupe",
      )}
    >
      {children}
    </Link>
  );
}
