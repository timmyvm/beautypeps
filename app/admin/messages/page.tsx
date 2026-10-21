import { desc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader, FilterTabs } from "@/components/admin/ui";
import { EmptyState } from "@/components/ui/misc";
import { db } from "@/lib/db";
import { contactMessages, type MessageStatus } from "@/lib/db/schema";
import { formatDateTime } from "@/lib/format";
import { messageCounts } from "@/lib/queries/admin-ops";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Messages" };

export default async function AdminMessagesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const sp = await searchParams;
  const status: MessageStatus | "inbox" = sp.status === "archived" ? "archived" : sp.status === "new" ? "new" : "inbox";
  const [rows, counts] = await Promise.all([
    status === "inbox"
      ? db.query.contactMessages.findMany({
          where: (m, { ne }) => ne(m.status, "archived"),
          orderBy: desc(contactMessages.createdAt),
          limit: 200,
        })
      : db.query.contactMessages.findMany({
          where: eq(contactMessages.status, status),
          orderBy: desc(contactMessages.createdAt),
          limit: 200,
        }),
    messageCounts(),
  ]);

  return (
    <>
      <AdminPageHeader title="Messages" description="Enquiries sent through the contact form." />
      <FilterTabs
        basePath="/admin/messages"
        param="status"
        current={sp.status === "new" || sp.status === "archived" ? sp.status : ""}
        options={[
          { value: "", label: "Inbox", count: counts.new + counts.read },
          { value: "new", label: "Unread", count: counts.new },
          { value: "archived", label: "Archived", count: counts.archived },
        ]}
      />

      {rows.length === 0 ? (
        <EmptyState title={status === "archived" ? "Nothing archived" : "Inbox zero"} description="New contact form messages will show up here." />
      ) : (
        <ul className="divide-y divide-surface overflow-hidden rounded-2xl border border-surface-2 bg-white">
          {rows.map((m) => (
            <li key={m.id}>
              <Link href={`/admin/messages/${m.id}`} className="flex gap-4 px-5 py-4 hover:bg-surface/50">
                <span
                  className={cn("mt-2 size-2 shrink-0 rounded-full", m.status === "new" ? "bg-accent" : "bg-transparent")}
                  aria-label={m.status === "new" ? "Unread" : undefined}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <span className={cn("truncate text-sm", m.status === "new" ? "font-semibold text-ink" : "text-ink")}>
                      {m.name} <span className="font-normal text-muted">· {m.email}</span>
                    </span>
                    <span className="shrink-0 text-[13px] text-muted">{formatDateTime(m.createdAt)}</span>
                  </span>
                  <span className={cn("mt-0.5 block truncate text-sm", m.status === "new" ? "font-medium text-ink" : "text-muted")}>
                    {m.subject}
                    {m.orderNumber && <span className="ml-2 text-[13px] text-ink">{m.orderNumber}</span>}
                  </span>
                  <span className="mt-0.5 block truncate text-[13px] text-muted">{m.message}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
