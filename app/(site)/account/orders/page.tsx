import { Package } from "lucide-react";
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
          icon={<Package className="size-8" />}
          title="No orders yet"
          description="When you place an order it will show up here, along with payment and shipping updates."
          action={<ButtonLink href="/shop">Shop peptides</ButtonLink>}
        />
      ) : (
        <ul className="space-y-4">
          {data.orders.map((o) => (
            <li key={o.id}>
              <Link
                href={`/account/orders/${o.orderNumber}`}
                className="block rounded-2xl border border-surface-2 bg-white p-5 transition-colors hover:border-taupe sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-ink">{o.orderNumber}</p>
                    <p className="mt-1 text-[13px] text-muted">
                      Placed {formatDate(o.createdAt)} · {pluralize(o.itemCount, "item")}
                    </p>
                  </div>
                  <OrderStatusBadge status={o.status} />
                </div>
                <div className="mt-4 flex items-end justify-between gap-4">
                  <div className="flex -space-x-3">
                    {o.previews.map((p, i) => (
                      <div
                        key={i}
                        className="relative size-14 overflow-hidden rounded-xl border-2 border-cream bg-surface"
                        title={p.name}
                      >
                        {p.image && <Image src={p.image} alt={p.name} fill sizes="56px" className="object-cover" />}
                      </div>
                    ))}
                    {o.itemCount > o.previews.length && o.previews.length >= 4 && (
                      <div className="grid size-14 place-items-center rounded-xl border-2 border-cream bg-surface-2 text-[13px] text-muted">
                        +
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] text-muted">Total</p>
                    <p className="text-base font-medium text-ink">{formatMoney(o.total)}</p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Pager page={data.page} pageCount={data.pageCount} basePath="/account/orders" />
    </div>
  );
}
