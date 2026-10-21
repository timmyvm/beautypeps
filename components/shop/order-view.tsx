import Link from "next/link";
import { SpecimenTile, toneFor } from "@/components/product/product-card";
import { ORDER_FLOW, ORDER_STATUSES, PAYMENT_METHODS, SHIPPING_METHOD_LABELS } from "@/lib/constants";
import type { Order, OrderEvent, OrderItem } from "@/lib/db/schema";
import { formatDateTime, formatMoney } from "@/lib/format";
import type { StoreSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";
import { CopyButton } from "./copy-button";

/*
 * Order views for public pages (confirmation, guest tracking). Same data as components/order/order-parts,
 * set in the page's house style: tone steps instead of lines, words instead of pills, five type steps.
 */

export function OrderProgressBar({ status }: { status: Order["status"] }) {
  if (status === "cancelled" || status === "refunded") {
    return <p className="bg-surface px-5 py-4 text-body">{ORDER_STATUSES[status].description}</p>;
  }
  const current = ORDER_FLOW.indexOf(status);
  return (
    <ol className="grid grid-cols-5 gap-1.5" aria-label="Order progress">
      {ORDER_FLOW.map((step, i) => (
        <li key={step} aria-current={i === current ? "step" : undefined}>
          <span className={cn("block h-1.5", i <= current ? "bg-accent" : "bg-surface-2")} />
          <span className={cn("mt-2 block text-small", i <= current ? "text-ink" : "text-muted")}>
            {ORDER_STATUSES[step].label}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function OrderLines({ items }: { items: OrderItem[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id} className="flex items-center gap-4 bg-surface p-3">
          <div className="w-16 shrink-0">
            {item.image ? (
              <SpecimenTile
                product={{ slug: item.sku, name: item.name, image: item.image }}
                tone={toneFor(item.name)}
                sizes="64px"
                className="aspect-[4/5] w-full"
              />
            ) : (
              <div className="aspect-[4/5] w-full bg-surface-2" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-body font-medium text-ink">{item.name}</p>
            <p className="text-small text-muted">
              {item.size ? `${item.size}, ` : ""}
              {item.quantity} × {formatMoney(item.unitPrice)}
            </p>
          </div>
          <p className="tabular text-body text-ink">{formatMoney(item.lineTotal)}</p>
        </li>
      ))}
    </ul>
  );
}

export function OrderSums({ order }: { order: Order }) {
  const rows: [string, string, string?][] = [["Subtotal", formatMoney(order.subtotal)]];
  if (order.discountTotal > 0)
    rows.push([`Discount${order.discountCode ? ` (${order.discountCode})` : ""}`, `−${formatMoney(order.discountTotal)}`, "text-sage"]);
  rows.push([SHIPPING_METHOD_LABELS[order.shippingMethod], order.shippingTotal ? formatMoney(order.shippingTotal) : "Free"]);
  return (
    <dl className="tabular text-body">
      {rows.map(([k, v, cls]) => (
        <div key={k} className={cn("flex justify-between gap-4 py-1", cls)}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
      <div className="mt-3 flex justify-between gap-4 bg-surface-2 px-3 py-3 font-medium">
        <dt>Total</dt>
        <dd>{formatMoney(order.total)}</dd>
      </div>
      <p className="mt-2 text-right text-small text-muted">Includes {formatMoney(order.gstTotal)} GST</p>
    </dl>
  );
}

export function PaymentPanel({ order, settings, copy = false }: { order: Order; settings: StoreSettings; copy?: boolean }) {
  const isPayId = order.paymentMethod === "payid";
  const rows: [string, string, string?][] = isPayId
    ? [
        ["PayID", settings.payId, settings.payId],
        ["Name", settings.bankAccountName],
        ["Amount", formatMoney(order.total), (order.total / 100).toFixed(2)],
        ["Reference", order.orderNumber, order.orderNumber],
      ]
    : [
        ["Account name", settings.bankAccountName],
        ["BSB", settings.bankBsb, settings.bankBsb],
        ["Account number", settings.bankAccountNumber, settings.bankAccountNumber],
        ["Amount", formatMoney(order.total), (order.total / 100).toFixed(2)],
        ["Reference", order.orderNumber, order.orderNumber],
      ];
  return (
    <section className="bg-field-frost p-6 md:p-8" aria-labelledby="pay-heading">
      <h2 id="pay-heading" className="text-lead font-medium">
        Pay by {PAYMENT_METHODS[order.paymentMethod].label}
      </h2>
      <p className="mt-2 max-w-[55ch] text-body">
        Please pay within {settings.paymentWindowDays} days and use your order number as the reference. We email you
        as soon as it clears.
      </p>
      <dl className="tabular mt-6 grid gap-x-8 gap-y-3 text-body sm:grid-cols-[auto_1fr]">
        {rows.map(([k, v, copyValue]) => (
          <div key={k} className="contents">
            <dt className="text-muted">{k}</dt>
            <dd className="flex flex-wrap items-center gap-x-4 gap-y-1 font-medium">
              {v}
              {copy && copyValue ? <CopyButton value={copyValue} label={`Copy ${k.toLowerCase()}`} /> : null}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function OrderHistory({ events }: { events: OrderEvent[] }) {
  const visible = events
    .filter((e) => e.visibleToCustomer)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  if (visible.length === 0) return null;
  return (
    <ol className="space-y-4">
      {visible.map((e) => (
        <li key={e.id}>
          <p className="text-body">{e.message}</p>
          <p className="text-small text-muted">{formatDateTime(e.createdAt)}</p>
        </li>
      ))}
    </ol>
  );
}

export function ShipTo({ address, method }: { address: Order["shippingAddress"]; method?: Order["shippingMethod"] }) {
  return (
    <address className="text-body not-italic">
      {address.firstName} {address.lastName}
      <br />
      {address.company && (
        <>
          {address.company}
          <br />
        </>
      )}
      {address.line1}
      {address.line2 ? `, ${address.line2}` : ""}
      <br />
      {address.suburb} {address.state} {address.postcode}
      {method && <span className="mt-2 block text-small text-muted">{SHIPPING_METHOD_LABELS[method]}</span>}
    </address>
  );
}

export function ParcelLink({ order }: { order: Pick<Order, "trackingNumber" | "trackingCarrier"> }) {
  if (!order.trackingNumber) return null;
  return (
    <Link
      href={`https://auspost.com.au/mypost/track/details/${encodeURIComponent(order.trackingNumber)}`}
      target="_blank"
      rel="noreferrer"
      className="text-body text-accent underline underline-offset-4"
    >
      Track the parcel with {order.trackingCarrier ?? "Australia Post"} ({order.trackingNumber})
    </Link>
  );
}
