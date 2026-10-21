import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PeptideRows } from "@/components/product/peptide-chip-card";
import { FilterChip, SpecimenGrid } from "@/components/shop/specimen-grid";
import { buttonClasses } from "@/components/ui/button";
import { searchAll } from "@/lib/queries/catalog";
import { getPublishedPeptides } from "@/lib/queries/content";

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
  const [results, peptides] = await Promise.all([q.trim() ? searchAll(q) : Promise.resolve(null), getPublishedPeptides()]);
  const total = results ? results.products.length + results.peptides.length + results.articles.length : 0;
  const grades = Object.fromEntries(peptides.map((p) => [p.slug, { name: p.name, grade: p.evidenceLevel }]));

  return (
    <div className="container-bp pt-10 md:pt-16">
      <header className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end lg:gap-[var(--gutter)]">
        <div className="lg:col-span-7" data-reveal="">
          <h1 className="display-type text-[clamp(2.75rem,1rem+5vw,5.75rem)] [overflow-wrap:anywhere]">{q ? `Results for “${q}”` : "Search the shop"}</h1>
          <p className="mt-4 max-w-[40ch] text-lead" aria-live="polite">
            {results
              ? total === 0
                ? "Nothing matched. Try a peptide name, an INCI name or a concern."
                : `${total} ${total === 1 ? "result" : "results"} across formulas, the peptide library and the journal.`
              : "Formulas, peptide monographs and journal articles, all in one search."}
          </p>
        </div>
        <div className="lg:col-span-5 lg:col-start-8" data-reveal="" style={{ ["--reveal-i" as string]: 1 }}>
          <form action="/search" role="search" className="flex">
            <label htmlFor="site-search" className="sr-only">
              Search products, peptides and articles
            </label>
            <input
              id="site-search"
              name="q"
              defaultValue={q}
              autoFocus={!q}
              placeholder="Try GHK-Cu or fine lines"
              className="h-14 min-w-0 flex-1 bg-surface px-5 text-body text-ink placeholder:text-taupe focus:outline-2 focus:outline-accent"
            />
            <button type="submit" className={buttonClasses({ size: "lg" })}>
              Search
            </button>
          </form>
          <ul className="mt-3 flex flex-wrap gap-2" aria-label="Suggestions">
            {SUGGESTIONS.map((s) => (
              <li key={s}>
                <FilterChip href={`/search?q=${encodeURIComponent(s)}`} active={s.toLowerCase() === q.toLowerCase()}>
                  {s}
                </FilterChip>
              </li>
            ))}
          </ul>
        </div>
      </header>

      {results && total === 0 && (
        <section className="mt-16 grid gap-6 bg-surface p-8 md:grid-cols-[1fr_auto] md:items-end md:p-12" aria-labelledby="none-heading">
          <div>
            <h2 id="none-heading" className="display-type text-head">
              Nothing for “{q}”
            </h2>
            <p className="mt-4 max-w-[48ch] text-body">
              Search by peptide (GHK-Cu, Argireline), by INCI name, or by what you want to change, such as fine lines.
            </p>
          </div>
          <Link href="/shop" className={buttonClasses({ size: "lg" })}>
            Browse every formula
          </Link>
        </section>
      )}

      {results && results.products.length > 0 && (
        <section className="mt-20 md:mt-28" aria-labelledby="sr-products">
          <h2 id="sr-products" className="display-type mb-10 text-head" data-reveal="">
            Formulas
          </h2>
          <SpecimenGrid products={results.products} grades={grades} doubles={false} />
        </section>
      )}

      {results && results.peptides.length > 0 && (
        <section className="mt-28 md:mt-40" aria-labelledby="sr-peptides">
          <h2 id="sr-peptides" className="display-type mb-10 text-head" data-reveal="">
            Peptide library
          </h2>
          <PeptideRows peptides={results.peptides} />
        </section>
      )}

      {results && results.articles.length > 0 && (
        <section className="mt-28 md:mt-40" aria-labelledby="sr-articles">
          <h2 id="sr-articles" className="display-type mb-10 text-head" data-reveal="">
            Journal
          </h2>
          <ul className="grid gap-x-[var(--gutter)] gap-y-12 md:grid-cols-2">
            {results.articles.map((a, i) => (
              <li key={a.slug} data-reveal="" style={{ ["--reveal-i" as string]: i % 2 }}>
                <Link href={`/learn/${a.slug}`} className="group grid gap-5 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
                  <div className="relative aspect-[3/2] overflow-hidden bg-surface">
                    {a.coverImage && <Image src={a.coverImage} alt="" fill sizes="(min-width: 768px) 20vw, 100vw" className="object-cover" />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lead font-medium group-hover:underline group-hover:underline-offset-4">{a.title}</h3>
                    <p className="mt-2 line-clamp-3 text-body">{a.excerpt}</p>
                    <p className="mt-2 text-small text-muted">
                      {a.category}, {a.readMinutes} minute read
                    </p>
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
