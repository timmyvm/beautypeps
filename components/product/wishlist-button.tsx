"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toggleWishlistAction } from "@/lib/actions/wishlist";
import { cn } from "@/lib/utils";

export function WishlistButton({
  productId,
  productSlug,
  initial,
  className,
}: {
  productId: string;
  productSlug: string;
  initial: boolean;
  className?: string;
}) {
  const [wishlisted, setWishlisted] = useState(initial);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const toggle = () =>
    startTransition(async () => {
      setWishlisted((w) => !w); // optimistic
      const res = await toggleWishlistAction(productId);
      if (res.needsLogin) {
        setWishlisted(false);
        router.push(`/login?next=${encodeURIComponent(`/products/${productSlug}`)}`);
        return;
      }
      if (res.ok && typeof res.wishlisted === "boolean") setWishlisted(res.wishlisted);
      else setWishlisted(initial);
    });

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={wishlisted}
      aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
      className={cn(
        "grid size-12 shrink-0 place-items-center rounded-full border border-stone bg-cream text-espresso transition-colors hover:border-copper hover:text-copper-dark",
        className,
      )}
    >
      <Heart className={cn("size-5 transition-colors", wishlisted && "fill-copper text-copper")} aria-hidden />
    </button>
  );
}
