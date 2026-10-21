import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { getCartCount } from "@/lib/cart";
import { getSettings } from "@/lib/settings";
import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";
import { MAIN_NAV } from "./nav-links";

/** A plain bar on the page ground: wordmark, four links, one action (the bag). */
export async function Header() {
  const [user, cartCount, settings] = await Promise.all([getCurrentUser(), getCartCount(), getSettings()]);
  const accountHref = user ? (user.role === "admin" ? "/admin" : "/account") : "/login";

  return (
    <>
      {settings.announcement && (
        <p className="bg-surface px-[var(--margin)] py-2.5 text-center text-small text-ink">{settings.announcement}</p>
      )}
      <header className="bg-bg">
        <div className="container-bp flex h-16 items-center gap-8 md:h-20">
          <Logo />
          <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
            {MAIN_NAV.map((l) => (
              <Link key={l.href} href={l.href} className="link-quiet text-small font-medium text-ink">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-6">
            <Link href={accountHref} className="link-quiet hidden text-small font-medium text-ink sm:inline">
              {user ? "Account" : "Sign in"}
            </Link>
            <Link
              href="/cart"
              className="press inline-flex h-10 items-center bg-ink px-4 text-small font-medium text-white tabular hover:bg-black"
              aria-label={`Bag, ${cartCount} ${cartCount === 1 ? "item" : "items"}`}
            >
              Bag{cartCount > 0 ? ` (${cartCount})` : ""}
            </Link>
            <MobileMenu signedIn={!!user} isAdmin={user?.role === "admin"} />
          </div>
        </div>
      </header>
    </>
  );
}
