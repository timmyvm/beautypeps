"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const ITEMS: { href: string; label: string }[] = [
  { href: "/account", label: "Overview" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/wishlist", label: "Wishlist" },
  { href: "/account/reviews", label: "Reviews" },
  { href: "/account/profile", label: "Profile" },
  { href: "/account/security", label: "Security" },
];

/** The account's own sections as underline tabs on one rule, under the site header. */
export function AccountNav({ isAdmin, signOut }: { isAdmin: boolean; signOut: ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/account" ? pathname === "/account" : pathname.startsWith(href));

  return (
    <div className="flex items-end gap-6 border-b border-surface-2">
      <nav aria-label="Account" className="scrollbar-none -mb-px min-w-0 flex-1 overflow-x-auto">
        <ul className="flex min-w-max gap-6">
          {ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "flex h-11 items-center border-b-2 text-[15px] transition-colors",
                  isActive(item.href) ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink",
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
          {isAdmin && (
            <li>
              <Link href="/admin" className="flex h-11 items-center border-b-2 border-transparent text-[15px] text-muted hover:text-ink">
                Store admin
              </Link>
            </li>
          )}
        </ul>
      </nav>
      <div className="hidden shrink-0 pb-px sm:block">{signOut}</div>
    </div>
  );
}
