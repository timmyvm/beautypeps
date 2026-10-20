import Image from "next/image";
import Link from "next/link";
import { Price, Stars } from "@/components/ui/misc";
import type { Product } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

export type ProductCardData = Pick<
  Product,
  "id" | "slug" | "name" | "subtitle" | "price" | "compareAtPrice" | "image" | "badge" | "size" | "stock"
> & { rating?: { average: number; count: number } | null };

export function ProductCard({ product, className, priority }: { product: ProductCardData; className?: string; priority?: boolean }) {
  const soldOut = product.stock <= 0;
  return (
    <Link href={`/products/${product.slug}`} className={cn("group flex flex-col", className)}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-ivory">
        <Image
          src={product.image}
          alt={product.name}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {soldOut ? (
            <span className="rounded-full bg-espresso px-2.5 py-1 text-[10px] font-semibold tracking-wider text-cream uppercase">
              Sold out
            </span>
          ) : product.badge ? (
            <span className="rounded-full bg-cream/90 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-espresso uppercase backdrop-blur">
              {product.badge}
            </span>
          ) : null}
        </div>
      </div>
      <div className="mt-4 flex flex-1 flex-col">
        <h3 className="font-display text-lg leading-snug text-espresso group-hover:text-copper-dark">{product.name}</h3>
        {product.subtitle && <p className="mt-1 line-clamp-1 text-sm text-cocoa">{product.subtitle}</p>}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-2 gap-y-1 pt-3">
          <Price cents={product.price} compareAt={product.compareAtPrice} className="text-sm font-medium text-espresso" />
          {product.rating && product.rating.count > 0 ? (
            <span className="flex items-center gap-1 text-xs text-cocoa">
              <Stars rating={product.rating.average} size={12} />({product.rating.count})
            </span>
          ) : product.size ? (
            <span className="text-xs text-taupe">{product.size}</span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
