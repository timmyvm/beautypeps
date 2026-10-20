import { Check } from "lucide-react";
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
    return (
      <div className="rounded-xl bg-sand px-4 py-3 text-sm text-cocoa">{ORDER_STATUSES[status].description}</div>
    );
  }
  const current = ORDER_FLOW.indexOf(status);
  return (
    <ol className="grid grid-cols-5 gap-2" aria-label="Order progress">
      {ORDER_FLOW.map((step, i) => {
        const done = i <= current;
        return (
          <li key={step} className="flex flex-col items-center gap-2 text-center">
            <div className="flex w-full items-center">
              <span className={cn("h-px flex-1", i === 0 ? "bg-transparent" : done ? "bg-copper" : "bg-stone")} />
              <span
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-full border text-[11px] font-semibold",
                  done ? "border-copper bg-copper text-cream" : "border-stone bg-cream text-taupe",
                )}
                aria-current={i === current ? "step" : undefined}
              >
                {done ? <Check className="size-3.5" aria-hidden /> : i + 1}
              </span>
              <span
                className={cn(
                  "h-px flex-1",
                  i === ORDER_FLOW.length - 1 ? "bg-transparent" : i < current ? "bg-copper" : "bg-stone",
                )}
              />
            </div>
            <span className={cn("text-[11px] leading-tight", done ? "text-espresso" : "text-taupe")}>
              {ORDER_STATUSES[step].label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function OrderItemsList({ items }: { items: OrderItem[] }) {
  return (
    <ul className="divide-y divide-stone/60">
      {items.map((item) => (
        <li key={item.id} className="flex items-center gap-4 py-4">
          <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-ivory">
            {item.image && <Image src={item.image} alt="" fill sizes="64px" className="object-cover" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-espresso">{item.name}</p>
            <p className="text-xs text-cocoa">
              {item.size ? `${item.size} · ` : ""}Qty {item.quantity} × {formatMoney(item.unitPrice)}
            </p>
          </div>
          <p className="text-sm font-medium">{formatMoney(item.lineTotal)}</p>
        </li>
      ))}
    </ul>
  );
}

export function OrderTotals({ order }: { order: Order }) {
  return (
    <dl className="space-y-2 text-sm">
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
      <div className="border-t border-stone pt-3">
        <Row label="Total" value={formatMoney(order.total)} className="text-base font-semibold text-espresso" />
        <p className="mt-1 text-right text-xs text-taupe">Includes {formatMoney(order.gstTotal)} GST</p>
      </div>
    </dl>
  );
}

function Row({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={cn("flex justify-between gap-4 text-cocoa", className)}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export function AddressBlock({ address }: { address: Order["shippingAddress"] }) {
  return (
    <address className="text-sm leading-relaxed text-cocoa not-italic">
      <span className="font-medium text-espresso">
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
    <div className="rounded-2xl border border-copper/30 bg-copper-light/30 p-5">
      <p className="eyebrow mb-1">Payment required</p>
      <p className="font-display text-xl text-espresso">Pay by {PAYMENT_METHODS[order.paymentMethod].label}</p>
      <p className="mt-1 text-sm text-cocoa">
        Please pay within {settings.paymentWindowDays} days using your order number as the reference. We&apos;ll
        email you as soon as payment clears.
      </p>
      <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-cocoa">{k}</dt>
            <dd className={cn("font-medium text-espresso", k === "Reference" && "font-mono tracking-wide")}>{v}</dd>
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
    <ol className="relative space-y-5 border-l border-stone pl-6">
      {visible.map((e) => (
        <li key={e.id} className="relative">
          <span
            className={cn(
              "absolute top-1.5 -left-[29px] size-2.5 rounded-full ring-4 ring-cream",
              e.visibleToCustomer ? "bg-copper" : "bg-taupe",
            )}
          />
          <p className="text-sm text-espresso">{e.message}</p>
          <p className="mt-0.5 text-xs text-taupe">
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
      className="text-sm font-medium text-copper-dark underline underline-offset-4"
    >
      Track with {order.trackingCarrier ?? "Australia Post"} · {order.trackingNumber}
    </a>
  );
}
