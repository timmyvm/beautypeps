import { BookOpen, CheckCircle2, Mail, Package, Wallet } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import {
  AddressBlock,
  OrderItemsList,
  OrderProgress,
  OrderStatusBadge,
  OrderTotals,
  PaymentInstructions,
} from "@/components/order/order-parts";
import { CopyButton } from "@/components/shop/copy-button";
import { buttonClasses } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";
import { SHIPPING_METHOD_LABELS } from "@/lib/constants";
import { formatMoney } from "@/lib/format";
import { getOrderByNumber, LAST_ORDER_COOKIE } from "@/lib/orders";
import { getSettings } from "@/lib/settings";

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

  const steps = [
    {
      icon: Wallet,
      title: awaitingPayment ? "Send your payment" : "Payment received",
      body: awaitingPayment
        ? `Transfer ${formatMoney(order.total)} using reference ${order.orderNumber} within ${settings.paymentWindowDays} days.`
        : "Thank you — your payment has cleared.",
    },
    {
      icon: Mail,
      title: "We confirm by email",
      body: `As soon as payment lands we'll email ${order.email} and start packing.`,
    },
    {
      icon: Package,
      title: "Packed & dispatched",
      body: `${settings.dispatchTime} You'll get an Australia Post tracking number.`,
    },
  ];

  return (
    <div className="container-bp py-12 md:py-16">
      <div className="mx-auto max-w-3xl text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-sage-light text-sage">
          <CheckCircle2 className="size-8" aria-hidden />
        </span>
        <p className="eyebrow mt-6 mb-3">Order {order.orderNumber}</p>
        <h1 className="font-display text-4xl leading-tight text-espresso md:text-5xl">
          Thank you, {firstName}. Your order is reserved.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-cocoa">
          {awaitingPayment
            ? "We've emailed your confirmation and payment details. Complete payment below and we'll get your peptides on their way."
            : "We've emailed your confirmation. You'll hear from us again when it ships."}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <OrderStatusBadge status={order.status} />
          <span className="text-sm text-cocoa">Reference</span>
          <span className="font-mono text-sm font-semibold tracking-wider text-espresso">{order.orderNumber}</span>
          <CopyButton value={order.orderNumber} label="Copy reference" />
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-5xl">
        <div className="rounded-2xl border border-stone/70 bg-cream p-6 md:p-8">
          <OrderProgress status={order.status} />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-8">
            {awaitingPayment && (
              <div>
                <PaymentInstructions order={order} settings={settings} />
                <div className="mt-3 flex flex-wrap gap-2">
                  {order.paymentMethod === "payid" ? (
                    <CopyButton value={settings.payId} label="Copy PayID" />
                  ) : (
                    <>
                      <CopyButton value={settings.bankBsb} label="Copy BSB" />
                      <CopyButton value={settings.bankAccountNumber} label="Copy account number" />
                    </>
                  )}
                  <CopyButton value={(order.total / 100).toFixed(2)} label="Copy amount" />
                </div>
              </div>
            )}

            <section className="rounded-2xl border border-stone/70 bg-cream p-6">
              <h2 className="font-display text-2xl text-espresso">What happens next</h2>
              <ol className="mt-6 grid gap-6 md:grid-cols-3">
                {steps.map((s, i) => (
                  <li key={s.title}>
                    <span className="grid size-10 place-items-center rounded-full bg-ivory text-copper">
                      <s.icon className="size-5" aria-hidden />
                    </span>
                    <p className="mt-3 text-sm font-medium text-espresso">
                      {i + 1}. {s.title}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-cocoa">{s.body}</p>
                  </li>
                ))}
              </ol>
            </section>

            <section className="rounded-2xl border border-stone/70 bg-cream p-6">
              <h2 className="font-display text-2xl text-espresso">Items</h2>
              <OrderItemsList items={order.items} />
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-stone/70 bg-cream p-6">
              <h2 className="mb-4 text-sm font-semibold tracking-wide text-espresso">Order total</h2>
              <OrderTotals order={order} />
            </section>
            <section className="rounded-2xl border border-stone/70 bg-cream p-6">
              <h2 className="mb-3 text-sm font-semibold tracking-wide text-espresso">Shipping to</h2>
              <AddressBlock address={order.shippingAddress} />
              <p className="mt-3 text-xs text-taupe">{SHIPPING_METHOD_LABELS[order.shippingMethod]}</p>
            </section>

            {!user ? (
              <section className="rounded-2xl bg-espresso p-6 text-cream">
                <h2 className="font-display text-xl">Track orders in one place</h2>
                <p className="mt-2 text-sm text-cream/70">
                  Create an account with {order.email} — we&apos;ll link this order to it automatically.
                </p>
                <Link
                  href={`/register?email=${encodeURIComponent(order.email)}`}
                  className={buttonClasses({ variant: "light", size: "sm", className: "mt-5" })}
                >
                  Create account
                </Link>
                <Link
                  href={`/track?order=${order.orderNumber}&email=${encodeURIComponent(order.email)}`}
                  className="mt-4 block text-xs text-cream/70 underline underline-offset-4"
                >
                  Or track this order as a guest
                </Link>
              </section>
            ) : (
              <Link href="/account" className={buttonClasses({ variant: "outline", className: "w-full" })}>
                View in my account
              </Link>
            )}
          </aside>
        </div>

        <section className="mt-12 grid items-center gap-6 rounded-2xl bg-ivory p-8 md:grid-cols-[auto_1fr_auto]">
          <BookOpen className="size-8 text-copper" aria-hidden />
          <div>
            <h2 className="font-display text-2xl text-espresso">While you wait — get to know your peptides</h2>
            <p className="mt-1 text-sm text-cocoa">
              How to layer them, what to pair them with, and what the research actually says.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/peptides" className={buttonClasses({ variant: "outline", size: "sm" })}>
              Peptide Library
            </Link>
            <Link href="/learn/how-to-layer-peptides" className={buttonClasses({ size: "sm" })}>
              Layering guide
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
