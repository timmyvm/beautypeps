"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/utils";

export function SortSelect({ options, value }: { options: { value: string; label: string }[]; value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  return (
    <label className={cn("flex items-center gap-2 text-sm text-cocoa", pending && "opacity-60")}>
      <span className="whitespace-nowrap">Sort by</span>
      <select
        value={value}
        onChange={(e) => {
          const qs = new URLSearchParams(searchParams.toString());
          if (e.target.value === "featured") qs.delete("sort");
          else qs.set("sort", e.target.value);
          startTransition(() => router.push(qs.toString() ? `${pathname}?${qs}` : pathname, { scroll: false }));
        }}
        className="select-chevron h-10 appearance-none rounded-full border border-stone bg-cream pr-9 pl-4 text-sm text-espresso focus:border-copper focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
