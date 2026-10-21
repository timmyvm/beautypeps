import { eq } from "drizzle-orm";
import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleForm } from "@/components/admin/catalog/article-form";
import { ConfirmButton } from "@/components/admin/catalog/confirm-button";
import { Notice } from "@/components/admin/catalog/notice";
import { AdminPageHeader } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { deleteArticleAction } from "@/lib/actions/admin/articles";
import { db } from "@/lib/db";
import { articles } from "@/lib/db/schema";
import { formatDateTime } from "@/lib/format";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const article = await db.query.articles.findFirst({ where: eq(articles.id, id), columns: { title: true } });
  return { title: article ? `Edit “${article.title}”` : "Article not found" };
}

export default async function EditArticlePage({ params, searchParams }: Props) {
  const [{ id }, { saved }] = await Promise.all([params, searchParams]);
  const article = await db.query.articles.findFirst({ where: eq(articles.id, id) });
  if (!article) notFound();

  return (
    <>
      <AdminPageHeader
        back={{ href: "/admin/articles", label: "Journal" }}
        title={
          <span className="flex flex-wrap items-center gap-3">
            <span className="line-clamp-2">{article.title}</span>
            {article.published ? <Badge tone="sage">Published</Badge> : <Badge tone="amber">Draft</Badge>}
          </span>
        }
        description={`${article.category} · by ${article.author} · updated ${formatDateTime(article.updatedAt)}`}
        actions={
          <>
            {article.published && (
              <Link href={`/learn/${article.slug}`} target="_blank" className={buttonClasses({ variant: "outline", size: "sm", className: "bg-surface-2 hover:bg-stone" })}>
                <ExternalLink className="size-3.5" /> View on site
              </Link>
            )}
            <ConfirmButton
              action={deleteArticleAction.bind(null, article.id)}
              confirm="Delete this article permanently?"
              confirmLabel="Delete"
              variant="ghost"
              className="text-danger hover:bg-danger-light"
            >
              Delete
            </ConfirmButton>
          </>
        }
      />
      <Notice value={saved} />
      <ArticleForm article={article} />
    </>
  );
}
