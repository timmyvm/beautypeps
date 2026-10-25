"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { SpecimenTile, toneFor } from "@/components/product/product-card";
import { removeFromCart, updateCartQuantity } from "@/lib/actions/cart";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

export function CartLineRow({
  line,
  maxQuantity,
}: {
  line: {
    product: { id: string; slug: string; name: string; subtitle: string | null; image: string; size: string | null; price: number; stock: number };
    quantity: number;
    lineTotal: number;
    limited: boolean;
  };
  maxQuantity: number;
}) {
  const [pending, startTransition] = useTransition();
  const { product } = line;

  return (
    <li className={cn("flex gap-4 bg-surface p-3 transition-opacity sm:gap-6 sm:p-4", pending && "opacity-60")}>
      <Link href={`/products/${product.slug}`} className="w-24 shrink-0 sm:w-28" aria-label={product.name}>
        <SpecimenTile product={product} tone={toneFor(product.slug)} sizes="112px" className="aspect-[4/5] w-full" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Link href={`/products/${product.slug}`} className="text-body font-medium hover:underline hover:underline-offset-4">
              {product.name}
            </Link>
            <p className="mt-0.5 text-small text-muted">
              {[product.size, `${formatMoney(product.price)} each`].filter(Boolean).join(", ")}
            </p>
          </div>
          <p className="tabular text-body font-medium whitespace-nowrap">{formatMoney(line.lineTotal)}</p>
        </div>

        {line.limited && (
          <p className="mt-2 bg-amber-light px-3 py-1.5 text-small text-amber">
            Only {product.stock} left, so we&apos;ve adjusted your quantity.
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
          <QuantityStepper
            size="sm"
            value={line.quantity}
            max={maxQuantity}
            disabled={pending}
            label={`Quantity of ${product.name}`}
            onChange={(q) => startTransition(async () => void (await updateCartQuantity(product.id, q)))}
          />
          <button
            type="button"
            onClick={() => startTransition(async () => void (await removeFromCart(product.id)))}
            disabled={pending}
            className="press inline-flex items-center gap-1.5 text-small underline underline-offset-4 hover:text-danger"
            aria-label={`Remove ${product.name} from bag`}
          >
            {pending && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}
