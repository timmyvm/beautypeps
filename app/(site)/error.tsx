"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function SiteError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const digest = error instanceof Error && "digest" in error ? String((error as Error & { digest?: string }).digest ?? "") : "";

  return (
    <section aria-labelledby="error-title" className="container-bp pt-12 pb-24 lg:pt-20 lg:pb-40">
      <h1 id="error-title" className="display-type max-w-5xl text-[10.5vw] text-ink sm:text-[clamp(2.75rem,5.9vw,5.75rem)]">
        This page didn&apos;t load
      </h1>
      <p className="mt-8 max-w-[44ch] text-lead">
        It is probably a passing hiccup. Try again, and if it keeps happening, tell us and we will look into it.
      </p>
      <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
        <Button onClick={() => retry()}>Try again</Button>
        <Link href="/contact" className="text-body underline underline-offset-4">
          Contact support
        </Link>
      </div>
      {digest && <p className="mt-10 text-small text-muted">Reference {digest}</p>}
    </section>
  );
}
