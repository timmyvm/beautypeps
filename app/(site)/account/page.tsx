import { ArrowRight, BookOpen, FlaskConical, Heart, MapPin, Package, Search, Wallet } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AccountHeading, Banner } from "@/components/account/bits";
import { AddressBlock, OrderStatusBadge } from "@/components/order/order-parts";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/misc";
import { requireUser } from "@/lib/auth/session";
import { formatDate, formatMoney, pluralize } from "@/lib/format";
import { getUserAddresses, getUserOrders, getUserStats } from "@/lib/queries/account";

export const metadata: Metadata = { title: "Overview" };

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
  const [stats, recent, addresses] = await Promise.all([
    getUserStats(user.id),
    getUserOrders(user.id, 1, 3),
    getUserAddresses(user.id),
  ]);
  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];

  return (
    <div>
      {welcome && (
        <Banner>
          Welcome to Beauty Peps{user.firstName ? `, ${user.firstName}` : ""}! Your account is ready
          {stats.orderCount > 0 ? ` — we've linked ${pluralize(stats.orderCount, "earlier order")} placed with this email.` : "."}
        </Banner>
      )}
      {reset && <Banner>Your password has been updated and other devices have been signed out.</Banner>}

      <AccountHeading
        title={`${greeting()}${user.firstName ? `, ${user.firstName}` : ""}.`}
        description="Here's what's happening with your orders and saved details."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat icon={<Package className="size-4" />} label="Orders" value={String(stats.orderCount)} href="/account/orders" />
        <Stat icon={<Wallet className="size-4" />} label="Total spent" value={formatMoney(stats.totalSpent)} />
        <Stat
          icon={<Heart className="size-4" />}
          label="Wishlist"
          value={String(stats.wishlistCount)}
          href="/account/wishlist"
        />
      </div>

      {stats.pendingPayment.length > 0 && (
        <section className="mt-8 rounded-2xl border border-amber/30 bg-amber-light/50 p-5 sm:p-6" aria-labelledby="attention">
          <p className="eyebrow mb-1 text-amber!">Needs your attention</p>
          <h2 id="attention" className="text-lg font-semibold text-espresso">
            {stats.pendingPayment.length === 1
              ? "1 order is awaiting payment"
              : `${stats.pendingPayment.length} orders are awaiting payment`}
          </h2>
          <ul className="mt-4 divide-y divide-amber/20">
            {stats.pendingPayment.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="text-sm">
                  <span className="font-mono font-medium text-espresso">{o.orderNumber}</span>
                  <span className="text-muted"> · placed {formatDate(o.createdAt)} · {formatMoney(o.total)}</span>
                </div>
                <Link
                  href={`/account/orders/${o.orderNumber}`}
                  className="flex items-center gap-1 text-sm font-medium text-copper-dark hover:underline"
                >
                  View payment details <ArrowRight className="size-3.5" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-8 grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="p-0">
          <div className="flex items-center justify-between border-b border-stone/60 px-6 py-4">
            <h2 className="text-lg font-semibold text-espresso">Recent orders</h2>
            {recent.total > 0 && (
              <Link href="/account/orders" className="text-sm text-copper-dark hover:underline">
                View all
              </Link>
            )}
          </div>
          {recent.orders.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-sm text-muted">You haven&apos;t placed an order yet.</p>
              <ButtonLink href="/shop" size="sm" className="mt-4">
                Explore the collection
              </ButtonLink>
            </div>
          ) : (
            <ul className="divide-y divide-stone/50">
              {recent.orders.map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/account/orders/${o.orderNumber}`}
                    className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 transition-colors hover:bg-ivory/60"
                  >
                    <div>
                      <p className="font-mono text-sm font-medium text-espresso">{o.orderNumber}</p>
                      <p className="mt-0.5 text-[13px] text-muted">
                        {formatDate(o.createdAt)} · {pluralize(o.itemCount, "item")}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <OrderStatusBadge status={o.status} />
                      <span className="text-sm font-medium text-espresso">{formatMoney(o.total)}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-espresso">
                <MapPin className="size-4 text-copper" aria-hidden /> Default address
              </h2>
              <Link href="/account/addresses" className="text-[13px] text-copper-dark hover:underline">
                Manage
              </Link>
            </div>
            {defaultAddress ? (
              <AddressBlock address={defaultAddress} />
            ) : (
              <p className="text-sm text-muted">
                No saved addresses yet.{" "}
                <Link href="/account/addresses/new" className="text-copper-dark underline">
                  Add one
                </Link>{" "}
                for faster checkout.
              </p>
            )}
          </Card>

          <Card>
            <h2 className="mb-3 text-sm font-semibold text-espresso">Explore</h2>
            <ul className="space-y-1">
              <QuickLink href="/peptides" icon={<FlaskConical className="size-4" />} label="Peptide Library" />
              <QuickLink href="/routine-builder" icon={<BookOpen className="size-4" />} label="Routine builder" />
              <QuickLink href="/track" icon={<Search className="size-4" />} label="Track an order" />
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href?: string }) {
  const body = (
    <>
      <div className="flex items-center justify-between text-muted">
        <span className="text-[13px] font-medium">{label}</span>
        <span className="text-copper">{icon}</span>
      </div>
      <p className="mt-3 text-2xl font-semibold text-espresso">{value}</p>
    </>
  );
  const cls = "block rounded-2xl border border-stone/70 bg-cream p-5";
  return href ? (
    <Link href={href} className={`${cls} transition-colors hover:border-taupe`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

function QuickLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-muted transition-colors hover:bg-ivory hover:text-espresso"
      >
        <span className="flex items-center gap-2.5">
          <span className="text-copper">{icon}</span>
          {label}
        </span>
        <ArrowRight className="size-3.5" aria-hidden />
      </Link>
    </li>
  );
}
