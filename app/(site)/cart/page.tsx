import type { Metadata } from "next";
import Link from "next/link";
import { CartLineRow } from "@/components/shop/cart-line";
import { CartSuggestions } from "@/components/shop/cart-suggestions";
import { DiscountForm } from "@/components/shop/discount-form";
import { FreeShippingBar } from "@/components/shop/free-shipping-bar";
import { SpecimenGrid } from "@/components/shop/specimen-grid";
import { buttonClasses } from "@/components/ui/button";
import { getCart, MAX_QTY_PER_LINE } from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import { resolveCartDiscount } from "@/lib/orders";
import { computeTotals } from "@/lib/pricing";
import { getSuggestedProducts } from "@/lib/queries/catalog";
import { getSettings } from "@/lib/settings";

// Per-visitor (session, bag or order cookie): renders at request time.
export const instant = false;

export const metadata: Metadata = { title: "Your bag", robots: { index: false } };

export default async function CartPage() {
  const [cart, settings] = await Promise.all([getCart(), getSettings()]);

  if (cart.lines.length === 0) {
    const starters = await getSuggestedProducts(4);
    return (
      <div className="container-bp pt-10 md:pt-16">
        <section className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end lg:gap-[var(--gutter)]" aria-labelledby="bag-heading">
          <h1 id="bag-heading" className="display-type text-[clamp(2.75rem,1rem+5vw,5.75rem)] lg:col-span-7" data-reveal="">
            Your bag is empty
          </h1>
          <div className="lg:col-span-5 lg:col-start-8">
            <p className="max-w-[44ch] text-lead" data-reveal="" style={{ ["--reveal-i" as string]: 1 }}>
              Start with one of the vials below, or let the routine builder match peptides to what you want to change.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4" data-reveal="" style={{ ["--reveal-i" as string]: 2 }}>
              <Link href="/shop" className={buttonClasses({ size: "lg" })}>
                See every vial
              </Link>
              <Link href="/routine-builder" className="text-body underline underline-offset-4">
                Build my routine
              </Link>
            </div>
          </div>
        </section>
        {starters.length > 0 && (
          <section className="mt-28 md:mt-40" aria-labelledby="start-heading">
            <h2 id="start-heading" className="display-type mb-10 text-head" data-reveal="">
              Start here
            </h2>
            <SpecimenGrid products={starters} doubles={false} priority={2} />
          </section>
        )}
      </div>
    );
  }

  const [{ discount, code, invalidReason }, featured] = await Promise.all([
    resolveCartDiscount(cart.discountCode, cart.subtotal),
    getSuggestedProducts(9),
  ]);
  const inBag = new Set(cart.lines.map((l) => l.product.id));
  const suggestions = featured
    .filter((p) => !inBag.has(p.id) && p.stock > 0)
    .slice(0, 3)
    .map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      image: p.image,
      price: p.price,
      fact: p.keyActives?.[0] ? `${p.keyActives[0].amount} ${p.keyActives[0].name}` : (p.subtitle ?? ""),
    }));
  const totals = computeTotals({ subtotal: cart.subtotal, shippingMethod: "standard", settings, discount });

  return (
    <div className="container-bp pt-10 md:pt-16">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <h1 className="display-type text-head">Your bag</h1>
        <p className="text-body">
          {cart.itemCount} {cart.itemCount === 1 ? "item" : "items"}.{" "}
          <Link href="/shop" className="underline underline-offset-4">
            Keep shopping
          </Link>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-[var(--gutter)]">
        <div className="lg:col-span-7">
          <FreeShippingBar subtotal={cart.subtotal} threshold={settings.freeShippingThreshold} />
          <ul className="mt-2 space-y-2">
            {cart.lines.map((line) => (
              <CartLineRow
                key={line.product.id}
                line={line}
                maxQuantity={Math.max(1, Math.min(line.product.stock, MAX_QTY_PER_LINE))}
              />
            ))}
          </ul>
          <CartSuggestions items={suggestions} remaining={Math.max(0, settings.freeShippingThreshold - cart.subtotal)} />
        </div>

        <aside className="h-fit bg-surface p-6 md:p-8 lg:sticky lg:top-8 lg:col-span-4 lg:col-start-9" aria-labelledby="summary-heading">
          <h2 id="summary-heading" className="text-lead font-medium">
            Summary
          </h2>
          <div className="mt-6">
            <DiscountForm appliedCode={code} invalidReason={invalidReason} />
          </div>
          <dl className="tabular mt-8 text-body">
            <div className="flex justify-between py-1">
              <dt>Subtotal</dt>
              <dd>{formatMoney(totals.subtotal)}</dd>
            </div>
            {totals.discountTotal > 0 && (
              <div className="flex justify-between py-1 text-sage">
                <dt>Discount ({code})</dt>
                <dd>−{formatMoney(totals.discountTotal)}</dd>
              </div>
            )}
            <div className="flex justify-between py-1">
              <dt>Standard shipping</dt>
              <dd>{totals.shippingTotal === 0 ? "Free" : formatMoney(totals.shippingTotal)}</dd>
            </div>
            <div className="mt-3 flex justify-between bg-surface-2 px-3 py-3 font-medium">
              <dt>Estimated total</dt>
              <dd>{formatMoney(totals.total)}</dd>
            </div>
            <p className="mt-2 text-small text-muted">
              Includes {formatMoney(totals.gstTotal)} GST. Express shipping is offered at checkout.
            </p>
          </dl>
          <Link href="/checkout" className={buttonClasses({ size: "lg", className: "mt-8 w-full" })}>
            Checkout
          </Link>
          <p className="mt-4 text-small">Pay by bank transfer or PayID. Your order is held for you while payment clears.</p>
        </aside>
      </div>
    </div>
  );
}
