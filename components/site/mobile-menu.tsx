"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CONCERN_LINKS, LEARN_LINKS, SHOP_LINKS } from "./nav-links";

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
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="-ml-2 grid size-10 place-items-center rounded-full text-espresso hover:bg-espresso/5"
      >
        <Menu className="size-5" aria-hidden />
      </button>

      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col overflow-y-auto bg-cream p-6 shadow-2xl animate-fade-up">
            <div className="mb-8 flex items-center justify-between">
              <span className="font-display text-xl">Menu</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="grid size-10 place-items-center rounded-full hover:bg-espresso/5"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>

            <MenuGroup title="Shop" links={SHOP_LINKS} />
            <MenuGroup title="Shop by concern" links={CONCERN_LINKS} />
            <MenuGroup title="Learn" links={LEARN_LINKS} />
            <MenuGroup
              title="Help"
              links={[
                { href: "/about", label: "About us" },
                { href: "/faq", label: "FAQ" },
                { href: "/track", label: "Track an order" },
                { href: "/contact", label: "Contact" },
              ]}
            />

            <div className="mt-auto border-t border-stone pt-6">
              {signedIn ? (
                <div className="flex flex-col gap-3">
                  <Link href="/account" className="text-sm font-medium">
                    My account
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" className="text-sm font-medium text-copper-dark">
                      Admin panel
                    </Link>
                  )}
                </div>
              ) : (
                <div className="flex gap-4">
                  <Link href="/login" className="text-sm font-medium">
                    Sign in
                  </Link>
                  <Link href="/register" className="text-sm font-medium text-copper-dark">
                    Create account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuGroup({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div className="mb-7">
      <p className="eyebrow mb-3">{title}</p>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-[15px] text-espresso">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
