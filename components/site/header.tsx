import { ChevronDown, Search, ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { getCartCount } from "@/lib/cart";
import { getSettings } from "@/lib/settings";
import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";
import { CONCERN_LINKS, LEARN_LINKS, SHOP_LINKS } from "./nav-links";

export async function Header() {
  const [user, cartCount, settings] = await Promise.all([getCurrentUser(), getCartCount(), getSettings()]);

  return (
    <>
      {settings.announcement && (
        <div className="bg-espresso px-4 py-2 text-center text-[11px] font-medium tracking-[0.16em] text-cream uppercase">
          {settings.announcement}
        </div>
      )}
      <header className="sticky top-0 z-40 border-b border-stone/60 bg-cream/90 backdrop-blur-md">
        <div className="container-bp flex h-16 items-center gap-6 md:h-20">
          <MobileMenu signedIn={!!user} isAdmin={user?.role === "admin"} />
          <Logo />

          <nav aria-label="Main" className="ml-6 hidden items-center gap-1 lg:flex">
            <div className="group relative">
              <Link
                href="/shop"
                className="flex items-center gap-1 rounded-full px-4 py-2 text-sm text-espresso hover:bg-espresso/5"
              >
                Shop <ChevronDown className="size-3.5 transition-transform group-hover:rotate-180" aria-hidden />
              </Link>
              <div className="invisible absolute top-full left-0 pt-3 opacity-0 transition-all group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                <div className="grid w-[460px] grid-cols-2 gap-6 rounded-2xl border border-stone/70 bg-cream p-6 shadow-xl shadow-espresso/5">
                  <div>
                    <p className="eyebrow mb-3">Categories</p>
                    <ul className="space-y-2">
                      {SHOP_LINKS.map((l) => (
                        <li key={l.href}>
                          <Link href={l.href} className="text-sm text-cocoa hover:text-copper-dark">
                            {l.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="eyebrow mb-3">By concern</p>
                    <ul className="space-y-2">
                      {CONCERN_LINKS.map((l) => (
                        <li key={l.href}>
                          <Link href={l.href} className="text-sm text-cocoa hover:text-copper-dark">
                            {l.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <Link href="/peptides" className="rounded-full px-4 py-2 text-sm text-espresso hover:bg-espresso/5">
              Peptide Library
            </Link>

            <div className="group relative">
              <Link
                href="/learn"
                className="flex items-center gap-1 rounded-full px-4 py-2 text-sm text-espresso hover:bg-espresso/5"
              >
                Learn <ChevronDown className="size-3.5 transition-transform group-hover:rotate-180" aria-hidden />
              </Link>
              <div className="invisible absolute top-full left-0 pt-3 opacity-0 transition-all group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                <ul className="grid w-[420px] grid-cols-2 gap-1 rounded-2xl border border-stone/70 bg-cream p-3 shadow-xl shadow-espresso/5">
                  {LEARN_LINKS.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="block rounded-xl p-3 hover:bg-ivory">
                        <span className="block text-sm font-medium text-espresso">{l.label}</span>
                        <span className="mt-0.5 block text-xs text-cocoa">{l.description}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <Link href="/about" className="rounded-full px-4 py-2 text-sm text-espresso hover:bg-espresso/5">
              About
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <Link
              href="/search"
              aria-label="Search"
              className="grid size-10 place-items-center rounded-full text-espresso hover:bg-espresso/5"
            >
              <Search className="size-5" aria-hidden />
            </Link>
            <Link
              href={user ? (user.role === "admin" ? "/admin" : "/account") : "/login"}
              aria-label={user ? "My account" : "Sign in"}
              className="hidden size-10 place-items-center rounded-full text-espresso hover:bg-espresso/5 sm:grid"
            >
              <User className="size-5" aria-hidden />
            </Link>
            <Link
              href="/cart"
              aria-label={`Cart, ${cartCount} items`}
              className="relative grid size-10 place-items-center rounded-full text-espresso hover:bg-espresso/5"
            >
              <ShoppingBag className="size-5" aria-hidden />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 grid min-w-4.5 place-items-center rounded-full bg-copper px-1 text-[10px] leading-4.5 font-semibold text-cream">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
