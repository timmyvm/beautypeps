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
      <button type="submit" className="flex h-11 items-center text-[15px] text-muted underline-offset-4 hover:text-ink hover:underline">
        Sign out
      </button>
    </form>
  );

  return (
    <div className="container-bp pt-6 pb-16 md:pt-10 md:pb-24">
      <AccountNav isAdmin={user.role === "admin"} signOut={signOut} />
      <div className="mt-8 md:mt-10">{children}</div>
      <div className="mt-12 flex items-center justify-between border-t border-surface-2 pt-4 text-[14px] text-muted sm:hidden">
        <span className="min-w-0 truncate">{user.email}</span>
        {signOut}
      </div>
    </div>
  );
}
