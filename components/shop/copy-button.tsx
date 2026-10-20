"use client";

import { Check, Copy } from "lucide-react";
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
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-stone bg-cream px-3 py-1 text-xs text-cocoa transition-colors hover:border-copper hover:text-copper-dark",
        className,
      )}
      aria-label={copied ? "Copied" : `${label}: ${value}`}
    >
      {copied ? <Check className="size-3.5 text-sage" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
      {copied ? "Copied" : label}
    </button>
  );
}
