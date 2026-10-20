"use client";

import { startTransition, useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, Input, Textarea } from "@/components/ui/form";
import { saveCategoryAction } from "@/lib/actions/admin/categories";
import type { Category } from "@/lib/db/schema";
import { slugify, type FormState } from "@/lib/utils";
import { ImageField } from "./image-field";

export function CategoryForm({ category }: { category: Category | null }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(saveCategoryAction, {});
  const e = state.errors ?? {};
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!category);

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={(ev) => {
        ev.preventDefault();
        const fd = new FormData(ev.currentTarget);
        startTransition(() => formAction(fd));
      }}
    >
      <input type="hidden" name="id" value={category?.id ?? ""} />
      <FormMessage state={state} />
      <Field label="Name" htmlFor="cat-name" error={e.name}>
        <Input
          id="cat-name"
          name="name"
          value={name}
          onChange={(ev) => {
            setName(ev.target.value);
            if (!slugTouched) setSlug(slugify(ev.target.value));
          }}
          aria-invalid={!!e.name}
        />
      </Field>
      <Field label="Slug" htmlFor="cat-slug" error={e.slug} hint={`/shop?category=${slug || "…"}`}>
        <Input
          id="cat-slug"
          name="slug"
          value={slug}
          onChange={(ev) => {
            setSlugTouched(true);
            setSlug(ev.target.value.toLowerCase());
          }}
          aria-invalid={!!e.slug}
        />
      </Field>
      <Field label="Tagline" htmlFor="cat-tagline" error={e.tagline}>
        <Input id="cat-tagline" name="tagline" defaultValue={category?.tagline ?? ""} placeholder="Concentrated peptide serums" />
      </Field>
      <Field label="Description" htmlFor="cat-description" error={e.description}>
        <Textarea id="cat-description" name="description" defaultValue={category?.description ?? ""} rows={4} />
      </Field>
      <ImageField name="image" folder="categories" label="Banner image" defaultValue={category?.image} error={e.image} aspect="aspect-[3/2]" />
      <Field label="Sort order" htmlFor="cat-sort" error={e.sortOrder} hint="Lower numbers appear first.">
        <Input id="cat-sort" name="sortOrder" type="number" defaultValue={category?.sortOrder ?? 0} className="max-w-32" />
      </Field>
      <Button type="submit" disabled={pending} aria-busy={pending}>
        {pending ? "Saving…" : category ? "Save category" : "Create category"}
      </Button>
    </form>
  );
}
