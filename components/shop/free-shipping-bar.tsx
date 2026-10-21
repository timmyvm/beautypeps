import { formatMoney } from "@/lib/format";

export function FreeShippingBar({ subtotal, threshold }: { subtotal: number; threshold: number }) {
  if (threshold <= 0) return null;
  const remaining = Math.max(0, threshold - subtotal);
  const pct = Math.min(100, Math.round((subtotal / threshold) * 100));
  return (
    <div className="bg-field-frost px-4 py-4">
      <p className="text-body">
        {remaining > 0 ? (
          <>
            Add <strong className="font-medium">{formatMoney(remaining)}</strong> more for free standard shipping.
          </>
        ) : (
          "Standard shipping is free on this order."
        )}
      </p>
      <div
        className="mt-3 h-1.5 bg-white"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label="Progress to free shipping"
      >
        <div className="h-full bg-accent transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
