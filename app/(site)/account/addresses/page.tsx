import { MapPin, Pencil, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AccountHeading, Banner } from "@/components/account/bits";
import { ConfirmSubmit } from "@/components/account/confirm-submit";
import { AddressBlock } from "@/components/order/order-parts";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { deleteAddressAction, setDefaultAddressAction } from "@/lib/actions/account";
import { requireUser } from "@/lib/auth/session";
import { getUserAddresses } from "@/lib/queries/account";

export const metadata: Metadata = { title: "Addresses" };

export default async function AddressesPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const user = await requireUser("/account/addresses");
  const addresses = await getUserAddresses(user.id);

  return (
    <div>
      {saved && <Banner>Address saved.</Banner>}
      <AccountHeading
        title="Addresses"
        description="Saved addresses appear at checkout so you don't have to type them again."
        action={
          addresses.length > 0 ? (
            <ButtonLink href="/account/addresses/new" size="sm">
              <Plus className="size-4" aria-hidden /> Add address
            </ButtonLink>
          ) : undefined
        }
      />

      {addresses.length === 0 ? (
        <EmptyState
          icon={<MapPin className="size-8" />}
          title="No saved addresses"
          description="Add your delivery address once and pick it at checkout in a single tap."
          action={<ButtonLink href="/account/addresses/new">Add an address</ButtonLink>}
        />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {addresses.map((a) => (
            <li
              key={a.id}
              className={`flex flex-col rounded-2xl border bg-white p-5 ${a.isDefault ? "border-copper/50" : "border-surface-2"}`}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-ink">{a.label}</p>
                {a.isDefault && <Badge tone="copper">Default</Badge>}
              </div>
              <div className="mb-5">
                <AddressBlock address={a} />
              </div>
              <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-surface-2 pt-4 text-sm">
                <Link
                  href={`/account/addresses/${a.id}`}
                  className="flex items-center gap-1.5 text-ink hover:text-copper-dark"
                >
                  <Pencil className="size-3.5" aria-hidden /> Edit
                </Link>
                {!a.isDefault && (
                  <form action={setDefaultAddressAction}>
                    <input type="hidden" name="id" value={a.id} />
                    <button type="submit" className="text-muted hover:text-ink">
                      Make default
                    </button>
                  </form>
                )}
                <form action={deleteAddressAction} className="ml-auto">
                  <input type="hidden" name="id" value={a.id} />
                  <ConfirmSubmit
                    confirmMessage={`Delete the "${a.label}" address?`}
                    className="text-danger hover:underline"
                  >
                    Delete
                  </ConfirmSubmit>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
