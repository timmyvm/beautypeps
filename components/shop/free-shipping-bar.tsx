import { Truck } from "lucide-react";
import { formatMoney } from "@/lib/format";

export function FreeShippingBar({ subtotal, threshold }: { subtotal: number; threshold: number }) {
  if (threshold <= 0) return null;
  const remaining = Math.max(0, threshold - subtotal);
  const pct = Math.min(100, Math.round((subtotal / threshold) * 100));
  return (
    <div className="rounded-2xl bg-ivory p-4">
      <p className="flex items-center gap-2 text-sm text-espresso">
        <Truck className="size-4 text-copper" aria-hidden />
        {remaining > 0 ? (
          <span>
            You&apos;re <strong className="font-semibold">{formatMoney(remaining)}</strong> away from free standard shipping
          </span>
        ) : (
          <span>You&apos;ve unlocked free standard shipping</span>
        )}
      </p>
      <div
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-stone/70"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label="Progress to free shipping"
      >
        <div className="h-full rounded-full bg-copper transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
