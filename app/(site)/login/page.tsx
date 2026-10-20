import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/auth-forms";
import { getCurrentUser } from "@/lib/auth/session";
import { authDestination } from "@/lib/queries/account";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; email?: string }>;
}) {
  const { next, email } = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect(authDestination(user.role, next));

  const registerHref = `/register${next ? `?next=${encodeURIComponent(next)}` : ""}`;

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in"
      description="Access your orders, saved addresses and wishlist."
      footer={
        <p>
          New to Beauty Peps?{" "}
          <Link href={registerHref} className="font-medium text-copper-dark hover:underline">
            Create an account
          </Link>
          <span className="mt-2 block text-xs text-taupe">
            Checked out as a guest?{" "}
            <Link href="/track" className="underline hover:text-cocoa">
              Track your order
            </Link>{" "}
            with your order number and email.
          </span>
        </p>
      }
    >
      <LoginForm next={next} defaultEmail={email} />
    </AuthShell>
  );
}
