import { Mail, Printer } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ActionField, ActionForm } from "@/components/admin/ops/action-form";
import { OpsSubmit } from "@/components/admin/ops/buttons";
import { OrderActions } from "@/components/admin/ops/order-actions";
import { Toaster } from "@/components/admin/ops/toast";
import { adminButtonClasses, AdminPageHeader } from "@/components/admin/ui";
import {
  AddressBlock,
  OrderItemsList,
  OrderStatusBadge,
  OrderTimeline,
  OrderTotals,
  TrackingLink,
} from "@/components/order/order-parts";
import { Checkbox, Input, Select, Textarea } from "@/components/ui/form";
import {
  addOrderNoteAction,
  resendConfirmationAction,
  updateAdminNoteAction,
  updateShippingAddressAction,
  updateTrackingAction,
} from "@/lib/actions/admin/orders";
import { AU_STATES, PAYMENT_METHODS, SHIPPING_METHOD_LABELS } from "@/lib/constants";
import { formatDateTime, formatMoney, pluralize } from "@/lib/format";
import { getOrderDetail } from "@/lib/queries/admin-ops";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const detail = await getOrderDetail((await params).id);
  return { title: detail ? `Order ${detail.order.orderNumber}` : "Order not found" };
}

/** One section of the order sheet: a heading and its content, divided from the next by a rule. */
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="px-5 py-5">
      <h2 className="mb-4 text-[16px] font-semibold text-ink">{title}</h2>
      {children}
    </section>
  );
}

const summaryClass = "cursor-pointer text-[14px] text-ink hover:underline";

