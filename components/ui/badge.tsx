import type { ReactNode } from "react";
import type { BadgeTone } from "@/lib/constants";
import { cn } from "@/lib/utils";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-sand text-cocoa",
  copper: "bg-copper-light text-copper-dark",
  sapphire: "bg-sapphire-light text-sapphire",
  sage: "bg-sage-light text-sage",
  amber: "bg-amber-light text-amber",
  danger: "bg-danger-light text-danger",
};

export function Badge({ tone = "neutral", className, children }: { tone?: BadgeTone; className?: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
