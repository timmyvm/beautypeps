"use client";

import { useActionState } from "react";
import { PasswordInput } from "@/components/auth/password-input";
import { Checkbox, Field, FormMessage, Input } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  changeEmailAction,
  changePasswordAction,
  deleteAccountAction,
  signOutOtherDevicesAction,
  updateProfileAction,
  type AccountFormState,
} from "@/lib/actions/account";

export function ProfileForm({
  user,
}: {
  user: { firstName: string; lastName: string; phone: string | null; marketingOptIn: boolean };
}) {
  const [state, action] = useActionState<AccountFormState, FormData>(updateProfileAction, {});
  const e = state.errors ?? {};
  const v = state.values;
  return (
    <form action={action} className="space-y-5" noValidate>
      <FormMessage state={state} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="First name" htmlFor="firstName" error={e.firstName}>
          <Input
            id="firstName"
            name="firstName"
            autoComplete="given-name"
            defaultValue={v?.firstName ?? user.firstName}
            aria-invalid={!!e.firstName}
          />
        </Field>
        <Field label="Last name" htmlFor="lastName" error={e.lastName}>
          <Input
            id="lastName"
            name="lastName"
            autoComplete="family-name"
            defaultValue={v?.lastName ?? user.lastName}
            aria-invalid={!!e.lastName}
          />
        </Field>
      </div>
      <Field label="Mobile (optional)" htmlFor="phone" error={e.phone}>
        <Input id="phone" name="phone" type="tel" autoComplete="tel" defaultValue={v?.phone ?? user.phone ?? ""} aria-invalid={!!e.phone} />
      </Field>
      <label className="flex items-start gap-3 text-sm text-cocoa">
        <Checkbox
          name="marketing"
          className="mt-0.5"
          defaultChecked={v ? v.marketing === "on" : user.marketingOptIn}
        />
        <span>
          <span className="block font-medium text-espresso">The Peptide Letter</span>
          New research, formulation notes and early access to launches. Twice a month, unsubscribe anytime.
        </span>
      </label>
      <SubmitButton pendingText="Saving…">Save details</SubmitButton>
    </form>
  );
}

export function EmailForm({ email }: { email: string }) {
  const [state, action] = useActionState<AccountFormState, FormData>(changeEmailAction, {});
  const e = state.errors ?? {};
  return (
    <form action={action} className="space-y-5" noValidate>
      <FormMessage state={state} />
      <Field label="Email address" htmlFor="email" error={e.email}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state.values?.email ?? email}
          aria-invalid={!!e.email}
        />
      </Field>
      <Field label="Current password" htmlFor="emailCurrentPassword" hint="Required to change your email." error={e.currentPassword}>
        <PasswordInput
          id="emailCurrentPassword"
          name="currentPassword"
          autoComplete="current-password"
          aria-invalid={!!e.currentPassword}
        />
      </Field>
      <SubmitButton variant="outline" pendingText="Updating…">
        Update email
      </SubmitButton>
    </form>
  );
}

export function ChangePasswordForm() {
  const [state, action] = useActionState(changePasswordAction, {});
  const e = state.errors ?? {};
  return (
    <form action={action} className="space-y-5" noValidate key={state.ok ? "done" : "form"}>
      <FormMessage state={state} />
      <Field label="Current password" htmlFor="currentPassword" error={e.currentPassword}>
        <PasswordInput
          id="currentPassword"
          name="currentPassword"
          autoComplete="current-password"
          aria-invalid={!!e.currentPassword}
        />
      </Field>
      <Field label="New password" htmlFor="newPassword" error={e.password}>
        <PasswordInput id="newPassword" name="password" autoComplete="new-password" showStrength aria-invalid={!!e.password} />
      </Field>
      <Field label="Confirm new password" htmlFor="confirmPassword" error={e.confirm}>
        <PasswordInput id="confirmPassword" name="confirm" autoComplete="new-password" aria-invalid={!!e.confirm} />
      </Field>
      <SubmitButton pendingText="Updating…">Change password</SubmitButton>
    </form>
  );
}

export function SignOutOthersForm() {
  const [state, action] = useActionState(signOutOtherDevicesAction, {});
  return (
    <form action={action} className="space-y-4">
      <FormMessage state={state} />
      <SubmitButton variant="outline" pendingText="Signing out…">
        Sign out of all other devices
      </SubmitButton>
    </form>
  );
}

export function DeleteAccountForm() {
  const [state, action] = useActionState(deleteAccountAction, {});
  const e = state.errors ?? {};
  return (
    <form action={action} className="space-y-5" noValidate>
      <FormMessage state={state} />
      <Field label="Type DELETE to confirm" htmlFor="deleteConfirm" error={e.confirm}>
        <Input id="deleteConfirm" name="confirm" autoComplete="off" placeholder="DELETE" aria-invalid={!!e.confirm} />
      </Field>
      <Field label="Password" htmlFor="deletePassword" error={e.password}>
        <PasswordInput id="deletePassword" name="password" autoComplete="current-password" aria-invalid={!!e.password} />
      </Field>
      <SubmitButton variant="danger" pendingText="Deleting…">
        Permanently delete my account
      </SubmitButton>
    </form>
  );
}
