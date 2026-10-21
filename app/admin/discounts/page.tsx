import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { desc } from "drizzle-orm";
import { ActionForm } from "@/components/admin/ops/action-form";
import { ConfirmSubmit, OpsSubmit } from "@/components/admin/ops/buttons";
import { Toaster } from "@/components/admin/ops/toast";
import { AdminPageHeader, DataTable } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { deleteDiscountAction, toggleDiscountAction } from "@/lib/actions/admin/discounts";
import type { BadgeTone } from "@/lib/constants";
import { db } from "@/lib/db";
import { discounts, type Discount } from "@/lib/db/schema";
import { formatDate, formatMoney } from "@/lib/format";

export const metadata: Metadata = { title: "Discounts" };

function discountStatus(d: Discount, now: Date): { label: string; tone: BadgeTone } {
  if (!d.active) return { label: "Disabled", tone: "neutral" };
  if (d.startsAt && d.startsAt > now) return { label: "Scheduled", tone: "neutral" };
  if (d.endsAt && d.endsAt < now) return { label: "Expired", tone: "neutral" };
  if (d.maxUses !== null && d.usedCount >= d.maxUses) return { label: "Used up", tone: "amber" };
  return { label: "Active", tone: "sage" };
}

function describeValue(d: Discount) {
  if (d.type === "percent") return `${d.value}% off`;
  if (d.type === "fixed") return `${formatMoney(d.value)} off`;
  return "Free shipping";
}

export default async function AdminDiscountsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const rows = await db.select().from(discounts).orderBy(desc(discounts.createdAt));
  const now = new Date();

  return (
    <>
      <Toaster />
      <AdminPageHeader
        title="Discounts"
        description="Codes customers can apply in their bag or at checkout."
        actions={
          <ButtonLink href="/admin/discounts/new" variant="dark" size="sm">
            <Plus className="size-4" /> New discount
          </ButtonLink>
        }
      />

      {saved && (
        <div role="status" className="mb-6 rounded-xl bg-sage-light px-4 py-3 text-sm text-sage">
          Discount <strong>{saved}</strong> saved.
        </div>
      )}

      {rows.length === 0 ? (
        <EmptyState
          title="No discount codes yet"
          description="Create a code for a launch, a loyal customer or an influencer campaign."
          action={<ButtonLink href="/admin/discounts/new" variant="dark" size="sm">Create a discount</ButtonLink>}
        />
      ) : (
        <DataTable>
          <thead>
            <tr>
              <th>Code</th>
              <th>Offer</th>
              <th className="text-right">Min spend</th>
              <th className="text-right">Used</th>
              <th>Active window</th>
              <th>Status</th>
              <th className="relative text-right">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((d) => {
              const status = discountStatus(d, now);
              return (
                <tr key={d.id}>
                  <td>
                    <Link href={`/admin/discounts/${d.id}`} className="font-medium text-ink hover:underline">
                      {d.code}
                    </Link>
                    {d.description && <span className="block max-w-56 truncate text-[13px] text-muted">{d.description}</span>}
                  </td>
                  <td className="whitespace-nowrap">{describeValue(d)}</td>
                  <td className="text-right tabular-nums">{d.minSubtotal ? formatMoney(d.minSubtotal) : "—"}</td>
                  <td className="text-right tabular-nums">
                    {d.usedCount}
                    {d.maxUses !== null ? ` / ${d.maxUses}` : ""}
                  </td>
                  <td className="text-[13px] whitespace-nowrap text-muted">
                    {d.startsAt || d.endsAt ? `${d.startsAt ? formatDate(d.startsAt) : "Now"} → ${d.endsAt ? formatDate(d.endsAt) : "No end"}` : "Always"}
                  </td>
                  <td>
                    {status.label === "Active" ? <span className="text-muted">Active</span> : <Badge tone={status.tone}>{status.label}</Badge>}
                  </td>
                  <td>
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/discounts/${d.id}`} className="px-3 py-1.5 text-[13px] text-muted hover:bg-surface hover:text-ink">
                        Edit
                      </Link>
                      <ActionForm action={toggleDiscountAction}>
                        <input type="hidden" name="id" value={d.id} />
                        <OpsSubmit variant="ghost">{d.active ? "Disable" : "Enable"}</OpsSubmit>
                      </ActionForm>
                      <ActionForm action={deleteDiscountAction}>
                        <input type="hidden" name="id" value={d.id} />
                        <ConfirmSubmit variant="ghost" confirmLabel="Delete?">
                          Delete
                        </ConfirmSubmit>
                      </ActionForm>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </DataTable>
      )}
    </>
  );
}
