import { asc, eq, inArray } from "drizzle-orm";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ActionForm } from "@/components/admin/ops/action-form";
import { OpsSubmit } from "@/components/admin/ops/buttons";
import { SalesCard } from "@/components/admin/ops/revenue-chart";
import { Toaster } from "@/components/admin/ops/toast";
import { AdminPageHeader } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/button";
import { PAYMENT_METHODS } from "@/lib/constants";
import { updateOrderStatusAction } from "@/lib/actions/admin/orders";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { formatDate, formatMoney, pluralize } from "@/lib/format";
import { getDashboardData, parseRange, RANGES } from "@/lib/queries/admin-ops";
import { getSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Overview" };

const DAY = 86_400_000;
const QUEUE_ROWS = 5;

function daysSince(d: Date | null, now: number) {
  return d ? Math.max(0, Math.floor((now - d.getTime()) / DAY)) : 0;
}

function waited(days: number) {
  return days === 0 ? "today" : days === 1 ? "1 day" : `${days} days`;
}

export default async function AdminOverview({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const range = parseRange((await searchParams).range);
  const [data, transfers, toPack, settings] = await Promise.all([
    getDashboardData(range),
    db.query.orders.findMany({
      where: eq(orders.status, "pending_payment"),
      orderBy: asc(orders.createdAt),
      limit: QUEUE_ROWS,
    }),
    db.query.orders.findMany({
      where: inArray(orders.status, ["paid", "processing"]),
      orderBy: asc(orders.paidAt),
      limit: QUEUE_ROWS,
      with: { items: { columns: { quantity: true } } },
    }),
    getSettings(),
  ]);
  // eslint-disable-next-line react-hooks/purity -- server component, rendered once per request
  const now = Date.now();

  const finding = [
    data.toFulfil ? `${pluralize(data.toFulfil, "paid order")} to pack` : "Nothing to pack",
    data.awaitingPayment.count
      ? `${pluralize(data.awaitingPayment.count, "transfer")} to match (${formatMoney(data.awaitingPayment.value)})`
      : "no transfers to match",
  ].join(" and ");

  const rangeControl = (
    <div className="inline-flex border border-surface-2" role="group" aria-label="Period">
      {RANGES.map((r) => (
        <Link
          key={r}
          href={r === 30 ? "/admin" : `/admin?range=${r}`}
          aria-current={r === range ? "true" : undefined}
          className={cn(
            "flex h-8 items-center px-3 text-[13px] transition-colors",
            r === range ? "bg-surface-2 font-medium text-ink" : "text-muted hover:text-ink",
          )}
        >
          {r} days
        </Link>
      ))}
    </div>
  );

  const topUnits = data.topProducts[0]?.units || 1;

  return (
    <>
      <Toaster />
      <AdminPageHeader
        title="Overview"
        description={`${finding}.`}
        actions={
          <ButtonLink href="/admin/orders/auspost" variant="dark" size="sm">
            Create Australia Post labels
          </ButtonLink>
        }
      />

      {/* The two queues share one ledger so their rows read across, whatever their counts */}
      <div className="grid grid-cols-1 divide-y divide-surface-2 border border-surface-2 bg-white lg:grid-cols-2 lg:divide-x lg:divide-y-0">
        <Queue
          title="Transfers to match"
          meta={data.awaitingPayment.count ? `${data.awaitingPayment.count} waiting` : undefined}
          more={
            data.awaitingPayment.count > transfers.length
              ? { href: "/admin/orders?status=pending_payment", label: `All ${data.awaitingPayment.count} awaiting payment` }
              : undefined
          }
          empty="No transfers waiting. Every order placed so far has been paid."
        >
          {transfers.map((o) => {
            const days = daysSince(o.createdAt, now);
            const late = days >= settings.paymentWindowDays;
            return (
              <li key={o.id} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-4 px-5 py-3">
                <div className="min-w-0">
                  <Link href={`/admin/orders/${o.id}`} className="text-[14px] font-medium text-ink hover:underline">
                    {o.orderNumber}
                  </Link>
                  <p className="text-[13px] text-muted sm:truncate">
                    {o.shippingAddress.firstName} {o.shippingAddress.lastName} · {PAYMENT_METHODS[o.paymentMethod].label} ·{" "}
                    <span className={cn(late && "text-amber")}>{late ? `${waited(days)}, past the window` : waited(days)}</span>
                  </p>
                </div>
                <span className="text-right text-[14px] font-medium text-ink tabular-nums">{formatMoney(o.total)}</span>
                <ActionForm action={updateOrderStatusAction}>
                  <input type="hidden" name="orderId" value={o.id} />
                  <input type="hidden" name="to" value="paid" />
                  <input type="hidden" name="notify" value="on" />
                  <OpsSubmit variant="outline" className="bg-surface-2 hover:bg-stone">
                    Mark paid<span className="sr-only"> {o.orderNumber}</span>
                  </OpsSubmit>
                </ActionForm>
              </li>
            );
          })}
        </Queue>

        <Queue
          title="To pack"
          meta={data.toFulfil ? `${data.toFulfil} to pack` : undefined}
          more={
            data.toFulfil > toPack.length
              ? { href: "/admin/orders?status=paid", label: `All ${data.toFulfil} paid orders` }
              : undefined
          }
          empty="Nothing to pack. Orders land here as soon as they're marked paid."
        >
          {toPack.map((o) => {
            const units = o.items.reduce((s, i) => s + i.quantity, 0);
            const paidDays = daysSince(o.paidAt, now);
            return (
              <li key={o.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3">
                <div className="min-w-0">
                  <Link href={`/admin/orders/${o.id}`} className="text-[14px] font-medium text-ink hover:underline">
                    {o.orderNumber}
                  </Link>
                  <p className="text-[13px] text-muted sm:truncate">
                    {o.shippingAddress.firstName} {o.shippingAddress.lastName} · {pluralize(units, "item")} ·{" "}
                    {o.shippingMethod === "express" ? <span className="text-ink">Express</span> : "Standard"} ·{" "}
                    {paidDays === 0 ? "paid today" : `paid ${waited(paidDays)} ago`}
                  </p>
                </div>
                <Link
                  href={`/admin/orders/${o.id}/packing-slip`}
                  className="flex h-10 items-center text-[14px] text-ink underline-offset-4 hover:underline"
                >
                  Packing slip<span className="sr-only"> for {o.orderNumber}</span>
                </Link>
              </li>
            );
          })}
        </Queue>
      </div>

      <div className="mt-6 grid grid-cols-1 divide-y divide-surface-2 border border-surface-2 bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <WaitingLink href="/admin/reviews" label="Reviews" figure={data.pendingReviews ? `${data.pendingReviews} waiting` : "None waiting"} />
        <WaitingLink href="/admin/messages" label="Messages" figure={data.newMessages ? `${data.newMessages} unread` : "None unread"} />
        <WaitingLink
          href="/admin/subscribers"
          label="Subscribers"
          figure={`${data.subscribers.total}${data.subscribers.new ? `, ${data.subscribers.new} new` : ""}`}
        />
      </div>

      <div className="mt-6">
        <SalesCard
          data={data.series}
          totals={{ revenue: data.revenue, orders: data.paidCount, aov: data.aov }}
          rangeControl={rangeControl}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 divide-y divide-surface-2 border border-surface-2 bg-white lg:grid-cols-2 lg:divide-x lg:divide-y-0">
        <section className="flex flex-col">
          <h2 className="px-5 pt-4 pb-2 text-[16px] font-semibold text-ink">Running low</h2>
          {data.lowStock.length === 0 ? (
            <p className="px-5 pb-5 text-[14px] text-muted">Every active product is above its reorder point.</p>
          ) : (
            <ul className="divide-y divide-surface">
              {data.lowStock.slice(0, QUEUE_ROWS).map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 px-5 py-2.5 hover:bg-surface/60">
                    <span className="relative size-9 shrink-0 overflow-hidden bg-surface">
                      <Image src={p.image} alt="" fill sizes="36px" className="object-cover" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] text-ink">{p.name}</span>
                      <span className="block text-[13px] text-muted">
                        {p.sku} · reorder at {p.threshold}
                      </span>
                    </span>
                    <span className={cn("text-[14px] font-medium tabular-nums", p.stock === 0 ? "text-danger" : "text-ink")}>
                      {p.stock === 0 ? "Sold out" : `${p.stock} left`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <MoreLink href="/admin/products" label="All products" />
        </section>

        <section className="flex flex-col">
          <h2 className="px-5 pt-4 pb-2 text-[16px] font-semibold text-ink">Selling most</h2>
          {data.topProducts.length === 0 ? (
            <p className="px-5 pb-5 text-[14px] text-muted">No paid sales in the last {range} days.</p>
          ) : (
            <ul className="divide-y divide-surface">
              {data.topProducts.slice(0, QUEUE_ROWS).map((p, i) => (
                <li key={`${p.productId}-${p.name}`} className="px-5 py-2.5">
                  <div className="flex items-baseline gap-3">
                    <span className="min-w-0 flex-1 truncate text-[14px] text-ink">
                      {p.productId ? (
                        <Link href={`/admin/products/${p.productId}`} className="hover:underline">
                          {p.name}
                        </Link>
                      ) : (
                        p.name
                      )}
                    </span>
                    <span className="text-[13px] text-muted tabular-nums">{pluralize(p.units, "unit")}</span>
                    <span className="w-20 text-right text-[14px] text-ink tabular-nums">{formatMoney(p.revenue)}</span>
                  </div>
                  <span className="mt-1.5 block h-1 bg-surface" aria-hidden>
                    <span
                      className={cn("block h-1", i === 0 ? "bg-ink" : "bg-taupe/60")}
                      style={{ width: `${Math.max(3, (p.units / topUnits) * 100)}%` }}
                    />
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-auto px-5 pt-3 pb-4 text-[13px] text-muted">Paid orders since {formatDate(data.start)}.</p>
        </section>
      </div>
    </>
  );
}

function Queue({
  title,
  meta,
  more,
  empty,
  children,
}: {
  title: string;
  meta?: string;
  more?: { href: string; label: string };
  empty: string;
  children: React.ReactNode[];
}) {
  return (
    <section className="flex flex-col">
      <div className="flex items-baseline justify-between gap-4 px-5 pt-4 pb-2">
        <h2 className="text-[16px] font-semibold text-ink">{title}</h2>
        {meta && <span className="text-[13px] text-muted tabular-nums">{meta}</span>}
      </div>
      {children.length === 0 ? (
        <p className="px-5 pb-5 text-[14px] text-muted">{empty}</p>
      ) : (
        <ul className="divide-y divide-surface">{children}</ul>
      )}
      {more && <MoreLink href={more.href} label={more.label} />}
    </section>
  );
}

function MoreLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="mt-auto block border-t border-surface px-5 py-3 text-[14px] text-ink hover:bg-surface/60">
      {label} →
    </Link>
  );
}

function WaitingLink({ href, label, figure }: { href: string; label: string; figure: string }) {
  return (
    <Link href={href} className="flex items-baseline justify-between gap-3 px-5 py-3.5 hover:bg-surface/60">
      <span className="text-[14px] text-ink">{label}</span>
      <span className="text-right text-[14px] text-muted tabular-nums">{figure}</span>
    </Link>
  );
}
