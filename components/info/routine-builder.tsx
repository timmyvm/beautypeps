"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition, type ReactNode } from "react";
import { SpecimenThumb } from "@/components/peptides/peptide-entry";
import { SpecimenTile, toneFor } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { addManyToCart } from "@/lib/actions/cart";
import { concernLabel } from "@/lib/constants";
import {
  BUILDER_CONCERNS,
  EXPERIENCE_OPTIONS,
  PREFERENCE_OPTIONS,
  previewMatches,
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
  const topRef = useRef<HTMLDivElement>(null);
  const hasInteracted = useRef(false);
  const preview = useMemo(() => previewMatches(products, answers), [products, answers]);

  // Bring the next question (or the results) into view after each step.
  useEffect(() => {
    if (!hasInteracted.current) {
      hasInteracted.current = true;
      return;
    }
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

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
    return (
      <div ref={topRef} className="scroll-mt-8">
        <Results products={products} answers={answers} peptideNames={peptideNames} onRestart={restart} onBack={() => setStep(3)} />
      </div>
    );
  }

  return (
    <div ref={topRef} className="grid scroll-mt-8 gap-14 lg:grid-cols-12 lg:gap-[var(--gutter)]">
      <div className="lg:col-span-7">
        <ol className="grid grid-cols-4 gap-1.5" aria-label="Progress">
          {STEPS.map((label, i) => (
            <li key={label} aria-current={i === step ? "step" : undefined}>
              <div className={cn("h-1.5 transition-colors duration-300", i <= step ? "bg-accent" : "bg-surface-2")} />
              <p className={cn("mt-2 text-small", i === step ? "font-medium text-ink" : "text-muted")}>{label}</p>
            </li>
          ))}
        </ol>

        <div className="mt-12">
          {step === 0 && (
            <Question title="What would you like to work on?" hint={`Choose up to ${MAX_CONCERNS}.`}>
              <div className="flex flex-wrap gap-2">
                {BUILDER_CONCERNS.map((c) => {
                  const selected = answers.concerns.includes(c.value);
                  const disabled = !selected && answers.concerns.length >= MAX_CONCERNS;
                  return (
                    <Option
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
              <div className="grid gap-2 sm:grid-cols-2">
                {SKIN_TYPE_OPTIONS.map((o) => (
                  <Option
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
            <Question title="How used to actives is your skin?">
              <div className="grid gap-2">
                {EXPERIENCE_OPTIONS.map((o) => (
                  <Option
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
              <div className="grid gap-2 sm:grid-cols-2">
                {PREFERENCE_OPTIONS.map((o) => (
                  <Option
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
        </div>

        <div className="mt-12 flex items-center gap-8">
          <Button onClick={() => setStep((s) => s + 1)} disabled={!canContinue}>
            {step === STEPS.length - 1 ? "See my routine" : "Continue"}
          </Button>
          {step > 0 && (
            <button type="button" onClick={() => setStep((s) => Math.max(0, s - 1))} className="text-body underline underline-offset-4">
              Back
            </button>
          )}
        </div>
      </div>

      <aside aria-labelledby="preview-title" className="lg:col-span-4 lg:col-start-9">
        <h2 id="preview-title" className="text-lead font-medium">
          {answers.concerns.length === 0 ? "Where most people start" : "Formulas that match so far"}
        </h2>
        <p className="mt-1 text-body text-muted" aria-live="polite">
          {answers.concerns.length === 0
            ? "Choose a concern and this narrows."
            : `For ${answers.concerns.map((c) => concernLabel(c).toLowerCase()).join(", ")}.`}
        </p>
        <ul className="mt-6 grid grid-cols-2 gap-2">
          {preview.map((p) => (
            <li key={p.id}>
              <Link href={`/products/${p.slug}`} className="group block">
                <SpecimenTile product={p} tone={toneFor(p.slug)} sizes="(min-width: 1024px) 16vw, 50vw" className="aspect-[4/5]" />
                <p className="mt-2 text-small font-medium group-hover:underline group-hover:underline-offset-4">{p.name}</p>
                <p className="text-small text-muted">{formatMoney(p.price)}</p>
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}

function Question({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="display-type text-head">{title}</legend>
      {hint && <p className="mt-4 text-body text-muted">{hint}</p>}
      <div className="mt-8">{children}</div>
    </fieldset>
  );
}

function Option({
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
        "press text-left",
        hint ? "flex min-h-[72px] w-full flex-col justify-center px-5 py-3" : "inline-flex h-12 items-center px-5",
        selected ? "bg-ink text-white" : "bg-surface text-ink hover:bg-surface-2",
        disabled && "cursor-not-allowed text-muted hover:bg-surface",
      )}
    >
      <span className="text-body font-medium">{label}</span>
      {hint && <span className={cn("text-small", selected ? "text-white/80" : "text-muted")}>{hint}</span>}
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
  const skin = SKIN_TYPE_OPTIONS.find((s) => s.value === answers.skinType)?.label.toLowerCase();

  const addAll = () =>
    startTransition(async () => {
      const res = await addManyToCart(rec.products.map((p) => p.id));
      setResult(res);
    });

  return (
    <div>
      <h2 className="display-type text-head">Your peptide routine</h2>
      <p className="mt-6 max-w-[56ch] text-lead">
        For {answers.concerns.map((c) => concernLabel(c).toLowerCase()).join(", ")}, on {skin} skin.
      </p>

      {rec.products.length === 0 ? (
        <div className="mt-12 bg-surface px-6 py-12 sm:px-10">
          <p className="text-lead">Nothing in stock matches those answers right now.</p>
          <p className="mt-2 text-body">Try different concerns, or browse the full range.</p>
          <div className="mt-6 flex gap-8 text-body">
            <button type="button" onClick={onRestart} className="underline underline-offset-4">
              Start over
            </button>
            <Link href="/shop" className="underline underline-offset-4">
              Shop all
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-14 grid gap-16 lg:grid-cols-12 lg:gap-[var(--gutter)]">
          <div className="lg:col-span-7">
            <div className="grid gap-12 md:grid-cols-2 md:gap-[var(--gutter)]">
              <RoutineColumn title="Morning" steps={rec.am} />
              <RoutineColumn title="Evening" steps={rec.pm} />
            </div>

            <section aria-labelledby="why-title" className="mt-20">
              <h3 id="why-title" className="text-lead font-medium">
                Why these formulas
              </h3>
              <ul className="mt-6">
                {rec.introOrder.map((p, i) => (
                  <li key={p.id} className={cn("px-4 py-5 sm:px-5", i % 2 === 0 ? "bg-surface" : "bg-bg")}>
                    <Link href={`/products/${p.slug}`} className="text-body font-medium underline-offset-4 hover:underline">
                      {p.name}
                    </Link>
                    {rec.matched[p.id]?.length > 0 && (
                      <p className="mt-1 text-body">
                        For {rec.matched[p.id].map((c) => concernLabel(c).toLowerCase()).join(", ")}
                      </p>
                    )}
                    {p.peptideSlugs.length > 0 && (
                      <p className="mt-1 text-body text-muted">
                        With{" "}
                        {p.peptideSlugs.map((s, j) => (
                          <span key={s}>
                            {j > 0 && (j === p.peptideSlugs.length - 1 ? " and " : ", ")}
                            <Link href={`/peptides/${s}`} className="text-ink underline underline-offset-4">
                              {peptideNames[s] ?? s}
                            </Link>
                          </span>
                        ))}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="start-title" className="mt-16">
              <h3 id="start-title" className="text-lead font-medium">
                How to start
              </h3>
              <ul className="mt-5 space-y-3">
                {rec.notes.map((n) => (
                  <li key={n} className="flex gap-4 text-body">
                    <span aria-hidden className="mt-[0.6em] size-2 shrink-0 bg-accent" />
                    {n}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <aside aria-labelledby="bag-title" className="h-fit bg-field-ink p-6 text-field-ink-ink sm:p-8 lg:sticky lg:top-8 lg:col-span-4 lg:col-start-9">
            <h3 id="bag-title" className="text-lead font-medium">
              The routine, in one go
            </h3>
            <ul className="mt-6 space-y-3">
              {rec.products.map((p) => (
                <li key={p.id} className="flex items-center gap-4">
                  <SpecimenThumb specimen={p} className="size-14 shrink-0" sizes="56px" />
                  <span className="min-w-0 flex-1 text-body">{p.name}</span>
                  <span className="tabular text-body">{formatMoney(p.price)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 flex items-baseline justify-between text-body">
              <span>Total</span>
              <span className="tabular text-lead font-medium">{formatMoney(total)}</span>
            </p>
            <Button onClick={addAll} disabled={pending} size="lg" className="mt-6 w-full">
              {pending ? "Adding…" : "Add routine to bag"}
            </Button>
            {result && (
              <p className="mt-3 text-body" role="status">
                {result.message}{" "}
                <Link href="/cart" className="underline underline-offset-4">
                  View bag
                </Link>
              </p>
            )}
            {rec.kit && (
              <p className="mt-6 text-body text-white/80">
                Prefer a set? The{" "}
                <Link href={`/products/${rec.kit.slug}`} className="text-white underline underline-offset-4">
                  {rec.kit.name}
                </Link>{" "}
                covers similar ground.
              </p>
            )}
            <div className="mt-8 flex gap-8 text-body">
              <button type="button" onClick={onBack} className="underline underline-offset-4">
                Change answers
              </button>
              <button type="button" onClick={onRestart} className="underline underline-offset-4">
                Start over
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function RoutineColumn({ title, steps }: { title: string; steps: RoutineStep[] }) {
  return (
    <section aria-label={title}>
      <h3 className="text-lead font-medium">{title}</h3>
      <ol className="mt-5 space-y-6">
        {steps.map((s, i) => (
          <li key={`${s.step}-${i}`}>
            <p className="text-body font-medium">{s.step}</p>
            {s.product ? (
              <Link href={`/products/${s.product.slug}`} className="group mt-2 flex items-center gap-4">
                <SpecimenThumb specimen={s.product} className="size-16 shrink-0" sizes="64px" />
                <span className="min-w-0">
                  <span className="block text-body group-hover:underline group-hover:underline-offset-4">{s.product.name}</span>
                  <span className="block text-small text-muted">
                    {formatMoney(s.product.price)}
                    {s.product.size ? `, ${s.product.size}` : ""}
                  </span>
                </span>
              </Link>
            ) : (
              <p className="mt-1 text-body text-muted">{s.generic}</p>
            )}
            {s.note && <p className="mt-2 text-body">{s.note}</p>}
          </li>
        ))}
      </ol>
    </section>
  );
}
