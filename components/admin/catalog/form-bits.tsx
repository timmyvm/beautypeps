"use client";

import { Loader2, Plus, Trash2 } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Label, Textarea } from "@/components/ui/form";
import type { FormState } from "@/lib/utils";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Sticky save bar for long forms                                      */
/* ------------------------------------------------------------------ */

export function SaveBar({
  state,
  pending,
  label = "Save changes",
  extra,
}: {
  state: FormState;
  pending: boolean;
  label?: string;
  extra?: ReactNode;
}) {
  const errorCount = state.errors ? Object.keys(state.errors).length : 0;
  return (
    <div className="sticky bottom-0 z-20 -mx-4 mt-6 border-t border-surface-2 bg-surface px-4 py-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-h-5 text-sm" role="status" aria-live="polite">
          {state.message && (
            <span className={state.ok ? "text-sage" : "text-danger"}>
              {state.message}
              {!state.ok && errorCount > 0 && ` (${errorCount} field${errorCount === 1 ? "" : "s"} need attention)`}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {extra}
          <Button type="submit" variant="dark" size="sm" disabled={pending} aria-busy={pending}>
            {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
            {pending ? "Saving…" : label}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Toggle (checkbox styled as a switch)                                */
/* ------------------------------------------------------------------ */

export function Toggle({
  name,
  label,
  description,
  defaultChecked,
  checked,
  onChange,
}: {
  name: string;
  label: string;
  description?: string;
  defaultChecked?: boolean;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start justify-between gap-4">
      <span>
        <span className="block text-sm font-medium text-ink">{label}</span>
        {description && <span className="mt-0.5 block text-[13px] text-muted">{description}</span>}
      </span>
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input
          id={id}
          type="checkbox"
          name={name}
          defaultChecked={checked === undefined ? defaultChecked : undefined}
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          className="peer sr-only"
        />
        <span className="h-6 w-11 bg-stone transition-colors peer-checked:bg-ink peer-focus-visible:ring-2 peer-focus-visible:ring-ink/30" />
        <span className="absolute top-0.5 left-0.5 size-5 bg-white transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* Checkbox group (multi-select posted as repeated values)             */
/* ------------------------------------------------------------------ */

export function CheckboxGroup({
  name,
  label,
  options,
  defaultValue = [],
  columns = 1,
  error,
}: {
  name: string;
  label?: string;
  options: { value: string; label: string; description?: string }[];
  defaultValue?: string[];
  columns?: 1 | 2;
  error?: string;
}) {
  return (
    <fieldset>
      {label && <legend className="mb-2 text-[13px] font-medium text-muted">{label}</legend>}
      <div className={cn("grid gap-2", columns === 2 && "sm:grid-cols-2")}>
        {options.map((o) => (
          <label key={o.value} className="flex cursor-pointer items-start gap-2.5 text-sm text-ink">
            <Checkbox name={name} value={o.value} defaultChecked={defaultValue.includes(o.value)} className="mt-0.5" />
            <span>
              {o.label}
              {o.description && <span className="block text-[13px] text-muted">{o.description}</span>}
            </span>
          </label>
        ))}
      </div>
      {error && <p className="mt-1.5 text-[13px] text-danger">{error}</p>}
    </fieldset>
  );
}

/* ------------------------------------------------------------------ */
/* Input / textarea with live character counter                        */
/* ------------------------------------------------------------------ */

export function CountedField({
  name,
  label,
  defaultValue,
  max,
  error,
  hint,
  multiline,
  onValueChange,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  max: number;
  error?: string;
  hint?: string;
  multiline?: boolean;
  onValueChange?: (v: string) => void;
}) {
  const id = useId();
  const [value, setValue] = useState(defaultValue ?? "");
  const over = value.length > max;
  const props = {
    id,
    name,
    value,
    "aria-invalid": !!error || over,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValue(e.target.value);
      onValueChange?.(e.target.value);
    },
  };
  return (
    <div>
      <div className="flex items-end justify-between">
        <Label htmlFor={id}>{label}</Label>
        <span className={cn("mb-1.5 text-[13px] tabular-nums", over ? "text-danger" : "text-muted")}>
          {value.length}/{max}
        </span>
      </div>
      {multiline ? <Textarea {...props} rows={3} className="min-h-20" /> : <Input {...props} />}
      {error ? (
        <p className="mt-1.5 text-[13px] text-danger">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-[13px] text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Repeatable rows (key actives, FAQs, studies) → hidden JSON input   */
/* ------------------------------------------------------------------ */

export type RowField = {
  key: string;
  label: string;
  placeholder?: string;
  multiline?: boolean;
  className?: string; // grid column sizing, e.g. "sm:col-span-2"
};

type Row = Record<string, string> & { _id: string };

let rowSeq = 0;
const newRowId = () => `row-${++rowSeq}`;

export function RepeatableRows({
  name,
  label,
  fields,
  defaultValue = [],
  addLabel = "Add row",
  columnsClass = "sm:grid-cols-3",
  error,
  hint,
}: {
  name: string;
  label: string;
  fields: RowField[];
  defaultValue?: Record<string, string | number | null | undefined>[];
  addLabel?: string;
  columnsClass?: string;
  error?: string;
  hint?: string;
}) {
  const blank = () => Object.fromEntries(fields.map((f) => [f.key, ""])) as Record<string, string>;
  const [rows, setRows] = useState<Row[]>(() =>
    defaultValue.map((r) => ({
      ...Object.fromEntries(fields.map((f) => [f.key, r[f.key] === null || r[f.key] === undefined ? "" : String(r[f.key])])),
      _id: newRowId(),
    })),
  );

  const serialised = rows
    .map((r) => Object.fromEntries(fields.map((f) => [f.key, r[f.key]?.trim() ?? ""])))
    .filter((r) => Object.values(r).some((v) => v !== ""));

  function update(id: string, key: string, value: string) {
    setRows((prev) => prev.map((r) => (r._id === id ? { ...r, [key]: value } : r)));
  }

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(serialised)} />
      <p className="mb-2 text-[13px] font-medium text-muted">{label}</p>
      {rows.length === 0 && <p className="mb-3 text-sm text-muted">None yet.</p>}
      <ul className="space-y-3">
        {rows.map((row, index) => (
          <li key={row._id} className="relative rounded-xl border border-surface-2 bg-surface/50 p-3 pr-12">
            <div className={cn("grid gap-3", columnsClass)}>
              {fields.map((f) => (
                <Field key={f.key} label={index === 0 || f.multiline ? f.label : undefined} className={f.className}>
                  {f.multiline ? (
                    <Textarea
                      value={row[f.key]}
                      onChange={(e) => update(row._id, f.key, e.target.value)}
                      placeholder={f.placeholder}
                      aria-label={f.label}
                      rows={2}
                      className="min-h-16"
                    />
                  ) : (
                    <Input
                      value={row[f.key]}
                      onChange={(e) => update(row._id, f.key, e.target.value)}
                      placeholder={f.placeholder}
                      aria-label={f.label}
                      className="h-10"
                    />
                  )}
                </Field>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setRows((prev) => prev.filter((r) => r._id !== row._id))}
              aria-label="Remove row"
              className="absolute top-3 right-3 grid size-8 place-items-center text-muted hover:bg-danger-light hover:text-danger"
            >
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => setRows((prev) => [...prev, { ...blank(), _id: newRowId() }])}
        className="mt-3 inline-flex items-center gap-1.5 bg-surface-2 px-4 py-2 text-[14px] font-medium text-ink hover:bg-stone"
      >
        <Plus className="size-3.5" /> {addLabel}
      </button>
      {error ? (
        <p className="mt-1.5 text-[13px] text-danger">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-[13px] text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
