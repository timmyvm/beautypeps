import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Fragment } from "react";
import { Breadcrumbs } from "@/components/info/breadcrumbs";
import { JsonLd, siteUrl } from "@/components/info/json-ld";
import { reveal } from "@/components/info/page-header";
import { ArticleBody, plainText, splitSections } from "@/components/learn/article-body";
import { ArticleCard, ArticleMeta } from "@/components/learn/article-card";
import { ARTICLE_EXTRAS, specimenSlugs, type Interlude } from "@/components/learn/article-extras";
import { ArticleSpecimens, InterludeView, type PeptideFacts } from "@/components/learn/article-interludes";
import { ShareButton } from "@/components/learn/share-button";
import { ProductCard } from "@/components/product/product-card";
import { NewsletterForm } from "@/components/site/newsletter-form";
import { splitTitle } from "@/lib/content/titles";
import {
  getArticleBySlug,
  getProductsForArticle,
  getPublishedArticles,
  getPublishedPeptides,
  getRelatedArticles,
} from "@/lib/queries/content";
import { cn } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();
  const description = article.seoDescription ?? article.excerpt;
  return {
    title: article.title,
    description,
    alternates: { canonical: `/learn/${article.slug}` },
    openGraph: {
      title: article.title,
      description,
      type: "article",
      publishedTime: (article.publishedAt ?? article.createdAt).toISOString(),
      authors: [article.author],
      url: `/learn/${article.slug}`,
    },
  };
}

/** Every published entry is prerendered at build; a new one is rendered on its first visit and kept. */
export async function generateStaticParams() {
  const articles = await getPublishedArticles();
  return articles.map((x) => ({ slug: x.slug }));
}

// The slug is read before any Suspense boundary, so a page added after the build is rendered on its
// first visit and then kept as a static page (ISR) like the rest.
export default async function ArticlePage({ params }: { params: Params }) {
  const { slug } = await params;
  return <ArticlePageView slug={slug} />;
}

