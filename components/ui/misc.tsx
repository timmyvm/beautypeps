import { Star } from "lucide-react";
import type { ReactNode } from "react";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

export function Price({
  cents,
  compareAt,
  className,
}: {
  cents: number;
  compareAt?: number | null;
  className?: string;
}) {
  return (
    <span className={cn("tabular inline-flex items-baseline gap-2", className)}>
      <span>{formatMoney(cents)}</span>
      {compareAt && compareAt > cents ? (
        <span className="text-[0.85em] text-muted line-through">{formatMoney(compareAt)}</span>
      ) : null}
    </span>
  );
}

export function Stars({ rating, size = 14, className }: { rating: number; size?: number; className?: string }) {
  return (
    <span role="img" className={cn("inline-flex items-center gap-0.5 text-ink", className)} aria-label={`${rating.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          width={size}
          height={size}
          className={i <= Math.round(rating) ? "fill-current" : "fill-transparent opacity-35"}
          aria-hidden
        />
      ))}
    </span>
  );
}

/**
 * Section heading: the heading names the section; the first sentence carries the rest.
 * (`eyebrow` is accepted for older call sites but no longer rendered — no labels above headings.)
 */
export function SectionHeading({
  title,
  description,
  align = "left",
  className,
  action,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
  action?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "mb-10 flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className={cn("max-w-3xl", align === "center" && "mx-auto")}>
        <h2 className="display-type text-head text-ink">{title}</h2>
        {description && <p className="mt-4 max-w-[60ch] text-body text-ink">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center bg-surface px-6 py-16 text-center", className)}>
      {icon && <div className="mb-4 text-muted">{icon}</div>}
      <h3 className="text-[22px] font-medium text-ink">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-[16px] text-ink">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("bg-surface p-6", className)}>{children}</div>;
}
