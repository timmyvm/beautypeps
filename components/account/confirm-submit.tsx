"use client";

import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

/** A plain submit button that asks for confirmation first. Use inside a <form action={serverAction}>. */
export function ConfirmSubmit({
  confirmMessage,
  className,
  children,
  ...props
}: ComponentProps<"button"> & { confirmMessage: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm(confirmMessage)) e.preventDefault();
      }}
      className={cn("disabled:opacity-50", className)}
      {...props}
    >
      {children}
    </button>
  );
}
