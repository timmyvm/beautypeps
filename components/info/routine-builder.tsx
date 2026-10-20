"use client";

import { ArrowLeft, ArrowRight, Check, Loader2, Moon, RotateCcw, ShoppingBag, Sun } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { addManyToCart } from "@/lib/actions/cart";
import { concernLabel } from "@/lib/constants";
import {
  BUILDER_CONCERNS,
  EXPERIENCE_OPTIONS,
  PREFERENCE_OPTIONS,
  recommend,
  SKIN_TYPE_OPTIONS,
  type Answers,
  type BuilderProduct,
  type RoutineStep,
} from "@/lib/content/routine";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

const MAX_CONCERNS = 3;
const STEPS = ["Concerns", "Skin type", "Experience", "Routine"] as const;

export function RoutineBuilder({
  products,
  peptideNames,
}: {
  products: BuilderProduct[];
  peptideNames: Record<string, string>;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({ concerns: [], skinType: null, experience: null, preference: null });
  const done = step >= STEPS.length;

  const canContinue =
    (step === 0 && answers.concerns.length > 0) ||
    (step === 1 && !!answers.skinType) ||
    (step === 2 && !!answers.experience) ||
    (step === 3 && !!answers.preference);

  const restart = () => {
    setAnswers({ concerns: [], skinType: null, experience: null, preference: null });
    setStep(0);
  };

  if (done) {
    return <Results products={products} answers={answers} peptideNames={peptideNames} onRestart={restart} onBack={() => setStep(3)} />;
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Progress */}
      <ol className="mb-10 grid grid-cols-4 gap-2" aria-label="Progress">
        {STEPS.map((label, i) => (
          <li key={label}>
            <div className={cn("h-1 rounded-full transition-colors", i <= step ? "bg-copper" : "bg-stone")} />
            <p className={cn("mt-2 text-[11px] tracking-wide", i === step ? "font-semibold text-espresso" : "text-taupe")}>
              <span className="sr-only">Step </span>
              {i + 1}. {label}
            </p>
          </li>
        ))}
      </ol>

      <div className="rounded-2xl border border-stone/70 bg-cream p-6 md:p-10">
        {step === 0 && (
          <Question title="What would you like to focus on?" hint={`Choose up to ${MAX_CONCERNS}.`}>
            <div className="grid gap-3 sm:grid-cols-2">
              {BUILDER_CONCERNS.map((c) => {
                const selected = answers.concerns.includes(c.value);
                const disabled = !selected && answers.concerns.length >= MAX_CONCERNS;
                return (
                  <OptionButton
                    key={c.value}
                    selected={selected}
                    disabled={disabled}
                    multi
                    onClick={() =>
                      setAnswers((a) => ({
                        ...a,
                        concerns: selected ? a.concerns.filter((x) => x !== c.value) : [...a.concerns, c.value],
                      }))
                    }
                    label={c.label}
                  />
                );
              })}
            </div>
          </Question>
        )}

        {step === 1 && (
          <Question title="How would you describe your skin?">
            <div className="grid gap-3 sm:grid-cols-2">
              {SKIN_TYPE_OPTIONS.map((o) => (
                <OptionButton
                  key={o.value}
                  selected={answers.skinType === o.value}
                  onClick={() => setAnswers((a) => ({ ...a, skinType: o.value }))}
                  label={o.label}
                  hint={o.hint}
                />
              ))}
            </div>
          </Question>
        )}

        {step === 2 && (
          <Question title="How familiar are you with active skincare?">
            <div className="grid gap-3">
              {EXPERIENCE_OPTIONS.map((o) => (
                <OptionButton
                  key={o.value}
                  selected={answers.experience === o.value}
                  onClick={() => setAnswers((a) => ({ ...a, experience: o.value }))}
                  label={o.label}
                  hint={o.hint}
                />
              ))}
            </div>
          </Question>
        )}

        {step === 3 && (
          <Question title="How much do you want in your routine?">
            <div className="grid gap-3 sm:grid-cols-2">
              {PREFERENCE_OPTIONS.map((o) => (
                <OptionButton
                  key={o.value}
                  selected={answers.preference === o.value}
                  onClick={() => setAnswers((a) => ({ ...a, preference: o.value }))}
                  label={o.label}
                  hint={o.hint}
                />
              ))}
            </div>
          </Question>
        )}

        <div className="mt-10 flex items-center justify-between gap-4 border-t border-stone/60 pt-6">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="inline-flex items-center gap-1.5 text-sm text-cocoa hover:text-espresso disabled:invisible"
          >
            <ArrowLeft className="size-4" aria-hidden /> Back
          </button>
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            disabled={!canContinue}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-espresso px-6 text-sm font-medium text-cream transition-colors hover:bg-ink disabled:opacity-40"
          >
            {step === STEPS.length - 1 ? "See my routine" : "Continue"} <ArrowRight className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}

function Question({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="font-display text-2xl text-espresso md:text-3xl">{title}</legend>
      {hint && <p className="mt-2 text-sm text-cocoa">{hint}</p>}
      <div className="mt-7">{children}</div>
    </fieldset>
  );
}

function OptionButton({
  selected,
  disabled,
  multi,
  onClick,
  label,
  hint,
}: {
  selected: boolean;
  disabled?: boolean;
  multi?: boolean;
  onClick: () => void;
  label: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      role={multi ? "checkbox" : "radio"}
      aria-checked={selected}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-4 rounded-xl border px-4 py-3.5 text-left transition-colors",
        selected ? "border-copper bg-copper-light/30" : "border-stone bg-cream hover:border-taupe",
        disabled && "cursor-not-allowed opacity-40",
      )}
    >
      <span
        className={cn(
          "grid size-5 shrink-0 place-items-center border transition-colors",
          multi ? "rounded-md" : "rounded-full",
          selected ? "border-copper bg-copper text-cream" : "border-taupe",
        )}
      >
        {selected && <Check className="size-3" aria-hidden />}
      </span>
      <span>
        <span className="block text-sm font-medium text-espresso">{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-cocoa">{hint}</span>}
      </span>
    </button>
  );
}

