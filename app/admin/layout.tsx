import { count, eq } from "drizzle-orm";
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
    <div className="border-t border-surface-2 px-5 py-4">
      <p className="truncate text-[13px] text-muted">{admin.email}</p>
      <div className="mt-2 flex gap-4 text-[14px]">
        <Link href="/" target="_blank" className="text-ink hover:underline">
          View store
        </Link>
        <form action={logoutAction}>
          <button type="submit" className="text-ink hover:underline">
            Sign out
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-surface text-ink">
      <AdminSidebar
        counts={{ pendingOrders: pendingOrders.n, pendingReviews: pendingReviews.n, newMessages: newMessages.n }}
        footer={footer}
      />
      <div className="lg:pl-60">
        {/*
          Admin density (app-screens §8, §10): controls 40px tall with 14px text on desktop,
          44px touch targets on a phone. Scoped here so the storefront keeps its larger controls.
        */}
        <main className="mx-auto max-w-[80rem] px-4 py-6 sm:px-6 lg:px-8 lg:py-8 lg:[&_.press]:h-10 [&_.press]:text-[14px] lg:[&_input.h-12]:h-10 lg:[&_select.h-12]:h-10 [&_input]:text-[14px] [&_select]:text-[14px] [&_textarea]:text-[14px]">
          {children}
        </main>
      </div>
    </div>
  );
}
