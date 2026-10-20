import { Mail, Printer } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionField, ActionForm } from "@/components/admin/ops/action-form";
import { OpsSubmit } from "@/components/admin/ops/buttons";
import { OrderActions } from "@/components/admin/ops/order-actions";
import { Toaster } from "@/components/admin/ops/toast";
import { AdminPageHeader, Panel } from "@/components/admin/ui";
import {
  AddressBlock,
  OrderItemsList,
  OrderStatusBadge,
  OrderTimeline,
  OrderTotals,
  TrackingLink,
} from "@/components/order/order-parts";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Checkbox, Input, Select, Textarea } from "@/components/ui/form";
import {
  addOrderNoteAction,
  resendConfirmationAction,
  updateAdminNoteAction,
  updateShippingAddressAction,
  updateTrackingAction,
} from "@/lib/actions/admin/orders";
import { AU_STATES, PAYMENT_METHODS, SHIPPING_METHOD_LABELS } from "@/lib/constants";
import { formatDateTime, formatMoney } from "@/lib/format";
import { getOrderDetail } from "@/lib/queries/admin-ops";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const detail = await getOrderDetail((await params).id);
  return { title: detail ? `Order ${detail.order.orderNumber}` : "Order not found" };
}

export default async function AdminOrderPage({ params }: Props) {
  const detail = await getOrderDetail((await params).id);
  if (!detail) notFound();
  const { order, customerOrderCount } = detail;
  const a = order.shippingAddress;
  const units = order.items.reduce((s, i) => s + i.quantity, 0);
  const restocked = order.events.some((e) => e.type === "restock");

  return (
    <>
      <Toaster />
      <AdminPageHeader
        back={{ href: "/admin/orders", label: "Orders" }}
        title={
          <span className="flex flex-wrap items-center gap-3">
            {order.orderNumber}
            <span className="flex gap-2 font-sans">
              <OrderStatusBadge status={order.status} />
              <Badge tone={order.paymentStatus === "paid" ? "sage" : order.paymentStatus === "refunded" ? "danger" : "amber"}>
                Payment: {order.paymentStatus === "paid" ? "received" : order.paymentStatus === "refunded" ? "refunded" : "unpaid"}
              </Badge>
            </span>
          </span>
        }
        description={`Placed ${formatDateTime(order.createdAt)} · ${units} ${units === 1 ? "item" : "items"} · ${formatMoney(order.total)}`}
        actions={
          <>
            <ActionForm action={resendConfirmationAction}>
              <input type="hidden" name="orderId" value={order.id} />
              <OpsSubmit variant="outline">
                <Mail className="size-4" /> Resend confirmation
              </OpsSubmit>
            </ActionForm>
            <Link href={`/admin/orders/${order.id}/packing-slip`} className={buttonClasses({ variant: "outline", size: "sm" })}>
              <Printer className="size-4" /> Packing slip
            </Link>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <div className="flex min-w-0 flex-col gap-6">
          <Panel title="Fulfilment">
            <OrderActions order={order} restocked={restocked} />
          </Panel>

          <Panel title={`Items (${units})`} bodyClassName="px-5 py-1">
            <OrderItemsList items={order.items} />
            <div className="border-t border-stone/60 py-4">
              <OrderTotals order={order} />
            </div>
          </Panel>

          <Panel title="Timeline">
            <ActionForm action={addOrderNoteAction} resetOnSuccess className="mb-6 rounded-xl bg-ivory/60 p-4">
              <input type="hidden" name="orderId" value={order.id} />
              <ActionField name="message" label="Add a note">
                <Textarea id="message" name="message" rows={2} placeholder="e.g. Customer called to confirm the address." required className="min-h-16" />
              </ActionField>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-xs text-cocoa">
                  <Checkbox name="visibleToCustomer" /> Visible to the customer
                </label>
                <OpsSubmit>Add note</OpsSubmit>
              </div>
            </ActionForm>
            <OrderTimeline events={order.events} showInternal />
          </Panel>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <Panel title="Customer">
            <p className="font-medium text-espresso">
              {a.firstName} {a.lastName}
            </p>
            <a href={`mailto:${order.email}`} className="block truncate text-sm text-copper-dark hover:underline">
              {order.email}
            </a>
            {a.phone && <p className="text-sm text-cocoa">{a.phone}</p>}
            <div className="mt-4 flex items-center justify-between border-t border-stone/50 pt-4 text-sm">
              {order.user ? (
                <Link href={`/admin/customers/${order.user.id}`} className="text-copper-dark hover:underline">
                  View customer profile
                </Link>
              ) : (
                <span className="text-cocoa">Guest checkout</span>
              )}
              <span className="text-xs text-taupe">
                {customerOrderCount} {customerOrderCount === 1 ? "order" : "orders"}
              </span>
            </div>
          </Panel>

          <Panel title="Shipping">
            <AddressBlock address={a} />
            <p className="mt-3 text-xs text-cocoa">{SHIPPING_METHOD_LABELS[order.shippingMethod]}</p>
            {order.trackingNumber && (
              <div className="mt-3">
                <TrackingLink order={order} />
              </div>
            )}
            {(order.status === "shipped" || order.status === "delivered") && (
              <details className="mt-4 border-t border-stone/50 pt-4">
                <summary className="cursor-pointer text-xs font-medium text-cocoa hover:text-espresso">Edit tracking</summary>
                <ActionForm action={updateTrackingAction} className="mt-3 grid gap-3">
                  <input type="hidden" name="orderId" value={order.id} />
                  <ActionField name="trackingCarrier" htmlFor="trk-carrier" label="Carrier">
                    <Input id="trk-carrier" name="trackingCarrier" defaultValue={order.trackingCarrier ?? "Australia Post"} />
                  </ActionField>
                  <ActionField name="trackingNumber" htmlFor="trk-number" label="Tracking number">
                    <Input id="trk-number" name="trackingNumber" defaultValue={order.trackingNumber ?? ""} required />
                  </ActionField>
                  <div className="flex justify-end">
                    <OpsSubmit>Save tracking</OpsSubmit>
                  </div>
                </ActionForm>
              </details>
            )}
            <details className="mt-4 border-t border-stone/50 pt-4">
              <summary className="cursor-pointer text-xs font-medium text-cocoa hover:text-espresso">Edit address</summary>
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
                  <OpsSubmit>Save address</OpsSubmit>
                </div>
              </ActionForm>
            </details>
          </Panel>

          <Panel title="Payment">
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="text-cocoa">Method</dt>
              <dd className="text-espresso">{PAYMENT_METHODS[order.paymentMethod].label}</dd>
              <dt className="text-cocoa">Reference</dt>
              <dd className="font-mono text-espresso">{order.orderNumber}</dd>
              <dt className="text-cocoa">Amount</dt>
              <dd className="text-espresso">{formatMoney(order.total)}</dd>
              <dt className="text-cocoa">Status</dt>
              <dd className="text-espresso capitalize">{order.paymentStatus}</dd>
              {order.paidAt && (
                <>
                  <dt className="text-cocoa">Paid</dt>
                  <dd className="text-espresso">{formatDateTime(order.paidAt)}</dd>
                </>
              )}
              {order.discountCode && (
                <>
                  <dt className="text-cocoa">Discount</dt>
                  <dd className="text-espresso">
                    {order.discountCode} (−{formatMoney(order.discountTotal)})
                  </dd>
                </>
              )}
            </dl>
          </Panel>

          {order.customerNote && (
            <Panel title="Customer note">
              <p className="text-sm whitespace-pre-line text-cocoa">{order.customerNote}</p>
            </Panel>
          )}

          <Panel title="Admin note">
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
          </Panel>
        </div>
      </div>
    </>
  );
}
