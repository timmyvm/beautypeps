"use client";

import { useActionState } from "react";
import { subscribeAction } from "@/lib/actions/newsletter";
import { cn } from "@/lib/utils";

export function NewsletterForm({ source = "footer", tone = "light" }: { source?: string; tone?: "dark" | "light" }) {
  const [state, action, pending] = useActionState(subscribeAction, {});

  if (state.ok) {
    return <p className={cn("text-body", tone === "dark" ? "text-white" : "text-ink")}>{state.message}</p>;
  }

  return (
    <form action={action} className="w-full">
      <input type="hidden" name="source" value={source} />
      <label htmlFor={`nl-${source}`} className="sr-only">
        Email address
      </label>
      <div className="flex">
        <input
          id={`nl-${source}`}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Your email address"
          className={cn(
            "h-12 min-w-0 flex-1 rounded-none px-4 text-body focus:outline-none focus-visible:outline-2 focus-visible:outline-accent",
            tone === "dark" ? "bg-white/10 text-white placeholder:text-white/60" : "bg-white text-ink placeholder:text-taupe",
          )}
        />
        <button
          type="submit"
          disabled={pending}
          className="press h-12 shrink-0 bg-accent px-5 text-body font-medium text-accent-ink hover:bg-accent-strong disabled:opacity-60"
        >
          Subscribe
        </button>
      </div>
      {state.message && !state.ok && <p className="mt-2 text-small text-danger">{state.message}</p>}
    </form>
  );
}
