import { and, count, desc, eq, like, or } from "drizzle-orm";
import { Info, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader, DataTable, FilterTabs, Pagination } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { EmptyState } from "@/components/ui/misc";
import { db } from "@/lib/db";
import { emailLog } from "@/lib/db/schema";
import { formatDateTime } from "@/lib/format";
import { parsePage } from "@/lib/queries/admin-ops";

export const metadata: Metadata = { title: "Email log" };

const PAGE_SIZE = 40;

function emailStatusTone(status: string) {
  return status === "sent" ? "sage" : status === "failed" ? "danger" : "neutral";
}

export default async function AdminEmailsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const page = parsePage(sp.page);
  const q = sp.q?.trim().replace(/[%_]/g, "");
  const conds = [];
  if (sp.status === "sent" || sp.status === "failed" || sp.status === "logged") conds.push(eq(emailLog.status, sp.status));
  if (q) conds.push(or(like(emailLog.to, `%${q}%`), like(emailLog.subject, `%${q}%`))!);
  const where = conds.length ? and(...conds) : undefined;

  const [rows, [{ n: total }]] = await Promise.all([
    db
      .select({ id: emailLog.id, to: emailLog.to, subject: emailLog.subject, status: emailLog.status, createdAt: emailLog.createdAt })
      .from(emailLog)
      .where(where)
      .orderBy(desc(emailLog.createdAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ n: count() }).from(emailLog).where(where),
  ]);
  const delivering = !!(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);

  return (
    <>
      <AdminPageHeader title="Email log" description="Every email the store has generated — order updates, password resets, replies." />

      <div className="mb-6 flex gap-3 rounded-xl border border-stone/70 bg-cream px-4 py-3 text-sm text-muted">
        <Info className="mt-0.5 size-4 shrink-0 text-copper" aria-hidden />
        <p>
          {delivering ? (
            <>Emails are being delivered through Resend from <strong>{process.env.EMAIL_FROM}</strong>.</>
          ) : (
            <>
              Emails are only <strong>logged</strong>, not delivered. Set <code className="font-mono text-[13px]">RESEND_API_KEY</code> and{" "}
              <code className="font-mono text-[13px]">EMAIL_FROM</code> in your environment to send them for real.
            </>
          )}
        </p>
      </div>

      <FilterTabs
        basePath="/admin/emails"
        param="status"
        current={sp.status}
        searchParams={sp}
        options={[
          { value: "", label: "All" },
          { value: "sent", label: "Sent" },
          { value: "logged", label: "Logged only" },
          { value: "failed", label: "Failed" },
        ]}
      />

      <form className="mb-5 flex gap-3" role="search">
        {sp.status && <input type="hidden" name="status" value={sp.status} />}
        <label className="relative max-w-md flex-1">
          <span className="sr-only">Search emails</span>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-taupe" aria-hidden />
          <Input name="q" defaultValue={sp.q} placeholder="Recipient or subject…" className="pl-10" />
        </label>
        <button type="submit" className={buttonClasses()}>
          Search
        </button>
      </form>

      {rows.length === 0 ? (
        <EmptyState title="No emails" description="Emails appear here as orders are placed and updated." />
      ) : (
        <DataTable>
          <thead>
            <tr>
              <th>Subject</th>
              <th>To</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.id}>
                <td className="max-w-96">
                  <Link href={`/admin/emails/${e.id}`} className="block truncate font-medium text-espresso hover:text-copper-dark">
                    {e.subject}
                  </Link>
                </td>
                <td className="max-w-64 truncate text-muted">{e.to}</td>
                <td>
                  <Badge tone={emailStatusTone(e.status)} className="capitalize">
                    {e.status}
                  </Badge>
                </td>
                <td className="whitespace-nowrap text-muted">{formatDateTime(e.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      )}
      <Pagination page={page} pageCount={Math.max(1, Math.ceil(total / PAGE_SIZE))} basePath="/admin/emails" searchParams={sp} />
    </>
  );
}
