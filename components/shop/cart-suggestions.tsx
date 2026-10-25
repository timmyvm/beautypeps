"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { SpecimenTile, toneFor } from "@/components/product/product-card";
import { addToCart } from "@/lib/actions/cart";
import { formatMoney } from "@/lib/format";

type Suggestion = { id: string; slug: string; name: string; image: string; price: number; fact: string };

/**
 * Under the bag's lines: three formulas worth adding, each one tap from the bag. When the visitor is short of
 * free shipping, the ones that would close the gap say so.
 */
export function CartSuggestions({ items, remaining }: { items: Suggestion[]; remaining: number }) {
  if (items.length === 0) return null;
  return (
    <section className="mt-16" aria-labelledby="also-heading">
      <h2 id="also-heading" className="text-lead font-medium" data-reveal="">
        Often added with it
      </h2>
      <ul className="mt-5 grid grid-cols-2 gap-x-2 gap-y-8 sm:grid-cols-3">
        {items.map((item, i) => (
          <SuggestionTile key={item.id} item={item} freesShipping={remaining > 0 && item.price >= remaining} index={i} />
        ))}
      </ul>
    </section>
  );
}

function SuggestionTile({ item, freesShipping, index }: { item: Suggestion; freesShipping: boolean; index: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <li className="flex flex-col" data-reveal="" style={{ ["--reveal-i" as string]: index + 1 }}>
      <Link href={`/products/${item.slug}`} className="group block" aria-label={item.name}>
        <SpecimenTile product={item} tone={toneFor(item.slug, index)} sizes="(min-width: 1024px) 18vw, 45vw" className="aspect-[4/5] w-full" />
      </Link>
      <p className="mt-3 text-body leading-snug font-medium">{item.name}</p>
      <p className="mt-0.5 text-small text-muted">{item.fact}</p>
      {freesShipping && <p className="mt-1 text-small text-accent">Adding it makes standard shipping free.</p>}
      <div className="mt-auto pt-3">
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await addToCart(item.id, 1);
              router.refresh();
            })
          }
          className="press flex h-11 w-full items-center justify-between gap-2 bg-surface px-4 text-body font-medium hover:bg-surface-2 disabled:opacity-60"
        >
          <span>{pending ? "Adding" : "Add to bag"}</span>
          <span className="tabular">{formatMoney(item.price)}</span>
        </button>
      </div>
    </li>
  );
}
