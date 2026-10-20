"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";

/** Uses the native share sheet when available, otherwise copies the link. */
export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // user dismissed the share sheet — fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", url);
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className="inline-flex items-center gap-2 rounded-full border border-stone bg-cream px-4 py-2 text-xs font-medium text-espresso transition-colors hover:border-copper/50"
    >
      {copied ? <Check className="size-3.5 text-sage" aria-hidden /> : <Share2 className="size-3.5" aria-hidden />}
      <span aria-live="polite">{copied ? "Link copied" : "Share"}</span>
    </button>
  );
}
