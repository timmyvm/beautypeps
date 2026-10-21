import Image from "next/image";
import Link from "next/link";
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
  figureClassName,
  children,
  size = "display",
  className,
}: {
  title: ReactNode;
  lead?: ReactNode;
  crumbs?: { href?: string; label: string }[];
  figure?: ReactNode;
  /** e.g. "hidden lg:block" when the page's first action must reach the first screen on a phone */
  figureClassName?: string;
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
          figure && "lg:grid-cols-12",
        )}
      >
        {/* The title holds the top left; the sentence and any controls sit level with the foot of the picture. */}
        <div className={cn(figure ? "lg:col-span-7 lg:flex lg:flex-col lg:justify-between lg:gap-12" : "max-w-5xl")}>
          <h1
            className={cn(
              "display-type text-ink",
              size === "display" ? "text-[10.5vw] sm:text-[clamp(2.75rem,5.9vw,5.75rem)]" : "text-head",
            )}
          >
            {title}
          </h1>
          {(lead || children) && (
            <div>
              {lead && <p className="mt-8 max-w-[44ch] text-lead text-ink lg:mt-0">{lead}</p>}
              {children && <div className="mt-8">{children}</div>}
            </div>
          )}
        </div>
        {figure && <div className={cn("lg:col-span-5", figureClassName)}>{figure}</div>}
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

/** Entrance for a part of a section; `i` staggers it after its neighbours. */
export function reveal(i = 0) {
  return { "data-reveal": "", style: { ["--reveal-i" as string]: i } };
}

/** A picture that leads somewhere: a photograph with a title and one line under it. */
export function PictureLink({
  href,
  src,
  alt,
  title,
  text,
  ratio = "aspect-[4/3]",
  sizes = "(min-width: 1024px) 33vw, 100vw",
  index = 0,
  className,
}: {
  href: string;
  src: string;
  alt: string;
  title: string;
  text: string;
  ratio?: string;
  sizes?: string;
  index?: number;
  className?: string;
}) {
  return (
    <Link href={href} className={cn("group block", className)} {...reveal(index)}>
      <div className={cn("relative w-full overflow-hidden bg-surface", ratio)}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <h3 className="mt-4 text-lead font-medium text-ink group-hover:underline group-hover:underline-offset-4">{title}</h3>
      <p className="mt-1 max-w-[44ch] text-body text-ink">{text}</p>
    </Link>
  );
}