export default async function AdminOrderPage({ params }: Props) {
  const detail = await getOrderDetail((await params).id);
  if (!detail) notFound();
  const { order, customerOrderCount } = detail;
  const a = order.shippingAddress;
  const units = order.items.reduce((s, i) => s + i.quantity, 0);
  const restocked = order.events.some((e) => e.type === "restock");
  const paymentLabel = order.paymentStatus === "paid" ? "Received" : order.paymentStatus === "refunded" ? "Refunded" : "Not received";

  return (
    <>
      <Toaster />
      <AdminPageHeader
        back={{ href: "/admin/orders", label: "Orders" }}
        title={
          <span className="flex flex-wrap items-center gap-3">
            {order.orderNumber}
            <OrderStatusBadge status={order.status} />
          </span>
        }
        description={`${a.firstName} ${a.lastName} · placed ${formatDateTime(order.createdAt)} · ${pluralize(units, "item")} · ${formatMoney(order.total)}`}
        actions={
          <>
            <ActionForm action={resendConfirmationAction}>
              <input type="hidden" name="orderId" value={order.id} />
              <OpsSubmit variant="outline">
                <Mail className="size-4" aria-hidden /> Resend confirmation
              </OpsSubmit>
            </ActionForm>
            <Link href={`/admin/orders/${order.id}/packing-slip`} className={adminButtonClasses({ variant: "outline" })}>
              <Printer className="size-4" aria-hidden /> Packing slip
            </Link>
          </>
        }
      />

      {/* The order as one sheet: what happens next and what was bought on the left, who and where on the right */}
      <div className="grid grid-cols-1 border border-surface-2 bg-white xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <div className="min-w-0 divide-y divide-surface-2">
          <Section title="Next step">
            <OrderActions order={order} restocked={restocked} />
          </Section>

          <Section title={`Items (${units})`}>
            <OrderItemsList items={order.items} />
            <div className="border-t border-surface-2 pt-4">
              <OrderTotals order={order} />
            </div>
          </Section>

          <Section title="Timeline">
            <OrderTimeline events={order.events} showInternal />
            <ActionForm action={addOrderNoteAction} resetOnSuccess className="mt-6 border-t border-surface pt-5">
              <input type="hidden" name="orderId" value={order.id} />
              <ActionField name="message" label="Add a note">
                <Textarea id="message" name="message" rows={2} placeholder="e.g. Customer called to confirm the address." required className="min-h-16" />
              </ActionField>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-[14px] text-muted">
                  <Checkbox name="visibleToCustomer" /> Visible to the customer
                </label>
                <OpsSubmit variant="outline">Add note</OpsSubmit>
              </div>
            </ActionForm>
          </Section>
        </div>

        <div className="min-w-0 divide-y divide-surface-2 border-t border-surface-2 xl:border-t-0 xl:border-l">
          <Section title="Customer">
            <p className="text-[14px] font-medium text-ink">
              {a.firstName} {a.lastName}
            </p>
            <a href={`mailto:${order.email}`} className="block truncate text-[14px] text-ink underline-offset-4 hover:underline">
              {order.email}
            </a>
            {a.phone && <p className="text-[14px] text-muted tabular-nums">{a.phone}</p>}
            <div className="mt-4 flex items-center justify-between border-t border-surface pt-4 text-[14px]">
              {order.user ? (
                <Link href={`/admin/customers/${order.user.id}`} className="text-ink underline-offset-4 hover:underline">
                  Customer profile →
                </Link>
              ) : (
                <span className="text-muted">Guest checkout</span>
              )}
              <span className="text-[13px] text-muted tabular-nums">{pluralize(customerOrderCount, "order")}</span>
            </div>
          </Section>

          <Section title="Shipping">
            <AddressBlock address={a} />
            <p className="mt-3 text-[13px] text-muted">{SHIPPING_METHOD_LABELS[order.shippingMethod]}</p>
            {order.trackingNumber && (
              <div className="mt-3">
                <TrackingLink order={order} />
              </div>
            )}
            {(order.status === "shipped" || order.status === "delivered") && (
              <details className="mt-4 border-t border-surface pt-4">
                <summary className={summaryClass}>Edit tracking</summary>
                <ActionForm action={updateTrackingAction} className="mt-3 grid gap-3">
                  <input type="hidden" name="orderId" value={order.id} />
                  <ActionField name="trackingCarrier" htmlFor="trk-carrier" label="Carrier">
                    <Input id="trk-carrier" name="trackingCarrier" defaultValue={order.trackingCarrier ?? "Australia Post"} />
                  </ActionField>
                  <ActionField name="trackingNumber" htmlFor="trk-number" label="Tracking number">
                    <Input id="trk-number" name="trackingNumber" defaultValue={order.trackingNumber ?? ""} required />
                  </ActionField>
                  <div className="flex justify-end">
                    <OpsSubmit variant="outline">Save tracking</OpsSubmit>
                  </div>
                </ActionForm>
              </details>
            )}
            <details className="mt-4 border-t border-surface pt-4">
              <summary className={summaryClass}>Edit address</summary>
              <ActionForm action={updateShippingAddressAction} className="mt-3 grid grid-cols-2 gap-3">
                <input type="hidden" name="orderId" value={order.id} />
                <ActionField name="firstName" label="First name">
                  <Input id="firstName" name="firstName" defaultValue={a.firstName} required />
                </ActionField>
                <ActionField name="lastName" label="Last name">
                  <Input id="lastName" name="lastName" defaultValue={a.lastName} required />
                </ActionField>
                <ActionField name="company" label="Company" className="col-span-2">
                  <Input id="company" name="company" defaultValue={a.company ?? ""} />
                </ActionField>
                <ActionField name="line1" label="Address line 1" className="col-span-2">
                  <Input id="line1" name="line1" defaultValue={a.line1} required />
                </ActionField>
                <ActionField name="line2" label="Address line 2" className="col-span-2">
                  <Input id="line2" name="line2" defaultValue={a.line2 ?? ""} />
                </ActionField>
                <ActionField name="suburb" label="Suburb" className="col-span-2">
                  <Input id="suburb" name="suburb" defaultValue={a.suburb} required />
                </ActionField>
                <ActionField name="state" label="State">
                  <Select id="state" name="state" defaultValue={a.state}>
                    {AU_STATES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </Select>
                </ActionField>
                <ActionField name="postcode" label="Postcode">
                  <Input id="postcode" name="postcode" defaultValue={a.postcode} inputMode="numeric" required />
                </ActionField>
                <ActionField name="phone" label="Phone" className="col-span-2">
                  <Input id="phone" name="phone" defaultValue={a.phone ?? ""} />
                </ActionField>
                <div className="col-span-2 flex justify-end">
                  <OpsSubmit variant="outline">Save address</OpsSubmit>
                </div>
              </ActionForm>
            </details>
          </Section>

          <Section title="Payment">
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-[14px]">
              <dt className="text-muted">Method</dt>
              <dd className="text-ink">{PAYMENT_METHODS[order.paymentMethod].label}</dd>
              <dt className="text-muted">Reference</dt>
              <dd className="text-ink">{order.orderNumber}</dd>
              <dt className="text-muted">Amount</dt>
              <dd className="text-ink tabular-nums">{formatMoney(order.total)}</dd>
              <dt className="text-muted">Payment</dt>
              <dd className="text-ink">{paymentLabel}</dd>
              {order.paidAt && (
                <>
                  <dt className="text-muted">Paid</dt>
                  <dd className="text-ink">{formatDateTime(order.paidAt)}</dd>
                </>
              )}
              {order.discountCode && (
                <>
                  <dt className="text-muted">Discount</dt>
                  <dd className="text-ink">
                    {order.discountCode} (−{formatMoney(order.discountTotal)})
                  </dd>
                </>
              )}
            </dl>
          </Section>

          {order.customerNote && (
            <Section title="Customer note">
              <p className="text-[14px] whitespace-pre-line text-ink">{order.customerNote}</p>
            </Section>
          )}

          <Section title="Admin note">
            <ActionForm action={updateAdminNoteAction}>
              <input type="hidden" name="orderId" value={order.id} />
              <Textarea
                name="adminNote"
                aria-label="Admin note"
                defaultValue={order.adminNote ?? ""}
                rows={3}
                placeholder="Private to the team — never shown to the customer."
                className="min-h-20"
              />
              <div className="mt-3 flex justify-end">
                <OpsSubmit variant="outline">Save note</OpsSubmit>
              </div>
            </ActionForm>
          </Section>
        </div>
      </div>
    </>
  );
}