async function ArticlePageView({ slug }: { slug: string }) {
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const [related, products, peptideList] = await Promise.all([
    getRelatedArticles({ id: article.id, category: article.category }, 3),
    getProductsForArticle(article, 4),
    getPublishedPeptides(),
  ]);
  const { intro, sections } = splitSections(article.body);
  const published = article.publishedAt ?? article.createdAt;
  const t = splitTitle(article.title);

  // What the article is about, drawn; and what sits between its chapters (pull-outs only while the line is still in the text).
  const peptides = new Map<string, PeptideFacts>(peptideList.map((p) => [p.slug, p]));
  const extras = ARTICLE_EXTRAS[article.slug];
  const specimens = specimenSlugs(article, peptideList)
    .map((s) => peptides.get(s))
    .filter((p): p is PeptideFacts => !!p)
    .slice(0, 2);
  const text = plainText(article.body);
  const interludes = (extras?.interludes ?? []).filter(
    (x) => x.kind !== "quote" || text.includes(x.text.toLowerCase().replace(/[.\s]+$/, "")),
  );
  const after = (title: string): Interlude[] => interludes.filter((x) => x.after === title);

  return (
    <article>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: article.title,
          description: article.excerpt,
          image: article.coverImage ? [`${siteUrl()}${article.coverImage}`] : undefined,
          datePublished: published.toISOString(),
          dateModified: article.updatedAt.toISOString(),
          author: { "@type": "Organization", name: article.author },
          publisher: {
            "@type": "Organization",
            name: "Beauty Peps",
            logo: { "@type": "ImageObject", url: `${siteUrl()}/images/brand/logo-wordmark.png` },
          },
          mainEntityOfPage: `${siteUrl()}/learn/${article.slug}`,
        }}
      />

      <header className="container-bp pt-8 lg:pt-10">
        <Breadcrumbs items={[{ href: "/", label: "Home" }, { href: "/learn", label: "Journal" }, { label: t.head }]} />
        <h1
          className={cn(
            "display-type mt-8 max-w-[22ch] text-ink sm:text-display lg:mt-12",
            // On a phone the title keeps to two lines: the longer it is, the smaller it starts.
            t.head.length > 48 ? "text-lead" : t.head.length > 38 ? "text-[6.7vw]" : "text-[8.4vw]",
          )}
        >
          {t.head}
        </h1>
        <p className="mt-6 max-w-[44ch] text-lead text-ink">{t.deck ?? article.excerpt}</p>
        {article.coverImage && (
          <div className="shutter-now relative mt-10 aspect-[3/2] w-full overflow-hidden bg-surface sm:aspect-[2/1] lg:mt-14 lg:aspect-[21/9]">
            <Image src={article.coverImage} alt="" fill loading="eager" fetchPriority="high" sizes="100vw" className="object-cover" />
          </div>
        )}
      </header>

      {/* The standfirst, with who wrote it and what it is about beside it */}
      <div className="container-bp mt-14 grid gap-10 lg:mt-20 lg:grid-cols-12 lg:gap-[var(--gutter)]">
        <aside aria-label="About this guide" className="lg:col-span-4">
          <p className="text-body font-medium">By {article.author}</p>
          <ArticleMeta article={article} className="mt-1 text-body" />
          <ShareButton title={article.title} className="mt-5" />
          <ArticleSpecimens peptides={specimens} />
        </aside>
        <div className="min-w-0 lg:col-span-7 lg:col-start-6">
          {intro && <ArticleBody className="[&>:first-child]:mt-0 [&_p]:text-lead [&_p]:leading-[1.4]">{intro}</ArticleBody>}
          {sections.length > 1 && (
            <nav aria-labelledby="toc-title" className="mt-12 hidden bg-surface p-6 lg:block">
              <h2 id="toc-title" className="text-body font-medium">
                In this guide
              </h2>
              <ol className="mt-3 columns-2 gap-[var(--gutter)] text-body">
                {sections.map((item) => (
                  <li key={item.id} className="break-inside-avoid py-1">
                    <a href={`#${item.id}`} className="link-quiet">
                      {item.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}
          {sections.length > 1 && (
            <details className="group mt-10 bg-surface lg:hidden">
              <summary className="press flex h-14 cursor-pointer list-none items-center justify-between px-5 text-body font-medium [&::-webkit-details-marker]:hidden">
                In this guide
                <span aria-hidden className="text-lead leading-none group-open:rotate-45 motion-safe:transition-transform">
                  +
                </span>
              </summary>
              <ol className="space-y-2 px-5 pb-5 text-body">
                {sections.map((item) => (
                  <li key={item.id}>
                    <a href={`#${item.id}`} className="underline-offset-4 hover:underline">
                      {item.title}
                    </a>
                  </li>
                ))}
              </ol>
            </details>
          )}
        </div>
      </div>

      {/* Chapters: the heading holds its place on the left while its text is read */}
      {sections.map((section) => (
        <Fragment key={section.id}>
          <section aria-labelledby={section.id} className="container-bp mt-16 grid gap-6 lg:mt-24 lg:grid-cols-12 lg:gap-[var(--gutter)]">
            <div className="lg:col-span-4">
              <h2
                id={section.id}
                className="display-type max-w-[18ch] scroll-mt-8 text-[calc(var(--text-body)*1.75)] leading-[1.1] lg:sticky lg:top-8"
                {...reveal(0)}
              >
                {section.title}
              </h2>
            </div>
            <div className="min-w-0 lg:col-span-7 lg:col-start-6">
              <ArticleBody className="[&>:first-child]:mt-0">{section.body}</ArticleBody>
            </div>
          </section>
          {after(section.title).map((item, i) => (
            <InterludeView key={i} item={item} peptides={peptides} />
          ))}
        </Fragment>
      ))}

      <div className="container-bp mt-20 grid lg:mt-28 lg:grid-cols-12 lg:gap-[var(--gutter)]">
        <p className="max-w-[64ch] bg-surface p-6 text-body sm:p-8 lg:col-span-7 lg:col-start-6">
          A note on evidence: we cite published research wherever we can and grade every peptide in our{" "}
          <Link href="/peptides" className="underline underline-offset-4">
            peptide library
          </Link>
          . This article is general information about cosmetic ingredients, not medical advice.
        </p>
      </div>

      {products.length > 0 && (
        <section aria-labelledby="formulas-title" className="container-bp mt-28 lg:mt-44">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h2 id="formulas-title" className="display-type text-head" {...reveal(0)}>
              The formulas in this guide
            </h2>
            <Link href="/routine-builder" className="text-body underline underline-offset-4">
              Build a routine around them
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-x-[var(--gutter)] gap-y-10 lg:grid-cols-4">
            {products.map((p, i) => (
              <div key={p.id} {...reveal(i)}>
                <ProductCard product={p} index={i} />
              </div>
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="letter-title" className="mt-28 bg-field-frost py-20 lg:mt-44 lg:py-28">
        <div className="container-bp grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-12 lg:items-end lg:gap-[var(--gutter)]">
          <div className="lg:col-span-6">
            <h2 id="letter-title" className="display-type text-head" {...reveal(0)}>
              Get the next one first
            </h2>
            <p className="mt-6 max-w-[44ch] text-body" {...reveal(1)}>
              The Peptide Letter: new guides and research breakdowns, twice a month.
            </p>
          </div>
          <div className="lg:col-span-5 lg:col-start-8" {...reveal(2)}>
            <NewsletterForm source="journal" tone="light" />
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section aria-labelledby="more-title" className="container-bp mt-28 lg:mt-44">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h2 id="more-title" className="display-type text-head" {...reveal(0)}>
              Keep reading
            </h2>
            <Link href="/learn" className="text-body underline underline-offset-4">
              Every guide
            </Link>
          </div>
          <div className="mt-12 grid gap-x-[var(--gutter)] gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((a, i) => (
              <div key={a.id} {...reveal(i)}>
                <ArticleCard article={a} />
              </div>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
