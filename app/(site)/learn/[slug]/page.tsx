import { ArrowRight, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/info/breadcrumbs";
import { JsonLd, siteUrl } from "@/components/info/json-ld";
import { ArticleBody, extractToc } from "@/components/learn/article-body";
import { ArticleCard, ArticleMeta } from "@/components/learn/article-card";
import { ShareButton } from "@/components/learn/share-button";
import { NewsletterForm } from "@/components/site/newsletter-form";
import { ButtonLink } from "@/components/ui/button";
import { getArticleBySlug, getRelatedArticles } from "@/lib/queries/content";

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

  const [related, toc] = [await getRelatedArticles(article, 3), extractToc(article.body)];
  const published = article.publishedAt ?? article.createdAt;

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

      <header className="container-bp pt-8">
        <Breadcrumbs
          items={[{ href: "/", label: "Home" }, { href: "/learn", label: "Journal" }, { label: article.title }]}
        />
        <div className="mx-auto mt-12 max-w-3xl text-center">
          <ArticleMeta article={article} className="justify-center" />
          <h1 className="mt-5 font-display text-4xl leading-[1.08] text-espresso md:text-6xl">{article.title}</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-cocoa">{article.excerpt}</p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <p className="text-sm text-cocoa">
              By <span className="font-medium text-espresso">{article.author}</span>
            </p>
            <ShareButton title={article.title} />
          </div>
        </div>
        {article.coverImage && (
          <div className="relative mx-auto mt-12 aspect-[3/2] max-w-5xl overflow-hidden rounded-2xl bg-sand md:aspect-[2/1]">
            <Image src={article.coverImage} alt="" fill priority sizes="(min-width: 1024px) 1024px, 100vw" className="object-cover" />
          </div>
        )}
      </header>

      <div className="container-bp mt-14 grid gap-12 lg:grid-cols-[220px_minmax(0,1fr)_220px]">
        {/* Table of contents */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          {toc.length > 1 && (
            <nav aria-label="Table of contents" className="rounded-2xl border border-stone/70 bg-ivory/60 p-5 lg:border-0 lg:bg-transparent lg:p-0">
              <p className="eyebrow mb-3">In this guide</p>
              <ol className="space-y-2.5 border-l border-stone pl-4">
                {toc.map((item) => (
                  <li key={item.id}>
                    <a href={`#${item.id}`} className="block text-sm leading-snug text-cocoa hover:text-copper-dark">
                      {item.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}
        </aside>

        <div className="min-w-0">
          <ArticleBody className="mx-auto max-w-[68ch]">{article.body}</ArticleBody>

          <div className="mx-auto mt-12 max-w-[68ch] rounded-2xl border border-stone/70 bg-ivory p-6 text-sm leading-relaxed text-cocoa">
            <p>
              <strong className="text-espresso">A note on evidence.</strong> We cite published research wherever we
              can and grade every peptide in our{" "}
              <Link href="/peptides" className="text-copper-dark underline underline-offset-4">
                Peptide Library
              </Link>
              . This article is general information about cosmetic ingredients, not medical advice.
            </p>
          </div>
        </div>

        <aside className="hidden lg:sticky lg:top-28 lg:block lg:self-start">
          <div className="rounded-2xl bg-espresso p-6 text-cream">
            <Sparkles className="size-5 text-copper-light" aria-hidden />
            <p className="mt-3 font-display text-xl leading-snug">Shop the routine</p>
            <p className="mt-2 text-sm text-cream/70">Find the peptides that match your concerns in under a minute.</p>
            <ButtonLink href="/routine-builder" variant="copper" size="sm" className="mt-5 w-full">
              Build my routine
            </ButtonLink>
            <ButtonLink href="/shop" variant="ghost" size="sm" className="mt-2 w-full text-cream hover:bg-cream/10">
              Browse the shop
            </ButtonLink>
          </div>
        </aside>
      </div>

      {/* Mobile CTA */}
      <section className="container-bp mt-12 lg:hidden">
        <div className="flex flex-col gap-4 rounded-2xl bg-espresso p-6 text-cream sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-xl">Shop the routine</p>
            <p className="mt-1 text-sm text-cream/70">Match peptides to your concerns in under a minute.</p>
          </div>
          <ButtonLink href="/routine-builder" variant="copper" size="sm">
            Build my routine <ArrowRight className="size-3.5" />
          </ButtonLink>
        </div>
      </section>

      <section className="container-bp mt-16">
        <div className="grid gap-8 rounded-2xl border border-stone/70 bg-ivory p-8 md:grid-cols-[1.2fr_1fr] md:items-center md:p-10">
          <div>
            <p className="eyebrow mb-2">The Peptide Letter</p>
            <h2 className="font-display text-2xl text-espresso md:text-3xl">Enjoyed this? Get the next one first.</h2>
            <p className="mt-2 text-sm text-cocoa">New guides and research breakdowns, twice a month.</p>
          </div>
          <NewsletterForm source="journal" tone="light" />
        </div>
      </section>

      {related.length > 0 && (
        <section className="container-bp mt-20">
          <div className="mb-10 flex items-end justify-between">
            <h2 className="font-display text-3xl text-espresso">Keep reading</h2>
            <Link href="/learn" className="text-sm text-copper-dark underline underline-offset-4">
              All articles
            </Link>
          </div>
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
