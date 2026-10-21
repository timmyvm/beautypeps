import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/auth-forms";
import { getCurrentUser } from "@/lib/auth/session";
import { authDestination } from "@/lib/queries/account";

// Per-visitor (session, bag or order cookie): renders at request time.
export const instant = false;

export const metadata: Metadata = {
  title: "Forgot your password?",
  robots: { index: false, follow: false },
};

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email } = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect(authDestination(user.role, "/account/security"));

  return (
    <AuthShell
      title="Reset your password"
      description="Enter the email you use for Beauty Peps and we'll send you a secure link to choose a new password."
      footer={
        <p>
          Remembered it?{" "}
          <Link href="/login" className="font-medium text-ink underline underline-offset-4">
            Back to sign in
          </Link>
        </p>
      }
    >
      <ForgotPasswordForm defaultEmail={email} />
    </AuthShell>
  );
}
