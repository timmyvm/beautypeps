import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

// Form fields keep a real field edge (allowed for form controls); everything else is told apart by tone.
const control =
  "w-full rounded-none border border-stone bg-white px-4 text-[16px] text-ink placeholder:text-taupe " +
  "transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 " +
  "disabled:opacity-60 aria-[invalid=true]:border-danger";

export function Label({ className, ...props }: ComponentProps<"label">) {
  return <label className={cn("mb-1.5 block text-[14px] font-medium text-ink", className)} {...props} />;
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(control, "h-12", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(control, "min-h-28 py-3 leading-relaxed", className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={cn(control, "select-chevron h-12 appearance-none pr-10", className)} {...props} />;
}

export function Checkbox({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      type="checkbox"
      className={cn("size-4 rounded-none border-stone text-accent accent-accent focus:ring-accent/30", className)}
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
        <p className="mt-1.5 text-[13px] text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-[13px] text-muted">{hint}</p>
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
      className={cn("px-4 py-3 text-[15px]", state.ok ? "bg-sage-light text-sage" : "bg-danger-light text-danger")}
    >
      {state.message}
    </div>
  );
}
