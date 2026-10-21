"use client";

import {
  BookOpen,
  FlaskConical,
  FolderTree,
  Inbox,
  LayoutDashboard,
  Mail,
  Newspaper,
  Package,
  Percent,
  Settings,
  ShoppingCart,
  Star,
  Users,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/*
 * Admin shell — "Open plane" (tasteskill app sheet: achromatic ledger, seed 1969225264).
 * A labelled sidebar on the page ground, one hairline from the canvas; the active item is a neutral
 * grey pill; counts appear only on queues that need action, with their noun.
 */

type NavItem = { href: string; label: string; icon: LucideIcon; count?: (c: SidebarCounts) => string | null };
export type SidebarCounts = { pendingOrders: number; pendingReviews: number; newMessages: number };

const SECTIONS: { title?: string; items: NavItem[] }[] = [
  {
    items: [
      { href: "/admin", label: "Overview", icon: LayoutDashboard },
      { href: "/admin/orders", label: "Orders", icon: ShoppingCart, count: (c) => (c.pendingOrders ? `${c.pendingOrders} to pack` : null) },
      { href: "/admin/customers", label: "Customers", icon: Users },
      { href: "/admin/discounts", label: "Discounts", icon: Percent },
    ],
  },
  {
    title: "Catalogue",
    items: [
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/categories", label: "Categories", icon: FolderTree },
      { href: "/admin/reviews", label: "Reviews", icon: Star, count: (c) => (c.pendingReviews ? `${c.pendingReviews} waiting` : null) },
    ],
  },
  {
    title: "Content",
    items: [
      { href: "/admin/peptides", label: "Peptide library", icon: FlaskConical },
      { href: "/admin/articles", label: "Journal", icon: BookOpen },
    ],
  },
  {
    title: "Customers write in",
    items: [
      { href: "/admin/messages", label: "Messages", icon: Inbox, count: (c) => (c.newMessages ? `${c.newMessages} unread` : null) },
      { href: "/admin/subscribers", label: "Subscribers", icon: Newspaper },
      { href: "/admin/emails", label: "Email log", icon: Mail },
    ],
  },
];

const UTILITIES: NavItem[] = [{ href: "/admin/settings", label: "Settings", icon: Settings }];

const isActive = (pathname: string, href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

function NavLink({ item, pathname, counts }: { item: NavItem; pathname: string; counts: SidebarCounts }) {
  const active = isActive(pathname, item.href);
  const count = item.count?.(counts);
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-11 items-center gap-2.5 px-3 text-[14px] text-ink transition-colors lg:h-8",
        active ? "bg-surface-2 font-medium" : "hover:bg-surface-2/60",
      )}
    >
      <item.icon className="size-4 shrink-0 text-muted" strokeWidth={1.6} aria-hidden />
      <span className="flex-1 truncate">{item.label}</span>
      {count && <span className="text-[13px] text-muted tabular-nums">{count}</span>}
    </Link>
  );
}

export function AdminSidebar({ counts, footer }: { counts: SidebarCounts; footer: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const current = [...SECTIONS.flatMap((s) => s.items), ...UTILITIES].find((i) => isActive(pathname, i.href));

  const brand = (
    <Link href="/admin" className="flex items-center gap-3 px-3">
      <Image src="/images/brand/logo-wordmark.png" alt="Beauty Peps" width={1229} height={301} className="h-6 w-auto" priority />
      <span className="text-[13px] text-muted">Store admin</span>
    </Link>
  );

  const nav = (
    <nav className="flex flex-1 flex-col overflow-y-auto px-2 pt-4 pb-4" aria-label="Admin">
      {SECTIONS.map((section, i) => (
        <div key={section.title ?? i} className={cn(i > 0 && "mt-6")}>
          {section.title && <p className="mb-1.5 px-3 text-[13px] text-muted">{section.title}</p>}
          <ul className="space-y-0.5">
            {section.items.map((item) => (
              <li key={item.href}>
                <NavLink item={item} pathname={pathname} counts={counts} />
              </li>
            ))}
          </ul>
        </div>
      ))}
      <ul className="mt-auto space-y-0.5 pt-6">
        {UTILITIES.map((item) => (
          <li key={item.href}>
            <NavLink item={item} pathname={pathname} counts={counts} />
          </li>
        ))}
      </ul>
    </nav>
  );

  return (
    <>
      {/* Phone and tablet: a 48px bar with the screen's name and a menu */}
      <div className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-surface-2 bg-surface px-4 lg:hidden">
        <Link href="/admin" aria-label="Admin overview">
          <Image src="/images/brand/logo-wordmark.png" alt="Beauty Peps" width={1229} height={301} className="h-5 w-auto" />
        </Link>
        <span className="text-[14px] font-medium text-ink">{current?.label ?? "Admin"}</span>
        <button type="button" onClick={() => setOpen(true)} className="h-11 text-[14px] font-medium text-ink" aria-expanded={open}>
          Menu
        </button>
      </div>

      {/* Desktop sidebar on the page ground */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-surface-2 bg-surface pt-6 lg:flex">
        {brand}
        {nav}
        {footer}
      </aside>

      {/* Phone sheet */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-surface lg:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
          <div className="flex h-12 items-center justify-between border-b border-surface-2 px-4">
            <span className="text-[14px] font-medium">Store admin</span>
            <button type="button" onClick={() => setOpen(false)} className="h-11 text-[14px] font-medium">
              Close
            </button>
          </div>
          {nav}
          {footer}
        </div>
      )}
    </>
  );
}
