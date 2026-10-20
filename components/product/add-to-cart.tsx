"use client";

import { Check, Loader2, Minus, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { buttonClasses } from "@/components/ui/button";
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
  const add = (quantity: number) =>
    startTransition(async () => {
      const res = await addToCart(productId, quantity);
      setResult({ ok: res.ok, message: res.message });
    });
  return { pending, result, add };
}

export function QuantityStepper({
  value,
  onChange,
  max,
  disabled,
  size = "md",
  label = "Quantity",
}: {
  value: number;
  onChange: (v: number) => void;
  max: number;
  disabled?: boolean;
  size?: "sm" | "md";
  label?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-stone bg-cream",
        size === "sm" ? "h-9" : "h-12",
        disabled && "opacity-50",
      )}
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={disabled || value <= 1}
        aria-label="Decrease quantity"
        className={cn("grid place-items-center text-espresso disabled:opacity-30", size === "sm" ? "w-8" : "w-11")}
      >
        <Minus className="size-3.5" aria-hidden />
      </button>
      <span className={cn("text-center text-sm font-medium tabular-nums", size === "sm" ? "w-6" : "w-8")} aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
        className={cn("grid place-items-center text-espresso disabled:opacity-30", size === "sm" ? "w-8" : "w-11")}
      >
        <Plus className="size-3.5" aria-hidden />
      </button>
    </div>
  );
}

/** Quantity + "Add to bag" for the product page. */
export function AddToCart({ productId, productName, price, maxQuantity }: Props) {
  const [qty, setQty] = useState(1);
  const { pending, result, add } = useAddToCart(productId);
  const soldOut = maxQuantity <= 0;

  return (
    <div>
      <div className="flex gap-3">
        <QuantityStepper value={qty} onChange={setQty} max={Math.max(1, maxQuantity)} disabled={soldOut || pending} />
        <button
          type="button"
          onClick={() => add(qty)}
          disabled={soldOut || pending}
          className={buttonClasses({ size: "lg", className: "h-12 min-w-0 flex-1 px-5" })}
          aria-label={soldOut ? `${productName} is sold out` : `Add ${qty} ${productName} to bag`}
        >
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          {soldOut ? (
            "Sold out"
          ) : (
            <>
              Add to bag<span className="hidden sm:inline"> · {formatMoney(price * qty)}</span>
            </>
          )}
        </button>
      </div>
      <div aria-live="polite" className="min-h-0">
        {result && (
          <p
            className={cn(
              "mt-3 flex items-center gap-2 rounded-xl px-4 py-3 text-sm",
              result.ok ? "bg-sage-light text-sage" : "bg-danger-light text-danger",
            )}
          >
            {result.ok && <Check className="size-4 shrink-0" aria-hidden />}
            <span className="flex-1">{result.message}</span>
            {result.ok && (
              <Link href="/cart" className="font-semibold underline underline-offset-4">
                View bag
              </Link>
            )}
          </p>
        )}
      </div>
    </div>
  );
}

/** Fixed bottom bar on mobile so "Add to bag" is always reachable. */
export function StickyAddToCart({ productId, productName, price, maxQuantity, image }: Props) {
  const { pending, result, add } = useAddToCart(productId);
  const soldOut = maxQuantity <= 0;
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-stone/70 bg-cream/95 px-4 py-3 backdrop-blur-md lg:hidden">
      <div className="flex items-center gap-3">
        {image && (
          <Image src={image} alt="" width={44} height={55} className="h-12 w-10 shrink-0 rounded-lg bg-ivory object-cover" />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-espresso">{productName}</p>
          <p className="text-xs text-cocoa">
            {result?.ok ? (
              <Link href="/cart" className="font-semibold text-sage underline underline-offset-2">
                Added · View bag
              </Link>
            ) : (
              formatMoney(price)
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => add(1)}
          disabled={soldOut || pending}
          className={buttonClasses({ size: "sm", className: "h-10 px-5" })}
        >
          {pending && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
          {soldOut ? "Sold out" : "Add to bag"}
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
      <button
        type="button"
        onClick={() => add(1)}
        disabled={pending}
        className={buttonClasses({ variant, className })}
      >
        {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {result?.ok ? (
          <>
            <Check className="size-4" aria-hidden /> Added
          </>
        ) : (
          label
        )}
      </button>
      <span aria-live="polite" className="text-xs">
        {result && !result.ok && <span className="text-danger">{result.message}</span>}
        {result?.ok && (
          <Link href="/cart" className="underline underline-offset-4 opacity-80">
            View bag
          </Link>
        )}
      </span>
    </div>
  );
}
