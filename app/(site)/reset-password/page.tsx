import { LinkIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/auth-forms";
import { ButtonLink } from "@/components/ui/button";
import { getValidPasswordReset } from "@/lib/queries/account";

export const metadata: Metadata = {
  title: "Choose a new password",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const reset = await getValidPasswordReset(token);

  if (!token || !reset) {
    return (
      <AuthShell
        title="This link has expired"
        description="Password reset links work once and last for an hour. Request a fresh one and we'll email it straight over."
      >
        <div className="rounded-2xl border border-stone bg-surface/60 p-6 text-center">
          <LinkIcon className="mx-auto size-7 text-muted" aria-hidden />
          <p className="mt-3 text-sm text-muted">The link may have been used already or copied incompletely.</p>
          <ButtonLink href="/forgot-password" className="mt-5">
            Request a new link
          </ButtonLink>
          <p className="mt-4 text-[13px] text-muted">
            or{" "}
            <Link href="/login" className="underline hover:text-muted">
              return to sign in
            </Link>
          </p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Choose a new password"
      description="For your security, this will sign you out on any other devices."
    >
      <ResetPasswordForm token={token} />
    </AuthShell>
  );
}
