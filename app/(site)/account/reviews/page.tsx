import { MessageSquareQuote, Star } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AccountHeading } from "@/components/account/bits";
import { ConfirmSubmit } from "@/components/account/confirm-submit";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, Stars } from "@/components/ui/misc";
import { deleteReviewAction } from "@/lib/actions/account";
import { requireUser } from "@/lib/auth/session";
import { REVIEW_STATUSES } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { getUserReviews } from "@/lib/queries/account";

export const metadata: Metadata = { title: "Reviews" };

export default async function MyReviewsPage() {
  const user = await requireUser("/account/reviews");
  const reviews = await getUserReviews(user.id);

  return (
    <div>
      <AccountHeading
        title="Your reviews"
        description="Reviews are checked by our team before they appear on the product page — usually within a day."
      />

      {reviews.length === 0 ? (
        <EmptyState
          icon={<Star className="size-8" />}
          title="No reviews yet"
          description="Once your order arrives, tell others how your peptides are working for you."
          action={<ButtonLink href="/account/orders">View my orders</ButtonLink>}
        />
      ) : (
        <ul className="space-y-4">
          {reviews.map((r) => {
            const status = REVIEW_STATUSES[r.status];
            return (
              <li key={r.id} className="bg-surface p-5 sm:p-6">
                <div className="flex gap-4">
                  <Link
                    href={`/products/${r.productSlug}`}
                    className="relative size-16 shrink-0 overflow-hidden bg-white"
                  >
                    <Image src={r.productImage} alt={r.productName} fill sizes="64px" className="object-cover" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Link
                        href={`/products/${r.productSlug}`}
                        className="text-[15px] font-medium text-ink hover:underline"
                      >
                        {r.productName}
                      </Link>
                      <Badge tone={status.tone}>{status.label}</Badge>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[13px] text-muted">
                      <Stars rating={r.rating} size={12} />
                      <span>{formatDate(r.createdAt)}</span>
                      {r.verifiedPurchase && <span>· Verified purchase</span>}
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-base font-semibold text-ink">{r.title}</p>
                <p className="mt-1 text-[15px] leading-relaxed whitespace-pre-line text-ink">{r.body}</p>
                {r.adminReply && (
                  <div className="mt-4 flex gap-3 border-l-2 border-ink bg-white p-4">
                    <MessageSquareQuote className="size-4 shrink-0 text-muted" aria-hidden />
                    <div>
                      <p className="text-[13px] font-semibold text-ink">Reply from Beauty Peps</p>
                      <p className="mt-1 text-sm text-muted">{r.adminReply}</p>
                    </div>
                  </div>
                )}
                {r.status === "rejected" && (
                  <p className="mt-3 text-[13px] text-muted">
                    This review wasn&apos;t published — usually because it mentioned medical claims or another brand.
                  </p>
                )}
                <form action={deleteReviewAction} className="mt-4 text-right">
                  <input type="hidden" name="id" value={r.id} />
                  <ConfirmSubmit confirmMessage="Delete this review?" className="text-[13px] text-muted hover:text-danger">
                    Delete review
                  </ConfirmSubmit>
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
