"use client";

import { Heart, Home, KeyRound, MapPin, Package, Shield, Star, UserRound, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const ITEMS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/account", label: "Overview", icon: Home },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/reviews", label: "Reviews", icon: Star },
  { href: "/account/profile", label: "Profile", icon: UserRound },
  { href: "/account/security", label: "Security", icon: KeyRound },
];

export function AccountNav({ isAdmin, signOut }: { isAdmin: boolean; signOut: ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/account" ? pathname === "/account" : pathname.startsWith(href));

  return (
    <>
      {/* Mobile: horizontally scrolling tabs */}
      <nav aria-label="Account" className="-mx-4 lg:hidden">
        <ul className="scrollbar-none flex gap-2 overflow-x-auto px-4 pb-1">
          {ITEMS.map((item) => (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition-colors",
                  isActive(item.href)
                    ? "border-espresso bg-espresso text-cream"
                    : "border-stone bg-cream text-muted hover:border-taupe",
                )}
              >
                <item.icon className="size-3.5" aria-hidden />
                {item.label}
              </Link>
            </li>
          ))}
          {isAdmin && (
            <li className="shrink-0">
              <Link
                href="/admin"
                className="flex items-center gap-1.5 rounded-full border border-copper/40 px-4 py-2 text-sm text-copper-dark"
              >
                <Shield className="size-3.5" aria-hidden /> Admin
              </Link>
            </li>
          )}
        </ul>
      </nav>

      {/* Desktop: vertical list */}
      <nav aria-label="Account" className="hidden lg:block">
        <ul className="space-y-1">
          {ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-colors",
                  isActive(item.href)
                    ? "bg-espresso text-cream"
                    : "text-muted hover:bg-ivory hover:text-espresso",
                )}
              >
                <item.icon className="size-4" aria-hidden />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-6 space-y-1 border-t border-stone/70 pt-6">
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-copper-dark hover:bg-copper-light/30"
            >
              <Shield className="size-4" aria-hidden /> Admin panel
            </Link>
          )}
          {signOut}
        </div>
      </nav>
    </>
  );
}
