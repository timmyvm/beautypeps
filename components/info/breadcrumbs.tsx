import Link from "next/link";
import { cn } from "@/lib/utils";
import { JsonLd, siteUrl } from "./json-ld";

/** The trail above a page, published to search engines as a BreadcrumbList too. */
export function Breadcrumbs({
  items,
  className,
}: {
  items: { href?: string; label: string }[];
  className?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className={cn("text-small text-ink", className)}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: items.map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: item.label,
            ...(item.href && { item: `${siteUrl()}${item.href}` }),
          })),
        }}
      />
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-2">
            {i > 0 && (
              <span aria-hidden className="text-muted">
                /
              </span>
            )}
            {item.href ? (
              <Link href={item.href} className="link-quiet">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-muted">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
