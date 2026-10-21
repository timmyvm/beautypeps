"use client";

import { MailCheck } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import { Checkbox, Field, FormMessage, Input } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  forgotPasswordAction,
  loginAction,
  registerAction,
  resetPasswordAction,
  type AuthFormState,
} from "@/lib/actions/auth";
import { PasswordInput } from "./password-input";

const initial: AuthFormState = {};

export function LoginForm({ next, defaultEmail }: { next?: string; defaultEmail?: string }) {
  const [state, action] = useActionState(loginAction, initial);
  const e = state.errors ?? {};
  return (
    <form action={action} className="space-y-5" noValidate>
      <FormMessage state={state} />
      <input type="hidden" name="next" value={next ?? ""} />
      <Field label="Email" htmlFor="email" error={e.email}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.values?.email ?? defaultEmail}
          aria-invalid={!!e.email}
        />
      </Field>
      <Field
        label={
          <span className="flex items-center justify-between">
            Password
            <Link href="/forgot-password" className="font-normal text-ink underline underline-offset-4">
              Forgot password?
            </Link>
          </span>
        }
        htmlFor="password"
        error={e.password}
      >
        <PasswordInput id="password" name="password" autoComplete="current-password" required aria-invalid={!!e.password} />
      </Field>
      <SubmitButton className="w-full" size="lg" pendingText="Signing in…">
        Sign in
      </SubmitButton>
    </form>
  );
}

export function RegisterForm({ next, defaultEmail }: { next?: string; defaultEmail?: string }) {
  const [state, action] = useActionState(registerAction, initial);
  const e = state.errors ?? {};
  const v = state.values ?? {};
  return (
    <form action={action} className="space-y-5" noValidate>
      <FormMessage state={state} />
      <input type="hidden" name="next" value={next ?? ""} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="First name" htmlFor="firstName" error={e.firstName}>
          <Input
            id="firstName"
            name="firstName"
            autoComplete="given-name"
            required
            defaultValue={v.firstName}
            aria-invalid={!!e.firstName}
          />
        </Field>
        <Field label="Last name" htmlFor="lastName" error={e.lastName}>
          <Input
            id="lastName"
            name="lastName"
            autoComplete="family-name"
            required
            defaultValue={v.lastName}
            aria-invalid={!!e.lastName}
          />
        </Field>
      </div>
      <Field
        label="Email"
        htmlFor="email"
        error={e.email}
        hint="Already ordered as a guest? Use the same email and we'll link those orders."
      >
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={v.email ?? defaultEmail}
          aria-invalid={!!e.email}
        />
      </Field>
      {e.email?.includes("already exists") && (
        <p className="-mt-3 text-[13px] text-muted">
          <Link href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="text-ink underline underline-offset-4">
            Sign in to your account
          </Link>{" "}
          or{" "}
          <Link href="/forgot-password" className="text-ink underline underline-offset-4">
            reset your password
          </Link>
          .
        </p>
      )}
      <Field label="Password" htmlFor="password" error={e.password}>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          required
          minLength={8}
          showStrength
          aria-invalid={!!e.password}
        />
      </Field>
      <Field label="Confirm password" htmlFor="confirm" error={e.confirm}>
        <PasswordInput id="confirm" name="confirm" autoComplete="new-password" required aria-invalid={!!e.confirm} />
      </Field>
      <label className="flex items-start gap-3 text-sm text-muted">
        <Checkbox name="marketing" defaultChecked={v.marketing === "on"} className="mt-0.5" />
        <span>Send me The Peptide Letter — new research, formulation notes and early access. Unsubscribe anytime.</span>
      </label>
      <SubmitButton className="w-full" size="lg" pendingText="Creating account…">
        Create account
      </SubmitButton>
      <p className="text-center text-[13px] leading-relaxed text-muted">
        By creating an account you agree to our{" "}
        <Link href="/policies/terms" className="underline hover:text-muted">
          Terms of sale
        </Link>{" "}
        and{" "}
        <Link href="/policies/privacy" className="underline hover:text-muted">
          Privacy policy
        </Link>
        .
      </p>
    </form>
  );
}

export function ForgotPasswordForm({ defaultEmail }: { defaultEmail?: string }) {
  const [state, action] = useActionState(forgotPasswordAction, initial);
  const e = state.errors ?? {};

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-sage/30 bg-sage-light/60 p-6 text-center" role="status">
        <MailCheck className="mx-auto size-8 text-sage" aria-hidden />
        <p className="mt-3 text-lg font-semibold text-ink">Check your inbox</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">{state.message}</p>
        <p className="mt-4 text-[13px] text-muted">Don&apos;t see it? Check your spam folder or try again in a few minutes.</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5" noValidate>
      <FormMessage state={state} />
      <Field label="Email" htmlFor="email" error={e.email}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.values?.email ?? defaultEmail}
          aria-invalid={!!e.email}
        />
      </Field>
      <SubmitButton className="w-full" size="lg" pendingText="Sending…">
        Email me a reset link
      </SubmitButton>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action] = useActionState(resetPasswordAction, initial);
  const e = state.errors ?? {};
  return (
    <form action={action} className="space-y-5" noValidate>
      <FormMessage state={state} />
      {state.ok === false && state.message?.includes("expired") && (
        <p className="-mt-2 text-sm">
          <Link href="/forgot-password" className="text-ink underline underline-offset-4">
            Request a new link
          </Link>
        </p>
      )}
      <input type="hidden" name="token" value={token} />
      <Field label="New password" htmlFor="password" error={e.password}>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          required
          minLength={8}
          showStrength
          aria-invalid={!!e.password}
        />
      </Field>
      <Field label="Confirm new password" htmlFor="confirm" error={e.confirm}>
        <PasswordInput id="confirm" name="confirm" autoComplete="new-password" required aria-invalid={!!e.confirm} />
      </Field>
      <SubmitButton className="w-full" size="lg" pendingText="Saving…">
        Set new password
      </SubmitButton>
    </form>
  );
}
