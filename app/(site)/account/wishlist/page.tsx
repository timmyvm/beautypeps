import { Heart } from "lucide-react";
import type { Metadata } from "next";
import { AddToBagButton } from "@/components/account/add-to-bag-button";
import { AccountHeading } from "@/components/account/bits";
import { ProductCard } from "@/components/product/product-card";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { removeFromWishlistAction } from "@/lib/actions/account";
import { requireUser } from "@/lib/auth/session";
import { pluralize } from "@/lib/format";
import { getWishlist } from "@/lib/queries/account";

export const metadata: Metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  const user = await requireUser("/account/wishlist");
  const items = await getWishlist(user.id);

  return (
    <div>
      <AccountHeading
        title="Wishlist"
        description={
          items.length > 0
            ? `${pluralize(items.length, "product")} saved for later.`
            : "Tap the heart on any product to save it here."
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon={<Heart className="size-8" />}
          title="Your wishlist is empty"
          description="Save the peptides you're curious about and come back when you're ready."
          action={<ButtonLink href="/shop">Browse products</ButtonLink>}
        />
      ) : (
        <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">
          {items.map((p) => (
            <li key={p.id} className="flex flex-col">
              <ProductCard product={p} className="flex-1" />
              <AddToBagButton productId={p.id} soldOut={p.stock <= 0} className="mt-4" />
              <form action={removeFromWishlistAction} className="mt-2 text-center">
                <input type="hidden" name="productId" value={p.id} />
                <button type="submit" className="text-[13px] text-muted underline-offset-4 hover:text-danger hover:underline">
                  Remove
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
