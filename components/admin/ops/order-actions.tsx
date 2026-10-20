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
    <label className="flex items-center gap-2 text-xs text-cocoa">
      <Checkbox name="notify" defaultChecked={defaultChecked} /> Email the customer
    </label>
  );
}

function Row({ icon, title, description, children }: { icon: React.ReactNode; title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex flex-1 items-start gap-3">
        <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-ivory text-copper-dark">{icon}</span>
        <div>
          <p className="text-sm font-medium text-espresso">{title}</p>
          <p className="text-xs text-cocoa">{description}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 sm:justify-end">{children}</div>
    </div>
  );
}

/** The fulfilment controls for one order — only the moves valid from its current status are shown. */
export function OrderActions({ order, restocked }: { order: Order; restocked: boolean }) {
  const moves = allowedTransitions(order);
  if (moves.length === 0) {
    return <p className="text-sm text-cocoa">This order is closed — no further status changes are available.</p>;
  }

  return (
    <div className="divide-y divide-stone/50 [&>*]:py-4 [&>*:first-child]:pt-0 [&>*:last-child]:pb-0">
      {moves.includes("paid") && (
        <ActionForm action={updateOrderStatusAction}>
          <Hidden orderId={order.id} to="paid" />
          <Row
            icon={<CheckCircle2 className="size-4" />}
            title="Mark as paid"
            description={`Confirm ${formatMoney(order.total)} received with reference ${order.orderNumber}.`}
          >
            <NotifyToggle />
            <OpsSubmit variant="copper">Mark as paid</OpsSubmit>
          </Row>
        </ActionForm>
      )}

      {moves.includes("processing") && (
        <ActionForm action={updateOrderStatusAction}>
          <Hidden orderId={order.id} to="processing" />
          <Row icon={<PackageOpen className="size-4" />} title="Start packing" description="Moves the order to “Packing”.">
            <NotifyToggle defaultChecked={false} />
            <OpsSubmit variant={moves.includes("paid") ? "outline" : "primary"}>Mark as packing</OpsSubmit>
          </Row>
        </ActionForm>
      )}

      {moves.includes("shipped") && (
        <ActionForm action={updateOrderStatusAction}>
          <Hidden orderId={order.id} to="shipped" />
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-ivory text-copper-dark">
              <Truck className="size-4" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium text-espresso">Mark as shipped</p>
              <p className="text-xs text-cocoa">Adds tracking to the order and the customer&apos;s account.</p>
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
                <OpsSubmit>Mark as shipped</OpsSubmit>
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
            <OpsSubmit>Mark as delivered</OpsSubmit>
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
            <label className="flex items-center gap-2 text-xs text-cocoa">
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
              <label className="flex items-center gap-2 text-xs text-cocoa">
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
