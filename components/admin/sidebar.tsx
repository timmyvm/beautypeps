"use client";

import {
  BookOpen,
  FlaskConical,
  FolderTree,
  Inbox,
  LayoutDashboard,
  Mail,
  Menu,
  Package,
  Percent,
  Settings,
  ShoppingCart,
  Star,
  Users,
  Newspaper,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: LucideIcon; countKey?: keyof SidebarCounts };
export type SidebarCounts = { pendingOrders: number; pendingReviews: number; newMessages: number };

const SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: "Store",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/orders", label: "Orders", icon: ShoppingCart, countKey: "pendingOrders" },
      { href: "/admin/customers", label: "Customers", icon: Users },
      { href: "/admin/discounts", label: "Discounts", icon: Percent },
    ],
  },
  {
    title: "Catalogue",
    items: [
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/categories", label: "Categories", icon: FolderTree },
      { href: "/admin/reviews", label: "Reviews", icon: Star, countKey: "pendingReviews" },
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
    title: "Communication",
    items: [
      { href: "/admin/messages", label: "Messages", icon: Inbox, countKey: "newMessages" },
      { href: "/admin/subscribers", label: "Subscribers", icon: Newspaper },
      { href: "/admin/emails", label: "Email log", icon: Mail },
    ],
  },
  {
    title: "System",
    items: [{ href: "/admin/settings", label: "Settings", icon: Settings }],
  },
];

export function AdminSidebar({ counts, footer }: { counts: SidebarCounts; footer: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  const nav = (
    <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-6" aria-label="Admin">
      {SECTIONS.map((section) => (
        <div key={section.title}>
          <p className="mb-2 px-3 text-[10px] font-semibold tracking-[0.2em] text-cream/40 uppercase">{section.title}</p>
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
              const count = item.countKey ? counts[item.countKey] : 0;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      active ? "bg-cream/10 text-cream" : "text-cream/65 hover:bg-cream/5 hover:text-cream",
                    )}
                  >
                    <item.icon className="size-4" aria-hidden />
                    <span className="flex-1">{item.label}</span>
                    {count > 0 && (
                      <span className="rounded-full bg-copper px-1.5 text-[10px] leading-4.5 font-semibold text-cream">
                        {count}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between bg-espresso px-4 text-cream lg:hidden">
        <button type="button" onClick={() => setOpen(true)} aria-label="Open admin menu" className="-ml-1 p-1">
          <Menu className="size-5" />
        </button>
        <span className="font-display text-lg">beauty peps admin</span>
        <span className="w-6" />
      </div>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-espresso lg:flex">
        <div className="flex h-16 items-center px-6">
          <Link href="/admin" className="font-display text-xl text-cream">
            beauty peps <span className="ml-1 font-sans text-[10px] tracking-[0.2em] text-copper-light uppercase">admin</span>
          </Link>
        </div>
        {nav}
        {footer}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-espresso">
            <div className="flex h-14 items-center justify-between px-5 text-cream">
              <span className="font-display text-lg">beauty peps admin</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close menu">
                <X className="size-5" />
              </button>
            </div>
            {nav}
            {footer}
          </aside>
        </div>
      )}
    </>
  );
}
