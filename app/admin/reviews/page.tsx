import { BadgeCheck, MessageSquareReply } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ConfirmButton } from "@/components/admin/catalog/confirm-button";
import { AdminPageHeader, FilterTabs, Pagination } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState, Stars } from "@/components/ui/misc";
import {
  bulkApproveReviewsAction,
  deleteReviewAction,
  replyToReviewAction,
  setReviewStatusAction,
} from "@/lib/actions/admin/reviews";
import { REVIEW_STATUSES } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { listAdminReviews, listProductOptions, reviewStatusCounts } from "@/lib/queries/admin-catalog";

export const metadata: Metadata = { title: "Reviews" };

type SP = { status?: string; rating?: string; product?: string; page?: string };

export default async function AdminReviewsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const status = sp.status ?? "pending";
  const [{ rows, total, page, pageCount }, counts, productOptions] = await Promise.all([
    listAdminReviews({ ...sp, status, page: Number(sp.page) || 1 }),
    reviewStatusCounts(),
    listProductOptions(),
  ]);
  const pendingOnPage = rows.filter((r) => r.status === "pending");

  return (
    <>
      <AdminPageHeader
        title="Reviews"
        description={
          counts.pending > 0
            ? `${counts.pending} review${counts.pending === 1 ? "" : "s"} waiting for moderation`
            : "All caught up — no reviews waiting for moderation."
        }
      />

      <FilterTabs
        basePath="/admin/reviews"
        param="status"
        current={status}
        searchParams={{ rating: sp.rating, product: sp.product }}
        options={[
          { value: "pending", label: "Pending", count: counts.pending },
          { value: "approved", label: "Approved", count: counts.approved },
          { value: "rejected", label: "Rejected", count: counts.rejected },
          { value: "all", label: "All", count: counts.all },
        ]}
      />

      <form method="get" className="mb-6 flex flex-wrap items-center gap-2">
        <input type="hidden" name="status" value={status} />
        <select
          name="rating"
          defaultValue={sp.rating ?? ""}
          aria-label="Rating"
          className="select-chevron h-10 appearance-none rounded-full border border-stone bg-cream pr-10 pl-4 text-sm focus:border-copper focus:outline-none"
        >
          <option value="">Any rating</option>
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>
              {r} star{r === 1 ? "" : "s"}
            </option>
          ))}
        </select>
        <select
          name="product"
          defaultValue={sp.product ?? ""}
          aria-label="Product"
          className="select-chevron h-10 max-w-64 appearance-none rounded-full border border-stone bg-cream pr-10 pl-4 text-sm focus:border-copper focus:outline-none"
        >
          <option value="">All products</option>
          {productOptions.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <button type="submit" className={buttonClasses({ variant: "outline", size: "sm", className: "h-10 bg-surface-2 hover:bg-stone" })}>
          Filter
        </button>
        {(sp.rating || sp.product) && (
          <Link href={`/admin/reviews?status=${status}`} className="px-2 text-[13px] text-muted underline underline-offset-4">
            Clear
          </Link>
        )}
      </form>

      {rows.length === 0 ? (
        <EmptyState
          title={status === "pending" ? "No reviews to moderate" : "No reviews found"}
          description={status === "pending" ? "New customer reviews will appear here for approval." : "Try a different filter."}
        />
      ) : (
        <form action={bulkApproveReviewsAction}>
          {pendingOnPage.length > 1 && (
            <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-stone/70 bg-cream px-4 py-3">
              <p className="text-sm text-muted">Tick reviews to approve several at once.</p>
              <button type="submit" className={buttonClasses({ variant: "dark", size: "sm" })}>
                Approve selected
              </button>
            </div>
          )}

          <ul className="space-y-4">
            {rows.map((r) => (
              <li key={r.id} className="rounded-2xl border border-stone/70 bg-cream p-5">
                <div className="flex gap-4">
                  {r.status === "pending" && (
                    <input
                      type="checkbox"
                      name="ids"
                      value={r.id}
                      aria-label={`Select review “${r.title}”`}
                      className="mt-1 size-4 shrink-0 accent-copper"
                    />
                  )}
                  <Link href={`/admin/products/${r.productId}`} className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-ivory">
                    <Image src={r.productImage} alt="" fill sizes="56px" className="object-cover" unoptimized={!r.productImage.startsWith("/images/")} />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <Link href={`/admin/products/${r.productId}`} className="text-[13px] font-medium text-copper-dark hover:underline">
                        {r.productName}
                      </Link>
                      <Badge tone={REVIEW_STATUSES[r.status].tone}>{REVIEW_STATUSES[r.status].label}</Badge>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <Stars rating={r.rating} />
                      <h2 className="font-medium text-espresso">{r.title}</h2>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-muted">{r.body}</p>
                    <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-taupe">
                      <span className="font-medium text-muted">{r.authorName}</span>
                      {r.verifiedPurchase && (
                        <span className="inline-flex items-center gap-1 text-sage">
                          <BadgeCheck className="size-3.5" aria-hidden /> Verified purchase
                        </span>
                      )}
                      {r.skinType && <span>· {r.skinType} skin</span>}
                      <span>· {formatDate(r.createdAt)}</span>
                    </p>

                    {r.adminReply && (
                      <div className="mt-3 rounded-xl border-l-2 border-copper bg-ivory px-4 py-2.5 text-sm text-muted">
                        <p className="mb-0.5 text-[13px] font-semibold text-copper-dark">Beauty Peps replied</p>
                        {r.adminReply}
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {r.status !== "approved" && (
                        <ConfirmButton action={setReviewStatusAction.bind(null, r.id, "approved")} variant="primary">
                          Approve
                        </ConfirmButton>
                      )}
                      {r.status !== "rejected" && (
                        <ConfirmButton action={setReviewStatusAction.bind(null, r.id, "rejected")}>Reject</ConfirmButton>
                      )}
                      <ConfirmButton
                        action={deleteReviewAction.bind(null, r.id)}
                        confirm="Delete this review permanently?"
                        confirmLabel="Delete"
                        variant="ghost"
                        className="text-danger hover:bg-danger-light"
                      >
                        Delete
                      </ConfirmButton>
                    </div>

                    <details className="group mt-3">
                      <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 text-[13px] font-medium text-muted hover:text-espresso">
                        <MessageSquareReply className="size-3.5" aria-hidden />
                        {r.adminReply ? "Edit reply" : "Reply publicly"}
                      </summary>
                      <div className="mt-2 space-y-2">
                        <textarea
                          name={`reply-${r.id}`}
                          defaultValue={r.adminReply ?? ""}
                          rows={3}
                          maxLength={2000}
                          aria-label="Public reply"
                          placeholder="Thanks so much for sharing your results…"
                          className="w-full rounded-xl border border-stone bg-cream px-4 py-3 text-sm focus:border-copper focus:ring-2 focus:ring-copper/20 focus:outline-none"
                        />
                        <div className="flex items-center gap-3">
                          <button
                            type="submit"
                            formAction={replyToReviewAction.bind(null, r.id)}
                            className={buttonClasses({ variant: "outline", size: "sm", className: "bg-surface-2 hover:bg-stone" })}
                          >
                            Save reply
                          </button>
                          <span className="text-[13px] text-taupe">Shown under the review on the product page. Leave empty to remove.</span>
                        </div>
                      </div>
                    </details>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </form>
      )}

      <p className="mt-4 text-[13px] text-taupe">{total} review{total === 1 ? "" : "s"}</p>
      <Pagination page={page} pageCount={pageCount} basePath="/admin/reviews" searchParams={{ ...sp, status }} />
    </>
  );
}
