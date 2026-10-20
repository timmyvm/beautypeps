"use client";

import { Landmark, Loader2, Lock, Smartphone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { startTransition, useActionState, useState, type FormEvent, type ReactNode } from "react";
import { Checkbox, Field, FormMessage, Input, Select, Textarea } from "@/components/ui/form";
import { buttonClasses } from "@/components/ui/button";
import { placeOrderAction } from "@/lib/actions/checkout";
import { AU_STATES, PAYMENT_METHODS, SHIPPING_METHOD_LABELS } from "@/lib/constants";
import type { Address, PaymentMethod, ShippingMethod } from "@/lib/db/schema";
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
  const e = state.errors ?? {};

  // Submit via a transition (not the form `action` prop) so React doesn't reset
  // the fields when validation fails.
  const onSubmit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const data = new FormData(ev.currentTarget);
    startTransition(() => formAction(data));
  };

  const useNew = addressId === "new";

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-10 lg:grid-cols-[1fr_420px] lg:gap-14">
      <div className="space-y-10">
        <FormMessage state={state} />

        <Section step={1} title="Contact">
          {user ? (
            <div className="rounded-xl bg-ivory px-4 py-3 text-sm text-cocoa">
              Signed in as <span className="font-medium text-espresso">{user.email}</span>
              <input type="hidden" name="email" value={user.email} />
            </div>
          ) : (
            <>
              <Field label="Email address" htmlFor="email" error={e.email} hint="We'll send your order confirmation and payment details here.">
                <Input id="email" name="email" type="email" autoComplete="email" required aria-invalid={!!e.email} />
              </Field>
              <p className="mt-3 text-sm text-cocoa">
                Already have an account?{" "}
                <Link href="/login?next=/checkout" className="font-medium text-copper-dark underline underline-offset-4">
                  Sign in
                </Link>{" "}
                for faster checkout and order tracking.
              </p>
            </>
          )}
        </Section>

        <Section step={2} title="Shipping address">
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
                    <span className="block text-sm font-medium text-espresso">
                      {a.label}
                      {a.isDefault && <span className="ml-2 text-[10px] tracking-wider text-copper-dark uppercase">Default</span>}
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-cocoa">
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
                  <span className="block text-sm font-medium text-espresso">Use a new address</span>
                  <span className="mt-1 block text-xs text-cocoa">Ship somewhere else this time</span>
                </RadioCard>
              </div>
              {e.addressId && <p className="mt-2 text-xs text-danger">{e.addressId}</p>}
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
              <p className="text-xs text-taupe sm:col-span-2">We currently ship within Australia only.</p>
              {user && (
                <label className="flex items-center gap-2.5 text-sm text-cocoa sm:col-span-2">
                  <Checkbox name="saveAddress" defaultChecked={addresses.length === 0} />
                  Save this address to my account
                </label>
              )}
            </div>
          )}
        </Section>

        <Section step={3} title="Delivery">
          <fieldset>
            <legend className="sr-only">Shipping method</legend>
            <div className="grid gap-3">
              {(["standard", "express"] as const).map((m) => (
                <RadioCard key={m} name="shippingMethod" value={m} checked={shipping === m} onChange={() => setShipping(m)}>
                  <span className="flex items-center justify-between gap-4">
                    <span>
                      <span className="block text-sm font-medium text-espresso">{SHIPPING_METHOD_LABELS[m]}</span>
                      <span className="mt-0.5 block text-xs text-cocoa">
                        {m === "standard" ? "2–6 business days after dispatch" : "1–3 business days after dispatch"}
                      </span>
                    </span>
                    <span className="text-sm font-medium whitespace-nowrap text-espresso">
                      {totals[m].shippingTotal === 0 ? "Free" : formatMoney(totals[m].shippingTotal)}
                    </span>
                  </span>
                </RadioCard>
              ))}
            </div>
          </fieldset>
        </Section>

        <Section step={4} title="Payment">
          <fieldset>
            <legend className="sr-only">Payment method</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {(Object.keys(PAYMENT_METHODS) as PaymentMethod[]).map((m) => (
                <RadioCard key={m} name="paymentMethod" value={m} checked={payment === m} onChange={() => setPayment(m)}>
                  <span className="flex items-start gap-3">
                    <span className="mt-0.5 text-copper">
                      {m === "payid" ? <Smartphone className="size-5" aria-hidden /> : <Landmark className="size-5" aria-hidden />}
                    </span>
                    <span>
                      <span className="block text-sm font-medium text-espresso">{PAYMENT_METHODS[m].label}</span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-cocoa">{PAYMENT_METHODS[m].description}</span>
                    </span>
                  </span>
                </RadioCard>
              ))}
            </div>
          </fieldset>
          <p className="mt-4 rounded-xl bg-ivory px-4 py-3 text-xs leading-relaxed text-cocoa">
            You&apos;ll see our {payment === "payid" ? "PayID" : "bank account"} details on the next page and in your
            confirmation email. Your items are reserved while payment clears — we dispatch as soon as it lands.
          </p>
        </Section>

        <Section step={5} title="Anything else?">
          <Field label="Order note (optional)" htmlFor="customerNote" hint="Delivery instructions, gift notes, etc.">
            <Textarea id="customerNote" name="customerNote" rows={3} maxLength={500} />
          </Field>
        </Section>

        <div>
          <label className="flex items-start gap-3 text-sm leading-relaxed text-cocoa">
            <Checkbox name="terms" required className="mt-1" aria-invalid={!!e.terms} />
            <span>
              I agree to the{" "}
              <Link href="/policies/terms" target="_blank" className="text-copper-dark underline underline-offset-2">
                Terms of Sale
              </Link>{" "}
              and understand these are cosmetic products for external use only.
            </span>
          </label>
          {e.terms && <p className="mt-1.5 text-xs text-danger">{e.terms}</p>}

          <button
            type="submit"
            disabled={pending}
            className={buttonClasses({ size: "lg", className: "mt-6 h-14 w-full text-base" })}
          >
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Lock className="size-4" aria-hidden />}
            {pending ? "Placing order…" : `Place order · ${formatMoney(t.total)}`}
          </button>
          <p className="mt-3 text-center text-xs text-taupe">No card details needed — you&apos;ll pay by bank transfer or PayID.</p>
        </div>
      </div>

      <aside className="order-first h-fit rounded-2xl border border-stone/70 bg-cream p-6 lg:sticky lg:top-28 lg:order-none">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-espresso">Summary</h2>
          <Link href="/cart" className="text-xs text-cocoa underline underline-offset-4 hover:text-espresso">
            Edit bag
          </Link>
        </div>
        <ul className="mt-5 space-y-4">
          {lines.map((l) => (
            <li key={l.id} className="flex items-center gap-4">
              <div className="relative">
                <div className="relative size-16 overflow-hidden rounded-xl bg-ivory">
                  <Image src={l.image} alt="" fill sizes="64px" className="object-cover" />
                </div>
                <span className="absolute -top-1.5 -right-1.5 grid min-w-5 place-items-center rounded-full bg-espresso px-1 text-[10px] leading-5 font-semibold text-cream">
                  {l.quantity}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-espresso">{l.name}</p>
                {l.size && <p className="text-xs text-taupe">{l.size}</p>}
              </div>
              <p className="text-sm text-espresso">{formatMoney(l.lineTotal)}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-6 space-y-3 border-t border-stone/60 pt-5 text-sm" aria-live="polite">
          <div className="flex justify-between text-cocoa">
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
            <p className="rounded-lg bg-amber-light px-3 py-2 text-xs text-amber">
              Code {discountCode} not applied: {discountInvalid}
            </p>
          )}
          <div className="flex justify-between text-cocoa">
            <dt>{shipping === "express" ? "Express shipping" : "Standard shipping"}</dt>
            <dd>{t.shippingTotal === 0 ? "Free" : formatMoney(t.shippingTotal)}</dd>
          </div>
          <div className="flex justify-between border-t border-stone/60 pt-4 text-base font-semibold text-espresso">
            <dt>Total</dt>
            <dd>{formatMoney(t.total)} <span className="text-xs font-normal text-taupe">AUD</span></dd>
          </div>
          <p className="text-right text-xs text-taupe">Includes {formatMoney(t.gstTotal)} GST</p>
        </dl>
      </aside>
    </form>
  );
}

function Section({ step, title, children }: { step: number; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`checkout-step-${step}`}>
      <h2 id={`checkout-step-${step}`} className="mb-5 flex items-center gap-3 font-display text-2xl text-espresso">
        <span className="grid size-7 place-items-center rounded-full bg-espresso font-sans text-xs font-semibold text-cream">
          {step}
        </span>
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
        "relative flex cursor-pointer gap-3 rounded-xl border bg-cream p-4 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-copper/40",
        checked ? "border-copper bg-copper-light/15" : "border-stone hover:border-taupe",
      )}
    >
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="mt-1 accent-copper" />
      <span className="min-w-0 flex-1">{children}</span>
    </label>
  );
}
