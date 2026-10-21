import Link from "next/link";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { getCartCount } from "@/lib/cart";
import { getSettings } from "@/lib/settings";
import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";
import { MAIN_NAV } from "./nav-links";

/** A plain bar on the page ground: wordmark, four links, one action (the bag). */
export async function Header() {
  const settings = await getSettings();

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
          {/* The bar is part of every page's static shell; the visitor's own bag and sign-in stream in. */}
          <Suspense fallback={<HeaderActions />}>
            <VisitorActions />
          </Suspense>
        </div>
      </header>
    </>
  );
}

async function VisitorActions() {
  const [user, cartCount] = await Promise.all([getCurrentUser(), getCartCount()]);
  return <HeaderActions user={user ? { isAdmin: user.role === "admin" } : null} cartCount={cartCount} />;
}

function HeaderActions({ user = null, cartCount = 0 }: { user?: { isAdmin: boolean } | null; cartCount?: number }) {
  const accountHref = user ? (user.isAdmin ? "/admin" : "/account") : "/login";
  return (
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
      <MobileMenu signedIn={!!user} isAdmin={!!user?.isAdmin} />
    </div>
  );
}
