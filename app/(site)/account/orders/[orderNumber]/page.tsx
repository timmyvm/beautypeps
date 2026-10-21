import { LifeBuoy, PenLine, Truck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AccountHeading } from "@/components/account/bits";
import { BuyAgainButton, CancelOrderButton } from "@/components/account/order-actions";
import {
  AddressBlock,
  OrderItemsList,
  OrderProgress,
  OrderStatusBadge,
  OrderTimeline,
  OrderTotals,
  PaymentInstructions,
  TrackingLink,
} from "@/components/order/order-parts";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/misc";
import { requireUser } from "@/lib/auth/session";
import { ORDER_STATUSES, PAYMENT_METHODS, SHIPPING_METHOD_LABELS } from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/format";
import { getUserOrder } from "@/lib/queries/account";
import { getSettings } from "@/lib/settings";

type Props = { params: Promise<{ orderNumber: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orderNumber } = await params;
  return { title: `Order ${decodeURIComponent(orderNumber)}` };
}

export default async function AccountOrderPage({ params }: Props) {
  const { orderNumber: raw } = await params;
  const orderNumber = decodeURIComponent(raw);
  const user = await requireUser(`/account/orders/${raw}`);
  const [order, settings] = await Promise.all([getUserOrder(user.id, orderNumber), getSettings()]);
  if (!order) notFound();

  const status = ORDER_STATUSES[order.status];
  const reviewable = order.status === "delivered" ? order.items.filter((i) => i.productSlug) : [];
  const buyAgainIds = [...new Set(order.items.map((i) => i.productId).filter((id): id is string => !!id))];
  const latestDate =
    order.deliveredAt ?? order.shippedAt ?? order.paidAt ?? order.cancelledAt ?? order.createdAt;

  return (
    <div>
      <AccountHeading
        back={{ href: "/account/orders", label: "All orders" }}
        title={
          <span className="flex flex-wrap items-center gap-3">
            Order <span className="text-2xl md:text-3xl">{order.orderNumber}</span>
          </span>
        }
        description={`Placed ${formatDateTime(order.createdAt)}`}
        action={<OrderStatusBadge status={order.status} />}
      />

      <Card className="mb-6">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-lg font-semibold text-ink">{status.label}</p>
          <p className="text-[13px] text-muted">Updated {formatDate(latestDate)}</p>
        </div>
        <OrderProgress status={order.status} />
        {order.status !== "cancelled" && order.status !== "refunded" && (
          <p className="mt-5 text-sm text-muted">{status.description}</p>
        )}
        {order.status === "shipped" || order.status === "delivered" ? (
          <div className="mt-3 flex items-center gap-2">
            <Truck className="size-4 text-copper" aria-hidden />
            {order.trackingNumber ? (
              <TrackingLink order={order} />
            ) : (
              <span className="text-sm text-muted">Tracking details will appear here shortly.</span>
            )}
          </div>
        ) : null}
      </Card>

      {order.status === "pending_payment" && (
        <div className="mb-6 space-y-4">
          <PaymentInstructions order={order} settings={settings} />
          <CancelOrderButton orderNumber={order.orderNumber} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-ink">Items</h2>
            <OrderItemsList items={order.items} />
            <div className="mt-2 border-t border-surface-2 pt-5">
              <OrderTotals order={order} />
            </div>
          </Card>

          <div className="flex flex-wrap items-start gap-3">
            <BuyAgainButton productIds={buyAgainIds} />
            <Link
              href={`/contact?order=${encodeURIComponent(order.orderNumber)}`}
              className={buttonClasses({ variant: "outline" })}
            >
              <LifeBuoy className="size-4" aria-hidden /> Need help?
            </Link>
          </div>

          {reviewable.length > 0 && (
            <Card>
              <h2 className="text-lg font-semibold text-ink">How are you finding them?</h2>
              <p className="mt-1 text-sm text-muted">
                Your review helps others choose the right peptide — it takes a minute.
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {reviewable.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/products/${item.productSlug}#reviews`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-stone px-4 py-2 text-sm text-ink transition-colors hover:border-copper hover:text-copper-dark"
                    >
                      <PenLine className="size-3.5" aria-hidden /> Review {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="mb-3 text-sm font-semibold text-ink">Shipping to</h2>
            <AddressBlock address={order.shippingAddress} />
          </Card>
          <Card>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-[13px] text-muted">Delivery</dt>
                <dd className="text-ink">{SHIPPING_METHOD_LABELS[order.shippingMethod]}</dd>
              </div>
              <div>
                <dt className="text-[13px] text-muted">Payment</dt>
                <dd className="text-ink">
                  {PAYMENT_METHODS[order.paymentMethod].label} ·{" "}
                  {order.paymentStatus === "paid"
                    ? `paid ${formatDate(order.paidAt)}`
                    : order.paymentStatus === "refunded"
                      ? "refunded"
                      : order.status === "cancelled"
                        ? "not paid"
                        : "awaiting payment"}
                </dd>
              </div>
              <div>
                <dt className="text-[13px] text-muted">Confirmation sent to</dt>
                <dd className="break-all text-ink">{order.email}</dd>
              </div>
              {order.customerNote && (
                <div>
                  <dt className="text-[13px] text-muted">Your note</dt>
                  <dd className="text-ink">{order.customerNote}</dd>
                </div>
              )}
            </dl>
          </Card>
          {order.events.some((e) => e.visibleToCustomer) && (
            <Card>
              <h2 className="mb-4 text-sm font-semibold text-ink">Order updates</h2>
              <OrderTimeline events={order.events} />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
