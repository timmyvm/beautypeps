import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

const control =
  "w-full rounded-xl border border-stone bg-cream px-4 text-sm text-espresso placeholder:text-taupe " +
  "transition-colors focus:border-copper focus:outline-none focus:ring-2 focus:ring-copper/20 " +
  "disabled:opacity-60 aria-[invalid=true]:border-danger";

export function Label({ className, ...props }: ComponentProps<"label">) {
  return <label className={cn("mb-1.5 block text-xs font-medium tracking-wide text-cocoa", className)} {...props} />;
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(control, "h-11", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(control, "min-h-28 py-3 leading-relaxed", className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={cn(control, "select-chevron h-11 appearance-none pr-10", className)} {...props} />;
}

export function Checkbox({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      type="checkbox"
      className={cn("size-4 rounded border-stone text-copper accent-copper focus:ring-copper/30", className)}
      {...props}
    />
  );
}

/** Label + control + hint/error, wired up for accessibility. */
export function Field({
  label,
  htmlFor,
  error,
  hint,
  className,
  children,
}: {
  label?: ReactNode;
  htmlFor?: string;
  error?: string;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      {label && <Label htmlFor={htmlFor}>{label}</Label>}
      {children}
      {error ? (
        <p className="mt-1.5 text-xs text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-taupe">{hint}</p>
      ) : null}
    </div>
  );
}

/** Top-of-form success / error banner. */
export function FormMessage({ state }: { state?: { ok?: boolean; message?: string } }) {
  if (!state?.message) return null;
  return (
    <div
      role={state.ok ? "status" : "alert"}
      className={cn(
        "rounded-xl px-4 py-3 text-sm",
        state.ok ? "bg-sage-light text-sage" : "bg-danger-light text-danger",
      )}
    >
      {state.message}
    </div>
  );
}
