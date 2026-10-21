import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Heading row used at the top of every account page. */
export function AccountHeading({
  title,
  description,
  action,
  back,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-6">
      {back && (
        <Link href={back.href} className="mb-3 inline-flex items-center gap-1 text-[13px] text-muted hover:text-ink">
          <ChevronLeft className="size-3.5" aria-hidden /> {back.label}
        </Link>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[24px] leading-tight font-semibold tracking-[-0.01em] text-ink">{title}</h1>
          {description && <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{description}</p>}
        </div>
        {action && <div className="flex flex-wrap gap-2">{action}</div>}
      </div>
    </div>
  );
}

export function Banner({ tone = "sage", children }: { tone?: "sage" | "copper" | "amber"; children: ReactNode }) {
  return (
    <div
      role="status"
      className={cn(
        "mb-6 px-5 py-4 text-[15px]",
        tone === "sage" && "bg-sage-light text-sage",
        tone === "copper" && "bg-accent-soft text-accent-strong",
        tone === "amber" && "bg-amber-light text-amber",
      )}
    >
      {children}
    </div>
  );
}

export function Pager({ page, pageCount, basePath }: { page: number; pageCount: number; basePath: string }) {
  if (pageCount <= 1) return null;
  const href = (p: number) => (p > 1 ? `${basePath}?page=${p}` : basePath);
  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-between text-[14px] text-muted">
      <span>
        Page {page} of {pageCount}
      </span>
      <div className="flex gap-2">
        {page > 1 && (
          <Link
            href={href(page - 1)}
            className="flex h-10 items-center gap-1 bg-surface px-4 text-ink hover:bg-surface-2"
          >
            <ChevronLeft className="size-4" aria-hidden /> Newer
          </Link>
        )}
        {page < pageCount && (
          <Link
            href={href(page + 1)}
            className="flex h-10 items-center gap-1 bg-surface px-4 text-ink hover:bg-surface-2"
          >
            Older <ChevronRight className="size-4" aria-hidden />
          </Link>
        )}
      </div>
    </nav>
  );
}
