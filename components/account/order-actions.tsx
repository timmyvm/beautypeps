"use client";

import { Loader2, RotateCcw, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { cancelOrderAction } from "@/lib/actions/account";
import { addManyToCart } from "@/lib/actions/cart";

export function BuyAgainButton({ productIds }: { productIds: string[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  if (productIds.length === 0) return null;

  return (
    <div>
      <Button
        variant="primary"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await addManyToCart(productIds);
            // Items already in the bag still count as success for "buy again".
            if (res.ok || res.count > 0) router.push("/cart");
            else setMessage(res.message);
          })
        }
      >
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <RotateCcw className="size-4" aria-hidden />}
        Buy again
      </Button>
      {message && (
        <p className="mt-2 text-[13px] text-danger" role="alert">
          {message}
        </p>
      )}
    </div>
  );
}

export function CancelOrderButton({ orderNumber }: { orderNumber: string }) {
  const [confirming, setConfirming] = useState(false);
  const [state, action] = useActionState(cancelOrderAction, {});

  if (state.ok) return <FormMessage state={state} />;

  if (!confirming) {
    return (
      <Button variant="outline" onClick={() => setConfirming(true)}>
        <XCircle className="size-4" aria-hidden /> Cancel order
      </Button>
    );
  }

  return (
    <form action={action} className="w-full rounded-2xl border border-danger/30 bg-danger-light/50 p-4 sm:max-w-md">
      <input type="hidden" name="orderNumber" value={orderNumber} />
      <p className="text-sm font-medium text-espresso">Cancel order {orderNumber}?</p>
      <p className="mt-1 text-[13px] text-muted">
        Only cancel if you haven&apos;t sent payment yet. If you already have, contact us instead so we can match it up.
      </p>
      <div className="mt-3">
        <FormMessage state={state} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <SubmitButton variant="danger" size="sm" pendingText="Cancelling…">
          Yes, cancel it
        </SubmitButton>
        <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
          Keep order
        </Button>
      </div>
    </form>
  );
}
