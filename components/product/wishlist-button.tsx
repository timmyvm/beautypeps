"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toggleWishlistAction } from "@/lib/actions/wishlist";
import { cn } from "@/lib/utils";

/** Save / unsave as a plain text action (the page has one primary button: Add to bag). */
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
      className={cn("press text-body text-ink underline underline-offset-4 disabled:opacity-60", className)}
    >
      {wishlisted ? "Saved to your wishlist (remove)" : "Save to wishlist"}
    </button>
  );
}
