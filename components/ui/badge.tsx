import type { ReactNode } from "react";
import type { BadgeTone } from "@/lib/constants";
import { cn } from "@/lib/utils";

// Status marks for app screens (orders, reviews). Public pages put this information in the words instead.
const tones: Record<BadgeTone, string> = {
  neutral: "bg-surface-2 text-ink",
  copper: "bg-accent-soft text-accent-strong",
  sapphire: "bg-accent-soft text-accent-strong",
  sage: "bg-sage-light text-sage",
  amber: "bg-amber-light text-amber",
  danger: "bg-danger-light text-danger",
};

export function Badge({ tone = "neutral", className, children }: { tone?: BadgeTone; className?: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 text-[13px] leading-5 font-medium whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
