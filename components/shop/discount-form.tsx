"use client";

import { useActionState, useTransition } from "react";
import { SubmitButton } from "@/components/ui/submit-button";
import { applyDiscountAction, removeDiscountAction } from "@/lib/actions/cart";
import { cn } from "@/lib/utils";

export function DiscountForm({
  appliedCode,
  invalidReason,
}: {
  appliedCode?: string;
  invalidReason?: string;
}) {
  const [state, action] = useActionState(applyDiscountAction, {});
  const [removing, startTransition] = useTransition();

  if (appliedCode) {
    return (
      <div className={cn("flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-body", invalidReason ? "bg-amber-light text-amber" : "bg-sage-light text-sage")}>
        <span className="min-w-0">
          <span className="font-medium">{appliedCode}</span>
          {invalidReason ? <span className="block text-small">{invalidReason}</span> : <span> applied</span>}
        </span>
        <button
          type="button"
          onClick={() => startTransition(() => removeDiscountAction())}
          disabled={removing}
          className="press text-small underline underline-offset-4"
        >
          Remove code
        </button>
      </div>
    );
  }

  return (
    <form action={action}>
      <label htmlFor="discount-code" className="mb-1.5 block text-small font-medium">
        Discount code
      </label>
      <div className="flex">
        <input
          id="discount-code"
          name="code"
          autoComplete="off"
          placeholder="e.g. WELCOME10"
          className="h-12 min-w-0 flex-1 bg-white px-4 text-body uppercase placeholder:normal-case placeholder:text-taupe focus:outline-2 focus:outline-accent"
          aria-invalid={state.ok === false}
          aria-describedby="discount-msg"
        />
        <SubmitButton variant="dark" className="h-12" pendingText="Applying">
          Apply
        </SubmitButton>
      </div>
      <p id="discount-msg" aria-live="polite" className={cn("mt-1.5 text-small", state.ok ? "text-sage" : "text-danger")}>
        {state.message}
      </p>
    </form>
  );
}
