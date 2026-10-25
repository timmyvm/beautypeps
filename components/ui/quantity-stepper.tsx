"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

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
      className={cn("inline-flex items-center bg-surface", size === "sm" ? "h-10" : "h-14", disabled && "opacity-50")}
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={disabled || value <= 1}
        aria-label="Decrease quantity"
        className={cn("press grid h-full place-items-center text-ink hover:bg-surface-2 disabled:opacity-30", size === "sm" ? "w-10" : "w-12")}
      >
        <Minus className="size-4" aria-hidden />
      </button>
      <span className="tabular w-8 text-center text-body font-medium" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
        className={cn("press grid h-full place-items-center text-ink hover:bg-surface-2 disabled:opacity-30", size === "sm" ? "w-10" : "w-12")}
      >
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  );
}
