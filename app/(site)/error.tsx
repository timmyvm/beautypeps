"use client";

import { RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function SiteError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const digest = error instanceof Error && "digest" in error ? String((error as Error & { digest?: string }).digest ?? "") : "";

  return (
    <section className="container-bp flex flex-col items-center py-24 text-center">
      <p className="eyebrow mb-4">Something went wrong</p>
      <h1 className="font-display text-3xl text-espresso md:text-5xl">We couldn&apos;t load this page</h1>
      <p className="mt-4 max-w-md text-cocoa">
        It&apos;s probably a temporary hiccup. Please try again — if it keeps happening, let us know and we&apos;ll look
        into it.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-espresso px-6 text-sm font-medium text-cream hover:bg-ink"
        >
          <RotateCcw className="size-4" aria-hidden /> Try again
        </button>
        <Link
          href="/contact"
          className="inline-flex h-11 items-center rounded-full border border-espresso/25 px-6 text-sm font-medium text-espresso hover:border-espresso"
        >
          Contact support
        </Link>
      </div>
      {digest && <p className="mt-8 font-mono text-xs text-taupe">Reference: {digest}</p>}
    </section>
  );
}
