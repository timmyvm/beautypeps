import { Search } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PeptideCard } from "@/components/product/peptide-chip-card";
import { ProductCard } from "@/components/product/product-card";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { searchAll } from "@/lib/queries/catalog";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const { q } = await searchParams;
  const term = Array.isArray(q) ? q[0] : q;
  return { title: term ? `Search: ${term}` : "Search", robots: { index: false } };
}

const SUGGESTIONS = ["GHK-Cu", "Argireline", "Matrixyl", "Eye", "Brightening", "Copper", "Lip", "Scalp"];

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const q = ((Array.isArray(sp.q) ? sp.q[0] : sp.q) ?? "").slice(0, 80);
  const results = q.trim() ? await searchAll(q) : null;
  const total = results ? results.products.length + results.peptides.length + results.articles.length : 0;

  return (
    <div className="container-bp py-12 md:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow mb-3">Search</p>
        <h1 className="font-display text-4xl text-espresso md:text-5xl">
          {q ? <>Results for “{q}”</> : "What are you looking for?"}
        </h1>
        <form action="/search" role="search" className="relative mt-8">
          <label htmlFor="site-search" className="sr-only">
            Search products, peptides and articles
          </label>
          <Search className="pointer-events-none absolute top-1/2 left-5 size-5 -translate-y-1/2 text-taupe" aria-hidden />
          <input
            id="site-search"
            name="q"
            defaultValue={q}
            autoFocus={!q}
            placeholder="Search products, peptides and articles"
            className="h-14 w-full rounded-full border border-stone bg-cream pr-32 pl-14 text-base shadow-sm focus:border-copper focus:ring-2 focus:ring-copper/20 focus:outline-none"
          />
          <button type="submit" className={buttonClasses({ className: "absolute top-1.5 right-1.5 h-11" })}>
            Search
          </button>
        </form>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {SUGGESTIONS.map((s) => (
            <Link
              key={s}
              href={`/search?q=${encodeURIComponent(s)}`}
              className="rounded-full border border-stone px-3 py-1 text-xs text-cocoa hover:border-copper hover:text-copper-dark"
            >
              {s}
            </Link>
          ))}
        </div>
        {results && (
          <p className="mt-6 text-sm text-cocoa" aria-live="polite">
            {total === 0 ? "No results" : `${total} ${total === 1 ? "result" : "results"}`}
          </p>
        )}
      </div>

      {results && total === 0 && (
        <EmptyState
          className="mx-auto mt-12 max-w-2xl"
          icon={<Search className="size-8" />}
          title={`Nothing found for “${q}”`}
          description="Try a peptide name (like GHK-Cu), an INCI name, or a concern such as fine lines."
          action={
            <Link href="/shop" className={buttonClasses({ variant: "outline" })}>
              Browse all products
            </Link>
          }
        />
      )}

      {results && results.products.length > 0 && (
        <section className="mt-16" aria-labelledby="sr-products">
          <h2 id="sr-products" className="mb-6 font-display text-2xl text-espresso">
            Products <span className="text-base text-taupe">({results.products.length})</span>
          </h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
            {results.products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {results && results.peptides.length > 0 && (
        <section className="mt-16" aria-labelledby="sr-peptides">
          <h2 id="sr-peptides" className="mb-6 font-display text-2xl text-espresso">
            Peptide Library <span className="text-base text-taupe">({results.peptides.length})</span>
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.peptides.map((p) => (
              <PeptideCard key={p.slug} peptide={p} />
            ))}
          </div>
        </section>
      )}

      {results && results.articles.length > 0 && (
        <section className="mt-16" aria-labelledby="sr-articles">
          <h2 id="sr-articles" className="mb-6 font-display text-2xl text-espresso">
            Journal <span className="text-base text-taupe">({results.articles.length})</span>
          </h2>
          <ul className="grid gap-6 md:grid-cols-2">
            {results.articles.map((a) => (
              <li key={a.slug}>
                <Link href={`/learn/${a.slug}`} className="group flex gap-5 rounded-2xl border border-stone/70 bg-cream p-4 hover:border-copper/50">
                  <div className="relative aspect-[3/2] w-32 shrink-0 overflow-hidden rounded-xl bg-ivory sm:w-40">
                    {a.coverImage && <Image src={a.coverImage} alt="" fill sizes="160px" className="object-cover" />}
                  </div>
                  <div className="min-w-0 py-1">
                    <p className="text-[11px] font-semibold tracking-wider text-copper-dark uppercase">
                      {a.category} · {a.readMinutes} min read
                    </p>
                    <h3 className="mt-1 font-display text-lg leading-snug text-espresso group-hover:text-copper-dark">{a.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-cocoa">{a.excerpt}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
