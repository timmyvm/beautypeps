"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SearchIndex } from "@/app/search-index/route";
import { SequenceStrand } from "@/components/peptides/sequence-strand";
import { SpecimenTile, toneFor } from "@/components/product/product-card";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

/*
 * Instant search, opened from the header (or "/" and ⌘K). The whole catalogue, the Peptide Library, the
 * Journal and the glossary are one small cached file, so results arrive as fast as you type; Enter opens the
 * highlighted result, and the full results page is one link away. Without script, Search is a link to /search.
 */

const SUGGESTIONS = ["GHK-Cu", "Argireline", "Matrixyl", "Eye", "Brightening", "Lip", "Powder", "Retinol"];

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9%.\s-]/g, " ");

function score(name: string, terms: string, tokens: string[]) {
  const n = norm(name);
  const t = `${n} ${norm(terms)}`;
  if (!tokens.every((tok) => t.includes(tok))) return 0;
  let s = 1;
  if (n.startsWith(tokens[0])) s += 4;
  if (n.includes(tokens.join(" "))) s += 2;
  for (const tok of tokens) if (n.includes(tok)) s += 1;
  return s;
}

type Hit = { href: string; key: string };

function useResults(index: SearchIndex | null, query: string) {
  return useMemo(() => {
    const tokens = norm(query).split(/\s+/).filter((t) => t.length > 0);
    if (!index || tokens.length === 0) return null;
    const rank = <T,>(items: T[], name: (x: T) => string, terms: (x: T) => string, limit: number) =>
      items
        .map((x) => ({ x, s: score(name(x), terms(x), tokens) }))
        .filter((r) => r.s > 0)
        .sort((a, b) => b.s - a.s)
        .slice(0, limit)
        .map((r) => r.x);
    return {
      products: rank(index.products, (p) => p.name, (p) => p.terms, 6),
      peptides: rank(index.peptides, (p) => p.name, (p) => p.terms, 5),
      articles: rank(index.articles, (a) => a.title, (a) => a.terms, 4),
      glossary: rank(index.glossary, (g) => g.term, (g) => g.terms, 4),
    };
  }, [index, query]);
}

