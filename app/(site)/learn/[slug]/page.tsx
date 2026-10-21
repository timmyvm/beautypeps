import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/info/breadcrumbs";
import { JsonLd, siteUrl } from "@/components/info/json-ld";
import { reveal } from "@/components/info/page-header";
import { ArticleBody, extractToc } from "@/components/learn/article-body";
import { ArticleCard, ArticleMeta } from "@/components/learn/article-card";
import { ShareButton } from "@/components/learn/share-button";
import { ProductCard } from "@/components/product/product-card";
import { NewsletterForm } from "@/components/site/newsletter-form";
import { splitTitle } from "@/lib/content/titles";
import { getArticleBySlug, getProductsForArticle, getRelatedArticles } from "@/lib/queries/content";
import { cn } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Article not found" };
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
      images: article.coverImage ? [article.coverImage] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const [related, products] = await Promise.all([getRelatedArticles(article, 3), getProductsForArticle(article, 4)]);
  const toc = extractToc(article.body);
  const published = article.publishedAt ?? article.createdAt;
  const t = splitTitle(article.title);

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
        <div className="mt-8 max-w-5xl lg:mt-12">
          <h1
            className={cn(
              "display-type text-ink sm:text-head",
              t.head.length > 38 ? "text-lead" : "text-[8.4vw]",
            )}
          >
            {t.head}
          </h1>
          <p className="mt-6 max-w-[48ch] text-lead text-ink">{t.deck ?? article.excerpt}</p>
          <div className="mt-6 flex flex-wrap items-baseline gap-x-8 gap-y-3">
            <ArticleMeta article={article} className="text-body" />
            <p className="text-body">By {article.author}</p>
            <ShareButton title={article.title} />
          </div>
        </div>
        {article.coverImage && (
          <div className="shutter relative mt-10 aspect-[3/2] w-full overflow-hidden bg-surface sm:aspect-[2/1] lg:mt-14 lg:aspect-[21/9]">
            <Image src={article.coverImage} alt="" fill priority sizes="100vw" className="object-cover" />
          </div>
        )}
      </header>

      <div className="container-bp mt-16 grid gap-12 lg:mt-24 lg:grid-cols-12 lg:gap-[var(--gutter)]">
        <div className="lg:col-span-3">
          {toc.length > 1 && (
            <nav aria-labelledby="toc-title" className="bg-surface p-6 lg:sticky lg:top-8" {...reveal(0)}>
              <h2 id="toc-title" className="text-lead font-medium">
                In this guide
              </h2>
              <ol className="mt-4 list-decimal space-y-2 pl-6 text-body marker:text-muted">
                {toc.map((item) => (
                  <li key={item.id} className="pl-1">
                    <a href={`#${item.id}`} className="link-quiet">
                      {item.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}
        </div>

        <div className="min-w-0 lg:col-span-7 lg:col-start-5">
          {!t.deck ? null : <p className="mb-10 max-w-[60ch] text-lead">{article.excerpt}</p>}
          <ArticleBody>{article.body}</ArticleBody>
          <p className="mt-14 max-w-[64ch] bg-surface p-6 text-body sm:p-8">
            A note on evidence: we cite published research wherever we can and grade every peptide in our{" "}
            <Link href="/peptides" className="underline underline-offset-4">
              peptide library
            </Link>
            . This article is general information about cosmetic ingredients, not medical advice.
          </p>
        </div>
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
