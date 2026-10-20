import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/lib/db/schema";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

type ArticleCardData = Pick<
  Article,
  "slug" | "title" | "excerpt" | "coverImage" | "category" | "readMinutes" | "publishedAt" | "createdAt"
>;

export function ArticleCard({ article, className }: { article: ArticleCardData; className?: string }) {
  return (
    <Link href={`/learn/${article.slug}`} className={cn("group flex flex-col", className)}>
      <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-sand">
        {article.coverImage && (
          <Image
            src={article.coverImage}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        )}
      </div>
      <ArticleMeta article={article} className="mt-5" />
      <h3 className="mt-2 font-display text-2xl leading-snug text-espresso group-hover:text-copper-dark">
        {article.title}
      </h3>
      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-cocoa">{article.excerpt}</p>
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
  return (
    <p className={cn("flex flex-wrap items-center gap-x-2 text-xs text-cocoa", className)}>
      <span className="font-semibold tracking-[0.16em] text-copper-dark uppercase">{article.category}</span>
      <span aria-hidden className="text-taupe">
        ·
      </span>
      <span>{article.readMinutes} min read</span>
      <span aria-hidden className="text-taupe">
        ·
      </span>
      <time dateTime={(article.publishedAt ?? article.createdAt).toISOString()}>
        {formatDate(article.publishedAt ?? article.createdAt)}
      </time>
    </p>
  );
}
