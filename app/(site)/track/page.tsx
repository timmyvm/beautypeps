import { PackageSearch } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
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
import { Field, Input } from "@/components/ui/form";
import { ORDER_STATUSES } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { findOrderForTracking } from "@/lib/orders";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Track your order",
  description: "Check the status of your Beauty Peps order with your order number and email address.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const str = (v: string | string[] | undefined) => ((Array.isArray(v) ? v[0] : v) ?? "").trim();

export default async function TrackPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const orderNumber = str(sp.order).slice(0, 20);
  const email = str(sp.email).slice(0, 200);
  const submitted = !!(orderNumber || email);
  const missing = submitted && (!orderNumber || !email);

  const [order, settings] = await Promise.all([
    orderNumber && email ? findOrderForTracking(orderNumber, email) : Promise.resolve(null),
    getSettings(),
  ]);

  return (
    <div className="container-bp py-12 md:py-16">
      <div className="mx-auto max-w-xl text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-ivory text-copper">
          <PackageSearch className="size-6" aria-hidden />
        </span>
        <h1 className="mt-5 font-display text-4xl text-espresso md:text-5xl">Track your order</h1>
        <p className="mt-3 text-cocoa">
          Enter your order number (e.g. BP10001) and the email you used at checkout.
          {" "}
          <Link href="/login?next=/account/orders" className="text-copper-dark underline underline-offset-4">
            Have an account? Sign in
          </Link>
        </p>
      </div>

      <form action="/track" method="get" className="mx-auto mt-10 grid max-w-2xl gap-4 rounded-2xl border border-stone/70 bg-cream p-6 sm:grid-cols-[1fr_1.4fr_auto] sm:items-end">
        <Field label="Order number" htmlFor="order">
          <Input id="order" name="order" defaultValue={orderNumber} placeholder="BP10001" required autoComplete="off" className="uppercase" />
        </Field>
        <Field label="Email address" htmlFor="email">
          <Input id="email" name="email" type="email" defaultValue={email} placeholder="you@example.com" required autoComplete="email" />
        </Field>
        <button type="submit" className={buttonClasses({ className: "h-11" })}>
          Find order
        </button>
      </form>

      {submitted && !order && (
        <div role="alert" className="mx-auto mt-6 max-w-2xl rounded-xl bg-danger-light px-4 py-3 text-center text-sm text-danger">
          {missing
            ? "Please enter both your order number and email address."
            : "We couldn't find that order. Check the order number and use the same email you checked out with."}
          {!missing && (
            <>
              {" "}
              <Link href="/contact" className="font-medium underline underline-offset-2">
                Contact us
              </Link>{" "}
              if you need a hand.
            </>
          )}
        </div>
      )}

      {order && (
        <div className="mx-auto mt-12 max-w-5xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow mb-2">Placed {formatDate(order.createdAt)}</p>
              <h2 className="font-display text-3xl text-espresso">Order {order.orderNumber}</h2>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>

          <div className="mt-6 rounded-2xl border border-stone/70 bg-cream p-6 md:p-8">
            <OrderProgress status={order.status} />
            <p className="mt-6 text-center text-sm text-cocoa">{ORDER_STATUSES[order.status].description}</p>
            {order.trackingNumber && (
              <div className="mt-4 text-center">
                <TrackingLink order={order} />
              </div>
            )}
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-8">
              {order.status === "pending_payment" && <PaymentInstructions order={order} settings={settings} />}
              <section className="rounded-2xl border border-stone/70 bg-cream p-6">
                <h3 className="font-display text-2xl text-espresso">Items</h3>
                <OrderItemsList items={order.items} />
              </section>
              <section className="rounded-2xl border border-stone/70 bg-cream p-6">
                <h3 className="mb-5 font-display text-2xl text-espresso">Order history</h3>
                <OrderTimeline events={order.events} />
              </section>
            </div>
            <aside className="space-y-6">
              <section className="rounded-2xl border border-stone/70 bg-cream p-6">
                <h3 className="mb-4 text-sm font-semibold tracking-wide text-espresso">Summary</h3>
                <OrderTotals order={order} />
              </section>
              <section className="rounded-2xl border border-stone/70 bg-cream p-6">
                <h3 className="mb-3 text-sm font-semibold tracking-wide text-espresso">Shipping to</h3>
                <AddressBlock address={order.shippingAddress} />
              </section>
              <Link href="/contact" className={buttonClasses({ variant: "outline", className: "w-full" })}>
                Need help with this order?
              </Link>
            </aside>
          </div>
        </div>
      )}
    </div>
  );
}
