"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { SpecimenTile, toneFor } from "@/components/product/product-card";
import { useBag } from "@/components/shop/bag";
import { buttonClasses } from "@/components/ui/button";
import { addManyToCart } from "@/lib/actions/cart";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

type PairItem = { id: string; slug: string; name: string; image: string; price: number; fact: string };

/**
 * Two specimens that belong together, side by side, with what they cost together and one button that puts
 * both in the bag (then opens it, so the visitor sees them land).
 */
export function CompleteThePair({
  first,
  second,
  reason,
  headingClass,
}: {
  first: PairItem;
  second: PairItem;
  reason: string;
  headingClass: string;
}) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const bag = useBag();
  const total = first.price + second.price;

  const addBoth = () =>
    startTransition(async () => {
      const res = await addManyToCart([first.id, second.id]);
      setMessage({ ok: res.ok, text: res.message });
      // Both may already be in the bag; it opens either way so the visitor can see them there.
      if (res.ok || res.count > 0) bag.open(second.id);
    });

  return (
    <section
      className="mt-32 grid grid-cols-1 gap-10 lg:mt-48 lg:grid-cols-12 lg:grid-rows-[1fr_auto] lg:gap-x-[var(--gutter)] lg:gap-y-0"
      aria-labelledby="pair-heading"
    >
      {/* On a phone the heading leads, then the pair, then the price and the button. */}
      <div className="lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:self-end" data-reveal="" style={{ ["--reveal-i" as string]: 2 }}>
        <h2 id="pair-heading" className={headingClass}>
          Complete the pair
        </h2>
        <p className="mt-6 max-w-[44ch] text-lead">
          {first.name} with {second.name}.
        </p>
        <p className="mt-3 max-w-[48ch] text-body">{reason}</p>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 lg:col-span-7 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:self-end">
        <PairTile item={first} index={0} />
        <span aria-hidden className="display-type text-head text-muted" data-reveal="" style={{ ["--reveal-i" as string]: 1 }}>
          +
        </span>
        <PairTile item={second} index={2} />
      </div>

      <div className="lg:col-span-5 lg:col-start-8 lg:row-start-2" data-reveal="" style={{ ["--reveal-i" as string]: 3 }}>
        <p className="flex items-baseline gap-3 lg:mt-6">
          <span className="tabular text-lead font-medium">{formatMoney(total)}</span>
          <span className="text-small text-muted">for both, GST included</span>
        </p>
        <button
          type="button"
          onClick={addBoth}
          disabled={pending}
          className={buttonClasses({ size: "lg", className: "mt-5 w-full sm:w-auto" })}
        >
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          Add both to bag
        </button>
        <p aria-live="polite" className={cn("mt-3 min-h-[1.5em] text-body", message && !message.ok && "text-muted")}>
          {message && !message.ok ? message.text : null}
        </p>
      </div>
    </section>
  );
}

function PairTile({ item, index }: { item: PairItem; index: number }) {
  return (
    <Link href={`/products/${item.slug}`} className="group block" data-reveal="" style={{ ["--reveal-i" as string]: index * 2 }}>
      <SpecimenTile product={item} tone={toneFor(item.slug)} sizes="(min-width: 1024px) 26vw, 45vw" className="aspect-[4/5] w-full" />
      <span className="mt-3 block text-body leading-snug font-medium group-hover:underline group-hover:underline-offset-4">{item.name}</span>
      <span className="mt-0.5 flex flex-wrap justify-between gap-x-3 text-body text-muted">
        <span>{item.fact}</span>
        <span className="tabular">{formatMoney(item.price)}</span>
      </span>
    </Link>
  );
}
