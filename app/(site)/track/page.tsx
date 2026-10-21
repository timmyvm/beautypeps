import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { JournalShelf } from "@/components/shop/journal-shelf";
import {
  OrderHistory,
  OrderLines,
  OrderProgressBar,
  OrderSums,
  ParcelLink,
  PaymentPanel,
  ShipTo,
} from "@/components/shop/order-view";
import { buttonClasses } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { ORDER_STATUSES } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { findOrderForTracking } from "@/lib/orders";
import { getPublishedArticles } from "@/lib/queries/content";
import { getSettings } from "@/lib/settings";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Track your order",
  description:
    "Check the status of your Beauty Peps order with your order number and email address.",
  path: "/track",
});

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const str = (v: string | string[] | undefined) => ((Array.isArray(v) ? v[0] : v) ?? "").trim();

/** This view is chosen by the URL, so it renders per request inside the page's static shell. */
export default function TrackPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<div className="container-bp min-h-dvh pt-10 md:pt-16" aria-busy="true" />}>
      <TrackPageContent searchParams={searchParams} />
    </Suspense>
  );
}

async function TrackPageContent({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const orderNumber = str(sp.order).slice(0, 20);
  const email = str(sp.email).slice(0, 200);
  const submitted = !!(orderNumber || email);
  const missing = submitted && (!orderNumber || !email);

  const [order, settings, articles] = await Promise.all([
    orderNumber && email ? findOrderForTracking(orderNumber, email) : Promise.resolve(null),
    getSettings(),
    getPublishedArticles(),
  ]);

  return (
    <div className="container-bp pt-10 pb-24 md:pt-16">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <h1 className="display-type text-[clamp(2.75rem,1rem+5vw,5.75rem)]" data-reveal="">
            Track your order
          </h1>
          <p className="mt-5 max-w-[44ch] text-lead" data-reveal="" style={{ ["--reveal-i" as string]: 1 }}>
            Enter your order number and the email you used at checkout to see where it is.{" "}
            <Link href="/login?next=/account/orders" className="underline underline-offset-4">
              Have an account? Sign in
            </Link>
          </p>

          <form
            action="/track"
            method="get"
            className="mt-10 grid gap-4 bg-surface p-5 sm:grid-cols-[1fr_1.4fr] md:p-8"
            data-reveal=""
            style={{ ["--reveal-i" as string]: 2 }}
          >
            <Field label="Order number" htmlFor="order">
              <Input id="order" name="order" defaultValue={orderNumber} placeholder="BP10001" required autoComplete="off" className="uppercase" />
            </Field>
            <Field label="Email address" htmlFor="email">
              <Input id="email" name="email" type="email" defaultValue={email} placeholder="you@example.com" required autoComplete="email" />
            </Field>
            <button type="submit" className={buttonClasses({ variant: "dark", className: "sm:col-span-2 sm:justify-self-start" })}>
              Find my order
            </button>
          </form>

          {submitted && !order && (
            <div role="alert" className="mt-4 bg-danger-light px-5 py-4 text-body text-danger">
              {missing
                ? "Please enter both your order number and email address."
                : "We couldn't find that order. Check the order number and use the same email you checked out with."}
              {!missing && (
                <>
                  {" "}
                  <Link href="/contact" className="font-medium underline underline-offset-4">
                    Contact us
                  </Link>{" "}
                  if you need a hand.
                </>
              )}
            </div>
          )}
        </div>

        <figure className="lg:col-span-5">
          <div className="shutter-now relative aspect-[4/3] overflow-hidden bg-surface-2 lg:aspect-[4/5]">
            <Image
              src="/images/editorial/unboxing.webp"
              alt="An opened Beauty Peps parcel: three serums in tissue with a handwritten card"
              fill
              loading="eager"
              fetchPriority="high"
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </div>
          <figcaption className="mt-3 text-body text-muted">
            {settings.dispatchTime} Every parcel goes by Australia Post with a tracking number.
          </figcaption>
        </figure>
      </div>

      {order && (
        <section aria-labelledby="order-heading" className="mt-20">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12" data-reveal="">
            <h2 id="order-heading" className="display-type text-head lg:col-span-7">
              Order {order.orderNumber} is {ORDER_STATUSES[order.status].label.toLowerCase()}
            </h2>
            <p className="text-body text-muted lg:col-span-5 lg:self-end">
              Placed {formatDate(order.createdAt)}. {ORDER_STATUSES[order.status].description}
            </p>
          </div>

          <div className="mt-8 space-y-4" data-reveal="" style={{ ["--reveal-i" as string]: 1 }}>
            <OrderProgressBar status={order.status} />
            <ParcelLink order={order} />
          </div>

          <div className="mt-14 grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-8">
            <div className="space-y-14 lg:col-span-7" data-reveal="" style={{ ["--reveal-i" as string]: 2 }}>
              {order.status === "pending_payment" && <PaymentPanel order={order} settings={settings} copy />}
              <section aria-labelledby="items-heading">
                <h3 id="items-heading" className="text-lead font-medium">
                  In this order
                </h3>
                <div className="mt-5">
                  <OrderLines items={order.items} />
                </div>
              </section>
              <section aria-labelledby="history-heading">
                <h3 id="history-heading" className="mb-5 text-lead font-medium">
                  Order history
                </h3>
                <OrderHistory events={order.events} />
              </section>
            </div>
            <aside className="space-y-10 lg:col-span-4 lg:col-start-9" data-reveal="" style={{ ["--reveal-i" as string]: 3 }}>
              <section aria-labelledby="sum-heading">
                <h3 id="sum-heading" className="mb-3 text-lead font-medium">
                  Summary
                </h3>
                <OrderSums order={order} />
              </section>
              <section aria-labelledby="ship-heading">
                <h3 id="ship-heading" className="mb-3 text-lead font-medium">
                  Shipping to
                </h3>
                <ShipTo address={order.shippingAddress} method={order.shippingMethod} />
              </section>
              <Link href="/contact" className={buttonClasses({ variant: "outline", className: "w-full" })}>
                Ask about this order
              </Link>
            </aside>
          </div>
        </section>
      )}

      <JournalShelf
        id="wait-heading"
        title="Before you open the first bottle"
        intro="How to start, layer and store your peptides, so they are ready to use the day the parcel arrives."
        articles={articles.slice(0, 3)}
      />
    </div>
  );
}
