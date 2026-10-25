import Image from "next/image";
import Link from "next/link";
import { SequenceStrand } from "@/components/peptides/sequence-strand";
import { splitTitle } from "@/lib/content/titles";
import type { Article, Peptide } from "@/lib/db/schema";
import { ArticleMeta } from "./article-card";

type RowArticle = Pick<
  Article,
  "slug" | "title" | "excerpt" | "coverImage" | "category" | "readMinutes" | "publishedAt" | "createdAt"
>;

/**
 * One entry in the Journal's index, read across like a line in a field guide's contents: the picture, the
 * headline with its deck and excerpt, and, when the entry is about a peptide, that peptide drawn.
 */
export function ArticleRow({ article, specimen }: { article: RowArticle; specimen?: Pick<Peptide, "name" | "sequence"> | null }) {
  const t = splitTitle(article.title);
  return (
    <Link href={`/learn/${article.slug}`} className="group grid gap-5 sm:grid-cols-12 sm:gap-[var(--gutter)]">
      <div className="relative aspect-[3/2] overflow-hidden bg-surface sm:col-span-5">
        {article.coverImage && (
          <Image
            src={article.coverImage}
            alt=""
            fill
            sizes="(min-width: 640px) 42vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        )}
      </div>
      <div className="flex flex-col sm:col-span-7 lg:col-span-6 lg:col-start-7">
        <h3 className="display-type text-lead leading-[1.1] text-ink group-hover:underline sm:text-[calc(var(--text-body)*1.75)] group-hover:decoration-2 group-hover:underline-offset-4">
          {t.head}
        </h3>
        {t.deck && <p className="mt-2 text-lead text-ink">{t.deck}</p>}
        <p className="mt-4 max-w-[52ch] text-body text-ink">{article.excerpt}</p>
        <ArticleMeta article={article} className="mt-4" />
        {/* The entry's specimen: the peptide it is about, drawn, sat level with the foot of the picture */}
        {specimen?.sequence && (
          <div className="mt-8 lg:mt-auto lg:pt-8">
            <SequenceStrand sequence={specimen.sequence} size="md" label={specimen.name} className="max-w-full [zoom:0.75]" />
          </div>
        )}
      </div>
    </Link>
  );
}
