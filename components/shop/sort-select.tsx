"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A filter as a chip: a link to the filtered view that keeps the scroll position, dims while the view loads
 * and says how many formulas it holds.
 */
export function FilterLink({
  href,
  active,
  count,
  children,
  className,
}: {
  href: string;
  active: boolean;
  count?: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "page" : undefined}
      className={cn(
        "press inline-flex h-12 shrink-0 items-center px-5 text-body whitespace-nowrap transition-colors",
        active ? "bg-ink text-white" : "bg-surface text-ink hover:bg-surface-2",
        className,
      )}
    >
      <FilterLinkLabel active={active} count={count}>
        {children}
      </FilterLinkLabel>
    </Link>
  );
}

function FilterLinkLabel({ active, count, children }: { active: boolean; count?: number; children: ReactNode }) {
  const { pending } = useLinkStatus();
  return (
    <span className={cn("inline-flex items-baseline gap-2.5 transition-opacity duration-200", pending && "animate-pulse opacity-60")}>
      {children}
      {count !== undefined && <span className={cn("tabular", active ? "text-white/70" : "text-muted")}>{count}</span>}
    </span>
  );
}

/** A select that writes one search param and navigates; the default value removes the param. */
export function ParamSelect({
  name,
  label,
  options,
  value,
  defaultValue = "",
  stacked = false,
  className,
}: {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  value: string;
  defaultValue?: string;
  stacked?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  return (
    <label className={cn(stacked ? "block text-body" : "flex items-center gap-3 text-body", pending && "opacity-60", className)}>
      <span className={stacked ? "mb-1.5 block" : "whitespace-nowrap"}>{label}</span>
      <select
        value={value}
        onChange={(e) => {
          const qs = new URLSearchParams(searchParams.toString());
          if (e.target.value === defaultValue) qs.delete(name);
          else qs.set(name, e.target.value);
          startTransition(() => router.push(qs.toString() ? `${pathname}?${qs}` : pathname, { scroll: false }));
        }}
        className={cn(
          "select-chevron h-11 appearance-none bg-white pr-10 pl-4 text-body text-ink focus:outline-2 focus:outline-accent",
          stacked && "w-full",
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function SortSelect({
  options,
  value,
  stacked,
}: {
  options: { value: string; label: string }[];
  value: string;
  stacked?: boolean;
}) {
  return <ParamSelect name="sort" label="Sort" options={options} value={value} defaultValue="featured" stacked={stacked} />;
}
