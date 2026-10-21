"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/** Uses the native share sheet when available, otherwise copies the link. */
export function ShareButton({ title, className }: { title: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // the share sheet was dismissed: fall through to copying the link
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
    <button type="button" onClick={share} className={cn("press text-body underline underline-offset-4", className)}>
      <span aria-live="polite">{copied ? "Link copied" : "Share this guide"}</span>
    </button>
  );
}
