"use client";

import { Check, Loader2, ShoppingBag } from "lucide-react";
import { useState, useTransition } from "react";
import { addToCart } from "@/lib/actions/cart";
import { cn } from "@/lib/utils";

export function AddToBagButton({ productId, soldOut, className }: { productId: string; soldOut?: boolean; className?: string }) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  return (
    <div className={className}>
      <button
        type="button"
        disabled={pending || soldOut}
        onClick={() =>
          start(async () => {
            const res = await addToCart(productId, 1);
            setResult(res);
          })
        }
        className={cn(
          "flex h-11 w-full items-center justify-center gap-2 text-[14px] font-medium transition-colors",
          "bg-surface-2 text-ink hover:bg-stone disabled:pointer-events-none disabled:opacity-50",
        )}
      >
        {pending ? (
          <Loader2 className="size-3.5 animate-spin" aria-hidden />
        ) : result?.ok ? (
          <Check className="size-3.5" aria-hidden />
        ) : (
          <ShoppingBag className="size-3.5" aria-hidden />
        )}
        {soldOut ? "Sold out" : result?.ok ? "Added to bag" : "Add to bag"}
      </button>
      <p className="sr-only" aria-live="polite">
        {result?.message}
      </p>
      {result && !result.ok && <p className="mt-1.5 text-[13px] text-danger">{result.message}</p>}
    </div>
  );
}
