"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function CopyButton({ value, label = "Copy", className }: { value: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          /* clipboard unavailable — ignore */
        }
      }}
      className={cn("press text-small font-normal text-accent underline underline-offset-4", className)}
      aria-label={copied ? "Copied" : `${label}: ${value}`}
    >
      {copied ? "Copied" : label}
    </button>
  );
}
