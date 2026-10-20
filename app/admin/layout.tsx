import { count, eq } from "drizzle-orm";
import { ExternalLink, LogOut } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AdminSidebar } from "@/components/admin/sidebar";
import { logoutAction } from "@/lib/actions/session";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { contactMessages, orders, reviews } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin · Beauty Peps" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  const [[pendingOrders], [pendingReviews], [newMessages]] = await Promise.all([
    db.select({ n: count() }).from(orders).where(eq(orders.status, "paid")),
    db.select({ n: count() }).from(reviews).where(eq(reviews.status, "pending")),
    db.select({ n: count() }).from(contactMessages).where(eq(contactMessages.status, "new")),
  ]);

  const footer = (
    <div className="border-t border-cream/10 p-4">
      <p className="truncate text-xs text-cream/50">Signed in as</p>
      <p className="truncate text-sm text-cream">{admin.email}</p>
      <div className="mt-3 flex gap-2">
        <Link
          href="/"
          target="_blank"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-cream/15 py-1.5 text-xs text-cream/80 hover:bg-cream/5"
        >
          <ExternalLink className="size-3.5" /> View store
        </Link>
        <form action={logoutAction} className="flex-1">
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-cream/15 py-1.5 text-xs text-cream/80 hover:bg-cream/5"
          >
            <LogOut className="size-3.5" /> Sign out
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-ivory">
      <AdminSidebar
        counts={{ pendingOrders: pendingOrders.n, pendingReviews: pendingReviews.n, newMessages: newMessages.n }}
        footer={footer}
      />
      <div className="lg:pl-64">
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
