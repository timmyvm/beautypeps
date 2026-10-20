import { ArrowRight, BookOpen } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/info/page-hero";
import { ArticleCard, ArticleMeta } from "@/components/learn/article-card";
import { NewsletterForm } from "@/components/site/newsletter-form";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { ARTICLE_CATEGORIES } from "@/lib/constants";
import { getPublishedArticles } from "@/lib/queries/content";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "The Journal — peptide guides, routines & research",
  description:
    "Evidence-led guides to cosmetic peptides: how copper peptides work, layering peptides with retinol and vitamin C, building a beginner routine, and what the research really says.",
};

type SearchParams = Promise<{ category?: string }>;

export default async function JournalPage({ searchParams }: { searchParams: SearchParams }) {
  const { category } = await searchParams;
  const activeCategory = ARTICLE_CATEGORIES.find((c) => c === category);
  const all = await getPublishedArticles();

  const featured = activeCategory ? undefined : (all.find((a) => a.featured) ?? all[0]);
  const list = all.filter((a) => a.id !== featured?.id && (!activeCategory || a.category === activeCategory));
  const counts = Object.fromEntries(ARTICLE_CATEGORIES.map((c) => [c, all.filter((a) => a.category === c).length]));

  return (
    <>
      <PageHero
        eyebrow="The Journal"
        title="Guides, routines & research — written by formulators"
        description="Long-form explainers on how cosmetic peptides work, how to use them with the rest of your routine, and how to read the claims on the label."
      />

      {featured && (
        <section className="container-bp pt-14">
          <Link
            href={`/learn/${featured.slug}`}
            className="group grid overflow-hidden rounded-2xl border border-stone/70 bg-cream md:grid-cols-[1.3fr_1fr]"
          >
            <div className="relative aspect-[3/2] md:aspect-auto md:min-h-[380px]">
              {featured.coverImage && (
                <Image
                  src={featured.coverImage}
                  alt=""
                  fill
                  priority
                  sizes="(min-width: 768px) 60vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              )}
            </div>
            <div className="flex flex-col justify-center p-7 md:p-10">
              <p className="eyebrow mb-4">Featured</p>
              <ArticleMeta article={featured} />
              <h2 className="mt-3 font-display text-3xl leading-tight text-espresso group-hover:text-copper-dark md:text-4xl">
                {featured.title}
              </h2>
              <p className="mt-4 leading-relaxed text-cocoa">{featured.excerpt}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-espresso">
                Read the guide <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </span>
            </div>
          </Link>
        </section>
      )}

      <section className="container-bp py-14">
        <nav aria-label="Journal categories" className="scrollbar-none -mx-4 mb-10 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <CategoryChip href="/learn" active={!activeCategory} label="All" count={all.length} />
          {ARTICLE_CATEGORIES.map((c) => (
            <CategoryChip key={c} href={`/learn?category=${c}`} active={activeCategory === c} label={c} count={counts[c]} />
          ))}
        </nav>

        {list.length > 0 ? (
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<BookOpen className="size-8" />}
            title={all.length === 0 ? "New guides are on the way" : `No ${activeCategory?.toLowerCase()} articles yet`}
            description="Subscribe to The Peptide Letter below and we'll let you know when new research guides go live."
            action={
              activeCategory ? (
                <ButtonLink href="/learn" variant="outline" size="sm">
                  See all articles
                </ButtonLink>
              ) : undefined
            }
          />
        )}
      </section>

      <section className="container-bp">
        <div className="grid gap-8 rounded-2xl bg-espresso p-8 text-cream md:grid-cols-[1.2fr_1fr] md:items-center md:p-12">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-copper-light uppercase">The Peptide Letter</p>
            <h2 className="mt-3 font-display text-3xl md:text-4xl">New research, decoded — twice a month</h2>
            <p className="mt-3 text-sm leading-relaxed text-cream/70">
              Study breakdowns, formulation notes and early access to new peptides. No spam, unsubscribe anytime.
            </p>
          </div>
          <NewsletterForm source="journal" />
        </div>
      </section>
    </>
  );
}

function CategoryChip({ href, active, label, count }: { href: string; active: boolean; label: string; count: number }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "shrink-0 rounded-full border px-4 py-2 text-xs font-medium whitespace-nowrap transition-colors",
        active ? "border-espresso bg-espresso text-cream" : "border-stone bg-cream text-cocoa hover:border-taupe",
      )}
    >
      {label} <span className="ml-1 opacity-60">{count}</span>
    </Link>
  );
}
