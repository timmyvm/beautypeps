import { AlertTriangle, ArrowRight, Inbox, Newspaper, Star } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { KpiTile, RevenueChart } from "@/components/admin/ops/revenue-chart";
import { AdminPageHeader, DataTable, Panel } from "@/components/admin/ui";
import { OrderStatusBadge } from "@/components/order/order-parts";
import { formatDate, formatMoney } from "@/lib/format";
import { getDashboardData, parseRange, RANGES } from "@/lib/queries/admin-ops";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const range = parseRange((await searchParams).range);
  const data = await getDashboardData(range);

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description={`Store performance since ${formatDate(data.start)}.`}
        actions={
          <div className="flex rounded-full border border-stone bg-cream p-1" role="group" aria-label="Date range">
            {RANGES.map((r) => (
              <Link
                key={r}
                href={r === 30 ? "/admin" : `/admin?range=${r}`}
                aria-current={r === range ? "true" : undefined}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                  r === range ? "bg-espresso text-cream" : "text-muted hover:text-espresso",
                )}
              >
                Last {r} days
              </Link>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <KpiTile label="Revenue" value={formatMoney(data.revenue)} hint={`${data.paidCount} paid orders`} />
        <KpiTile label="Orders placed" value={String(data.ordersPlaced)} hint="All statuses" href="/admin/orders" />
        <KpiTile label="Average order" value={formatMoney(data.aov)} hint="Paid orders" />
        <KpiTile label="New customers" value={String(data.newCustomers)} hint="Accounts created" href="/admin/customers" />
        <KpiTile
          label="Awaiting payment"
          value={String(data.awaitingPayment.count)}
          hint={`${formatMoney(data.awaitingPayment.value)} outstanding`}
          href="/admin/orders?status=pending_payment"
          tone={data.awaitingPayment.count ? "attention" : "default"}
        />
        <KpiTile
          label="To fulfil"
          value={String(data.toFulfil)}
          hint="Paid or packing"
          href="/admin/orders?status=paid"
          tone={data.toFulfil ? "attention" : "default"}
        />
      </div>

      <Panel title={`Revenue by day — last ${range} days`} className="mt-6" bodyClassName="p-5 pt-8">
        <RevenueChart data={data.series} />
      </Panel>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Panel
          title="Recent orders"
          actions={
            <Link href="/admin/orders" className="flex items-center gap-1 text-[13px] text-copper-dark hover:underline">
              All orders <ArrowRight className="size-3.5" />
            </Link>
          }
          bodyClassName="p-0"
        >
          {data.recentOrders.length === 0 ? (
            <p className="p-5 text-sm text-muted">No orders yet.</p>
          ) : (
            <DataTable className="rounded-none border-0">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th className="text-right">Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <Link href={`/admin/orders/${o.id}`} className="font-medium text-espresso hover:text-copper-dark">
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td className="max-w-48 truncate text-muted">
                      {o.shippingAddress.firstName} {o.shippingAddress.lastName}
                    </td>
                    <td className="whitespace-nowrap text-muted">{formatDate(o.createdAt)}</td>
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

        <div className="flex flex-col gap-6">
          <Panel title="Needs attention" bodyClassName="p-2">
            <ul>
              <AttentionRow
                href="/admin/reviews"
                icon={<Star className="size-4" />}
                label="Reviews awaiting moderation"
                count={data.pendingReviews}
              />
              <AttentionRow
                href="/admin/messages"
                icon={<Inbox className="size-4" />}
                label="New customer messages"
                count={data.newMessages}
              />
              <AttentionRow
                href="/admin/subscribers"
                icon={<Newspaper className="size-4" />}
                label={`Newsletter subscribers (${data.subscribers.total} total)`}
                count={data.subscribers.new}
                countLabel="new"
              />
            </ul>
          </Panel>

          <Panel title="Low stock" bodyClassName="p-0">
            {data.lowStock.length === 0 ? (
              <p className="p-5 text-sm text-muted">All active products are above their stock threshold.</p>
            ) : (
              <ul className="divide-y divide-stone/50">
                {data.lowStock.map((p) => (
                  <li key={p.id}>
                    <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-ivory/50">
                      <span className="relative size-9 shrink-0 overflow-hidden rounded-lg bg-ivory">
                        <Image src={p.image} alt="" fill sizes="36px" className="object-cover" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-espresso">{p.name}</span>
                        <span className="block text-[13px] text-taupe">{p.sku}</span>
                      </span>
                      <span
                        className={cn(
                          "flex items-center gap-1 text-sm font-semibold tabular-nums",
                          p.stock === 0 ? "text-danger" : "text-amber",
                        )}
                      >
                        <AlertTriangle className="size-3.5" aria-hidden />
                        {p.stock === 0 ? "Sold out" : `${p.stock} left`}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>

      <Panel title={`Top products — last ${range} days`} className="mt-6" bodyClassName="p-0">
        {data.topProducts.length === 0 ? (
          <p className="p-5 text-sm text-muted">No paid sales in this period.</p>
        ) : (
          <DataTable className="rounded-none border-0">
            <thead>
              <tr>
                <th>Product</th>
                <th className="text-right">Units</th>
                <th className="text-right">Revenue</th>
                <th className="w-1/3">Share of units</th>
              </tr>
            </thead>
            <tbody>
              {data.topProducts.map((p) => {
                const maxUnits = data.topProducts[0].units || 1;
                return (
                  <tr key={`${p.productId}-${p.name}`}>
                    <td>
                      <span className="flex items-center gap-3">
                        <span className="relative size-8 shrink-0 overflow-hidden rounded-lg bg-ivory">
                          {p.image && <Image src={p.image} alt="" fill sizes="32px" className="object-cover" />}
                        </span>
                        {p.productId ? (
                          <Link href={`/admin/products/${p.productId}`} className="text-espresso hover:text-copper-dark">
                            {p.name}
                          </Link>
                        ) : (
                          p.name
                        )}
                      </span>
                    </td>
                    <td className="text-right tabular-nums">{p.units}</td>
                    <td className="text-right tabular-nums">{formatMoney(p.revenue)}</td>
                    <td>
                      <span className="block h-2 rounded-full bg-sand" aria-hidden>
                        <span
                          className="block h-2 rounded-full bg-copper"
                          style={{ width: `${Math.max(4, (p.units / maxUnits) * 100)}%` }}
                        />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </DataTable>
        )}
      </Panel>
    </>
  );
}

function AttentionRow({
  href,
  icon,
  label,
  count,
  countLabel,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  count: number;
  countLabel?: string;
}) {
  return (
    <li>
      <Link href={href} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm hover:bg-ivory/60">
        <span className="grid size-8 place-items-center rounded-lg bg-ivory text-copper-dark">{icon}</span>
        <span className="flex-1 text-espresso">{label}</span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[13px] font-semibold tabular-nums",
            count > 0 ? "bg-copper-light text-copper-dark" : "bg-sand text-taupe",
          )}
        >
          {count}
          {countLabel ? ` ${countLabel}` : ""}
        </span>
      </Link>
    </li>
  );
}
