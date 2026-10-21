import { Download, Search, Truck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader, DataTable, FilterTabs, Pagination } from "@/components/admin/ui";
import { OrderStatusBadge } from "@/components/order/order-parts";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { EmptyState } from "@/components/ui/misc";
import { ORDER_STATUSES, PAYMENT_METHODS } from "@/lib/constants";
import type { OrderStatus } from "@/lib/db/schema";
import { formatDate, formatMoney } from "@/lib/format";
import { listOrders, parsePage } from "@/lib/queries/admin-ops";

export const metadata: Metadata = { title: "Orders" };

type Params = { status?: string; q?: string; from?: string; to?: string; page?: string };

const TAB_ORDER: OrderStatus[] = ["pending_payment", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"];

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams;
  const page = parsePage(sp.page);
  const { rows, total, pageCount, statusCounts, itemCounts } = await listOrders({ ...sp, page });

  const filterQs = new URLSearchParams();
  for (const k of ["status", "q", "from", "to"] as const) if (sp[k]) filterQs.set(k, sp[k]!);
  const exportHref = `/admin/orders/export${filterQs.size ? `?${filterQs}` : ""}`;
  const hasFilters = !!(sp.q || sp.from || sp.to);

  return (
    <>
      <AdminPageHeader
        title="Orders"
        description={`${total} ${total === 1 ? "order" : "orders"}${sp.status ? ` · ${ORDER_STATUSES[sp.status as OrderStatus]?.label ?? ""}` : ""}${hasFilters ? " matching your filters" : ""}.`}
        actions={
          <>
            <Link href="/admin/orders/auspost" className={buttonClasses({ variant: "outline", size: "sm", className: "bg-surface-2 hover:bg-stone" })}>
              <Truck className="size-4" /> Australia Post CSV
            </Link>
            <a href={exportHref} className={buttonClasses({ variant: "outline", size: "sm", className: "bg-surface-2 hover:bg-stone" })}>
              <Download className="size-4" /> Export CSV
            </a>
          </>
        }
      />

      <FilterTabs
        basePath="/admin/orders"
        param="status"
        current={sp.status}
        searchParams={sp}
        options={[
          { value: "", label: "All", count: statusCounts.all ?? 0 },
          ...TAB_ORDER.map((s) => ({ value: s, label: ORDER_STATUSES[s].label, count: statusCounts[s] ?? 0 })),
        ]}
      />

      <form className="mb-5 flex flex-wrap items-end gap-3" role="search">
        {sp.status && <input type="hidden" name="status" value={sp.status} />}
        <label className="relative min-w-60 flex-1">
          <span className="sr-only">Search orders</span>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-taupe" aria-hidden />
          <Input name="q" defaultValue={sp.q} placeholder="Order #, email, name, tracking…" className="pl-10" />
        </label>
        <label className="text-[13px] text-muted">
          <span className="mb-1 block">From</span>
          <Input type="date" name="from" defaultValue={sp.from} className="w-40" />
        </label>
        <label className="text-[13px] text-muted">
          <span className="mb-1 block">To</span>
          <Input type="date" name="to" defaultValue={sp.to} className="w-40" />
        </label>
        <button type="submit" className={buttonClasses({ variant: "dark", size: "sm" })}>
          Filter
        </button>
        {hasFilters && (
          <Link
            href={sp.status ? `/admin/orders?status=${sp.status}` : "/admin/orders"}
            className="px-2 text-[13px] text-muted underline underline-offset-4 hover:text-espresso"
          >
            Clear
          </Link>
        )}
      </form>

      {rows.length === 0 ? (
        <EmptyState
          title="No orders found"
          description={hasFilters || sp.status ? "Try a different status or clear your search." : "Orders will appear here as customers check out."}
        />
      ) : (
        <DataTable>
          <thead>
            <tr>
              <th>Order</th>
              <th>Date</th>
              <th>Customer</th>
              <th className="text-right">Items</th>
              <th className="text-right">Total</th>
              <th>Payment</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id}>
                <td>
                  <Link href={`/admin/orders/${o.id}`} className="font-medium text-espresso hover:text-copper-dark">
                    {o.orderNumber}
                  </Link>
                  {!o.userId && <span className="ml-2 text-[13px] text-taupe">Guest</span>}
                </td>
                <td className="whitespace-nowrap text-muted">{formatDate(o.createdAt)}</td>
                <td className="max-w-64">
                  <span className="block truncate text-espresso">
                    {o.shippingAddress.firstName} {o.shippingAddress.lastName}
                  </span>
                  <span className="block truncate text-[13px] text-taupe">{o.email}</span>
                </td>
                <td className="text-right tabular-nums">{itemCounts.get(o.id) ?? 0}</td>
                <td className="text-right font-medium tabular-nums">{formatMoney(o.total)}</td>
                <td>
                  <span className="block text-[13px] text-muted">{PAYMENT_METHODS[o.paymentMethod].label}</span>
                  <Badge
                    tone={o.paymentStatus === "paid" ? "sage" : o.paymentStatus === "refunded" ? "danger" : "amber"}
                    className="mt-1"
                  >
                    {o.paymentStatus === "paid" ? "Paid" : o.paymentStatus === "refunded" ? "Refunded" : "Unpaid"}
                  </Badge>
                </td>
                <td>
                  <OrderStatusBadge status={o.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      )}

      <Pagination page={page} pageCount={pageCount} basePath="/admin/orders" searchParams={sp} />
    </>
  );
}
