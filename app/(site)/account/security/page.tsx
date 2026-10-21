import { ShieldAlert } from "lucide-react";
import type { Metadata } from "next";
import { AccountHeading } from "@/components/account/bits";
import { ChangePasswordForm, DeleteAccountForm, SignOutOthersForm } from "@/components/account/settings-forms";
import { Card } from "@/components/ui/misc";
import { requireUser } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Security" };

export default async function SecurityPage() {
  const user = await requireUser("/account/security");
  return (
    <div className="max-w-2xl">
      <AccountHeading
        title="Security"
        description={user.lastLoginAt ? `Last sign-in ${formatDateTime(user.lastLoginAt)}.` : undefined}
      />
      <div className="space-y-6">
        <Card>
          <h2 className="mb-1 text-lg font-semibold text-espresso">Change password</h2>
          <p className="mb-6 text-sm text-muted">
            Changing your password signs you out on every other device.
          </p>
          <ChangePasswordForm />
        </Card>

        <Card>
          <h2 className="mb-1 text-lg font-semibold text-espresso">Active sessions</h2>
          <p className="mb-6 text-sm text-muted">
            Signed in on a shared or lost device? Sign out everywhere except here.
          </p>
          <SignOutOthersForm />
        </Card>

        <Card className="border-danger/30">
          <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-espresso">
            <ShieldAlert className="size-5 text-danger" aria-hidden /> Delete account
          </h2>
          <p className="mb-6 text-sm leading-relaxed text-muted">
            This permanently removes your profile, saved addresses and wishlist. Order records are kept (without a
            link to your account) as required for tax purposes. This can&apos;t be undone.
          </p>
          {user.role === "admin" ? (
            <p className="text-sm text-taupe">Admin accounts can&apos;t be deleted from here.</p>
          ) : (
            <DeleteAccountForm />
          )}
        </Card>
      </div>
    </div>
  );
}