export function SearchButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<SearchIndex | null>(null);
  const [active, setActive] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const show = useCallback(() => {
    setOpen(true);
    if (!index) {
      fetch("/search-index")
        .then((r) => r.json())
        .then(setIndex)
        .catch(() => {});
    }
  }, [index]);
  const hide = useCallback(() => setOpen(false), []);

  // "/" or ⌘K / Ctrl+K from anywhere outside a field
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && (e.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName));
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        show();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [show]);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      requestAnimationFrame(() => input.current?.focus());
    }
    if (!open && d.open) {
      const t = window.setTimeout(() => d.close(), 220);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  const results = useResults(index, query);
  const hits: Hit[] = results
    ? [
        ...results.products.map((p) => ({ href: `/products/${p.slug}`, key: `p-${p.slug}` })),
        ...results.peptides.map((p) => ({ href: `/peptides/${p.slug}`, key: `x-${p.slug}` })),
        ...results.articles.map((a) => ({ href: `/learn/${a.slug}`, key: `a-${a.slug}` })),
        ...results.glossary.map((g) => ({ href: `/glossary#${g.id}`, key: `g-${g.id}` })),
      ]
    : [];
  const current = Math.min(active, Math.max(0, hits.length - 1));
  const isActive = (key: string) => hits[current]?.key === key;
  const go = (href: string) => {
    hide();
    router.push(href);
  };

  return (
    <>
      <Link
        href="/search"
        className={className}
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
          e.preventDefault();
          show();
        }}
      >
        Search
      </Link>

      <dialog
        ref={dialog}
        className="search-dialog"
        data-open={open ? "" : undefined}
        aria-label="Search"
        onCancel={(e) => {
          e.preventDefault();
          hide();
        }}
        onClick={(e) => e.target === e.currentTarget && hide()}
      >
        <div className="search-panel bg-bg text-ink">
          <div className="container-bp pt-6 pb-10 md:pt-8">
            <form
              role="search"
              action="/search"
              className="flex items-center gap-6"
              onSubmit={(e) => {
                e.preventDefault();
                const hit = hits[current];
                go(hit ? hit.href : `/search?q=${encodeURIComponent(query)}`);
              }}
            >
              <label htmlFor="site-search" className="sr-only">
                Search formulas, peptides and the Journal
              </label>
              <input
                ref={input}
                id="site-search"
                name="q"
                type="search"
                autoComplete="off"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setActive((a) => Math.min(a + 1, hits.length - 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActive((a) => Math.max(a - 1, 0));
                  }
                }}
                placeholder="Search"
                aria-controls="site-search-results"
                aria-activedescendant={hits[current] ? `sr-${hits[current].key}` : undefined}
                className="h-16 min-w-0 flex-1 bg-surface px-5 text-lead font-medium text-ink placeholder:text-muted focus:outline-2 focus:outline-accent md:h-20 md:text-[clamp(1.5rem,1rem+1.6vw,2.25rem)]"
              />
              <button type="button" onClick={hide} className="press h-12 shrink-0 text-body font-medium underline-offset-4 hover:underline">
                Close
              </button>
            </form>

            <div id="site-search-results" role="listbox" aria-label="Results" className="mt-8">
              {!results ? (
                <div>
                  <p className="text-body">Try a peptide, an ingredient or what you are treating.</p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {SUGGESTIONS.map((s) => (
                      <li key={s}>
                        <button
                          type="button"
                          onClick={() => {
                            setQuery(s);
                            input.current?.focus();
                          }}
                          className="press h-11 bg-surface px-4 text-body hover:bg-surface-2"
                        >
                          {s}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : hits.length === 0 ? (
                <p className="text-body">
                  Nothing matched “{query}”. Try a peptide name, an INCI name or a concern, or{" "}
                  <Link href={`/search?q=${encodeURIComponent(query)}`} onClick={hide} className="underline underline-offset-4">
                    search every page
                  </Link>
                  .
                </p>
              ) : (
                <div className="grid gap-10 md:grid-cols-12 md:gap-[var(--gutter)]">
                  {results.products.length > 0 && (
                    <section className="md:col-span-6" aria-label="Formulas">
                      <h2 className="text-body font-medium">Formulas</h2>
                      <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {results.products.map((p) => (
                          <li key={p.slug} id={`sr-p-${p.slug}`} role="option" aria-selected={isActive(`p-${p.slug}`)}>
                            <Link
                              href={`/products/${p.slug}`}
                              onClick={hide}
                              className={cn("group block p-1.5 transition-colors", isActive(`p-${p.slug}`) ? "bg-accent-soft" : "hover:bg-surface")}
                            >
                              <SpecimenTile product={p} tone={toneFor(p.slug)} sizes="160px" className="aspect-[4/5] w-full" />
                              <span className="mt-2 block text-small leading-snug font-medium">{p.name}</span>
                              <span className="block text-small text-muted">
                                {p.fact} · {formatMoney(p.price)}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                  <div className="space-y-10 md:col-span-6">
                    {results.peptides.length > 0 && (
                      <section aria-label="Peptides">
                        <h2 className="text-body font-medium">In the Peptide Library</h2>
                        <ul className="mt-3 space-y-1">
                          {results.peptides.map((p) => (
                            <li key={p.slug} id={`sr-x-${p.slug}`} role="option" aria-selected={isActive(`x-${p.slug}`)}>
                              <Link
                                href={`/peptides/${p.slug}`}
                                onClick={hide}
                                className={cn(
                                  "flex items-center justify-between gap-4 px-3 py-2.5 transition-colors",
                                  isActive(`x-${p.slug}`) ? "bg-accent-soft" : "bg-surface hover:bg-surface-2",
                                )}
                              >
                                <span className="min-w-0">
                                  <span className="block text-body font-medium">{p.name}</span>
                                  <span className="block truncate text-small text-muted">
                                    {p.inci} · evidence grade {p.grade} of 5
                                  </span>
                                </span>
                                {p.sequence && <SequenceStrand sequence={p.sequence} size="sm" draw="none" label={p.name} className="hidden shrink-0 sm:block" />}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </section>
                    )}
                    {(results.articles.length > 0 || results.glossary.length > 0) && (
                      <section aria-label="Journal and glossary">
                        <h2 className="text-body font-medium">In the Journal and glossary</h2>
                        <ul className="mt-3 space-y-1">
                          {results.articles.map((a) => (
                            <li key={a.slug} id={`sr-a-${a.slug}`} role="option" aria-selected={isActive(`a-${a.slug}`)}>
                              <Link
                                href={`/learn/${a.slug}`}
                                onClick={hide}
                                className={cn("block px-3 py-2.5 transition-colors", isActive(`a-${a.slug}`) ? "bg-accent-soft" : "hover:bg-surface")}
                              >
                                <span className="block text-body font-medium">{a.title}</span>
                                <span className="block text-small text-muted">{a.category}</span>
                              </Link>
                            </li>
                          ))}
                          {results.glossary.map((g) => (
                            <li key={g.id} id={`sr-g-${g.id}`} role="option" aria-selected={isActive(`g-${g.id}`)}>
                              <Link
                                href={`/glossary#${g.id}`}
                                onClick={hide}
                                className={cn("block px-3 py-2.5 transition-colors", isActive(`g-${g.id}`) ? "bg-accent-soft" : "hover:bg-surface")}
                              >
                                <span className="block text-body font-medium">{g.term}</span>
                                <span className="block text-small text-muted">Glossary</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </section>
                    )}
                    <Link href={`/search?q=${encodeURIComponent(query)}`} onClick={hide} className="inline-block text-body underline underline-offset-4">
                      All results for “{query}”
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
