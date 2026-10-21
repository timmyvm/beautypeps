import { eq } from "drizzle-orm";
import { Archive, Inbox, Mail, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionField, ActionForm } from "@/components/admin/ops/action-form";
import { ConfirmSubmit, OpsSubmit } from "@/components/admin/ops/buttons";
import { Toaster } from "@/components/admin/ops/toast";
import { AdminPageHeader, Panel } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { Checkbox, Input, Textarea } from "@/components/ui/form";
import { deleteMessageAction, replyMessageAction, setMessageStatusAction } from "@/lib/actions/admin/messages";
import { db } from "@/lib/db";
import { contactMessages, users } from "@/lib/db/schema";
import { formatDateTime } from "@/lib/format";
import { orderIdByNumber } from "@/lib/queries/admin-ops";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const m = await db.query.contactMessages.findFirst({ where: eq(contactMessages.id, (await params).id) });
  return { title: m ? m.subject : "Message not found" };
}

export default async function AdminMessagePage({ params }: Props) {
  const { id } = await params;
  const message = await db.query.contactMessages.findFirst({ where: eq(contactMessages.id, id) });
  if (!message) notFound();

  // Opening a message marks it read.
  if (message.status === "new") {
    await db.update(contactMessages).set({ status: "read" }).where(eq(contactMessages.id, id));
  }

  const [order, customer] = await Promise.all([
    orderIdByNumber(message.orderNumber),
    db.query.users.findFirst({ where: eq(users.email, message.email.toLowerCase()), columns: { id: true } }),
  ]);
  const archived = message.status === "archived";

  return (
    <>
      <Toaster />
      <AdminPageHeader
        back={{ href: "/admin/messages", label: "Messages" }}
        title={message.subject}
        description={`From ${message.name} · ${formatDateTime(message.createdAt)}`}
        actions={
          <>
            <ActionForm action={setMessageStatusAction}>
              <input type="hidden" name="id" value={message.id} />
              <input type="hidden" name="status" value={archived ? "read" : "archived"} />
              <OpsSubmit variant="outline">
                {archived ? (
                  <>
                    <Inbox className="size-4" /> Move to inbox
                  </>
                ) : (
                  <>
                    <Archive className="size-4" /> Archive
                  </>
                )}
              </OpsSubmit>
            </ActionForm>
            {!archived && (
              <ActionForm action={setMessageStatusAction}>
                <input type="hidden" name="id" value={message.id} />
                <input type="hidden" name="status" value="new" />
                <OpsSubmit variant="ghost">
                  <Mail className="size-4" /> Mark unread
                </OpsSubmit>
              </ActionForm>
            )}
            <ActionForm action={deleteMessageAction}>
              <input type="hidden" name="id" value={message.id} />
              <ConfirmSubmit variant="ghost" confirmLabel="Delete permanently?">
                <Trash2 className="size-4" /> Delete
              </ConfirmSubmit>
            </ActionForm>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="flex min-w-0 flex-col gap-6">
          <Panel>
            <p className="text-sm leading-relaxed whitespace-pre-line text-ink">{message.message}</p>
          </Panel>

          <Panel title="Reply">
            <ActionForm action={replyMessageAction} resetOnSuccess className="grid gap-4">
              <input type="hidden" name="id" value={message.id} />
              <ActionField name="subject" label="Subject">
                <Input id="subject" name="subject" defaultValue={`Re: ${message.subject}`} required />
              </ActionField>
              <ActionField name="body" label="Message" hint="Your reply quotes their original message below it.">
                <Textarea
                  id="body"
                  name="body"
                  rows={8}
                  required
                  defaultValue={`Hi ${message.name.split(" ")[0]},\n\n\n\nWarmly,\nThe Beauty Peps team`}
                />
              </ActionField>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-[13px] text-muted">
                  <Checkbox name="archive" defaultChecked /> Archive after sending
                </label>
                <OpsSubmit size="md">Send reply</OpsSubmit>
              </div>
            </ActionForm>
          </Panel>
        </div>

        <Panel title="Sender">
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-muted">Name</dt>
            <dd className="text-ink">{message.name}</dd>
            <dt className="text-muted">Email</dt>
            <dd className="truncate">
              <a href={`mailto:${message.email}`} className="text-ink hover:underline">
                {message.email}
              </a>
            </dd>
            <dt className="text-muted">Status</dt>
            <dd>
              <Badge tone="neutral">{archived ? "Archived" : "Read"}</Badge>
            </dd>
            {message.orderNumber && (
              <>
                <dt className="text-muted">Order</dt>
                <dd>
                  {order ? (
                    <Link href={`/admin/orders/${order.id}`} className="text-ink hover:underline">
                      {order.orderNumber}
                    </Link>
                  ) : (
                    <span className="text-muted">{message.orderNumber} (not found)</span>
                  )}
                </dd>
              </>
            )}
          </dl>
          {customer && (
            <Link href={`/admin/customers/${customer.id}`} className="mt-4 inline-block text-sm text-ink hover:underline">
              View customer profile →
            </Link>
          )}
        </Panel>
      </div>
    </>
  );
}
