import { asc, desc, eq } from "drizzle-orm";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckoutForm, type CheckoutTotals } from "@/components/shop/checkout-form";
import { getCurrentUser } from "@/lib/auth/session";
import { getCart } from "@/lib/cart";
import { db } from "@/lib/db";
import { addresses } from "@/lib/db/schema";
import { resolveCartDiscount } from "@/lib/orders";
import { computeTotals } from "@/lib/pricing";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage() {
  const [cart, settings, user] = await Promise.all([getCart(), getSettings(), getCurrentUser()]);
  if (cart.lines.length === 0) redirect("/cart");

  const [{ discount, code, invalidReason }, savedAddresses] = await Promise.all([
    resolveCartDiscount(cart.discountCode, cart.subtotal),
    user
      ? db.select().from(addresses).where(eq(addresses.userId, user.id)).orderBy(desc(addresses.isDefault), asc(addresses.createdAt))
      : Promise.resolve([]),
  ]);

  const totalsFor = (shippingMethod: "standard" | "express"): CheckoutTotals => {
    const t = computeTotals({ subtotal: cart.subtotal, shippingMethod, settings, discount });
    return { subtotal: t.subtotal, discountTotal: t.discountTotal, shippingTotal: t.shippingTotal, total: t.total, gstTotal: t.gstTotal };
  };

  return (
    <div className="container-bp py-10 md:py-14">
      <Link href="/cart" className="mb-6 inline-flex items-center gap-1 text-sm text-cocoa hover:text-espresso">
        <ChevronLeft className="size-4" aria-hidden /> Back to bag
      </Link>
      <div className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-2">Secure checkout</p>
          <h1 className="font-display text-4xl text-espresso">Checkout</h1>
        </div>
        <p className="flex items-center gap-2 text-xs text-cocoa">
          <ShieldCheck className="size-4 text-sage" aria-hidden /> Your details are encrypted and never shared.
        </p>
      </div>

      <CheckoutForm
        user={user ? { email: user.email, firstName: user.firstName, lastName: user.lastName, phone: user.phone } : null}
        addresses={savedAddresses}
        lines={cart.lines.map((l) => ({
          id: l.product.id,
          name: l.product.name,
          image: l.product.image,
          size: l.product.size,
          quantity: l.quantity,
          lineTotal: l.lineTotal,
        }))}
        totals={{ standard: totalsFor("standard"), express: totalsFor("express") }}
        discountCode={code}
        discountInvalid={invalidReason}
      />
    </div>
  );
}
