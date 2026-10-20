import type { Metadata } from "next";
import { AddressForm } from "@/components/account/address-form";
import { AccountHeading } from "@/components/account/bits";
import { Card } from "@/components/ui/misc";
import { requireUser } from "@/lib/auth/session";
import { getUserAddresses } from "@/lib/queries/account";

export const metadata: Metadata = { title: "Add address" };

export default async function NewAddressPage() {
  const user = await requireUser("/account/addresses/new");
  const existing = await getUserAddresses(user.id);
  return (
    <div className="max-w-2xl">
      <AccountHeading back={{ href: "/account/addresses", label: "Addresses" }} title="Add an address" />
      <Card>
        <AddressForm isFirst={existing.length === 0} />
      </Card>
    </div>
  );
}
