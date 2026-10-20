"use client";

import { Loader2, Star } from "lucide-react";
import { startTransition, useActionState, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, Input, Select, Textarea } from "@/components/ui/form";
import { submitReviewAction } from "@/lib/actions/reviews";
import { SKIN_TYPES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const LABELS = ["", "Not for me", "It's okay", "Good", "Great", "Love it"];

export function ReviewForm({ productId, productName }: { productId: string; productName: string }) {
  const [state, action, pending] = useActionState(submitReviewAction, {});
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-sage/30 bg-sage-light/60 p-6 text-sm text-sage" role="status">
        <p className="font-display text-xl text-espresso">Thank you</p>
        <p className="mt-1">{state.message}</p>
      </div>
    );
  }

  const shown = hover || rating;

  // Submit in a transition so React doesn't clear the fields when validation fails.
  const onSubmit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const data = new FormData(ev.currentTarget);
    startTransition(() => action(data));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <input type="hidden" name="productId" value={productId} />
      <FormMessage state={state} />

      <fieldset>
        <legend className="mb-2 text-xs font-medium tracking-wide text-cocoa">Your rating for {productName}</legend>
        <div className="flex items-center gap-3">
          <div className="flex" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((n) => (
              <label key={n} className="cursor-pointer p-0.5" onMouseEnter={() => setHover(n)}>
                <input
                  type="radio"
                  name="rating"
                  value={n}
                  checked={rating === n}
                  onChange={() => setRating(n)}
                  className="peer sr-only"
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                />
                <Star
                  className={cn(
                    "size-7 text-copper transition-colors peer-focus-visible:rounded peer-focus-visible:outline-2 peer-focus-visible:outline-copper",
                    n <= shown ? "fill-copper" : "fill-transparent opacity-40",
                  )}
                  aria-hidden
                />
              </label>
            ))}
          </div>
          <span className="text-sm text-cocoa">{LABELS[shown]}</span>
        </div>
        {state.errors?.rating && <p className="mt-1.5 text-xs text-danger">{state.errors.rating}</p>}
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-[2fr_1fr]">
        <Field label="Headline" htmlFor="review-title" error={state.errors?.title}>
          <Input id="review-title" name="title" maxLength={100} required aria-invalid={!!state.errors?.title} />
        </Field>
        <Field label="Skin type (optional)" htmlFor="review-skin">
          <Select id="review-skin" name="skinType" defaultValue="">
            <option value="">Prefer not to say</option>
            {SKIN_TYPES.filter((s) => s !== "All skin types").map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field
        label="Your review"
        htmlFor="review-body"
        error={state.errors?.body}
        hint="How did it feel, how did you use it, and what changed over time?"
      >
        <Textarea id="review-body" name="body" rows={5} maxLength={3000} required aria-invalid={!!state.errors?.body} />
      </Field>

      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {pending ? "Submitting…" : "Submit review"}
      </Button>
    </form>
  );
}
