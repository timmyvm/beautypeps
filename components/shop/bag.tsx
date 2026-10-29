"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useTransition, type ReactNode } from "react";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { SpecimenTile, toneFor } from "@/components/product/product-card";
import { buttonClasses } from "@/components/ui/button";
import { addToCart, getBagSnapshot, removeFromCart, updateCartQuantity, type BagSnapshot } from "@/lib/actions/cart";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

/*
 * The slide-over bag. Anything that adds to the bag calls `useBag().open(productId)` afterwards, so the
 * visitor sees what went in, how far they are from free shipping and the way to checkout without leaving
 * the page. The header's Bag link opens it too; without script it is simply a link to /cart.
 */

type BagContext = { open: (highlightId?: string) => void; close: () => void };

const Ctx = createContext<BagContext>({ open: () => {}, close: () => {} });

export function useBag() {
  return useContext(Ctx);
}

export function BagProvider({ children }: { children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [isOpen, setOpen] = useState(false);
  const [bag, setBag] = useState<BagSnapshot | null>(null);
  const [highlight, setHighlight] = useState<string | undefined>();
  const [loading, startLoading] = useTransition();

  const load = useCallback(() => startLoading(async () => setBag(await getBagSnapshot())), []);

  const open = useCallback(
    (highlightId?: string) => {
      setHighlight(highlightId);
      setOpen(true);
      load();
    },
    [load],
  );
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (isOpen && !d.open) d.showModal();
    if (!isOpen && d.open) {
      // Let the panel slide out before the dialog leaves the top layer.
      const t = window.setTimeout(() => d.close(), 260);
      return () => window.clearTimeout(t);
    }
  }, [isOpen]);

  const value = useMemo(() => ({ open, close }), [open, close]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <dialog
        ref={dialog}
        className="bag-dialog"
        data-open={isOpen ? "" : undefined}
        aria-label="Your bag"
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
        onClick={(e) => {
          // A click on the backdrop (the dialog element itself, outside the panel) closes it.
          if (e.target === e.currentTarget) close();
        }}
      >
        <BagPanel bag={bag} loading={loading && !bag} highlight={highlight} onChange={load} onClose={close} />
      </dialog>
    </Ctx.Provider>
  );
}

