"use client";

import { Check, Loader2 } from "lucide-react";
import { useState, useTransition, type ReactNode } from "react";
import { adminButtonClasses } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

export type ActionResult = { ok: boolean; message?: string } | void;

type Variant = "primary" | "copper" | "outline" | "ghost" | "danger" | "light";

/**
 * Runs a server action from a button (never submits an enclosing form).
 * With `confirm`, the first click asks for confirmation inline.
 * Shows the action's returned message (or `successMessage`) briefly afterwards.
 */
export function ConfirmButton({
  action,
  children,
  confirm,
  confirmLabel = "Yes, continue",
  successMessage,
  variant = "outline",
  size = "sm",
  className,
}: {
  action: () => Promise<ActionResult>;
  children: ReactNode;
  confirm?: string;
  confirmLabel?: string;
  successMessage?: string;
  variant?: Variant;
  size?: "sm" | "md";
  className?: string;
}) {
  const [asking, setAsking] = useState(false);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  function run() {
    setAsking(false);
    setResult(null);
    startTransition(async () => {
      const res = await action();
      const ok = res ? res.ok : true;
      const message = (res && res.message) || (ok ? successMessage : "Something went wrong.");
      if (message) {
        setResult({ ok, message });
        if (ok) setTimeout(() => setResult(null), 3500);
      }
    });
  }

  if (asking) {
    return (
      <span className="inline-flex flex-wrap items-center gap-2 rounded-xl border border-danger/30 bg-danger-light/60 px-3 py-1.5 text-[13px] text-danger">
        <span>{confirm}</span>
        <button type="button" onClick={run} className="font-semibold underline underline-offset-2">
          {confirmLabel}
        </button>
        <button type="button" onClick={() => setAsking(false)} className="text-muted">
          Cancel
        </button>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => (confirm ? setAsking(true) : run())}
        className={adminButtonClasses({ variant, size, className })}
      >
        {pending && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
        {children}
      </button>
      {result && (
        <span role="status" className={cn("inline-flex items-center gap-1 text-[13px]", result.ok ? "text-sage" : "text-danger")}>
          {result.ok && <Check className="size-3.5" aria-hidden />}
          {result.message}
        </span>
      )}
    </span>
  );
}