function Results({
  products,
  answers,
  peptideNames,
  onRestart,
  onBack,
}: {
  products: BuilderProduct[];
  answers: Answers;
  peptideNames: Record<string, string>;
  onRestart: () => void;
  onBack: () => void;
}) {
  const rec = useMemo(() => recommend(products, answers), [products, answers]);
  const total = rec.products.reduce((s, p) => s + p.price, 0);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const addAll = () =>
    startTransition(async () => {
      const res = await addManyToCart(rec.products.map((p) => p.id));
      setResult(res);
    });

  return (
    <div>
      <div className="mx-auto max-w-3xl text-center">
        <p className="eyebrow mb-3">Your routine</p>
        <h2 className="font-display text-3xl text-espresso md:text-5xl">A peptide routine built for you</h2>
        <p className="mt-4 text-cocoa">
          Focused on {answers.concerns.map((c) => concernLabel(c).toLowerCase()).join(", ")} for{" "}
          {SKIN_TYPE_OPTIONS.find((s) => s.value === answers.skinType)?.label.toLowerCase()} skin.
        </p>
      </div>

      {rec.products.length === 0 ? (
        <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-dashed border-stone p-8 text-center">
          <p className="font-display text-xl text-espresso">We couldn&apos;t find an in-stock match right now</p>
          <p className="mt-2 text-sm text-cocoa">Try different concerns, or browse the full range.</p>
          <div className="mt-6 flex justify-center gap-3">
            <button type="button" onClick={onRestart} className="text-sm text-copper-dark underline underline-offset-4">
              Start over
            </button>
            <Link href="/shop" className="text-sm text-copper-dark underline underline-offset-4">
              Shop all
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <RoutineColumn title="Morning" icon={<Sun className="size-5" aria-hidden />} steps={rec.am} />
            <RoutineColumn title="Evening" icon={<Moon className="size-5" aria-hidden />} steps={rec.pm} />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <section className="rounded-2xl border border-stone/70 bg-cream p-6 md:p-8">
              <h3 className="font-display text-2xl text-espresso">Why these peptides</h3>
              <ul className="mt-5 space-y-5">
                {rec.introOrder.map((p, i) => (
                  <li key={p.id} className="flex gap-4">
                    <span className="font-display text-lg text-copper">{i + 1}</span>
                    <div className="min-w-0">
                      <Link href={`/products/${p.slug}`} className="font-medium text-espresso hover:text-copper-dark">
                        {p.name}
                      </Link>
                      {rec.matched[p.id]?.length > 0 && (
                        <p className="mt-0.5 text-xs text-cocoa">
                          Targets: {rec.matched[p.id].map((c) => concernLabel(c).toLowerCase()).join(", ")}
                        </p>
                      )}
                      {p.peptideSlugs.length > 0 && (
                        <p className="mt-1.5 flex flex-wrap gap-1.5">
                          {p.peptideSlugs.map((s) => (
                            <Link
                              key={s}
                              href={`/peptides/${s}`}
                              className="rounded-full border border-stone bg-ivory px-2.5 py-0.5 text-[11px] text-espresso hover:border-copper/50"
                            >
                              {peptideNames[s] ?? s}
                            </Link>
                          ))}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              <h3 className="mt-10 font-display text-xl text-espresso">How to start</h3>
              <ul className="mt-4 space-y-2.5">
                {rec.notes.map((n) => (
                  <li key={n} className="flex gap-3 text-sm leading-relaxed text-cocoa">
                    <Check className="mt-0.5 size-4 shrink-0 text-copper" aria-hidden />
                    {n}
                  </li>
                ))}
              </ul>
            </section>

            <aside className="h-fit rounded-2xl bg-espresso p-6 text-cream md:p-8 lg:sticky lg:top-28">
              <p className="text-xs font-semibold tracking-[0.2em] text-copper-light uppercase">Your routine</p>
              <ul className="mt-5 space-y-3">
                {rec.products.map((p) => (
                  <li key={p.id} className="flex items-center gap-3">
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-cream/10">
                      <Image src={p.image} alt="" fill sizes="48px" className="object-cover" />
                    </div>
                    <span className="min-w-0 flex-1 truncate text-sm">{p.name}</span>
                    <span className="text-sm">{formatMoney(p.price)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex items-center justify-between border-t border-cream/15 pt-4">
                <span className="text-sm text-cream/70">Total</span>
                <span className="font-display text-2xl">{formatMoney(total)}</span>
              </div>
              <button
                type="button"
                onClick={addAll}
                disabled={pending}
                className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-copper text-sm font-medium text-cream transition-colors hover:bg-copper-dark disabled:opacity-60"
              >
                {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <ShoppingBag className="size-4" aria-hidden />}
                Add routine to bag
              </button>
              {result && (
                <p className={cn("mt-3 text-center text-sm", result.ok ? "text-copper-light" : "text-cream/70")} role="status">
                  {result.message}{" "}
                  <Link href="/cart" className="underline underline-offset-4">
                    View bag
                  </Link>
                </p>
              )}
              {rec.kit && (
                <p className="mt-5 text-xs leading-relaxed text-cream/60">
                  Prefer a set? The{" "}
                  <Link href={`/products/${rec.kit.slug}`} className="text-cream underline underline-offset-4">
                    {rec.kit.name}
                  </Link>{" "}
                  covers similar ground.
                </p>
              )}
              <div className="mt-6 flex justify-between gap-3 border-t border-cream/15 pt-4 text-xs">
                <button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-cream/70 hover:text-cream">
                  <ArrowLeft className="size-3.5" aria-hidden /> Change answers
                </button>
                <button type="button" onClick={onRestart} className="inline-flex items-center gap-1 text-cream/70 hover:text-cream">
                  <RotateCcw className="size-3.5" aria-hidden /> Start over
                </button>
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}

function RoutineColumn({ title, icon, steps }: { title: string; icon: React.ReactNode; steps: RoutineStep[] }) {
  return (
    <section className="rounded-2xl border border-stone/70 bg-cream p-6 md:p-8">
      <h3 className="flex items-center gap-2 font-display text-2xl text-espresso">
        <span className="text-copper">{icon}</span> {title}
      </h3>
      <ol className="mt-6 space-y-4">
        {steps.map((s, i) => (
          <li key={`${s.step}-${i}`} className="flex gap-4">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-ivory text-xs font-semibold text-cocoa">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold tracking-[0.16em] text-copper-dark uppercase">{s.step}</p>
              {s.product ? (
                <Link href={`/products/${s.product.slug}`} className="group mt-1.5 flex items-center gap-3">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-ivory">
                    <Image src={s.product.image} alt="" fill sizes="56px" className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-espresso group-hover:text-copper-dark">{s.product.name}</p>
                    <p className="text-xs text-cocoa">
                      {formatMoney(s.product.price)}
                      {s.product.size ? ` · ${s.product.size}` : ""}
                    </p>
                  </div>
                </Link>
              ) : (
                <p className="mt-1 text-sm text-cocoa">{s.generic}</p>
              )}
              {s.note && <p className="mt-1.5 text-xs text-taupe">{s.note}</p>}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
