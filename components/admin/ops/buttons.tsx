"use client";

import { Loader2, Printer } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Variant = "primary" | "copper" | "outline" | "ghost" | "danger" | "light";

/**
 * Two-step destructive submit: first click arms it ("Click again to confirm"),
 * second click submits. Disarms after a few seconds.
 */
export function ConfirmSubmit({
  children,
  confirmLabel = "Click again to confirm",
  variant = "outline",
  size = "sm",
  className,
}: {
  children: ReactNode;
  confirmLabel?: string;
  variant?: Variant;
  size?: "sm" | "md";
  className?: string;
}) {
  const [armed, setArmed] = useState(false);
  const { pending } = useFormStatus();

  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(t);
  }, [armed]);

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!armed) {
          e.preventDefault();
          setArmed(true);
        }
      }}
      className={buttonClasses({ variant: armed ? "danger" : variant, size, className })}
    >
      {pending && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
      {armed ? confirmLabel : children}
    </button>
  );
}

/** Small submit with pending spinner, sized for admin toolbars. */
export function OpsSubmit({
  children,
  variant = "primary",
  size = "sm",
  className,
  name,
  value,
}: {
  children: ReactNode;
  variant?: Variant;
  size?: "sm" | "md";
  className?: string;
  name?: string;
  value?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name={name}
      value={value}
      disabled={pending}
      aria-busy={pending}
      className={buttonClasses({ variant, size, className })}
    >
      {pending && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

export function PrintButton({ className }: { className?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className={cn(buttonClasses({ size: "sm" }), className)}>
      <Printer className="size-4" aria-hidden /> Print
    </button>
  );
}
