import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AddressForm } from "@/components/account/address-form";
import { AccountHeading } from "@/components/account/bits";
import { Card } from "@/components/ui/misc";
import { requireUser } from "@/lib/auth/session";
import { getUserAddress, getUserAddresses } from "@/lib/queries/account";

export const metadata: Metadata = { title: "Edit address" };

export default async function EditAddressPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser("/account/addresses");
  const [address, all] = await Promise.all([getUserAddress(user.id, id), getUserAddresses(user.id)]);
  if (!address) notFound();
  return (
    <div className="max-w-2xl">
      <AccountHeading back={{ href: "/account/addresses", label: "Addresses" }} title={`Edit “${address.label}”`} />
      <Card>
        <AddressForm address={address} isFirst={all.length === 1} />
      </Card>
    </div>
  );
}
