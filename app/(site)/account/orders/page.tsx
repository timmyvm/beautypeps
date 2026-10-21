import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AccountHeading, Pager } from "@/components/account/bits";
import { OrderStatusBadge } from "@/components/order/order-parts";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { requireUser } from "@/lib/auth/session";
import { formatDate, formatMoney, pluralize } from "@/lib/format";
import { getUserOrders } from "@/lib/queries/account";

export const metadata: Metadata = { title: "Orders" };

export default async function AccountOrdersPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams;
  const user = await requireUser("/account/orders");
  const data = await getUserOrders(user.id, Number(page) || 1);

  return (
    <div>
      <AccountHeading
        title="Orders"
        description={
          data.total > 0
            ? `${pluralize(data.total, "order")} placed with Beauty Peps.`
            : "Your order history will appear here."
        }
      />

      {data.orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="When you place an order it will show up here, along with payment and shipping updates."
          action={<ButtonLink href="/shop">Shop peptides</ButtonLink>}
        />
      ) : (
        <ul className="divide-y divide-white bg-surface">
          {data.orders.map((o) => (
            <li key={o.id}>
              <Link
                href={`/account/orders/${o.orderNumber}`}
                className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-4 py-4 transition-colors hover:bg-surface-2/60 sm:grid-cols-[auto_minmax(0,1fr)_auto_7rem] sm:px-6"
              >
                <div className="flex -space-x-3">
                  {o.previews.slice(0, 3).map((p, i) => (
                    <div key={i} className="relative size-12 overflow-hidden border-2 border-surface bg-white" title={p.name}>
                      {p.image && <Image src={p.image} alt={p.name} fill sizes="48px" className="object-cover" />}
                    </div>
                  ))}
                </div>
                <div className="min-w-0">
                  <p className="text-[15px] font-medium text-ink">{o.orderNumber}</p>
                  <p className="text-[14px] text-muted">
                    {formatDate(o.createdAt)} · {pluralize(o.itemCount, "item")}
                  </p>
                </div>
                <OrderStatusBadge status={o.status} />
                <p className="col-span-3 text-right text-[15px] font-medium text-ink tabular-nums sm:col-span-1">{formatMoney(o.total)}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Pager page={data.page} pageCount={data.pageCount} basePath="/account/orders" />
    </div>
  );
}
