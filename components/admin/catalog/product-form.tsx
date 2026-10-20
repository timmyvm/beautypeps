"use client";

import { Minus, Plus } from "lucide-react";
import { startTransition, useActionState, useState, useTransition } from "react";
import { Panel } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { adjustStockAction, saveProductAction } from "@/lib/actions/admin/products";
import { CONCERNS, SKIN_TYPES } from "@/lib/constants";
import type { Product } from "@/lib/db/schema";
import { formatMoney, parseMoney } from "@/lib/format";
import { cn, slugify, type FormState } from "@/lib/utils";
import { GalleryField, ImageField } from "./image-field";
import { MarkdownEditor } from "./markdown-editor";
import { CheckboxGroup, CountedField, RepeatableRows, SaveBar, Toggle } from "./form-bits";

type Option = { id: string; name: string };
type PeptideOption = { slug: string; name: string; inciName: string };

const centsToInput = (c: number | null | undefined) => (c === null || c === undefined ? "" : (c / 100).toFixed(2));

export function ProductForm({
  product,
  categories,
  peptides,
}: {
  product: Product | null;
  categories: Option[];
  peptides: PeptideOption[];
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(saveProductAction, {});
  const e = state.errors ?? {};

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!product);
  const [price, setPrice] = useState(centsToInput(product?.price));
  const [seoTitle, setSeoTitle] = useState(product?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(product?.seoDescription ?? "");
  const [shortDescription, setShortDescription] = useState(product?.shortDescription ?? "");

  const priceCents = parseMoney(price);
  const previewTitle = seoTitle || (name ? `${name} · Beauty Peps` : "Product title · Beauty Peps");
  const previewDescription = seoDescription || shortDescription || "Short description shows here when no SEO description is set.";

  return (
    <form
      noValidate
      onSubmit={(ev) => {
        ev.preventDefault();
        const fd = new FormData(ev.currentTarget);
        startTransition(() => formAction(fd));
      }}
    >
      <input type="hidden" name="id" value={product?.id ?? ""} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* ---------------- Main column ---------------- */}
        <div className="space-y-6">
          <Panel title="Basics">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Product name" htmlFor="name" error={e.name} className="sm:col-span-2">
                <Input
                  id="name"
                  name="name"
                  value={name}
                  onChange={(ev) => {
                    setName(ev.target.value);
                    if (!slugTouched) setSlug(slugify(ev.target.value));
                  }}
                  aria-invalid={!!e.name}
                  required
                />
              </Field>
              <Field label="URL slug" htmlFor="slug" error={e.slug} hint={`/products/${slug || "…"}`}>
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
              <Field label="SKU" htmlFor="sku" error={e.sku}>
                <Input id="sku" name="sku" defaultValue={product?.sku ?? ""} aria-invalid={!!e.sku} className="uppercase" />
              </Field>
              <Field label="Subtitle" htmlFor="subtitle" error={e.subtitle} className="sm:col-span-2" hint="One line under the name, e.g. “1% Copper Tripeptide-1 Serum”.">
                <Input id="subtitle" name="subtitle" defaultValue={product?.subtitle ?? ""} />
              </Field>
              <div className="sm:col-span-2">
                <CountedField
                  name="shortDescription"
                  label="Short description"
                  defaultValue={product?.shortDescription}
                  max={300}
                  multiline
                  error={e.shortDescription}
                  hint="Shown on product cards and near the price."
                  onValueChange={setShortDescription}
                />
              </div>
              <Field label="Size" htmlFor="size" error={e.size} hint="e.g. 30 mL, 1 g">
                <Input id="size" name="size" defaultValue={product?.size ?? ""} />
              </Field>
            </div>
          </Panel>

          <Panel title="Media">
            <div className="space-y-6">
              <ImageField name="image" folder="products" label="Main image" defaultValue={product?.image} error={e.image} hint="4:5 portrait works best." />
              <GalleryField name="gallery" folder="products" defaultValue={product?.gallery ?? []} error={e.gallery} />
            </div>
          </Panel>

          <Panel title="Content">
            <div className="space-y-6">
              <MarkdownEditor name="description" label="Description" defaultValue={product?.description} error={e.description} rows={12} />
              <MarkdownEditor
                name="howToUse"
                label="How to use"
                defaultValue={product?.howToUse}
                error={e.howToUse}
                rows={6}
              />
              <Field label="Full ingredients (INCI)" htmlFor="ingredients" error={e.ingredients}>
                <Textarea id="ingredients" name="ingredients" defaultValue={product?.ingredients ?? ""} rows={4} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Texture" htmlFor="texture" error={e.texture}>
                  <Input id="texture" name="texture" defaultValue={product?.texture ?? ""} placeholder="Lightweight serum" />
                </Field>
                <Field label="pH range" htmlFor="phRange" error={e.phRange}>
                  <Input id="phRange" name="phRange" defaultValue={product?.phRange ?? ""} placeholder="5.5–6.5" />
                </Field>
                <Field label="Routine step" htmlFor="routineStep" error={e.routineStep}>
                  <Input id="routineStep" name="routineStep" defaultValue={product?.routineStep ?? ""} placeholder="AM / PM" />
                </Field>
              </div>
            </div>
          </Panel>

          <Panel title="Key actives">
            <RepeatableRows
              name="keyActives"
              label="Actives and their concentration"
              addLabel="Add active"
              defaultValue={product?.keyActives ?? []}
              error={e.keyActives}
              columnsClass="sm:grid-cols-[1.4fr_0.8fr_1.6fr]"
              fields={[
                { key: "name", label: "Name", placeholder: "Copper Tripeptide-1" },
                { key: "amount", label: "Amount", placeholder: "1%" },
                { key: "note", label: "Note (optional)", placeholder: "Signals collagen remodelling" },
              ]}
            />
          </Panel>

          <Panel title="FAQs">
            <RepeatableRows
              name="faqs"
              label="Questions shown on the product page"
              addLabel="Add question"
              defaultValue={product?.faqs ?? []}
              error={e.faqs}
              columnsClass="grid-cols-1"
              fields={[
                { key: "q", label: "Question", placeholder: "Can I use this with retinol?" },
                { key: "a", label: "Answer", multiline: true },
              ]}
            />
          </Panel>

          <Panel title="Search engine listing">
            <div className="space-y-4">
              <div className="rounded-xl border border-stone/70 bg-white/60 p-4">
                <p className="truncate text-xs text-sage">beautypeps.com.au › products › {slug || "…"}</p>
                <p className="mt-1 truncate text-[17px] text-[#1a0dab]">{previewTitle}</p>
                <p className="mt-1 line-clamp-2 text-[13px] text-cocoa">{previewDescription}</p>
              </div>
              <CountedField name="seoTitle" label="SEO title" defaultValue={seoTitle} max={70} error={e.seoTitle} onValueChange={setSeoTitle} hint="Leave blank to use the product name." />
              <CountedField
                name="seoDescription"
                label="SEO description"
                defaultValue={seoDescription}
                max={170}
                multiline
                error={e.seoDescription}
                onValueChange={setSeoDescription}
                hint="Leave blank to use the short description."
              />
            </div>
          </Panel>
        </div>

        {/* ---------------- Side column ---------------- */}
        <div className="space-y-6">
          <Panel title="Status & visibility">
            <div className="space-y-4">
              <Field label="Status" htmlFor="status" error={e.status}>
                <Select id="status" name="status" defaultValue={product?.status ?? "draft"}>
                  <option value="active">Active — visible in store</option>
                  <option value="draft">Draft — hidden</option>
                  <option value="archived">Archived — hidden</option>
                </Select>
              </Field>
              <Field label="Category" htmlFor="categoryId" error={e.categoryId}>
                <Select id="categoryId" name="categoryId" defaultValue={product?.categoryId ?? ""}>
                  <option value="">No category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Toggle name="featured" label="Featured" description="Show in bestsellers on the home page." defaultChecked={product?.featured} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Badge" htmlFor="badge" error={e.badge}>
                  <Input id="badge" name="badge" defaultValue={product?.badge ?? ""} placeholder="Bestseller" />
                </Field>
                <Field label="Sort order" htmlFor="sortOrder" error={e.sortOrder}>
                  <Input id="sortOrder" name="sortOrder" type="number" defaultValue={product?.sortOrder ?? 0} />
                </Field>
              </div>
            </div>
          </Panel>

          <Panel title="Pricing">
            <div className="space-y-4">
              <Field label="Price (AUD, incl. GST)" htmlFor="price" error={e.price}>
                <MoneyInput id="price" name="price" value={price} onChange={setPrice} invalid={!!e.price} />
              </Field>
              <Field label="Compare-at price" htmlFor="compareAtPrice" error={e.compareAtPrice} hint="Optional — shows the price struck through.">
                <MoneyInput id="compareAtPrice" name="compareAtPrice" defaultValue={centsToInput(product?.compareAtPrice)} invalid={!!e.compareAtPrice} />
              </Field>
              {!Number.isNaN(priceCents) && priceCents > 0 && (
                <p className="rounded-lg bg-ivory px-3 py-2 text-xs text-cocoa">
                  Includes {formatMoney(Math.round(priceCents / 11))} GST · ex-GST {formatMoney(priceCents - Math.round(priceCents / 11))}
                </p>
              )}
            </div>
          </Panel>

          <Panel title="Inventory">
            <div className="space-y-4">
              {product ? (
                <StockAdjuster productId={product.id} initialStock={product.stock} threshold={product.lowStockThreshold} />
              ) : (
                <Field label="Stock on hand" htmlFor="stock" error={e.stock}>
                  <Input id="stock" name="stock" type="number" min={0} defaultValue={0} />
                </Field>
              )}
              <Field label="Low-stock alert at" htmlFor="lowStockThreshold" error={e.lowStockThreshold} hint="Flags the product on the dashboard.">
                <Input id="lowStockThreshold" name="lowStockThreshold" type="number" min={0} defaultValue={product?.lowStockThreshold ?? 10} />
              </Field>
            </div>
          </Panel>

          <Panel title="Peptides in this formula">
            {peptides.length === 0 ? (
              <p className="text-sm text-taupe">Add peptides in the Peptide library first.</p>
            ) : (
              <CheckboxGroup
                name="peptideSlugs"
                defaultValue={product?.peptideSlugs ?? []}
                options={peptides.map((p) => ({ value: p.slug, label: p.name, description: p.inciName }))}
                error={e.peptideSlugs}
              />
            )}
          </Panel>

          <Panel title="Concerns">
            <CheckboxGroup
              name="concerns"
              defaultValue={product?.concerns ?? []}
              options={CONCERNS.map((c) => ({ value: c.slug, label: c.label }))}
              error={e.concerns}
            />
          </Panel>

          <Panel title="Skin types">
            <CheckboxGroup
              name="skinTypes"
              defaultValue={product?.skinTypes ?? []}
              options={SKIN_TYPES.map((s) => ({ value: s, label: s }))}
              error={e.skinTypes}
            />
          </Panel>
        </div>
      </div>

      <SaveBar state={state} pending={pending} label={product ? "Save product" : "Create product"} />
    </form>
  );
}

