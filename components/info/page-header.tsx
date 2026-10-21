import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "./breadcrumbs";

/*
 * Header for the education pages: the title and one sentence on the left, the page's picture on the
 * right, so the first screen says what this is and is never half empty.
 */
export function PageHeader({
  title,
  lead,
  crumbs,
  figure,
  children,
  size = "display",
  className,
}: {
  title: ReactNode;
  lead?: ReactNode;
  crumbs?: { href?: string; label: string }[];
  figure?: ReactNode;
  children?: ReactNode;
  size?: "display" | "head";
  className?: string;
}) {
  return (
    <header className={cn("container-bp pt-8 lg:pt-10", className)}>
      {crumbs && <Breadcrumbs items={crumbs} />}
      <div
        className={cn(
          "mt-8 grid grid-cols-1 gap-10 lg:mt-12 lg:gap-[var(--gutter)]",
          figure && "lg:grid-cols-12 lg:items-end",
        )}
      >
        <div className={cn(figure ? "lg:col-span-7 lg:pb-2" : "max-w-5xl")}>
          <h1
            className={cn(
              "display-type text-ink",
              size === "display" ? "text-[10.5vw] sm:text-[clamp(2.75rem,5.9vw,5.75rem)]" : "text-head",
            )}
          >
            {title}
          </h1>
          {lead && <p className="mt-8 max-w-[44ch] text-lead text-ink">{lead}</p>}
          {children && <div className="mt-8">{children}</div>}
        </div>
        {figure && <div className="lg:col-span-5">{figure}</div>}
      </div>
    </header>
  );
}

/** A picture with square corners at a fixed ratio, for headers and section figures. */
export function Figure({
  children,
  caption,
  className,
  ratio = "aspect-[4/5]",
}: {
  children: ReactNode;
  caption?: ReactNode;
  className?: string;
  ratio?: string;
}) {
  return (
    <figure className={className}>
      <div className={cn("relative w-full overflow-hidden bg-surface", ratio)}>{children}</div>
      {caption && <figcaption className="mt-3 text-small text-ink">{caption}</figcaption>}
    </figure>
  );
}
