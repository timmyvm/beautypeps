import { LogOut } from "lucide-react";
import type { Metadata } from "next";
import { AccountNav } from "@/components/account/account-nav";
import { logoutAction } from "@/lib/actions/session";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: { default: "My account", template: "%s · My account · Beauty Peps" },
  robots: { index: false, follow: false },
};

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("/account");

  const signOut = (
    <form action={logoutAction}>
      <button
        type="submit"
        className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm text-muted transition-colors hover:bg-ivory hover:text-espresso"
      >
        <LogOut className="size-4" aria-hidden /> Sign out
      </button>
    </form>
  );

  return (
    <div className="container-bp py-8 md:py-14">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3 lg:mb-10">
        <div>
          <p className="eyebrow mb-2">My account</p>
          <p className="text-sm text-muted">
            Signed in as <span className="font-medium text-espresso">{user.email}</span>
          </p>
        </div>
        <form action={logoutAction} className="lg:hidden">
          <button type="submit" className="flex items-center gap-1.5 text-sm text-muted underline-offset-4 hover:underline">
            <LogOut className="size-3.5" aria-hidden /> Sign out
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
        <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
          <AccountNav isAdmin={user.role === "admin"} signOut={signOut} />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
