"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LEARN_LINKS, SHOP_LINKS } from "./nav-links";

/** Phone navigation: a "Menu" text button that opens a full-screen sheet. */
export function MobileMenu({ signedIn, isAdmin }: { signedIn: boolean; isAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close whenever the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        className="press h-10 text-small font-medium text-ink"
      >
        Menu
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-bg" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="flex h-16 shrink-0 items-center justify-between px-[var(--margin)]">
            <span className="text-[16px] font-medium">Menu</span>
            <button type="button" onClick={() => setOpen(false)} className="press h-10 text-[16px] font-medium">
              Close
            </button>
          </div>
          <nav aria-label="Mobile" className="flex flex-col gap-10 px-[var(--margin)] pt-4 pb-12">
            <ul className="space-y-1">
              {SHOP_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="display-type block py-1.5 text-[34px]">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="space-y-3">
              {LEARN_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="block text-[20px] font-medium">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="space-y-3 text-[17px]">
              <li>
                <Link href={signedIn ? "/account" : "/login"}>{signedIn ? "My account" : "Sign in"}</Link>
              </li>
              {isAdmin && (
                <li>
                  <Link href="/admin" className="text-accent">
                    Admin panel
                  </Link>
                </li>
              )}
              <li>
                <Link href="/search">Search</Link>
              </li>
              <li>
                <Link href="/track">Track an order</Link>
              </li>
              <li>
                <Link href="/faq">FAQ</Link>
              </li>
              <li>
                <Link href="/contact">Contact</Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}
