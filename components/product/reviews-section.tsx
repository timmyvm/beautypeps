import { BadgeCheck, MessageSquareText } from "lucide-react";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { Stars } from "@/components/ui/misc";
import type { Review } from "@/lib/db/schema";
import { formatDate, pluralize } from "@/lib/format";
import { ReviewForm } from "./review-form";

export function ReviewsSection({
  product,
  reviews,
  signedIn,
  alreadyReviewed,
}: {
  product: { id: string; name: string; slug: string };
  reviews: Review[];
  signedIn: boolean;
  alreadyReviewed: boolean;
}) {
  const count = reviews.length;
  const average = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    n: reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <section id="reviews" className="scroll-mt-28 border-t border-stone/70 py-16 md:py-20" aria-labelledby="reviews-heading">
      <div className="grid gap-12 lg:grid-cols-[320px_1fr]">
        <div>
          <p className="eyebrow mb-3">Reviews</p>
          <h2 id="reviews-heading" className="font-display text-3xl text-espresso">
            What customers say
          </h2>
          {count > 0 ? (
            <>
              <div className="mt-6 flex items-end gap-3">
                <span className="font-display text-5xl text-espresso">{average.toFixed(1)}</span>
                <div className="pb-1.5">
                  <Stars rating={average} size={16} />
                  <p className="mt-1 text-xs text-cocoa">Based on {pluralize(count, "review")}</p>
                </div>
              </div>
              <ul className="mt-6 space-y-2" aria-label="Rating distribution">
                {distribution.map(({ star, n }) => (
                  <li key={star} className="flex items-center gap-3 text-xs text-cocoa">
                    <span className="w-8 tabular-nums">{star} ★</span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-sand">
                      <span
                        className="block h-full rounded-full bg-copper"
                        style={{ width: `${count ? (n / count) * 100 : 0}%` }}
                      />
                    </span>
                    <span className="w-6 text-right tabular-nums">{n}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="mt-4 text-sm text-cocoa">No reviews yet — be the first to share your experience.</p>
          )}

          <div className="mt-8 rounded-2xl bg-ivory p-5">
            {!signedIn ? (
              <>
                <p className="text-sm text-cocoa">Bought {product.name}? We&apos;d love to hear how it worked for you.</p>
                <Link
                  href={`/login?next=${encodeURIComponent(`/products/${product.slug}#write-review`)}`}
                  className={buttonClasses({ variant: "outline", size: "sm", className: "mt-4" })}
                >
                  Sign in to write a review
                </Link>
              </>
            ) : alreadyReviewed ? (
              <p className="text-sm text-cocoa">Thanks — you&apos;ve already reviewed this product.</p>
            ) : (
              <a href="#write-review" className={buttonClasses({ variant: "outline", size: "sm" })}>
                Write a review
              </a>
            )}
          </div>
        </div>

        <div>
          {count === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-stone px-6 py-14 text-center">
              <MessageSquareText className="size-8 text-taupe" aria-hidden />
              <p className="mt-3 font-display text-xl">No reviews yet</p>
            </div>
          ) : (
            <ul className="divide-y divide-stone/60">
              {reviews.map((r) => (
                <li key={r.id} className="py-6 first:pt-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Stars rating={r.rating} size={14} />
                    <span className="text-xs text-taupe">{formatDate(r.createdAt)}</span>
                  </div>
                  <h3 className="mt-3 font-medium text-espresso">{r.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-cocoa">{r.body}</p>
                  <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-cocoa">
                    <span className="font-medium text-espresso">{r.authorName}</span>
                    {r.verifiedPurchase && (
                      <span className="inline-flex items-center gap-1 text-sage">
                        <BadgeCheck className="size-3.5" aria-hidden /> Verified purchase
                      </span>
                    )}
                    {r.skinType && <span>Skin type: {r.skinType}</span>}
                  </p>
                  {r.adminReply && (
                    <div className="mt-4 rounded-xl border-l-2 border-copper bg-ivory px-4 py-3 text-sm text-cocoa">
                      <p className="mb-1 text-xs font-semibold tracking-wide text-copper-dark uppercase">
                        Beauty Peps replied
                      </p>
                      {r.adminReply}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

          {signedIn && !alreadyReviewed && (
            <div id="write-review" className="mt-10 scroll-mt-28 rounded-2xl border border-stone/70 bg-cream p-6 md:p-8">
              <h3 className="mb-6 font-display text-2xl text-espresso">Write a review</h3>
              <ReviewForm productId={product.id} productName={product.name} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
