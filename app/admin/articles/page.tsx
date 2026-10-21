import { Plus, Search, Star } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Notice } from "@/components/admin/catalog/notice";
import { AdminPageHeader, DataTable, FilterTabs } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { formatDate } from "@/lib/format";
import { listAdminArticles } from "@/lib/queries/admin-catalog";

export const metadata: Metadata = { title: "Journal" };

type SP = { q?: string; status?: string; notice?: string };

export default async function AdminArticlesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const [rows, all] = await Promise.all([listAdminArticles(sp), listAdminArticles({})]);
  const publishedCount = all.filter((a) => a.published).length;

  return (
    <>
      <AdminPageHeader
        title="Journal"
        description="Guides, science explainers and routines published at /learn."
        actions={
          <ButtonLink href="/admin/articles/new" variant="dark" size="sm">
            <Plus className="size-4" /> New article
          </ButtonLink>
        }
      />
      <Notice value={sp.notice} />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <FilterTabs
          basePath="/admin/articles"
          param="status"
          current={sp.status}
          searchParams={{ q: sp.q }}
          options={[
            { value: "", label: "All", count: all.length },
            { value: "published", label: "Published", count: publishedCount },
            { value: "draft", label: "Drafts", count: all.length - publishedCount },
          ]}
        />
        <form method="get" className="relative mb-4 w-full max-w-xs">
          {sp.status && <input type="hidden" name="status" value={sp.status} />}
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-taupe" aria-hidden />
          <input
            name="q"
            defaultValue={sp.q}
            placeholder="Search titles"
            aria-label="Search articles"
            className="h-10 w-full rounded-full border border-stone bg-cream pr-4 pl-10 text-sm placeholder:text-taupe focus:border-copper focus:outline-none"
          />
        </form>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title={sp.q || sp.status ? "No articles match" : "No articles yet"}
          description={sp.q || sp.status ? "Try a different search." : "Write your first guide for the Journal."}
          action={<ButtonLink href="/admin/articles/new" variant="dark" size="sm">New article</ButtonLink>}
        />
      ) : (
        <DataTable>
          <thead>
            <tr>
              <th className="w-24">
                <span className="sr-only">Cover</span>
              </th>
              <th>Title</th>
              <th>Category</th>
              <th>Status</th>
              <th>Published</th>
              <th className="text-right">Read</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id}>
                <td>
                  <div className="relative h-12 w-18 overflow-hidden rounded-lg bg-ivory">
                    {a.coverImage && (
                      <Image src={a.coverImage} alt="" fill sizes="72px" className="object-cover" unoptimized={!a.coverImage.startsWith("/images/")} />
                    )}
                  </div>
                </td>
                <td className="max-w-80">
                  <Link href={`/admin/articles/${a.id}`} className="flex items-center gap-1.5 font-medium text-espresso hover:text-copper-dark">
                    <span className="line-clamp-2">{a.title}</span>
                    {a.featured && <Star className="size-3.5 shrink-0 fill-copper text-copper" aria-label="Featured" />}
                  </Link>
                  <p className="text-[13px] text-taupe">/learn/{a.slug}</p>
                </td>
                <td className="text-muted">{a.category}</td>
                <td>{a.published ? <Badge tone="sage">Published</Badge> : <Badge tone="amber">Draft</Badge>}</td>
                <td className="whitespace-nowrap text-muted">{a.published ? formatDate(a.publishedAt) : "—"}</td>
                <td className="text-right whitespace-nowrap text-muted">{a.readMinutes} min</td>
                <td className="text-right">
                  <Link href={`/admin/articles/${a.id}`} className="text-[13px] font-medium text-copper-dark hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      )}
    </>
  );
}
