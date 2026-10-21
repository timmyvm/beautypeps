import { KeyRound, LogOut, ShieldCheck, ShieldOff, UserCheck, UserX } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/admin/ops/action-form";
import { ConfirmSubmit, OpsSubmit } from "@/components/admin/ops/buttons";
import { KpiTile } from "@/components/admin/ops/revenue-chart";
import { Toaster } from "@/components/admin/ops/toast";
import { AdminPageHeader, DataTable, Panel } from "@/components/admin/ui";
import { OrderStatusBadge } from "@/components/order/order-parts";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/form";
import { Stars } from "@/components/ui/misc";
import {
  sendPasswordResetAction,
  setRoleAction,
  signOutEverywhereAction,
  toggleDisabledAction,
  updateCustomerNoteAction,
} from "@/lib/actions/admin/customers";
import { requireAdmin } from "@/lib/auth/session";
import { REVIEW_STATUSES } from "@/lib/constants";
import { formatDate, formatDateTime, formatMoney } from "@/lib/format";
import { getCustomerDetail } from "@/lib/queries/admin-ops";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const detail = await getCustomerDetail((await params).id);
  if (!detail) return { title: "Customer not found" };
  const name = [detail.user.firstName, detail.user.lastName].filter(Boolean).join(" ");
  return { title: name || detail.user.email };
}

