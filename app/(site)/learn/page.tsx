import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { PageHeader, reveal } from "@/components/info/page-header";
import { ArticleCard } from "@/components/learn/article-card";
import { NewsletterForm } from "@/components/site/newsletter-form";
import { ARTICLE_CATEGORIES } from "@/lib/constants";
import { getPublishedArticles } from "@/lib/queries/content";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "The Journal: peptide guides, routines and research",
  description:
    "Evidence-led guides to cosmetic peptides: how copper peptides work, layering peptides with retinol and vitamin C, building a beginner routine, and what the research really says.",
};

type SearchParams = Promise<{ category?: string }>;

export default async function JournalPage({ searchParams }: { searchParams: SearchParams }) {
  const { category } = await searchParams;
  const activeCategory = ARTICLE_CATEGORIES.find((c) => c === category);
  const all = await getPublishedArticles();

  const inView = all.filter((a) => !activeCategory || a.category === activeCategory);
  const lead = activeCategory ? inView[0] : (all.find((a) => a.featured) ?? all[0]);
  const list = inView.filter((a) => a.id !== lead?.id);
  // A short shelf is followed by three guides from the others, so a filtered page is never thin.
  const elsewhere = activeCategory && inView.length < 4 ? all.filter((a) => a.category !== activeCategory).slice(0, 3) : [];
  const counts = Object.fromEntries(ARTICLE_CATEGORIES.map((c) => [c, all.filter((a) => a.category === c).length]));

  return (
    <>
      <PageHeader
        crumbs={[{ href: "/", label: "Home" }, { label: "Journal" }]}
        title="The journal"
        lead="Guides, routines and research on cosmetic peptides, written by the people who formulate with them."
        figure={lead ? <ArticleCard article={lead} size="lg" priority headingLevel={2} /> : undefined}
      >
        <nav aria-label="Journal categories" className="flex flex-wrap gap-2">
          <Chip href="/learn" active={!activeCategory}>
            All ({all.length})
          </Chip>
          {ARTICLE_CATEGORIES.map((c) => (
            <Chip key={c} href={`/learn?category=${c}`} active={activeCategory === c}>
              {c} ({counts[c]})
            </Chip>
          ))}
        </nav>
      </PageHeader>

      <section aria-labelledby="list-title" className="container-bp mt-20 lg:mt-32">
        <h2 id="list-title" className="display-type text-head" {...reveal(0)}>
          {activeCategory ? `More in ${activeCategory.toLowerCase()}` : "Every guide"}
        </h2>
        {list.length === 1 ? (
          <div className="mt-12" {...reveal(1)}>
            <ArticleCard article={list[0]} layout="row" />
          </div>
        ) : list.length > 0 ? (
          <div className="mt-12 grid gap-x-[var(--gutter)] gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((a, i) => (
              <div key={a.id} className={i === 0 && list.length > 3 ? "sm:col-span-2" : undefined} {...reveal(i % 3)}>
                <ArticleCard article={a} size={i === 0 && list.length > 3 ? "lg" : "md"} />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-12 bg-surface px-6 py-14 sm:px-10">
            <p className="text-lead">
              {all.length === 0
                ? "New guides are on the way."
                : `That is the only ${activeCategory?.toLowerCase()} guide so far.`}
            </p>
            {activeCategory && (
              <Link href="/learn" className="mt-3 inline-block text-body underline underline-offset-4">
                See every guide
              </Link>
            )}
          </div>
        )}
      </section>

      {elsewhere.length > 0 && (
        <section aria-labelledby="elsewhere-title" className="container-bp mt-28 lg:mt-44">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h2 id="elsewhere-title" className="display-type text-head" {...reveal(0)}>
              Elsewhere in the journal
            </h2>
            <Link href="/learn" className="text-body underline underline-offset-4">
              Every guide
            </Link>
          </div>
          <div className="mt-12 grid gap-x-[var(--gutter)] gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {elsewhere.map((a, i) => (
              <div key={a.id} {...reveal(i + 1)}>
                <ArticleCard article={a} />
              </div>
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="letter-title" className="mt-28 bg-field-frost py-20 lg:mt-44 lg:py-28">
        <div className="container-bp grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-12 lg:items-end lg:gap-[var(--gutter)]">
          <div className="lg:col-span-6">
            <h2 id="letter-title" className="display-type text-head" {...reveal(0)}>
              The Peptide Letter
            </h2>
            <p className="mt-6 max-w-[44ch] text-body" {...reveal(1)}>
              New research decoded twice a month: study breakdowns, formulation notes and first access to new
              peptides. Unsubscribe whenever you like.
            </p>
          </div>
          <div className="lg:col-span-5 lg:col-start-8" {...reveal(2)}>
            <NewsletterForm source="journal" tone="light" />
          </div>
        </div>
      </section>
    </>
  );
}

function Chip({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "press inline-flex h-11 items-center px-4 text-body whitespace-nowrap",
        active ? "bg-ink text-white" : "bg-surface text-ink hover:bg-surface-2",
      )}
    >
      {children}
    </Link>
  );
}
