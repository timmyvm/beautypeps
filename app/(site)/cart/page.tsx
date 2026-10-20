import { Lock, ShoppingBag } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { CartLineRow } from "@/components/shop/cart-line";
import { DiscountForm } from "@/components/shop/discount-form";
import { FreeShippingBar } from "@/components/shop/free-shipping-bar";
import { buttonClasses } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/misc";
import { getCart, MAX_QTY_PER_LINE } from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import { resolveCartDiscount } from "@/lib/orders";
import { computeTotals } from "@/lib/pricing";
import { getFeaturedProducts } from "@/lib/queries/catalog";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Your bag", robots: { index: false } };

export default async function CartPage() {
  const [cart, settings] = await Promise.all([getCart(), getSettings()]);

  if (cart.lines.length === 0) {
    const bestsellers = await getFeaturedProducts(4);
    return (
      <div className="container-bp py-16 md:py-24">
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <span className="grid size-16 place-items-center rounded-full bg-ivory text-copper">
            <ShoppingBag className="size-7" aria-hidden />
          </span>
          <h1 className="mt-6 font-display text-4xl text-espresso">Your bag is empty</h1>
          <p className="mt-3 text-cocoa">
            Start with a bestseller, or let the routine builder match peptides to your skin concerns.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/shop" className={buttonClasses()}>
              Shop all products
            </Link>
            <Link href="/routine-builder" className={buttonClasses({ variant: "outline" })}>
              Build my routine
            </Link>
          </div>
        </div>
        {bestsellers.length > 0 && (
          <section className="mt-24">
            <SectionHeading eyebrow="Customer favourites" title="Bestsellers" />
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
              {bestsellers.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  const { discount, code, invalidReason } = await resolveCartDiscount(cart.discountCode, cart.subtotal);
  const totals = computeTotals({ subtotal: cart.subtotal, shippingMethod: "standard", settings, discount });

  return (
    <div className="container-bp py-10 md:py-14">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Shopping bag</p>
          <h1 className="font-display text-4xl text-espresso">
            Your bag <span className="text-2xl text-taupe">({cart.itemCount})</span>
          </h1>
        </div>
        <Link href="/shop" className="hidden text-sm text-cocoa underline-offset-4 hover:text-espresso hover:underline sm:block">
          Continue shopping
        </Link>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_400px] lg:gap-14">
        <div>
          <FreeShippingBar subtotal={cart.subtotal} threshold={settings.freeShippingThreshold} />
          <ul className="mt-2 divide-y divide-stone/60 border-b border-stone/60">
            {cart.lines.map((line) => (
              <CartLineRow
                key={line.product.id}
                line={line}
                maxQuantity={Math.max(1, Math.min(line.product.stock, MAX_QTY_PER_LINE))}
              />
            ))}
          </ul>
        </div>

        <aside className="h-fit rounded-2xl border border-stone/70 bg-cream p-6 lg:sticky lg:top-28">
          <h2 className="font-display text-2xl text-espresso">Order summary</h2>
          <div className="mt-6">
            <DiscountForm appliedCode={code} invalidReason={invalidReason} />
          </div>
          <dl className="mt-6 space-y-3 border-t border-stone/60 pt-6 text-sm">
            <div className="flex justify-between text-cocoa">
              <dt>Subtotal</dt>
              <dd>{formatMoney(totals.subtotal)}</dd>
            </div>
            {totals.discountTotal > 0 && (
              <div className="flex justify-between text-sage">
                <dt>Discount ({code})</dt>
                <dd>−{formatMoney(totals.discountTotal)}</dd>
              </div>
            )}
            <div className="flex justify-between text-cocoa">
              <dt>Standard shipping</dt>
              <dd>{totals.shippingTotal === 0 ? "Free" : formatMoney(totals.shippingTotal)}</dd>
            </div>
            <div className="flex justify-between border-t border-stone/60 pt-4 text-base font-semibold text-espresso">
              <dt>Estimated total</dt>
              <dd>{formatMoney(totals.total)}</dd>
            </div>
            <p className="text-right text-xs text-taupe">Includes {formatMoney(totals.gstTotal)} GST · Express available at checkout</p>
          </dl>
          <Link href="/checkout" className={buttonClasses({ size: "lg", className: "mt-6 h-13 w-full" })}>
            <Lock className="size-4" aria-hidden /> Checkout
          </Link>
          <p className="mt-4 text-center text-xs leading-relaxed text-cocoa">
            Pay by bank transfer or PayID. Your order is reserved while payment clears.
          </p>
          <Link href="/shop" className="mt-4 block text-center text-sm text-cocoa underline-offset-4 hover:underline sm:hidden">
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
