import { asc, desc, eq } from "drizzle-orm";
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
    <div className="container-bp pt-10 md:pt-16">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <h1 className="display-type text-head">Checkout</h1>
        <p className="text-body">
          Your details are sent securely and never shared.{" "}
          <Link href="/cart" className="underline underline-offset-4">
            Back to bag
          </Link>
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
