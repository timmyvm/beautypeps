import { Ban, CheckCircle2, PackageCheck, PackageOpen, RotateCcw, Truck } from "lucide-react";
import { Checkbox, Input } from "@/components/ui/form";
import { updateOrderStatusAction } from "@/lib/actions/admin/orders";
import type { Order } from "@/lib/db/schema";
import { formatMoney } from "@/lib/format";
import { allowedTransitions } from "@/lib/queries/admin-ops";
import { ActionField, ActionForm } from "./action-form";
import { ConfirmSubmit, OpsSubmit } from "./buttons";

function Hidden({ orderId, to }: { orderId: string; to: string }) {
  return (
    <>
      <input type="hidden" name="orderId" value={orderId} />
      <input type="hidden" name="to" value={to} />
    </>
  );
}

function NotifyToggle({ defaultChecked = true }: { defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2 text-[13px] text-muted">
      <Checkbox name="notify" defaultChecked={defaultChecked} /> Email the customer
    </label>
  );
}

function Row({ icon, title, description, children }: { icon: React.ReactNode; title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      <div className="flex min-w-[min(100%,18rem)] flex-1 items-start gap-3">
        <span className="mt-0.5 shrink-0 text-muted [&_svg]:size-4" aria-hidden>{icon}</span>
        <div>
          <p className="text-[14px] font-medium text-ink">{title}</p>
          <p className="text-[13px] text-muted">{description}</p>
        </div>
      </div>
      <div className="ml-auto flex flex-wrap items-center justify-end gap-3">{children}</div>
    </div>
  );
}

/** Forward moves in the order they happen; the first one still open is the order's next step. */
const FORWARD = ["paid", "processing", "shipped", "delivered"] as const;

/** The fulfilment controls for one order — only the moves valid from its current status are shown. */
export function OrderActions({ order, restocked }: { order: Order; restocked: boolean }) {
  const moves = allowedTransitions(order);
  if (moves.length === 0) {
    return <p className="text-[14px] text-muted">This order is closed — no further status changes are available.</p>;
  }
  // The next step is the only near-black button; every other move is secondary.
  const next = FORWARD.find((m) => moves.includes(m));
  const variant = (m: (typeof FORWARD)[number]) => (m === next ? "dark" : "outline");

  return (
    <div className="divide-y divide-surface [&>*]:py-4 [&>*:first-child]:pt-0 [&>*:last-child]:pb-0">
      {moves.includes("paid") && (
        <ActionForm action={updateOrderStatusAction}>
          <Hidden orderId={order.id} to="paid" />
          <Row
            icon={<CheckCircle2 className="size-4" />}
            title="Mark as paid"
            description={`Confirm ${formatMoney(order.total)} received with reference ${order.orderNumber}.`}
          >
            <NotifyToggle />
            <OpsSubmit variant={variant("paid")}>Mark as paid</OpsSubmit>
          </Row>
        </ActionForm>
      )}

      {moves.includes("processing") && (
        <ActionForm action={updateOrderStatusAction}>
          <Hidden orderId={order.id} to="processing" />
          <Row icon={<PackageOpen className="size-4" />} title="Start packing" description="Moves the order to “Packing”.">
            <NotifyToggle defaultChecked={false} />
            <OpsSubmit variant={variant("processing")}>Mark as packing</OpsSubmit>
          </Row>
        </ActionForm>
      )}

      {moves.includes("shipped") && (
        <ActionForm action={updateOrderStatusAction}>
          <Hidden orderId={order.id} to="shipped" />
          <div className="flex items-start gap-3">
            <span className="mt-0.5 shrink-0 text-muted" aria-hidden>
              <Truck className="size-4" />
            </span>
            <div className="flex-1">
              <p className="text-[14px] font-medium text-ink">Mark as shipped</p>
              <p className="text-[13px] text-muted">Adds tracking to the order and the customer&apos;s account.</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1.4fr]">
                <ActionField name="trackingCarrier" label="Carrier">
                  <Input id="trackingCarrier" name="trackingCarrier" defaultValue={order.trackingCarrier ?? "Australia Post"} />
                </ActionField>
                <ActionField name="trackingNumber" label="Tracking number">
                  <Input
                    id="trackingNumber"
                    name="trackingNumber"
                    defaultValue={order.trackingNumber ?? ""}
                    placeholder="e.g. 33ABC123456701000935005"
                    required
                  />
                </ActionField>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-end gap-3">
                <NotifyToggle />
                <OpsSubmit variant={variant("shipped")}>Mark as shipped</OpsSubmit>
              </div>
            </div>
          </div>
        </ActionForm>
      )}

      {moves.includes("delivered") && (
        <ActionForm action={updateOrderStatusAction}>
          <Hidden orderId={order.id} to="delivered" />
          <Row icon={<PackageCheck className="size-4" />} title="Mark as delivered" description="Australia Post shows the parcel as delivered.">
            <NotifyToggle />
            <OpsSubmit variant={variant("delivered")}>Mark as delivered</OpsSubmit>
          </Row>
        </ActionForm>
      )}

      {moves.includes("cancelled") && (
        <ActionForm action={updateOrderStatusAction}>
          <Hidden orderId={order.id} to="cancelled" />
          <Row
            icon={<Ban className="size-4" />}
            title="Cancel order"
            description={order.paymentStatus === "paid" ? "Payment was received — refund it separately after cancelling." : "Releases the order without payment."}
          >
            <label className="flex items-center gap-2 text-[13px] text-muted">
              <Checkbox name="restock" defaultChecked /> Restock items
            </label>
            <NotifyToggle />
            <ConfirmSubmit>Cancel order</ConfirmSubmit>
          </Row>
        </ActionForm>
      )}

      {moves.includes("refunded") && (
        <ActionForm action={updateOrderStatusAction}>
          <Hidden orderId={order.id} to="refunded" />
          <Row
            icon={<RotateCcw className="size-4" />}
            title="Refund order"
            description={`Record a full refund of ${formatMoney(order.total)}. Send the money back via your bank first.`}
          >
            {!restocked && (
              <label className="flex items-center gap-2 text-[13px] text-muted">
                <Checkbox name="restock" defaultChecked={order.status !== "shipped" && order.status !== "delivered"} /> Restock items
              </label>
            )}
            <NotifyToggle />
            <ConfirmSubmit>Refund</ConfirmSubmit>
          </Row>
        </ActionForm>
      )}
    </div>
  );
}
