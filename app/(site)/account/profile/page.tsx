import type { Metadata } from "next";
import { AccountHeading } from "@/components/account/bits";
import { EmailForm, ProfileForm } from "@/components/account/settings-forms";
import { Card } from "@/components/ui/misc";
import { requireUser } from "@/lib/auth/session";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await requireUser("/account/profile");
  return (
    <div className="max-w-2xl">
      <AccountHeading
        title="Profile"
        description={`Member since ${formatDate(user.createdAt, { month: "long", year: "numeric" })}.`}
      />
      <div className="space-y-6">
        <Card>
          <h2 className="mb-1 text-lg font-semibold text-ink">Your details</h2>
          <p className="mb-6 text-sm text-muted">Used for order confirmations and delivery.</p>
          <ProfileForm user={user} />
        </Card>
        <Card>
          <h2 className="mb-1 text-lg font-semibold text-ink">Email address</h2>
          <p className="mb-6 text-sm text-muted">
            This is where we send receipts and shipping updates, and what you use to sign in.
          </p>
          <EmailForm email={user.email} />
        </Card>
      </div>
    </div>
  );
}
