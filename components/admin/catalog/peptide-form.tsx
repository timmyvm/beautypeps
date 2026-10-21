"use client";

import { startTransition, useActionState, useState } from "react";
import { Panel } from "@/components/admin/ui";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { savePeptideAction } from "@/lib/actions/admin/peptides";
import { CONCERNS, PEPTIDE_CLASSES } from "@/lib/constants";
import type { Peptide } from "@/lib/db/schema";
import { cn, slugify, type FormState } from "@/lib/utils";
import { EVIDENCE_LEVELS } from "./evidence";
import { CheckboxGroup, CountedField, RepeatableRows, SaveBar, Toggle } from "./form-bits";
import { MarkdownEditor } from "./markdown-editor";


export function PeptideForm({ peptide }: { peptide: Peptide | null }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(savePeptideAction, {});
  const e = state.errors ?? {};
  const [name, setName] = useState(peptide?.name ?? "");
  const [slug, setSlug] = useState(peptide?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!peptide);
  const [level, setLevel] = useState(peptide?.evidenceLevel ?? 3);

  return (
    <form
      noValidate
      onSubmit={(ev) => {
        ev.preventDefault();
        const fd = new FormData(ev.currentTarget);
        startTransition(() => formAction(fd));
      }}
    >
      <input type="hidden" name="id" value={peptide?.id ?? ""} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Panel title="Identity">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Common name" htmlFor="name" error={e.name} hint="e.g. GHK-Cu, Argireline">
                <Input
                  id="name"
                  name="name"
                  value={name}
                  onChange={(ev) => {
                    setName(ev.target.value);
                    if (!slugTouched) setSlug(slugify(ev.target.value));
                  }}
                  aria-invalid={!!e.name}
                />
              </Field>
              <Field label="URL slug" htmlFor="slug" error={e.slug} hint={`/peptides/${slug || "…"}`}>
                <Input
                  id="slug"
                  name="slug"
                  value={slug}
                  onChange={(ev) => {
                    setSlugTouched(true);
                    setSlug(ev.target.value.toLowerCase());
                  }}
                  aria-invalid={!!e.slug}
                />
              </Field>
              <Field label="INCI name" htmlFor="inciName" error={e.inciName} className="sm:col-span-2">
                <Input id="inciName" name="inciName" defaultValue={peptide?.inciName ?? ""} placeholder="Copper Tripeptide-1" aria-invalid={!!e.inciName} />
              </Field>
              <Field label="Also known as" htmlFor="aliases" error={e.aliases} hint="One per line — trade names, older INCI names.">
                <Textarea id="aliases" name="aliases" defaultValue={(peptide?.aliases ?? []).join("\n")} rows={3} className="min-h-20" />
              </Field>
              <Field label="Amino-acid sequence" htmlFor="sequence" error={e.sequence} hint="e.g. Gly-His-Lys (copper complex)">
                <Textarea id="sequence" name="sequence" defaultValue={peptide?.sequence ?? ""} rows={3} className="min-h-20 font-mono text-[13px]" />
              </Field>
              <Field label="Molecular weight" htmlFor="molecularWeight" error={e.molecularWeight}>
                <Input id="molecularWeight" name="molecularWeight" defaultValue={peptide?.molecularWeight ?? ""} placeholder="≈ 404 Da" />
              </Field>
              <Field label="Discovered / developed" htmlFor="discovered" error={e.discovered}>
                <Input id="discovered" name="discovered" defaultValue={peptide?.discovered ?? ""} placeholder="1973, Loren Pickart" />
              </Field>
            </div>
          </Panel>

          <Panel title="Overview">
            <div className="space-y-4">
              <CountedField name="summary" label="Summary" defaultValue={peptide?.summary} max={600} multiline error={e.summary} hint="Shown on library cards and at the top of the monograph." />
              <Field label="Key benefits" htmlFor="benefits" error={e.benefits} hint="One per line.">
                <Textarea id="benefits" name="benefits" defaultValue={(peptide?.benefits ?? []).join("\n")} rows={5} />
              </Field>
            </div>
          </Panel>

          <Panel title="Monograph">
            <div className="space-y-6">
              <MarkdownEditor name="mechanism" label="How it works (mechanism)" defaultValue={peptide?.mechanism} error={e.mechanism} rows={10} />
              <MarkdownEditor name="evidence" label="What the evidence says" defaultValue={peptide?.evidence} error={e.evidence} rows={10} />
              <MarkdownEditor name="usage" label="How to use it" defaultValue={peptide?.usage} error={e.usage} rows={8} />
            </div>
          </Panel>

          <Panel title="Studies & references">
            <RepeatableRows
              name="studies"
              label="Cited research"
              addLabel="Add study"
              defaultValue={peptide?.studies ?? []}
              error={e.studies}
              columnsClass="sm:grid-cols-[2fr_1.3fr_0.6fr]"
              hint="Only cite studies you can verify. Links should be full https:// URLs (PubMed, DOI…)."
              fields={[
                { key: "title", label: "Title", placeholder: "Regenerative and protective actions of the GHK-Cu peptide…" },
                { key: "source", label: "Source", placeholder: "Int J Mol Sci" },
                { key: "year", label: "Year", placeholder: "2018" },
                { key: "url", label: "Link", placeholder: "https://pubmed.ncbi.nlm.nih.gov/…", className: "sm:col-span-3" },
              ]}
            />
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Publishing">
            <div className="space-y-4">
              <Toggle name="published" label="Published" description="Visible in the public Peptide Library." defaultChecked={peptide ? peptide.published : true} />
              <Field label="Sort order" htmlFor="sortOrder" error={e.sortOrder}>
                <Input id="sortOrder" name="sortOrder" type="number" defaultValue={peptide?.sortOrder ?? 0} className="max-w-32" />
              </Field>
            </div>
          </Panel>

          <Panel title="Classification">
            <div className="space-y-5">
              <Field label="Peptide class" htmlFor="peptideClass" error={e.peptideClass}>
                <Select id="peptideClass" name="peptideClass" defaultValue={peptide?.peptideClass ?? ""} aria-invalid={!!e.peptideClass}>
                  <option value="" disabled>
                    Choose…
                  </option>
                  {Object.entries(PEPTIDE_CLASSES).map(([value, c]) => (
                    <option key={value} value={value}>
                      {c.label}
                    </option>
                  ))}
                </Select>
              </Field>

              <fieldset>
                <legend className="mb-2 text-[13px] font-medium text-muted">Evidence level</legend>
                <div className="space-y-1.5">
                  {Object.entries(EVIDENCE_LEVELS).map(([value, l]) => {
                    const n = Number(value);
                    return (
                      <label
                        key={value}
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2 transition-colors",
                          level === n ? "border-copper bg-copper-light/30" : "border-stone/70 hover:border-taupe",
                        )}
                      >
                        <input
                          type="radio"
                          name="evidenceLevel"
                          value={value}
                          checked={level === n}
                          onChange={() => setLevel(n)}
                          className="mt-1 accent-copper"
                        />
                        <span>
                          <span className="block text-sm font-medium text-espresso">
                            {n} · {l.label}
                          </span>
                          <span className="block text-[13px] text-muted">{l.description}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
                {e.evidenceLevel && <p className="mt-1.5 text-[13px] text-danger">{e.evidenceLevel}</p>}
              </fieldset>
            </div>
          </Panel>

          <Panel title="Formulation">
            <div className="space-y-4">
              <Field label="Typical concentration" htmlFor="typicalConcentration" error={e.typicalConcentration}>
                <Input id="typicalConcentration" name="typicalConcentration" defaultValue={peptide?.typicalConcentration ?? ""} placeholder="0.1–2%" />
              </Field>
              <Field label="pH range" htmlFor="phRange" error={e.phRange}>
                <Input id="phRange" name="phRange" defaultValue={peptide?.phRange ?? ""} placeholder="5.0–7.0" />
              </Field>
              <Field label="Pairs well with" htmlFor="pairsWith" error={e.pairsWith} hint="One per line.">
                <Textarea id="pairsWith" name="pairsWith" defaultValue={(peptide?.pairsWith ?? []).join("\n")} rows={4} className="min-h-24" />
              </Field>
              <Field label="Avoid combining with" htmlFor="avoidWith" error={e.avoidWith} hint="One per line.">
                <Textarea id="avoidWith" name="avoidWith" defaultValue={(peptide?.avoidWith ?? []).join("\n")} rows={3} className="min-h-20" />
              </Field>
            </div>
          </Panel>

          <Panel title="Concerns it targets">
            <CheckboxGroup
              name="concerns"
              defaultValue={peptide?.concerns ?? []}
              options={CONCERNS.map((c) => ({ value: c.slug, label: c.label }))}
              error={e.concerns}
            />
          </Panel>
        </div>
      </div>

      <SaveBar state={state} pending={pending} label={peptide ? "Save peptide" : "Create peptide"} />
    </form>
  );
}
