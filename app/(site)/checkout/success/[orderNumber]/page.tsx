import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { CopyButton } from "@/components/shop/copy-button";
import { OrderLines, OrderProgressBar, OrderSums, PaymentPanel, ShipTo } from "@/components/shop/order-view";
import { buttonClasses } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";
import { ORDER_STATUSES } from "@/lib/constants";
import { formatMoney } from "@/lib/format";
import { getOrderByNumber, LAST_ORDER_COOKIE } from "@/lib/orders";
import { getSettings } from "@/lib/settings";

// Per-visitor (session, bag or order cookie): renders at request time.
export const instant = false;

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false } };

type Props = { params: Promise<{ orderNumber: string }> };

export default async function OrderSuccessPage({ params }: Props) {
  const { orderNumber } = await params;
  const [order, user, settings, jar] = await Promise.all([
    getOrderByNumber(orderNumber),
    getCurrentUser(),
    getSettings(),
    cookies(),
  ]);
  if (!order) notFound();

  const ownsViaCookie = jar.get(LAST_ORDER_COOKIE)?.value === order.orderNumber;
  const ownsViaAccount = !!user && (order.userId === user.id || user.role === "admin");
  if (!ownsViaCookie && !ownsViaAccount) notFound();

  const awaitingPayment = order.status === "pending_payment";
  const firstName = order.shippingAddress.firstName;

  const next = [
    {
      title: awaitingPayment ? "You send the payment" : "Payment received",
      body: awaitingPayment
        ? `Transfer ${formatMoney(order.total)} with reference ${order.orderNumber} within ${settings.paymentWindowDays} days.`
        : "Thank you, your payment has cleared.",
    },
    {
      title: "We confirm by email",
      body: `When the payment lands we email ${order.email} and start packing.`,
    },
    {
      title: "Packed and posted",
      body: `${settings.dispatchTime} You get an Australia Post tracking number.`,
    },
  ];

  return (
    <div className="container-bp pt-10 pb-24 md:pt-16">
      <header className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <h1 className="display-type text-[clamp(2.75rem,1rem+5vw,5.75rem)] lg:col-span-8">
          Your order is reserved
        </h1>
        <div className="text-lead lg:col-span-4 lg:self-end">
          <p>
            Thank you, {firstName}.{" "}
            {awaitingPayment
              ? "Your confirmation and payment details are in your inbox. Pay below and we send your peptides on their way."
              : "Your confirmation is in your inbox. We write again when it ships."}
          </p>
          <p className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-body">
            <span>
              Order <span className="tabular font-medium">{order.orderNumber}</span>,{" "}
              {ORDER_STATUSES[order.status].label.toLowerCase()}
            </span>
            <CopyButton value={order.orderNumber} label="Copy order number" />
          </p>
        </div>
      </header>

      <div className="mt-12">
        <OrderProgressBar status={order.status} />
      </div>

      <div className="mt-14 grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-8">
        <div className="space-y-14 lg:col-span-7">
          {awaitingPayment && <PaymentPanel order={order} settings={settings} copy />}

          <section aria-labelledby="next-heading">
            <h2 id="next-heading" className="text-lead font-medium">
              What happens next
            </h2>
            <ol className="mt-5 grid gap-2 md:grid-cols-3">
              {next.map((s) => (
                <li key={s.title} className="bg-surface p-5">
                  <p className="text-body font-medium">{s.title}</p>
                  <p className="mt-1 text-body text-muted">{s.body}</p>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="items-heading">
            <h2 id="items-heading" className="text-lead font-medium">
              In your order
            </h2>
            <div className="mt-5">
              <OrderLines items={order.items} />
            </div>
          </section>
        </div>

        <aside className="space-y-10 lg:col-span-4 lg:col-start-9">
          <section aria-labelledby="total-heading">
            <h2 id="total-heading" className="mb-3 text-lead font-medium">
              Order total
            </h2>
            <OrderSums order={order} />
          </section>
          <section aria-labelledby="ship-heading">
            <h2 id="ship-heading" className="mb-3 text-lead font-medium">
              Shipping to
            </h2>
            <ShipTo address={order.shippingAddress} method={order.shippingMethod} />
          </section>

          {!user ? (
            <section aria-labelledby="account-heading" className="bg-field-ink p-6 text-field-ink-ink">
              <h2 id="account-heading" className="text-lead font-medium">
                Keep your orders in one place
              </h2>
              <p className="mt-2 text-body text-field-ink-ink/80">
                Create an account with {order.email} and we link this order to it.
              </p>
              <Link
                href={`/register?email=${encodeURIComponent(order.email)}`}
                className={buttonClasses({ variant: "light", className: "mt-5" })}
              >
                Create an account
              </Link>
              <Link
                href={`/track?order=${order.orderNumber}&email=${encodeURIComponent(order.email)}`}
                className="mt-4 block text-body underline underline-offset-4"
              >
                Or track this order as a guest
              </Link>
            </section>
          ) : (
            <Link href="/account" className={buttonClasses({ variant: "outline", className: "w-full" })}>
              See it in your account
            </Link>
          )}
        </aside>
      </div>

      <section aria-labelledby="learn-heading" className="mt-20 grid grid-cols-1 gap-6 bg-field-stone p-6 md:p-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h2 id="learn-heading" className="display-type text-head">
            Read up while you wait
          </h2>
          <p className="mt-3 max-w-[55ch] text-body">
            How to layer them, what to pair them with, and what the research actually says.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3 lg:col-span-5 lg:justify-end">
          <Link href="/learn/how-to-layer-peptides" className={buttonClasses()}>
            Read the layering guide
          </Link>
          <Link href="/peptides" className={buttonClasses({ variant: "light" })}>
            Open the peptide library
          </Link>
        </div>
      </section>
    </div>
  );
}
