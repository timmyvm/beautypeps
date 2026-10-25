"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { buttonClasses } from "@/components/ui/button";
import { QuantityStepper } from "@/components/ui/quantity-stepper";

export { QuantityStepper };
import { useBag } from "@/components/shop/bag";
import { addToCart } from "@/lib/actions/cart";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = {
  productId: string;
  productName: string;
  price: number;
  maxQuantity: number; // min(stock, per-line cap); 0 = sold out
  image?: string;
};

function useAddToCart(productId: string) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const bag = useBag();
  const add = (quantity: number) =>
    startTransition(async () => {
      const res = await addToCart(productId, quantity);
      setResult({ ok: res.ok, message: res.message });
      // Show what went in, and the way to checkout, without leaving the page.
      if (res.ok) bag.open(productId);
    });
  return { pending, result, add };
}

/** Quantity + "Add to bag" for the product page. */
export function AddToCart({ productId, productName, price, maxQuantity }: Props) {
  const [qty, setQty] = useState(1);
  const { pending, result, add } = useAddToCart(productId);
  const soldOut = maxQuantity <= 0;

  return (
    <div>
      <div className="flex gap-2">
        <QuantityStepper value={qty} onChange={setQty} max={Math.max(1, maxQuantity)} disabled={soldOut || pending} />
        <button
          type="button"
          onClick={() => add(qty)}
          disabled={soldOut || pending}
          className={buttonClasses({ size: "lg", className: "min-w-0 flex-1 px-5" })}
          aria-label={soldOut ? `Sold out: ${productName}` : `Add to bag · ${formatMoney(price * qty)}: ${qty} × ${productName}`}
        >
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          {soldOut ? "Sold out" : <>Add to bag · {formatMoney(price * qty)}</>}
        </button>
      </div>
      <div aria-live="polite">
        {result && (
          <p className={cn("mt-3 flex flex-wrap items-center gap-x-4 px-4 py-3 text-body", result.ok ? "bg-sage-light text-sage" : "bg-danger-light text-danger")}>
            <span>{result.message}</span>
            {result.ok && (
              <Link href="/cart" className="font-medium underline underline-offset-4">
                View bag
              </Link>
            )}
          </p>
        )}
      </div>
    </div>
  );
}

/** Fixed bottom bar on phones so "Add to bag" is always reachable. A solid bar, one tone step from the page. */
/**
 * Phone and tablet bag bar. It stays out of the way while the main buy block is on screen and while the reader
 * scrolls down through the page, and slides in when they scroll back up, so it never sits over a heading they are
 * reading. Not shown for sold-out products: there is nothing to add.
 */
export function StickyAddToCart({ productId, productName, price, maxQuantity, watchId = "buy" }: Props & { watchId?: string }) {
  const { pending, result, add } = useAddToCart(productId);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (maxQuantity <= 0) return;
    const target = document.getElementById(watchId);
    let buyInView = true;
    let lastY = window.scrollY;
    const io = target
      ? new IntersectionObserver(([entry]) => {
          buyInView = entry.isIntersecting;
          if (buyInView) setShown(false);
        })
      : null;
    if (target) io?.observe(target);
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - lastY) < 8) return;
      setShown(!buyInView && y < lastY);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io?.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [maxQuantity, watchId]);

  if (maxQuantity <= 0) return null;

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 bg-surface px-[var(--margin)] py-3 transition-transform duration-300 motion-reduce:transition-none lg:hidden",
        shown ? "translate-y-0" : "translate-y-full",
      )}
      aria-hidden={!shown}
      inert={!shown}
    >
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-body font-medium text-ink">{productName}</p>
          <p className="text-small">
            {result?.ok ? (
              <Link href="/cart" className="font-medium text-sage underline underline-offset-2">
                Added. View bag
              </Link>
            ) : (
              formatMoney(price)
            )}
          </p>
        </div>
        <button type="button" onClick={() => add(1)} disabled={pending} className={buttonClasses({ size: "md" })}>
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
          Add to bag
        </button>
      </div>
    </div>
  );
}

/** Compact one-click add, used in spotlights and cards. */
export function QuickAdd({
  productId,
  label = "Add to bag",
  className,
  variant = "primary",
}: {
  productId: string;
  label?: string;
  className?: string;
  variant?: "primary" | "copper" | "outline" | "light";
}) {
  const { pending, result, add } = useAddToCart(productId);
  return (
    <div className="flex flex-col items-start gap-2">
      <button type="button" onClick={() => add(1)} disabled={pending} className={buttonClasses({ variant, className })}>
        {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {result?.ok ? "Added" : label}
      </button>
      <span aria-live="polite" className="text-small">
        {result && !result.ok && <span className="text-danger">{result.message}</span>}
        {result?.ok && (
          <Link href="/cart" className="underline underline-offset-4">
            View bag
          </Link>
        )}
      </span>
    </div>
  );
}
