"use client";

import { ArrowRight } from "lucide-react";
import { useActionState } from "react";
import { subscribeAction } from "@/lib/actions/newsletter";
import { cn } from "@/lib/utils";

export function NewsletterForm({ source = "footer", tone = "dark" }: { source?: string; tone?: "dark" | "light" }) {
  const [state, action, pending] = useActionState(subscribeAction, {});

  if (state.ok) {
    return <p className={cn("text-sm", tone === "dark" ? "text-copper-light" : "text-sage")}>{state.message}</p>;
  }

  return (
    <form action={action} className="w-full">
      <input type="hidden" name="source" value={source} />
      <div
        className={cn(
          "flex items-center rounded-full border p-1 pl-5",
          tone === "dark" ? "border-cream/25 bg-cream/5" : "border-stone bg-cream",
        )}
      >
        <label htmlFor={`nl-${source}`} className="sr-only">
          Email address
        </label>
        <input
          id={`nl-${source}`}
          name="email"
          type="email"
          required
          placeholder="Your email address"
          className={cn(
            "h-10 min-w-0 flex-1 bg-transparent text-sm focus:outline-none",
            tone === "dark" ? "text-cream placeholder:text-cream/50" : "text-espresso placeholder:text-taupe",
          )}
        />
        <button
          type="submit"
          disabled={pending}
          aria-label="Subscribe"
          className="grid size-10 shrink-0 place-items-center rounded-full bg-copper text-cream transition-colors hover:bg-copper-dark disabled:opacity-60"
        >
          <ArrowRight className="size-4" aria-hidden />
        </button>
      </div>
      {state.message && !state.ok && <p className="mt-2 text-xs text-danger">{state.message}</p>}
    </form>
  );
}
