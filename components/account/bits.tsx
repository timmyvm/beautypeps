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
    <div className="mb-8">
      {back && (
        <Link href={back.href} className="mb-3 inline-flex items-center gap-1 text-[13px] text-muted hover:text-ink">
          <ChevronLeft className="size-3.5" aria-hidden /> {back.label}
        </Link>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold leading-tight text-ink md:text-4xl">{title}</h1>
          {description && <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>}
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
        "mb-6 rounded-2xl px-5 py-4 text-sm",
        tone === "sage" && "bg-sage-light text-sage",
        tone === "copper" && "bg-copper-light/50 text-copper-dark",
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
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-between text-sm text-muted">
      <span>
        Page {page} of {pageCount}
      </span>
      <div className="flex gap-2">
        {page > 1 && (
          <Link
            href={href(page - 1)}
            className="flex items-center gap-1 rounded-full border border-stone px-4 py-2 hover:border-taupe"
          >
            <ChevronLeft className="size-4" aria-hidden /> Newer
          </Link>
        )}
        {page < pageCount && (
          <Link
            href={href(page + 1)}
            className="flex items-center gap-1 rounded-full border border-stone px-4 py-2 hover:border-taupe"
          >
            Older <ChevronRight className="size-4" aria-hidden />
          </Link>
        )}
      </div>
    </nav>
  );
}
