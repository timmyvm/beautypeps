"use client";

import { Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";
import { QuantityStepper } from "@/components/product/add-to-cart";
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
    <li className={cn("flex gap-4 py-6 transition-opacity sm:gap-6", pending && "opacity-60")}>
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-[4/5] w-24 shrink-0 overflow-hidden rounded-xl bg-ivory sm:w-28"
      >
        <Image src={product.image} alt={product.name} fill sizes="112px" className="object-cover" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Link href={`/products/${product.slug}`} className="font-display text-lg leading-snug text-espresso hover:text-copper-dark">
              {product.name}
            </Link>
            <p className="mt-0.5 text-sm text-cocoa">
              {[product.subtitle, product.size].filter(Boolean).join(" · ")}
            </p>
            <p className="mt-1 text-xs text-taupe">{formatMoney(product.price)} each</p>
          </div>
          <p className="text-sm font-medium whitespace-nowrap text-espresso">{formatMoney(line.lineTotal)}</p>
        </div>

        {line.limited && (
          <p className="mt-2 rounded-lg bg-amber-light px-3 py-1.5 text-xs text-amber">
            Only {product.stock} available — we&apos;ve adjusted your quantity.
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
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
            className="inline-flex items-center gap-1.5 text-xs text-cocoa underline-offset-4 hover:text-danger hover:underline"
            aria-label={`Remove ${product.name} from bag`}
          >
            {pending ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : <Trash2 className="size-3.5" aria-hidden />}
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}
