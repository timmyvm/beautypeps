import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/* Admin building blocks. Keep admin pages visually consistent by using these. */

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
    <div className="mb-8">
      {back && (
        <Link href={back.href} className="mb-3 inline-flex items-center gap-1 text-[13px] text-muted hover:text-espresso">
          <ChevronLeft className="size-3.5" /> {back.label}
        </Link>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-espresso">{title}</h1>
          {description && <p className="mt-1.5 text-sm text-muted">{description}</p>}
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
    <section className={cn("rounded-2xl border border-stone/70 bg-cream", className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between gap-4 border-b border-stone/60 px-5 py-4">
          {title && <h2 className="text-sm font-semibold text-espresso">{title}</h2>}
          {actions}
        </div>
      )}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-stone/70 bg-cream p-5">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-muted">{label}</p>
        {icon && <span className="text-copper">{icon}</span>}
      </div>
      <p className="mt-3 text-2xl font-semibold text-espresso">{value}</p>
      {hint && <p className="mt-1 text-[13px] text-taupe">{hint}</p>}
    </div>
  );
}

/** Table wrapper: horizontal scroll on mobile, consistent cell styles via [&_th]/[&_td]. */
export function DataTable({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("relative overflow-x-auto rounded-2xl border border-stone/70 bg-cream", className)}>
      <table
        className={cn(
          "w-full min-w-[640px] text-left text-sm",
          "[&_th]:border-b [&_th]:border-stone/60 [&_th]:bg-ivory/60 [&_th]:px-4 [&_th]:py-3 [&_th]:text-[13px] [&_th]:font-semibold [&_th]:tracking-wider [&_th]:text-muted [&_th]:uppercase",
          "[&_td]:border-b [&_td]:border-stone/40 [&_td]:px-4 [&_td]:py-3 [&_td]:align-middle",
          "[&_tbody_tr:last-child_td]:border-b-0 [&_tbody_tr:hover]:bg-ivory/40",
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
    <div className="mt-6 flex items-center justify-between text-sm text-muted">
      <span>
        Page {page} of {pageCount}
      </span>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link href={href(page - 1)} className="flex items-center gap-1 rounded-lg border border-stone px-3 py-1.5 hover:bg-cream">
            <ChevronLeft className="size-4" /> Prev
          </Link>
        ) : null}
        {page < pageCount ? (
          <Link href={href(page + 1)} className="flex items-center gap-1 rounded-lg border border-stone px-3 py-1.5 hover:bg-cream">
            Next <ChevronRight className="size-4" />
          </Link>
        ) : null}
      </div>
    </div>
  );
}

/** Pill-style filter tabs driven by a query param. */
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
    <div className="mb-4 flex flex-wrap gap-2">
      {options.map((o) => {
        const qs = new URLSearchParams();
        for (const [k, v] of Object.entries(searchParams)) if (v && k !== param && k !== "page") qs.set(k, v);
        if (o.value) qs.set(param, o.value);
        const active = (current ?? "") === o.value;
        return (
          <Link
            key={o.value || "all"}
            href={qs.toString() ? `${basePath}?${qs}` : basePath}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors",
              active ? "border-espresso bg-espresso text-cream" : "border-stone bg-cream text-muted hover:border-taupe",
            )}
          >
            {o.label}
            {o.count !== undefined && <span className="ml-1.5 opacity-60">{o.count}</span>}
          </Link>
        );
      })}
    </div>
  );
}
