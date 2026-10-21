import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ORDER_FLOW, ORDER_STATUSES, PAYMENT_METHODS, SHIPPING_METHOD_LABELS } from "@/lib/constants";
import type { Order, OrderEvent, OrderItem, OrderStatus } from "@/lib/db/schema";
import { formatDateTime, formatMoney } from "@/lib/format";
import type { StoreSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

/*
 * Shared order building blocks — used by checkout confirmation, guest order
 * tracking, the customer account and the admin panel.
 */

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const s = ORDER_STATUSES[status];
  return <Badge tone={s.tone}>{s.label}</Badge>;
}

export function OrderProgress({ status }: { status: OrderStatus }) {
  if (status === "cancelled" || status === "refunded") {
    return <div className="bg-surface-2 px-4 py-3 text-[14px] text-muted">{ORDER_STATUSES[status].description}</div>;
  }
  const current = ORDER_FLOW.indexOf(status);
  // A ruled bar in five lengths: filled up to the current step, the step names under it.
  return (
    <ol className="grid grid-cols-5 gap-1" aria-label="Order progress">
      {ORDER_FLOW.map((step, i) => {
        const done = i <= current;
        return (
          <li key={step} aria-current={i === current ? "step" : undefined}>
            <span className={cn("block h-1", done ? "bg-accent" : "bg-surface-2")} aria-hidden />
            <span
              className={cn(
                "mt-2 block pr-2 text-[13px] leading-tight",
                i === current ? "font-medium text-ink" : done ? "text-ink" : "text-muted",
              )}
            >
              {ORDER_STATUSES[step].label}
              {done && i !== current && <span className="sr-only"> (done)</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function OrderItemsList({ items }: { items: OrderItem[] }) {
  return (
    <ul className="divide-y divide-surface">
      {items.map((item) => (
        <li key={item.id} className="flex items-center gap-4 py-4">
          <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-surface">
            {item.image && <Image src={item.image} alt="" fill sizes="64px" className="object-cover" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-medium text-ink">{item.name}</p>
            <p className="text-[13px] text-muted">
              {item.size ? `${item.size} · ` : ""}Qty {item.quantity} × {formatMoney(item.unitPrice)}
            </p>
          </div>
          <p className="text-[14px] font-medium text-ink tabular-nums">{formatMoney(item.lineTotal)}</p>
        </li>
      ))}
    </ul>
  );
}

export function OrderTotals({ order }: { order: Order }) {
  return (
    <dl className="space-y-2 text-[14px] tabular-nums">
      <Row label="Subtotal" value={formatMoney(order.subtotal)} />
      {order.discountTotal > 0 && (
        <Row
          label={`Discount${order.discountCode ? ` (${order.discountCode})` : ""}`}
          value={`−${formatMoney(order.discountTotal)}`}
          className="text-sage"
        />
      )}
      <Row
        label={SHIPPING_METHOD_LABELS[order.shippingMethod]}
        value={order.shippingTotal ? formatMoney(order.shippingTotal) : "Free"}
      />
      <div className="border-t border-surface-2 pt-3">
        <Row label="Total" value={formatMoney(order.total)} className="text-base font-semibold text-ink" />
        <p className="mt-1 text-right text-[13px] text-muted">Includes {formatMoney(order.gstTotal)} GST</p>
      </div>
    </dl>
  );
}

function Row({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={cn("flex justify-between gap-4 text-muted", className)}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export function AddressBlock({ address }: { address: Order["shippingAddress"] }) {
  return (
    <address className="text-[14px] leading-relaxed text-muted not-italic">
      <span className="font-medium text-ink">
        {address.firstName} {address.lastName}
      </span>
      <br />
      {address.company && (
        <>
          {address.company}
          <br />
        </>
      )}
      {address.line1}
      <br />
      {address.line2 && (
        <>
          {address.line2}
          <br />
        </>
      )}
      {address.suburb} {address.state} {address.postcode}
      <br />
      {address.country === "AU" ? "Australia" : address.country}
      {address.phone && (
        <>
          <br />
          {address.phone}
        </>
      )}
    </address>
  );
}

export function PaymentInstructions({ order, settings }: { order: Order; settings: StoreSettings }) {
  const isPayId = order.paymentMethod === "payid";
  const rows: [string, string][] = isPayId
    ? [
        ["PayID", settings.payId],
        ["Name", settings.bankAccountName],
        ["Amount", formatMoney(order.total)],
        ["Reference", order.orderNumber],
      ]
    : [
        ["Account name", settings.bankAccountName],
        ["BSB", settings.bankBsb],
        ["Account number", settings.bankAccountNumber],
        ["Amount", formatMoney(order.total)],
        ["Reference", order.orderNumber],
      ];
  return (
    <div className="bg-surface p-5">
      <p className="text-lg font-semibold text-ink">Pay by {PAYMENT_METHODS[order.paymentMethod].label}</p>
      <p className="mt-1 text-[14px] text-muted">
        Please pay within {settings.paymentWindowDays} days using your order number as the reference. We&apos;ll
        email you as soon as payment clears.
      </p>
      <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-t border-surface-2 pt-4 text-[14px]">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-muted">{k}</dt>
            <dd className="font-medium text-ink tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function OrderTimeline({ events, showInternal = false }: { events: OrderEvent[]; showInternal?: boolean }) {
  const visible = events
    .filter((e) => showInternal || e.visibleToCustomer)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  if (visible.length === 0) return null;
  return (
    <ol className="relative space-y-5 border-l border-surface-2 pl-6">
      {visible.map((e) => (
        <li key={e.id} className="relative">
          {/* a filled dot for what the customer sees, a hollow one for notes kept in-house */}
          <span
            className={cn(
              "absolute top-1.5 -left-[28.5px] size-2 rounded-full",
              e.visibleToCustomer ? "bg-ink" : "border border-muted bg-white",
            )}
            aria-hidden
          />
          <p className="text-[14px] text-ink">{e.message}</p>
          <p className="mt-0.5 text-[13px] text-muted">
            {formatDateTime(e.createdAt)}
            {showInternal && e.actor ? ` · ${e.actor}` : ""}
            {showInternal && !e.visibleToCustomer ? " · internal" : ""}
          </p>
        </li>
      ))}
    </ol>
  );
}

export function TrackingLink({ order }: { order: Pick<Order, "trackingNumber" | "trackingCarrier"> }) {
  if (!order.trackingNumber) return null;
  return (
    <a
      href={`https://auspost.com.au/mypost/track/details/${encodeURIComponent(order.trackingNumber)}`}
      target="_blank"
      rel="noreferrer"
      className="text-[14px] font-medium text-ink underline underline-offset-4"
    >
      Track with {order.trackingCarrier ?? "Australia Post"} · {order.trackingNumber}
    </a>
  );
}
