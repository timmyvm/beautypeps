"use client";

import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { startTransition, useActionState, useState, type FormEvent, type ReactNode } from "react";
import { Checkbox, Field, FormMessage, Input, Select, Textarea } from "@/components/ui/form";
import { buttonClasses } from "@/components/ui/button";
import { placeOrderAction } from "@/lib/actions/checkout";
import { AU_STATES, PAYMENT_METHODS, SHIPPING_METHOD_LABELS } from "@/lib/constants";
import type { Address, PaymentMethod, ShippingMethod } from "@/lib/db/schema";
import { specimenSrc } from "@/components/product/product-card";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

export type CheckoutTotals = {
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  total: number;
  gstTotal: number;
};

export type CheckoutLine = {
  id: string;
  name: string;
  image: string;
  size: string | null;
  quantity: number;
  lineTotal: number;
};

type Props = {
  user: { email: string; firstName: string; lastName: string; phone: string | null } | null;
  addresses: Address[];
  lines: CheckoutLine[];
  totals: Record<ShippingMethod, CheckoutTotals>;
  discountCode?: string;
  discountInvalid?: string;
};

export function CheckoutForm({ user, addresses, lines, totals, discountCode, discountInvalid }: Props) {
  const [state, formAction, pending] = useActionState(placeOrderAction, {});
  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];
  const [addressId, setAddressId] = useState<string>(defaultAddress?.id ?? "new");
  const [shipping, setShipping] = useState<ShippingMethod>("standard");
  const [payment, setPayment] = useState<PaymentMethod>("bank_transfer");
  const t = totals[shipping];

  // Hide a field's error as soon as the customer edits it; reset on each new submission.
  const [edited, setEdited] = useState<Set<string>>(new Set());
  const [lastState, setLastState] = useState(state);
  if (state !== lastState) {
    setLastState(state);
    setEdited(new Set());
  }
  const e = Object.fromEntries(Object.entries(state.errors ?? {}).filter(([k]) => !edited.has(k)));
  const onFieldChange = (ev: FormEvent<HTMLFormElement>) => {
    const name = (ev.target as HTMLInputElement).name;
    if (name && state.errors?.[name] && !edited.has(name)) setEdited(new Set(edited).add(name));
  };

  // Submit via a transition (not the form `action` prop) so React doesn't reset
  // the fields when validation fails.
  const onSubmit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const data = new FormData(ev.currentTarget);
    startTransition(() => formAction(data));
  };

  const useNew = addressId === "new";

  return (
    <form onSubmit={onSubmit} onChange={onFieldChange} noValidate className="grid gap-10 lg:grid-cols-12 lg:gap-[var(--gutter)]">
      <div className="space-y-14 lg:col-span-7">
        <FormMessage state={state} />

        <Section id="contact" title="Contact">
          {user ? (
            <div className="bg-surface px-4 py-3 text-body">
              Signed in as <span className="font-medium">{user.email}</span>
              <input type="hidden" name="email" value={user.email} />
            </div>
          ) : (
            <>
              <Field label="Email address" htmlFor="email" error={e.email} hint="We'll send your order confirmation and payment details here.">
                <Input id="email" name="email" type="email" autoComplete="email" required aria-invalid={!!e.email} />
              </Field>
              <p className="mt-3 text-body">
                Already have an account?{" "}
                <Link href="/login?next=/checkout" className="font-medium underline underline-offset-4">
                  Sign in
                </Link>{" "}
                for faster checkout and order tracking.
              </p>
            </>
          )}
        </Section>

        <Section id="address" title="Shipping address">
          {addresses.length > 0 && (
            <fieldset className="mb-6">
              <legend className="sr-only">Choose a saved address</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {addresses.map((a) => (
                  <RadioCard
                    key={a.id}
                    name="addressId"
                    value={a.id}
                    checked={addressId === a.id}
                    onChange={() => setAddressId(a.id)}
                  >
                    <span className="block text-body font-medium">
                      {a.label}
                      {a.isDefault && <span className="font-normal text-muted"> (default)</span>}
                    </span>
                    <span className="mt-1 block text-small">
                      {a.firstName} {a.lastName}
                      <br />
                      {a.line1}
                      {a.line2 ? `, ${a.line2}` : ""}
                      <br />
                      {a.suburb} {a.state} {a.postcode}
                    </span>
                  </RadioCard>
                ))}
                <RadioCard name="addressId" value="new" checked={useNew} onChange={() => setAddressId("new")}>
                  <span className="block text-body font-medium">Use a new address</span>
                  <span className="mt-1 block text-small">Ship somewhere else this time</span>
                </RadioCard>
              </div>
              {e.addressId && <p className="mt-2 text-small text-danger">{e.addressId}</p>}
            </fieldset>
          )}

          {useNew && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name" htmlFor="firstName" error={e.firstName}>
                <Input id="firstName" name="firstName" autoComplete="given-name" defaultValue={user?.firstName} required aria-invalid={!!e.firstName} />
              </Field>
              <Field label="Last name" htmlFor="lastName" error={e.lastName}>
                <Input id="lastName" name="lastName" autoComplete="family-name" defaultValue={user?.lastName} required aria-invalid={!!e.lastName} />
              </Field>
              <Field label="Company (optional)" htmlFor="company" className="sm:col-span-2">
                <Input id="company" name="company" autoComplete="organization" />
              </Field>
              <Field label="Street address" htmlFor="line1" error={e.line1} className="sm:col-span-2">
                <Input id="line1" name="line1" autoComplete="address-line1" required aria-invalid={!!e.line1} />
              </Field>
              <Field label="Apartment, unit, etc. (optional)" htmlFor="line2" className="sm:col-span-2">
                <Input id="line2" name="line2" autoComplete="address-line2" />
              </Field>
              <Field label="Suburb" htmlFor="suburb" error={e.suburb}>
                <Input id="suburb" name="suburb" autoComplete="address-level2" required aria-invalid={!!e.suburb} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="State" htmlFor="state" error={e.state}>
                  <Select id="state" name="state" autoComplete="address-level1" defaultValue="" required aria-invalid={!!e.state}>
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
                    pattern="\d{4}"
                    required
                    aria-invalid={!!e.postcode}
                  />
                </Field>
              </div>
              <Field label="Phone (for delivery updates)" htmlFor="phone" error={e.phone} className="sm:col-span-2">
                <Input id="phone" name="phone" type="tel" autoComplete="tel" defaultValue={user?.phone ?? ""} aria-invalid={!!e.phone} />
              </Field>
              <p className="text-small text-muted sm:col-span-2">We ship within Australia only.</p>
              {user && (
                <label className="flex items-center gap-2.5 text-body sm:col-span-2">
                  <Checkbox name="saveAddress" defaultChecked={addresses.length === 0} />
                  Save this address to my account
                </label>
              )}
            </div>
          )}
        </Section>

        <Section id="delivery" title="Delivery">
          <fieldset>
            <legend className="sr-only">Shipping method</legend>
            <div className="grid gap-3">
              {(["standard", "express"] as const).map((m) => (
                <RadioCard key={m} name="shippingMethod" value={m} checked={shipping === m} onChange={() => setShipping(m)}>
                  <span className="flex items-center justify-between gap-4">
                    <span>
                      <span className="block text-body font-medium">{SHIPPING_METHOD_LABELS[m]}</span>
                      <span className="mt-0.5 block text-small">
                        {m === "standard" ? "2–6 business days after dispatch" : "1–3 business days after dispatch"}
                      </span>
                    </span>
                    <span className="tabular text-body font-medium whitespace-nowrap">
                      {totals[m].shippingTotal === 0 ? "Free" : formatMoney(totals[m].shippingTotal)}
                    </span>
                  </span>
                </RadioCard>
              ))}
            </div>
          </fieldset>
        </Section>

        <Section id="payment" title="Payment">
          <fieldset>
            <legend className="sr-only">Payment method</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {(Object.keys(PAYMENT_METHODS) as PaymentMethod[]).map((m) => (
                <RadioCard key={m} name="paymentMethod" value={m} checked={payment === m} onChange={() => setPayment(m)}>
                  <span className="block text-body font-medium">{PAYMENT_METHODS[m].label}</span>
                  <span className="mt-0.5 block text-small">{PAYMENT_METHODS[m].description}</span>
                </RadioCard>
              ))}
            </div>
          </fieldset>
          <p className="mt-4 bg-field-frost px-4 py-3 text-body">
            You&apos;ll see our {payment === "payid" ? "PayID" : "bank account"} details on the next page and in your
            confirmation email. Your items are reserved while payment clears — we dispatch as soon as it lands.
          </p>
        </Section>

        <Section id="note" title="Anything else?">
          <Field label="Order note (optional)" htmlFor="customerNote" hint="Delivery instructions, gift notes, etc.">
            <Textarea id="customerNote" name="customerNote" rows={3} maxLength={500} />
          </Field>
        </Section>

        <div>
          <label className="flex items-start gap-3 text-body">
            <Checkbox name="terms" required className="mt-1" aria-invalid={!!e.terms} />
            <span>
              I agree to the{" "}
              <Link href="/policies/terms" target="_blank" className="underline underline-offset-2">
                Terms of Sale
              </Link>{" "}
              and understand these are cosmetic products for external use only.
            </span>
          </label>
          {e.terms && <p className="mt-1.5 text-small text-danger">{e.terms}</p>}

          <button
            type="submit"
            disabled={pending}
            className={buttonClasses({ size: "lg", className: "mt-6 w-full" })}
          >
            {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
            {pending ? "Placing order…" : `Place order · ${formatMoney(t.total)}`}
          </button>
          <p className="mt-3 text-small">No card details needed: you pay by bank transfer or PayID.</p>
        </div>
      </div>

      <aside className="order-first h-fit bg-surface p-6 md:p-8 lg:sticky lg:top-8 lg:order-none lg:col-span-4 lg:col-start-9">
        <div className="flex items-center justify-between">
          <h2 className="text-lead font-medium">Summary</h2>
          <Link href="/cart" className="text-small underline underline-offset-4">
            Edit bag
          </Link>
        </div>
        <ul className="mt-5 space-y-4">
          {lines.map((l) => (
            <li key={l.id} className="flex items-center gap-4">
              <div className="relative size-16 shrink-0 overflow-hidden bg-white">
                <Image src={specimenSrc(l.image) ?? l.image} alt="" fill sizes="64px" className={specimenSrc(l.image) ? "object-contain" : "object-cover"} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-body font-medium">{l.name}</p>
                <p className="text-small text-muted">
                  {l.size ? `${l.size}, ` : ""}quantity {l.quantity}
                </p>
              </div>
              <p className="tabular text-body">{formatMoney(l.lineTotal)}</p>
            </li>
          ))}
        </ul>
        <dl className="tabular mt-8 space-y-1 text-body" aria-live="polite">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd>{formatMoney(t.subtotal)}</dd>
          </div>
          {t.discountTotal > 0 && (
            <div className="flex justify-between text-sage">
              <dt>Discount ({discountCode})</dt>
              <dd>−{formatMoney(t.discountTotal)}</dd>
            </div>
          )}
          {discountCode && discountInvalid && (
            <p className="bg-amber-light px-3 py-2 text-small text-amber">
              Code {discountCode} not applied: {discountInvalid}
            </p>
          )}
          <div className="flex justify-between">
            <dt>{shipping === "express" ? "Express shipping" : "Standard shipping"}</dt>
            <dd>{t.shippingTotal === 0 ? "Free" : formatMoney(t.shippingTotal)}</dd>
          </div>
          <div className="mt-3 flex justify-between bg-surface-2 px-3 py-3 font-medium">
            <dt>Total</dt>
            <dd>{formatMoney(t.total)} AUD</dd>
          </div>
          <p className="pt-1 text-small text-muted">Includes {formatMoney(t.gstTotal)} GST</p>
        </dl>
      </aside>
    </form>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`checkout-${id}`}>
      <h2 id={`checkout-${id}`} className="mb-5 text-lead font-medium">
        {title}
      </h2>
      {children}
    </section>
  );
}

function RadioCard({
  name,
  value,
  checked,
  onChange,
  children,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  children: ReactNode;
}) {
  return (
    <label
      className={cn(
        "relative flex cursor-pointer gap-3 p-4 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent",
        checked ? "bg-accent-soft" : "bg-surface hover:bg-surface-2",
      )}
    >
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="mt-1.5 accent-accent" />
      <span className="min-w-0 flex-1">{children}</span>
    </label>
  );
}
