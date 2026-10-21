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
  headingClass,
}: {
  product: { id: string; name: string; slug: string };
  reviews: Review[];
  signedIn: boolean;
  alreadyReviewed: boolean;
  headingClass?: string;
}) {
  const count = reviews.length;
  const average = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    n: reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <section id="reviews" className="scroll-mt-10" aria-labelledby="reviews-heading">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-[var(--gutter)]">
        <div className="lg:col-span-4" data-reveal="">
          <h2 id="reviews-heading" className={headingClass ?? "display-type text-head"}>
            Reviews
          </h2>
          {count > 0 ? (
            <>
              <p className="mt-6 flex items-baseline gap-3">
                <span className="tabular text-lead font-medium">{average.toFixed(1)} of 5</span>
                <Stars rating={average} size={18} />
              </p>
              <p className="mt-1 text-body">From {pluralize(count, "review")} by people who bought it.</p>
              <ul className="mt-6 space-y-2" aria-label="Ratings by stars">
                {distribution.map(({ star, n }) => (
                  <li key={star} className="tabular grid grid-cols-[4.5rem_1fr_2rem] items-center gap-3 text-small">
                    <span>{pluralize(star, "star")}</span>
                    <span className="h-2 bg-surface-2">
                      <span className="block h-full bg-ink" style={{ width: `${count ? (n / count) * 100 : 0}%` }} />
                    </span>
                    <span className="text-right">{n}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="mt-4 text-body">No reviews yet. If you&apos;ve used it, yours can be the first.</p>
          )}

          <div className="mt-8">
            {!signedIn ? (
              <Link
                href={`/login?next=${encodeURIComponent(`/products/${product.slug}#write-review`)}`}
                className="text-body underline underline-offset-4"
              >
                Sign in to write a review
              </Link>
            ) : alreadyReviewed ? (
              <p className="text-body">Thanks, you&apos;ve already reviewed this formula.</p>
            ) : (
              <a href="#write-review" className="text-body underline underline-offset-4">
                Write a review
              </a>
            )}
          </div>
        </div>

        <div className="lg:col-span-7 lg:col-start-6">
          {count > 0 && (
            <ul className="space-y-12">
              {reviews.map((r, i) => (
                <li key={r.id} data-reveal="" style={{ ["--reveal-i" as string]: Math.min(i, 3) }}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Stars rating={r.rating} size={16} />
                    <span className="text-small text-muted">{formatDate(r.createdAt)}</span>
                  </div>
                  <h3 className="mt-3 text-lead font-medium">{r.title}</h3>
                  <p className="mt-2 max-w-[62ch] text-body whitespace-pre-line">{r.body}</p>
                  <p className="mt-3 text-small text-muted">
                    {r.authorName}
                    {r.verifiedPurchase ? ", verified buyer" : ""}
                    {r.skinType ? `, ${r.skinType.toLowerCase()} skin` : ""}
                  </p>
                  {r.adminReply && (
                    <div className="mt-4 max-w-[62ch] bg-surface px-5 py-4 text-body">
                      <p className="mb-1 font-medium">Beauty Peps replied</p>
                      {r.adminReply}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

          {signedIn && !alreadyReviewed && (
            <div id="write-review" className="mt-12 scroll-mt-10 bg-surface p-6 md:p-8">
              <h3 className="mb-6 text-lead font-medium">Write a review of {product.name}</h3>
              <ReviewForm productId={product.id} productName={product.name} />
            </div>
          )}
          {count === 0 && !(signedIn && !alreadyReviewed) && (
            <div className="bg-surface p-8">
              <p className="text-body">Reviews appear here once they&apos;ve been checked by our team.</p>
              <Link href="/shop" className={buttonClasses({ variant: "outline", className: "mt-6" })}>
                Back to the catalogue
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
