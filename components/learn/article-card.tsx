import Image from "next/image";
import Link from "next/link";
import { splitTitle } from "@/lib/content/titles";
import type { Article } from "@/lib/db/schema";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

type ArticleCardData = Pick<
  Article,
  "slug" | "title" | "excerpt" | "coverImage" | "category" | "readMinutes" | "publishedAt" | "createdAt"
>;

/** A journal entry: the cover, the headline, its deck, and the facts after them (never above). */
export function ArticleCard({
  article,
  className,
  size = "md",
  priority,
  headingLevel = 3,
  layout = "stack",
}: {
  article: ArticleCardData;
  className?: string;
  size?: "md" | "lg";
  /** "row" sets the cover and the words side by side, for a shelf of one */
  layout?: "stack" | "row";
  priority?: boolean;
  headingLevel?: 2 | 3;
}) {
  const t = splitTitle(article.title);
  const Heading = headingLevel === 2 ? "h2" : "h3";
  if (layout === "row") {
    return (
      <Link
        href={`/learn/${article.slug}`}
        className={cn("group grid gap-6 md:grid-cols-12 md:items-end md:gap-[var(--gutter)]", className)}
      >
        <div className="relative aspect-[3/2] overflow-hidden bg-surface md:col-span-7">
          {article.coverImage && (
            <Image
              src={article.coverImage}
              alt=""
              fill
              sizes="(min-width: 768px) 58vw, 100vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
          )}
        </div>
        <div className="md:col-span-5">
          <Heading className="text-lead font-medium text-ink group-hover:underline group-hover:underline-offset-4">
            {t.head}
          </Heading>
          <p className="mt-1 max-w-[44ch] text-body text-ink">{t.deck ?? article.excerpt}</p>
          {t.deck && <p className="mt-4 max-w-[44ch] text-body text-ink">{article.excerpt}</p>}
          <ArticleMeta article={article} className="mt-3" />
        </div>
      </Link>
    );
  }
  return (
    <Link href={`/learn/${article.slug}`} className={cn("group block", className)}>
      <div className={cn("relative overflow-hidden bg-surface", size === "lg" ? "aspect-[4/3]" : "aspect-[3/2]")}>
        {article.coverImage && (
          <Image
            src={article.coverImage}
            alt=""
            fill
            priority={priority}
            sizes={size === "lg" ? "(min-width: 1024px) 45vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        )}
      </div>
      <Heading className="mt-4 text-lead font-medium text-ink group-hover:underline group-hover:underline-offset-4">
        {t.head}
      </Heading>
      <p className="mt-1 max-w-[52ch] text-body text-ink">{t.deck ?? article.excerpt}</p>
      <ArticleMeta article={article} className="mt-3" />
    </Link>
  );
}

export function ArticleMeta({
  article,
  className,
}: {
  article: Pick<Article, "category" | "readMinutes" | "publishedAt" | "createdAt">;
  className?: string;
}) {
  const date = article.publishedAt ?? article.createdAt;
  return (
    <p className={cn("text-small text-muted", className)}>
      {article.category}, {article.readMinutes} minutes,{" "}
      <time dateTime={date.toISOString()}>{formatDate(date)}</time>
    </p>
  );
}
