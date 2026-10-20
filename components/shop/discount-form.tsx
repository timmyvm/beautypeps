"use client";

import { Tag, X } from "lucide-react";
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
      <div
        className={cn(
          "flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm",
          invalidReason ? "bg-amber-light text-amber" : "bg-sage-light text-sage",
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          <Tag className="size-4 shrink-0" aria-hidden />
          <span className="min-w-0">
            <span className="font-mono font-semibold tracking-wide">{appliedCode}</span>
            {invalidReason ? <span className="block text-xs">{invalidReason}</span> : <span> applied</span>}
          </span>
        </span>
        <button
          type="button"
          onClick={() => startTransition(() => removeDiscountAction())}
          disabled={removing}
          className="grid size-7 shrink-0 place-items-center rounded-full hover:bg-cream/60"
          aria-label={`Remove code ${appliedCode}`}
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
    );
  }

  return (
    <form action={action}>
      <label htmlFor="discount-code" className="mb-1.5 block text-xs font-medium tracking-wide text-cocoa">
        Discount code
      </label>
      <div className="flex gap-2">
        <input
          id="discount-code"
          name="code"
          autoComplete="off"
          placeholder="e.g. WELCOME10"
          className="h-11 min-w-0 flex-1 rounded-xl border border-stone bg-cream px-4 font-mono text-sm uppercase placeholder:font-sans placeholder:normal-case focus:border-copper focus:ring-2 focus:ring-copper/20 focus:outline-none"
          aria-invalid={state.ok === false}
          aria-describedby="discount-msg"
        />
        <SubmitButton variant="outline" className="h-11" pendingText="Applying">
          Apply
        </SubmitButton>
      </div>
      <p id="discount-msg" aria-live="polite" className={cn("mt-1.5 text-xs", state.ok ? "text-sage" : "text-danger")}>
        {state.message}
      </p>
    </form>
  );
}
