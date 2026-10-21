"use client";

import { Loader2 } from "lucide-react";
import { startTransition, useActionState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, Input, Select, Textarea } from "@/components/ui/form";
import { contactAction } from "@/lib/actions/contact";
import { CONTACT_SUBJECTS } from "./contact-subjects";

export function ContactForm({ defaultEmail, defaultName }: { defaultEmail?: string; defaultName?: string }) {
  const [state, action, pending] = useActionState(contactAction, {});
  const e = state.errors ?? {};

  if (state.ok) {
    return (
      <div className="bg-sage-light px-6 py-10" role="status">
        <p className="text-lead font-medium text-sage">Message sent</p>
        <p className="mt-2 max-w-[50ch] text-body text-ink">{state.message}</p>
      </div>
    );
  }

  // Submit in a transition so React doesn't clear the fields when validation fails.
  const onSubmit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const data = new FormData(ev.currentTarget);
    startTransition(() => action(data));
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <FormMessage state={state} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" htmlFor="c-name" error={e.name}>
          <Input id="c-name" name="name" autoComplete="name" defaultValue={defaultName} required aria-invalid={!!e.name} />
        </Field>
        <Field label="Email" htmlFor="c-email" error={e.email}>
          <Input id="c-email" name="email" type="email" autoComplete="email" defaultValue={defaultEmail} required aria-invalid={!!e.email} />
        </Field>
        <Field label="Topic" htmlFor="c-subject" error={e.subject}>
          <Select id="c-subject" name="subject" defaultValue="Product question" aria-invalid={!!e.subject}>
            {CONTACT_SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Order number (optional)" htmlFor="c-order" error={e.orderNumber}>
          <Input id="c-order" name="orderNumber" placeholder="BP10001" className="uppercase" />
        </Field>
      </div>
      <Field label="Message" htmlFor="c-message" error={e.message}>
        <Textarea id="c-message" name="message" rows={6} required maxLength={5000} aria-invalid={!!e.message} />
      </Field>
      {/* Honeypot */}
      <div aria-hidden className="hidden">
        <label>
          Website <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <Button type="submit" size="lg" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {pending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
