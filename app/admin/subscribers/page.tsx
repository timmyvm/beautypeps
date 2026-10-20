import { count, desc, like } from "drizzle-orm";
import { Download, Search } from "lucide-react";
import type { Metadata } from "next";
import { ActionForm } from "@/components/admin/ops/action-form";
import { ConfirmSubmit } from "@/components/admin/ops/buttons";
import { Toaster } from "@/components/admin/ops/toast";
import { AdminPageHeader, DataTable, Pagination } from "@/components/admin/ui";
import { buttonClasses } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { EmptyState } from "@/components/ui/misc";
import { deleteSubscriberAction } from "@/lib/actions/admin/subscribers";
import { db } from "@/lib/db";
import { subscribers } from "@/lib/db/schema";
import { formatDateTime } from "@/lib/format";
import { parsePage } from "@/lib/queries/admin-ops";

export const metadata: Metadata = { title: "Subscribers" };

const PAGE_SIZE = 50;

export default async function AdminSubscribersPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const sp = await searchParams;
  const page = parsePage(sp.page);
  const q = sp.q?.trim();
  const where = q ? like(subscribers.email, `%${q.replace(/[%_]/g, "")}%`) : undefined;

  const [rows, [{ n: total }]] = await Promise.all([
    db
      .select()
      .from(subscribers)
      .where(where)
      .orderBy(desc(subscribers.createdAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ n: count() }).from(subscribers).where(where),
  ]);

  return (
    <>
      <Toaster />
      <AdminPageHeader
        title="Subscribers"
        description={`${total} ${total === 1 ? "person" : "people"} on The Peptide Letter${q ? ` matching “${q}”` : ""}.`}
        actions={
          <a href={`/admin/subscribers/export${q ? `?q=${encodeURIComponent(q)}` : ""}`} className={buttonClasses({ variant: "outline", size: "sm" })}>
            <Download className="size-4" /> Export CSV
          </a>
        }
      />

      <form className="mb-5 flex gap-3" role="search">
        <label className="relative max-w-md flex-1">
          <span className="sr-only">Search subscribers</span>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-taupe" aria-hidden />
          <Input name="q" defaultValue={q} placeholder="Search by email…" className="pl-10" />
        </label>
        <button type="submit" className={buttonClasses()}>
          Search
        </button>
      </form>

      {rows.length === 0 ? (
        <EmptyState title="No subscribers" description="Sign-ups from the footer and newsletter blocks appear here." />
      ) : (
        <DataTable>
          <thead>
            <tr>
              <th>Email</th>
              <th>Source</th>
              <th>Subscribed</th>
              <th className="text-right">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id}>
                <td className="font-medium text-espresso">{s.email}</td>
                <td className="text-cocoa capitalize">{s.source}</td>
                <td className="whitespace-nowrap text-cocoa">{formatDateTime(s.createdAt)}</td>
                <td>
                  <ActionForm action={deleteSubscriberAction} className="flex justify-end">
                    <input type="hidden" name="id" value={s.id} />
                    <ConfirmSubmit variant="ghost" confirmLabel="Remove?">
                      Remove
                    </ConfirmSubmit>
                  </ActionForm>
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      )}
      <Pagination page={page} pageCount={Math.max(1, Math.ceil(total / PAGE_SIZE))} basePath="/admin/subscribers" searchParams={sp} />
    </>
  );
}
