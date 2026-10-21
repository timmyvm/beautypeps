import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/*
 * Admin building blocks — achromatic ledger: white panels with one hairline on the stone ground,
 * a noun title at 24px, 13px grey sentence-case table headers, rules instead of zebra bands.
 */

type ButtonVariant = "primary" | "copper" | "dark" | "outline" | "ghost" | "danger" | "light";

/**
 * Achromatic chrome: the admin's primary is near-black, never the brand hue, and its secondary is a
 * grey fill one step darker than the stone ground so it still reads as a button there.
 */
export function adminButtonClasses({
  variant = "outline",
  size = "sm",
  className,
}: { variant?: ButtonVariant; size?: "sm" | "md"; className?: string } = {}) {
  if (variant === "primary" || variant === "copper") variant = "dark";
  return buttonClasses({ variant, size, className: cn(variant === "outline" && "bg-surface-2 hover:bg-stone", className) });
}

export function AdminPageHeader({
  title,
  description,
  actions,
  back,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-6">
      {back && (
        <Link href={back.href} className="mb-2 inline-flex items-center gap-1 text-[13px] text-muted hover:text-ink">
          <ChevronLeft className="size-3.5" aria-hidden /> {back.label}
        </Link>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-[24px] leading-tight font-semibold tracking-[-0.01em] text-ink">{title}</h1>
          {description && <p className="mt-1 text-[15px] text-muted">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function Panel({
  title,
  actions,
  className,
  bodyClassName,
  children,
}: {
  title?: ReactNode;
  actions?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("border border-surface-2 bg-white", className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between gap-4 px-5 pt-4 pb-1">
          {title && <h2 className="text-[16px] font-semibold text-ink">{title}</h2>}
          {actions}
        </div>
      )}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

/** A figure with its label above it. Group several in a KpiStrip rather than giving each a tile. */
export function StatCard({ label, value, hint }: { label: string; value: ReactNode; hint?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="min-w-0 px-5 py-4">
      <p className="text-[13px] text-muted">{label}</p>
      <p className="mt-1 text-[24px] leading-tight font-medium text-ink tabular-nums">{value}</p>
      {hint && <p className="mt-0.5 text-[13px] text-muted">{hint}</p>}
    </div>
  );
}

/** One container split by hairlines into equal columns. */
export function KpiStrip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 divide-surface-2 border border-surface-2 bg-white sm:grid-cols-4 sm:divide-x [&>*:nth-child(n+3)]:border-t [&>*:nth-child(n+3)]:border-surface-2 sm:[&>*:nth-child(n+3)]:border-t-0",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Table wrapper: scrolls inside its own frame on small screens; rules, not bands. */
export function DataTable({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("relative overflow-x-auto border border-surface-2 bg-white", className)}>
      <table
        className={cn(
          "w-full min-w-[640px] text-left text-[14px]",
          "[&_th]:h-10 [&_th]:px-4 [&_th]:text-[13px] [&_th]:font-normal [&_th]:whitespace-nowrap [&_th]:text-muted",
          "[&_td]:border-t [&_td]:border-surface [&_td]:px-4 [&_td]:py-3 [&_td]:align-middle",
          "[&_td.text-right]:tabular-nums [&_tbody_tr:hover]:bg-surface/60",
        )}
      >
        {children}
      </table>
    </div>
  );
}

/** Server-rendered pagination that preserves the current query string. */
export function Pagination({
  page,
  pageCount,
  basePath,
  searchParams,
}: {
  page: number;
  pageCount: number;
  basePath: string;
  searchParams: Record<string, string | undefined>;
}) {
  if (pageCount <= 1) return null;
  const href = (p: number) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) if (v && k !== "page") qs.set(k, v);
    if (p > 1) qs.set("page", String(p));
    const s = qs.toString();
    return s ? `${basePath}?${s}` : basePath;
  };
  return (
    <div className="mt-4 flex items-center justify-between text-[14px] text-muted">
      <span className="tabular-nums">
        Page {page} of {pageCount}
      </span>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link href={href(page - 1)} className="flex h-9 items-center gap-1 bg-surface-2 px-3 text-ink hover:bg-stone">
            <ChevronLeft className="size-4" aria-hidden /> Previous
          </Link>
        ) : null}
        {page < pageCount ? (
          <Link href={href(page + 1)} className="flex h-9 items-center gap-1 bg-surface-2 px-3 text-ink hover:bg-stone">
            Next <ChevronRight className="size-4" aria-hidden />
          </Link>
        ) : null}
      </div>
    </div>
  );
}

/** Underline tabs on a full-width rule, driven by a query param. */
export function FilterTabs({
  basePath,
  param,
  current,
  options,
  searchParams = {},
}: {
  basePath: string;
  param: string;
  current?: string;
  options: { value: string; label: string; count?: number }[];
  searchParams?: Record<string, string | undefined>;
}) {
  return (
    <div className="scrollbar-none mb-5 overflow-x-auto border-b border-surface-2">
      <div className="flex min-w-max gap-6">
        {options.map((o) => {
          const qs = new URLSearchParams();
          for (const [k, v] of Object.entries(searchParams)) if (v && k !== param && k !== "page") qs.set(k, v);
          if (o.value) qs.set(param, o.value);
          const active = (current ?? "") === o.value;
          return (
            <Link
              key={o.value || "all"}
              href={qs.toString() ? `${basePath}?${qs}` : basePath}
              aria-current={active ? "page" : undefined}
              className={cn(
                "-mb-px flex h-10 items-center gap-1.5 border-b-2 text-[14px] transition-colors",
                active ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink",
              )}
            >
              {o.label}
              {o.count !== undefined && <span className="text-muted tabular-nums">{o.count}</span>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
