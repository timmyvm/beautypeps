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
    <span className={cn("inline-flex items-baseline gap-2", className)}>
      <span>{formatMoney(cents)}</span>
      {compareAt && compareAt > cents ? (
        <span className="text-[0.85em] text-taupe line-through">{formatMoney(compareAt)}</span>
      ) : null}
    </span>
  );
}

export function Stars({ rating, size = 14, className }: { rating: number; size?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-copper", className)} aria-label={`${rating.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          width={size}
          height={size}
          className={i <= Math.round(rating) ? "fill-current" : "fill-transparent opacity-40"}
          aria-hidden
        />
      ))}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
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
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h2 className="font-display text-3xl leading-tight text-espresso md:text-4xl">{title}</h2>
        {description && <p className="mt-4 text-base leading-relaxed text-cocoa">{description}</p>}
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
    <div className={cn("flex flex-col items-center rounded-2xl border border-dashed border-stone px-6 py-16 text-center", className)}>
      {icon && <div className="mb-4 text-taupe">{icon}</div>}
      <h3 className="font-display text-xl text-espresso">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-cocoa">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-2xl border border-stone/70 bg-cream p-6", className)}>{children}</div>;
}
