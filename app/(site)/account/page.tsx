import type { Metadata } from "next";
import Link from "next/link";
import { AccountHeading, Banner } from "@/components/account/bits";
import { AddressBlock, OrderStatusBadge, PaymentInstructions, TrackingLink } from "@/components/order/order-parts";
import { ButtonLink } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/session";
import { formatDate, formatMoney, pluralize } from "@/lib/format";
import { getUserAddresses, getUserOrders, getUserStats } from "@/lib/queries/account";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Overview" };

const DAY = 86_400_000;

function greeting() {
  const hour = Number(
    new Intl.DateTimeFormat("en-AU", { hour: "numeric", hourCycle: "h23", timeZone: "Australia/Melbourne" }).format(
      new Date(),
    ),
  );
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function AccountOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string; reset?: string }>;
}) {
  const { welcome, reset } = await searchParams;
  const user = await requireUser("/account");
  const [stats, recent, addresses, settings] = await Promise.all([
    getUserStats(user.id),
    getUserOrders(user.id, 1, 4),
    getUserAddresses(user.id),
    getSettings(),
  ]);
  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];
  const unpaid = stats.pendingPayment;
  const onTheWay = recent.orders.find((o) => o.status === "shipped");
  const payBy = (d: Date) => formatDate(new Date(d.getTime() + settings.paymentWindowDays * DAY), { day: "numeric", month: "long" });

  // The screen's one sentence: what, if anything, is waiting on the customer, then where their parcel is.
  const finding = unpaid.length
    ? `${pluralize(unpaid.length, "order")} waiting for your payment.`
    : onTheWay
      ? `${onTheWay.orderNumber} is on its way with ${onTheWay.trackingCarrier ?? "Australia Post"}.`
      : "Nothing needs you right now.";

  return (
    <div>
      {welcome && (
        <Banner>
          Welcome to Beauty Peps{user.firstName ? `, ${user.firstName}` : ""}! Your account is ready
          {stats.orderCount > 0 ? ` — we've linked ${pluralize(stats.orderCount, "earlier order")} placed with this email.` : "."}
        </Banner>
      )}
      {reset && <Banner>Your password has been updated and other devices have been signed out.</Banner>}

      <AccountHeading title={`${greeting()}${user.firstName ? `, ${user.firstName}` : ""}`} description={finding} />

      {unpaid.length === 1 && (
        <section aria-labelledby="waiting" className="mb-6">
          <h2 id="waiting" className="mb-3 text-[18px] font-semibold text-ink">
            Pay for {unpaid[0].orderNumber} by {payBy(unpaid[0].createdAt)}
          </h2>
          <PaymentInstructions order={unpaid[0]} settings={settings} />
        </section>
      )}
      {unpaid.length > 1 && (
        <section aria-labelledby="waiting" className="mb-6 bg-surface p-5">
          <h2 id="waiting" className="text-[18px] font-semibold text-ink">
            {unpaid.length} orders to pay
          </h2>
          <p className="mt-1 text-[14px] text-muted">Pay each one separately, with its own order number as the reference.</p>
          <ul className="mt-4 divide-y divide-surface-2 border-t border-surface-2">
            {unpaid.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-[15px]">
                <span>
                  <span className="font-medium text-ink">{o.orderNumber}</span>
                  <span className="text-muted"> · {formatMoney(o.total)} · pay by {payBy(o.createdAt)}</span>
                </span>
                <Link href={`/account/orders/${o.orderNumber}`} className="text-ink underline underline-offset-4">
                  Payment details
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Recent orders and the saved address share one sheet, so the two read as one block */}
      <div className="grid grid-cols-1 bg-surface lg:grid-cols-[minmax(0,1fr)_20rem] lg:divide-x lg:divide-white">
        <section aria-labelledby="recent" className="min-w-0 p-5 sm:p-6">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="recent" className="text-[18px] font-semibold text-ink">
              Recent orders
            </h2>
            {recent.total > recent.orders.length && (
              <Link href="/account/orders" className="text-[14px] text-ink underline-offset-4 hover:underline">
                All {recent.total} orders
              </Link>
            )}
          </div>
          {recent.orders.length === 0 ? (
            <div className="mt-4">
              <p className="text-[15px] text-muted">You haven&apos;t placed an order yet.</p>
              <ButtonLink href="/shop" size="sm" className="mt-4">
                Shop serums
              </ButtonLink>
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-white">
              {recent.orders.map((o) => (
                <li key={o.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 py-3.5">
                  <div className="min-w-0">
                    <Link href={`/account/orders/${o.orderNumber}`} className="text-[15px] font-medium text-ink hover:underline">
                      {o.orderNumber}
                    </Link>
                    <p className="text-[14px] text-muted">
                      {formatDate(o.createdAt)} · {pluralize(o.itemCount, "item")} · {formatMoney(o.total)}
                    </p>
                    {o.status === "shipped" && o.trackingNumber && (
                      <div className="mt-1">
                        <TrackingLink order={o} />
                      </div>
                    )}
                  </div>
                  <OrderStatusBadge status={o.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="address" className="min-w-0 border-t border-white p-5 sm:p-6 lg:border-t-0">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="address" className="text-[18px] font-semibold text-ink">
              Delivery address
            </h2>
            <Link href="/account/addresses" className="text-[14px] text-ink underline-offset-4 hover:underline">
              Manage
            </Link>
          </div>
          <div className="mt-3">
            {defaultAddress ? (
              <AddressBlock address={defaultAddress} />
            ) : (
              <p className="text-[15px] text-muted">
                No saved addresses yet.{" "}
                <Link href="/account/addresses/new" className="text-ink underline underline-offset-4">
                  Add one
                </Link>{" "}
                for a faster checkout.
              </p>
            )}
          </div>
          <ul className="mt-6 space-y-2 border-t border-white pt-4 text-[15px]">
            <li>
              <Link href="/account/wishlist" className="text-ink underline-offset-4 hover:underline">
                Wishlist →
              </Link>
            </li>
            <li>
              <Link href="/routine-builder" className="text-ink underline-offset-4 hover:underline">
                Build a routine →
              </Link>
            </li>
            <li>
              <Link href="/peptides" className="text-ink underline-offset-4 hover:underline">
                Peptide library →
              </Link>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