function MoneyInput({
  id,
  name,
  value,
  defaultValue,
  onChange,
  invalid,
}: {
  id: string;
  name: string;
  value?: string;
  defaultValue?: string;
  onChange?: (v: string) => void;
  invalid?: boolean;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-sm text-taupe">$</span>
      <Input
        id={id}
        name={name}
        inputMode="decimal"
        value={value}
        defaultValue={value === undefined ? defaultValue : undefined}
        onChange={onChange ? (ev) => onChange(ev.target.value) : undefined}
        placeholder="0.00"
        className="pl-8"
        aria-invalid={invalid}
      />
    </div>
  );
}

/** Lives inside the product form but never posts with it — it saves immediately. */
function StockAdjuster({ productId, initialStock, threshold }: { productId: string; initialStock: number; threshold: number }) {
  const [stock, setStock] = useState(initialStock);
  const [setTo, setSetTo] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startStock] = useTransition();

  function run(mode: "delta" | "set", value: number) {
    startStock(async () => {
      const res = await adjustStockAction(productId, mode, value);
      if (res.ok && res.stock !== undefined) {
        setStock(res.stock);
        setSetTo("");
      }
      setMessage({ ok: res.ok, text: res.message });
    });
  }

  const tone = stock <= 0 ? "text-danger" : stock <= threshold ? "text-copper-dark" : "text-espresso";

  return (
    <div>
      <p className="text-xs font-medium tracking-wide text-cocoa">Stock on hand</p>
      <div className="mt-1 flex items-center gap-3">
        <span className={cn("font-display text-4xl tabular-nums", tone)}>{stock}</span>
        <span className="text-xs text-taupe">{stock <= 0 ? "Sold out" : stock <= threshold ? "Low stock" : "In stock"}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" variant="outline" disabled={pending || stock <= 0} onClick={() => run("delta", -1)} aria-label="Decrease stock by 1">
          <Minus className="size-3.5" /> 1
        </Button>
        <Button size="sm" variant="outline" disabled={pending} onClick={() => run("delta", 1)} aria-label="Increase stock by 1">
          <Plus className="size-3.5" /> 1
        </Button>
        <Button size="sm" variant="outline" disabled={pending} onClick={() => run("delta", 10)} aria-label="Increase stock by 10">
          <Plus className="size-3.5" /> 10
        </Button>
      </div>
      <div className="mt-3 flex gap-2">
        <Input
          type="number"
          min={0}
          value={setTo}
          onChange={(ev) => setSetTo(ev.target.value)}
          onKeyDown={(ev) => {
            if (ev.key === "Enter") {
              ev.preventDefault();
              if (setTo !== "") run("set", Number(setTo));
            }
          }}
          placeholder="Set exact count"
          aria-label="Set exact stock count"
          className="h-9"
        />
        <Button size="sm" variant="outline" disabled={pending || setTo === ""} onClick={() => run("set", Number(setTo))}>
          Set
        </Button>
      </div>
      {message && <p className={cn("mt-2 text-xs", message.ok ? "text-sage" : "text-danger")}>{message.text}</p>}
      <p className="mt-2 text-[11px] text-taupe">Stock changes save instantly.</p>
    </div>
  );
}