function BagPanel({
  bag,
  loading,
  highlight,
  onChange,
  onClose,
}: {
  bag: BagSnapshot | null;
  loading: boolean;
  highlight?: string;
  onChange: () => void;
  onClose: () => void;
}) {
  const remaining = bag ? Math.max(0, bag.freeShippingThreshold - bag.subtotal) : 0;
  const pct = bag && bag.freeShippingThreshold > 0 ? Math.min(100, Math.round((bag.subtotal / bag.freeShippingThreshold) * 100)) : 0;

  return (
    <div className="bag-panel flex h-full flex-col bg-bg text-ink">
      <div className="flex items-center justify-between gap-4 px-6 pt-6 pb-4">
        <h2 className="text-lead font-medium">
          Your bag
          {bag && bag.itemCount > 0 && <span className="tabular ml-2 text-muted">{bag.itemCount}</span>}
        </h2>
        <button type="button" onClick={onClose} className="press h-10 text-body font-medium underline-offset-4 hover:underline" autoFocus>
          Close
        </button>
      </div>

      {loading ? (
        <div className="grid flex-1 place-items-center" aria-busy="true">
          <Loader2 className="size-6 animate-spin text-muted" aria-label="Loading your bag" />
        </div>
      ) : !bag || bag.lines.length === 0 ? (
        <div className="flex flex-1 flex-col justify-between px-6 pb-6">
          <p className="max-w-[30ch] text-lead">Your bag is empty. Every vial is in the catalogue, graded.</p>
          <Link href="/shop" onClick={onClose} className={buttonClasses({ size: "lg", className: "w-full" })}>
            See all formulas
          </Link>
        </div>
      ) : (
        <>
          {bag.freeShippingThreshold > 0 && (
            <div className="mx-6 bg-field-frost px-4 py-3">
              <p className="text-small">
                {remaining > 0 ? (
                  <>
                    <span className="font-medium">{formatMoney(remaining)}</span> away from free standard shipping.
                  </>
                ) : (
                  "Standard shipping is free on this order."
                )}
              </p>
              <div className="mt-2 h-1.5 bg-white" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Progress to free shipping">
                <div className="h-full bg-accent transition-[width] duration-500" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )}

          <div className="mt-4 flex-1 overflow-y-auto px-6 pb-6">
            <ul className="space-y-2">
              {bag.lines.map((l) => (
                <BagLine key={l.id} line={l} fresh={l.id === highlight} onChange={onChange} onNavigate={onClose} />
              ))}
            </ul>
            {bag.suggestions.length > 0 && (
              <div className="mt-8">
                <h3 className="text-body font-medium">More from the shelf</h3>
                <ul className="mt-3 grid grid-cols-2 gap-2">
                  {bag.suggestions.map((s) => (
                    <Suggestion key={s.id} item={s} onAdded={onChange} onNavigate={onClose} />
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="bg-surface px-6 pt-5 pb-6">
            <p className="flex items-baseline justify-between text-body">
              <span>Subtotal</span>
              <span className="tabular text-lead font-medium">{formatMoney(bag.subtotal)}</span>
            </p>
            <p className="mt-1 text-small text-muted">Shipping and any code are added at checkout. Pay by bank transfer or PayID.</p>
            <Link href="/checkout" onClick={onClose} className={buttonClasses({ size: "lg", className: "mt-4 w-full" })}>
              Checkout
            </Link>
            <Link href="/cart" onClick={onClose} className="mt-3 block text-center text-body underline underline-offset-4">
              View the full bag
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

function BagLine({
  line,
  fresh,
  onChange,
  onNavigate,
}: {
  line: BagSnapshot["lines"][number];
  fresh: boolean;
  onChange: () => void;
  onNavigate: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const run = (fn: () => Promise<unknown>) =>
    startTransition(async () => {
      await fn();
      onChange();
    });

  return (
    <li className={cn("bag-line flex gap-4 p-3 transition-[opacity,background-color] duration-500", fresh ? "bg-accent-soft" : "bg-surface", pending && "opacity-60")}>
      <Link href={`/products/${line.slug}`} onClick={onNavigate} className="w-20 shrink-0" aria-label={line.name}>
        <SpecimenTile product={line} tone={toneFor(line.slug)} sizes="80px" className="aspect-[4/5] w-full" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <Link href={`/products/${line.slug}`} onClick={onNavigate} className="text-body leading-snug font-medium hover:underline hover:underline-offset-4">
            {line.name}
          </Link>
          <span className="tabular text-body whitespace-nowrap">{formatMoney(line.lineTotal)}</span>
        </div>
        {line.limited && <p className="mt-1 text-small text-amber">Only {line.max} left, so the quantity was adjusted.</p>}
        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <QuantityStepper
            size="sm"
            value={line.quantity}
            max={Math.max(1, line.max)}
            disabled={pending}
            label={`Quantity of ${line.name}`}
            onChange={(q) => run(() => updateCartQuantity(line.id, q))}
          />
          <button
            type="button"
            onClick={() => run(() => removeFromCart(line.id))}
            disabled={pending}
            className="press text-small underline underline-offset-4 hover:text-danger"
            aria-label={`Remove ${line.name} from bag`}
          >
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}

function Suggestion({
  item,
  onAdded,
  onNavigate,
}: {
  item: BagSnapshot["suggestions"][number];
  onAdded: () => void;
  onNavigate: () => void;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <li className="flex flex-col">
      <Link href={`/products/${item.slug}`} onClick={onNavigate} className="group block" aria-label={item.name}>
        <SpecimenTile product={item} tone={toneFor(item.slug)} sizes="200px" className="aspect-[4/5] w-full" />
      </Link>
      <p className="mt-2 text-small leading-snug font-medium">{item.name}</p>
      <p className="text-small text-muted">{item.fact}</p>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await addToCart(item.id, 1);
            onAdded();
          })
        }
        className="press mt-2 inline-flex h-10 items-center justify-between gap-2 bg-surface px-3 text-small font-medium hover:bg-surface-2 disabled:opacity-60"
      >
        <span>{pending ? "Adding" : "Add"}</span>
        <span className="tabular">{formatMoney(item.price)}</span>
      </button>
    </li>
  );
}

/** The header's Bag: a link to /cart that opens the slide-over when script is running. */
export function BagLink({ count, className }: { count: number; className?: string }) {
  const bag = useBag();
  return (
    <Link
      href="/cart"
      className={className}
      aria-label={`Bag, ${count} ${count === 1 ? "item" : "items"}`}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        bag.open();
      }}
    >
      Bag{count > 0 ? ` (${count})` : ""}
    </Link>
  );
}
