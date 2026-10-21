"use client";

import Link from "next/link";
import { useActionState } from "react";
import { buttonClasses } from "@/components/ui/button";
import { Checkbox, Field, FormMessage, Input, Select } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { saveAddressAction, type AccountFormState } from "@/lib/actions/account";
import { AU_STATES } from "@/lib/constants";
import type { Address } from "@/lib/db/schema";

export function AddressForm({ address, isFirst }: { address?: Address; isFirst?: boolean }) {
  const [state, action] = useActionState<AccountFormState, FormData>(saveAddressAction, {});
  const e = state.errors ?? {};
  // After a failed submit, show what was typed; otherwise the saved address.
  const v = (key: keyof Address & string) => state.values?.[key] ?? (address?.[key] as string | null | undefined) ?? "";

  return (
    <form action={action} className="space-y-5" noValidate>
      <FormMessage state={state} />
      {address && <input type="hidden" name="id" value={address.id} />}

      <Field label="Label" htmlFor="label" hint="e.g. Home, Work, Mum's place" error={e.label}>
        <Input id="label" name="label" defaultValue={v("label") || (address ? "" : "Home")} maxLength={40} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="First name" htmlFor="firstName" error={e.firstName}>
          <Input id="firstName" name="firstName" autoComplete="given-name" defaultValue={v("firstName")} aria-invalid={!!e.firstName} />
        </Field>
        <Field label="Last name" htmlFor="lastName" error={e.lastName}>
          <Input id="lastName" name="lastName" autoComplete="family-name" defaultValue={v("lastName")} aria-invalid={!!e.lastName} />
        </Field>
      </div>

      <Field label="Company (optional)" htmlFor="company" error={e.company}>
        <Input id="company" name="company" autoComplete="organization" defaultValue={v("company")} />
      </Field>

      <Field label="Street address" htmlFor="line1" error={e.line1}>
        <Input id="line1" name="line1" autoComplete="address-line1" defaultValue={v("line1")} aria-invalid={!!e.line1} />
      </Field>
      <Field label="Apartment, unit, etc. (optional)" htmlFor="line2" error={e.line2}>
        <Input id="line2" name="line2" autoComplete="address-line2" defaultValue={v("line2")} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-[1fr_140px_120px]">
        <Field label="Suburb" htmlFor="suburb" error={e.suburb}>
          <Input id="suburb" name="suburb" autoComplete="address-level2" defaultValue={v("suburb")} aria-invalid={!!e.suburb} />
        </Field>
        <Field label="State" htmlFor="state" error={e.state}>
          <Select id="state" name="state" autoComplete="address-level1" defaultValue={v("state")} aria-invalid={!!e.state}>
            <option value="" disabled>
              Select
            </option>
            {AU_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Postcode" htmlFor="postcode" error={e.postcode}>
          <Input
            id="postcode"
            name="postcode"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={4}
            defaultValue={v("postcode")}
            aria-invalid={!!e.postcode}
          />
        </Field>
      </div>

      <Field label="Phone (optional)" htmlFor="phone" hint="For delivery updates from Australia Post." error={e.phone}>
        <Input id="phone" name="phone" type="tel" autoComplete="tel" defaultValue={v("phone")} aria-invalid={!!e.phone} />
      </Field>

      <p className="text-[13px] text-taupe">We currently ship within Australia only.</p>

      {isFirst ? (
        <p className="text-sm text-muted">This will be your default address.</p>
      ) : (
        <label className="flex items-center gap-3 text-sm text-muted">
          <Checkbox
            name="isDefault"
            defaultChecked={state.values ? state.values.isDefault === "on" : !!address?.isDefault}
          />
          Use as my default address
        </label>
      )}

      <div className="flex flex-wrap gap-3 pt-2">
        <SubmitButton pendingText="Saving…">{address ? "Save changes" : "Save address"}</SubmitButton>
        <Link href="/account/addresses" className={buttonClasses({ variant: "ghost" })}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
