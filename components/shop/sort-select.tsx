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
    <label className={cn("flex items-center gap-3 text-body", pending && "opacity-60")}>
      <span className="whitespace-nowrap">Sort</span>
      <select
        value={value}
        onChange={(e) => {
          const qs = new URLSearchParams(searchParams.toString());
          if (e.target.value === "featured") qs.delete("sort");
          else qs.set("sort", e.target.value);
          startTransition(() => router.push(qs.toString() ? `${pathname}?${qs}` : pathname, { scroll: false }));
        }}
        className="select-chevron h-11 appearance-none bg-white pr-10 pl-4 text-body text-ink focus:outline-2 focus:outline-accent"
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
