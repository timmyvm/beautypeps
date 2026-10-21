import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/auth-forms";
import { getCurrentUser } from "@/lib/auth/session";
import { authDestination } from "@/lib/queries/account";

export const metadata: Metadata = {
  title: "Create an account",
  robots: { index: false, follow: false },
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; email?: string }>;
}) {
  const { next, email } = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect(authDestination(user.role, next));

  return (
    <AuthShell
      title="Create your account"
      description="Faster checkout, order tracking and a wishlist for the peptides you're curious about."
      footer={
        <p>
          Already have an account?{" "}
          <Link
            href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`}
            className="font-medium text-ink underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <RegisterForm next={next} defaultEmail={email} />
    </AuthShell>
  );
}
