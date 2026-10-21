import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPageHeader, Panel } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { emailLog } from "@/lib/db/schema";
import { formatDateTime } from "@/lib/format";

type Props = { params: Promise<{ id: string }> };

async function load(id: string) {
  return db.query.emailLog.findFirst({ where: eq(emailLog.id, id) });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const email = await load((await params).id);
  return { title: email ? email.subject : "Email not found" };
}

export default async function AdminEmailPage({ params }: Props) {
  const email = await load((await params).id);
  if (!email) notFound();
  const tone = email.status === "sent" ? "sage" : email.status === "failed" ? "danger" : "neutral";

  return (
    <>
      <AdminPageHeader back={{ href: "/admin/emails", label: "Email log" }} title={email.subject} />
      <Panel className="mb-6">
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
          <dt className="text-muted">To</dt>
          <dd className="text-ink">{email.to}</dd>
          <dt className="text-muted">Status</dt>
          <dd>
            <Badge tone={tone} className="capitalize">
              {email.status}
            </Badge>
          </dd>
          <dt className="text-muted">Created</dt>
          <dd className="text-ink">{formatDateTime(email.createdAt)}</dd>
          {email.error && (
            <>
              <dt className="text-muted">Error</dt>
              <dd className="font-mono text-[13px] break-all text-danger">{email.error}</dd>
            </>
          )}
        </dl>
      </Panel>
      <Panel title="Preview" bodyClassName="p-0">
        {/* Sandboxed: no scripts, no same-origin access. */}
        <iframe title={`Preview of ${email.subject}`} srcDoc={email.html} sandbox="" className="h-[720px] w-full rounded-b-2xl bg-surface" />
      </Panel>
    </>
  );
}