export default async function AdminCustomerPage({ params }: Props) {
  const [admin, detail] = await Promise.all([requireAdmin(), getCustomerDetail((await params).id)]);
  if (!detail) notFound();
  const { user, orders, addresses, reviews, wishlistCount, stats } = detail;
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
  const isSelf = user.id === admin.id;

  return (
    <>
      <Toaster />
      <AdminPageHeader
        back={{ href: "/admin/customers", label: "Customers" }}
        title={
          <span className="flex flex-wrap items-center gap-3">
            {name}
            <span className="flex gap-2 font-sans">
              {user.role === "admin" && <Badge tone="copper">Admin</Badge>}
              {user.disabled && <Badge tone="danger">Disabled</Badge>}
            </span>
          </span>
        }
        description={`Customer since ${formatDate(user.createdAt)}`}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiTile label="Orders" value={String(stats.orderCount)} />
        <KpiTile label="Lifetime value" value={formatMoney(stats.lifetimeValue)} hint="Paid orders" />
        <KpiTile label="Average order" value={formatMoney(stats.aov)} />
        <KpiTile label="Last order" value={stats.lastOrder ? formatDate(stats.lastOrder) : "—"} hint={`${wishlistCount} wishlisted`} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <div className="flex min-w-0 flex-col gap-6">
          <Panel title={`Orders (${orders.length})`} bodyClassName="p-0">
            {orders.length === 0 ? (
              <p className="p-5 text-sm text-muted">No orders yet.</p>
            ) : (
              <DataTable className="rounded-none border-0">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Date</th>
                    <th className="text-right">Items</th>
                    <th className="text-right">Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td>
                        <Link href={`/admin/orders/${o.id}`} className="font-medium text-espresso hover:text-copper-dark">
                          {o.orderNumber}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap text-muted">{formatDate(o.createdAt)}</td>
                      <td className="text-right tabular-nums">{o.items.reduce((s, i) => s + i.quantity, 0)}</td>
                      <td className="text-right tabular-nums">{formatMoney(o.total)}</td>
                      <td>
                        <OrderStatusBadge status={o.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </DataTable>
            )}
          </Panel>

          <Panel title={`Reviews (${reviews.length})`}>
            {reviews.length === 0 ? (
              <p className="text-sm text-muted">No reviews written.</p>
            ) : (
              <ul className="divide-y divide-stone/50">
                {reviews.map((r) => (
                  <li key={r.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Stars rating={r.rating} size={12} />
                      <span className="text-sm font-medium text-espresso">{r.title}</span>
                      <Badge tone={REVIEW_STATUSES[r.status].tone}>{REVIEW_STATUSES[r.status].label}</Badge>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted">{r.body}</p>
                    <p className="mt-1 text-[13px] text-taupe">
                      {r.product ? (
                        <Link href={`/products/${r.product.slug}`} className="hover:underline">
                          {r.product.name}
                        </Link>
                      ) : (
                        "Deleted product"
                      )}{" "}
                      · {formatDate(r.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title={`Saved addresses (${addresses.length})`}>
            {addresses.length === 0 ? (
              <p className="text-sm text-muted">No saved addresses.</p>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2">
                {addresses.map((ad) => (
                  <li key={ad.id} className="rounded-xl border border-stone/60 p-4 text-sm text-muted">
                    <p className="mb-1 flex items-center gap-2 font-medium text-espresso">
                      {ad.label}
                      {ad.isDefault && <Badge tone="sage">Default</Badge>}
                    </p>
                    {ad.firstName} {ad.lastName}
                    <br />
                    {ad.line1}
                    {ad.line2 ? `, ${ad.line2}` : ""}
                    <br />
                    {ad.suburb} {ad.state} {ad.postcode}
                    {ad.phone && (
                      <>
                        <br />
                        {ad.phone}
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <Panel title="Profile">
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted">Email</dt>
              <dd className="truncate">
                <a href={`mailto:${user.email}`} className="text-copper-dark hover:underline">
                  {user.email}
                </a>
              </dd>
              <dt className="text-muted">Phone</dt>
              <dd className="text-espresso">{user.phone || "—"}</dd>
              <dt className="text-muted">Role</dt>
              <dd className="text-espresso capitalize">{user.role}</dd>
              <dt className="text-muted">Marketing</dt>
              <dd className="text-espresso">{user.marketingOptIn ? "Subscribed" : "Not subscribed"}</dd>
              <dt className="text-muted">Joined</dt>
              <dd className="text-espresso">{formatDateTime(user.createdAt)}</dd>
              <dt className="text-muted">Last login</dt>
              <dd className="text-espresso">{user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "Never"}</dd>
            </dl>
          </Panel>

          <Panel title="Account actions">
            <div className="flex flex-col gap-3">
              <ActionForm action={sendPasswordResetAction}>
                <input type="hidden" name="userId" value={user.id} />
                <OpsSubmit variant="outline" className="w-full justify-start">
                  <KeyRound className="size-4" /> Send password reset email
                </OpsSubmit>
              </ActionForm>
              <ActionForm action={signOutEverywhereAction}>
                <input type="hidden" name="userId" value={user.id} />
                <ConfirmSubmit className="w-full justify-start">
                  <LogOut className="size-4" /> Sign out of all devices
                </ConfirmSubmit>
              </ActionForm>
              {!isSelf && (
                <>
                  <ActionForm action={setRoleAction}>
                    <input type="hidden" name="userId" value={user.id} />
                    <input type="hidden" name="role" value={user.role === "admin" ? "customer" : "admin"} />
                    <ConfirmSubmit className="w-full justify-start">
                      {user.role === "admin" ? (
                        <>
                          <ShieldOff className="size-4" /> Remove admin access
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="size-4" /> Make admin
                        </>
                      )}
                    </ConfirmSubmit>
                  </ActionForm>
                  <ActionForm action={toggleDisabledAction}>
                    <input type="hidden" name="userId" value={user.id} />
                    {user.disabled ? (
                      <OpsSubmit variant="outline" className="w-full justify-start">
                        <UserCheck className="size-4" /> Re-enable account
                      </OpsSubmit>
                    ) : (
                      <ConfirmSubmit className="w-full justify-start">
                        <UserX className="size-4" /> Disable account
                      </ConfirmSubmit>
                    )}
                  </ActionForm>
                </>
              )}
              {isSelf && <p className="text-[13px] text-taupe">This is your account — role and status can&apos;t be changed here.</p>}
            </div>
          </Panel>

          <Panel title="Admin note">
            <ActionForm action={updateCustomerNoteAction}>
              <input type="hidden" name="userId" value={user.id} />
              <Textarea
                name="adminNote"
                aria-label="Admin note"
                defaultValue={user.adminNote ?? ""}
                rows={4}
                placeholder="Private to the team — skin type, preferences, past issues…"
              />
              <div className="mt-3 flex justify-end">
                <OpsSubmit variant="outline">Save note</OpsSubmit>
              </div>
            </ActionForm>
          </Panel>
        </div>
      </div>
    </>
  );
}
