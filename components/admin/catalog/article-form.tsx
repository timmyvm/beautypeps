"use client";

import { startTransition, useActionState, useState } from "react";
import { Panel } from "@/components/admin/ui";
import { Field, Input, Select } from "@/components/ui/form";
import { saveArticleAction } from "@/lib/actions/admin/articles";
import { ARTICLE_CATEGORIES } from "@/lib/constants";
import type { Article } from "@/lib/db/schema";
import { slugify, type FormState } from "@/lib/utils";
import { CountedField, SaveBar, Toggle } from "./form-bits";
import { ImageField } from "./image-field";
import { countWords, MarkdownEditor } from "./markdown-editor";

/** Date → value for <input type="datetime-local"> in the browser's local time. */
function toLocalInput(d: Date | null | undefined) {
  if (!d) return "";
  const date = new Date(d);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function ArticleForm({ article }: { article: Article | null }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(saveArticleAction, {});
  const e = state.errors ?? {};
  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!article);
  const [words, setWords] = useState(countWords(article?.body ?? ""));
  const [readMinutes, setReadMinutes] = useState(String(article?.readMinutes ?? 1));
  const [readTouched, setReadTouched] = useState(!!article);
  const [published, setPublished] = useState(article?.published ?? false);
  const [publishedAt, setPublishedAt] = useState(toLocalInput(article?.publishedAt));

  return (
    <form
      noValidate
      onSubmit={(ev) => {
        ev.preventDefault();
        const fd = new FormData(ev.currentTarget);
        startTransition(() => formAction(fd));
      }}
    >
      <input type="hidden" name="id" value={article?.id ?? ""} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Panel title="Article">
            <div className="space-y-4">
              <Field label="Title" htmlFor="title" error={e.title}>
                <Input
                  id="title"
                  name="title"
                  value={title}
                  onChange={(ev) => {
                    setTitle(ev.target.value);
                    if (!slugTouched) setSlug(slugify(ev.target.value));
                  }}
                  aria-invalid={!!e.title}
                  className="h-12 font-display text-lg"
                />
              </Field>
              <Field label="URL slug" htmlFor="slug" error={e.slug} hint={`/learn/${slug || "…"}`}>
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
              <CountedField name="excerpt" label="Excerpt" defaultValue={article?.excerpt} max={320} multiline error={e.excerpt} hint="Shown on journal cards and under the title." />
            </div>
          </Panel>

          <Panel title="Body">
            <MarkdownEditor
              name="body"
              label="Content"
              defaultValue={article?.body}
              error={e.body}
              rows={24}
              showWordCount
              hint="Use ## for section headings — they build the article's table of contents."
              onValueChange={(v) => {
                const w = countWords(v);
                setWords(w);
                if (!readTouched) setReadMinutes(String(Math.max(1, Math.round(w / 220))));
              }}
            />
          </Panel>

          <Panel title="Search engine listing">
            <CountedField
              name="seoDescription"
              label="SEO description"
              defaultValue={article?.seoDescription}
              max={170}
              multiline
              error={e.seoDescription}
              hint="Leave blank to use the excerpt."
            />
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Publishing">
            <div className="space-y-4">
              <Toggle
                name="published"
                label="Published"
                description="Visible in the Journal."
                checked={published}
                onChange={(v) => {
                  setPublished(v);
                  if (v && !publishedAt) setPublishedAt(toLocalInput(new Date()));
                }}
              />
              <Field label="Publish date" htmlFor="publishedAt" error={e.publishedAt} hint={published ? "Set when it first went live." : "Filled automatically when you publish."}>
                <Input id="publishedAt" name="publishedAt" type="datetime-local" value={publishedAt} onChange={(ev) => setPublishedAt(ev.target.value)} />
              </Field>
              <Toggle name="featured" label="Featured" description="Pin to the top of the Journal." defaultChecked={article?.featured} />
            </div>
          </Panel>

          <Panel title="Details">
            <div className="space-y-4">
              <Field label="Category" htmlFor="category" error={e.category}>
                <Select id="category" name="category" defaultValue={article?.category ?? "Guides"}>
                  {ARTICLE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Author" htmlFor="author" error={e.author}>
                <Input id="author" name="author" defaultValue={article?.author ?? "Beauty Peps Lab"} />
              </Field>
              <Field label="Read time (minutes)" htmlFor="readMinutes" error={e.readMinutes} hint={`${words} words · ~${Math.max(1, Math.round(words / 220))} min at 220 wpm`}>
                <Input
                  id="readMinutes"
                  name="readMinutes"
                  type="number"
                  min={1}
                  value={readMinutes}
                  onChange={(ev) => {
                    setReadTouched(true);
                    setReadMinutes(ev.target.value);
                  }}
                  className="max-w-32"
                />
              </Field>
            </div>
          </Panel>

          <Panel title="Cover image">
            <ImageField name="coverImage" folder="articles" label="Cover" defaultValue={article?.coverImage} error={e.coverImage} aspect="aspect-[3/2]" hint="3:2 landscape works best." />
          </Panel>
        </div>
      </div>

      <SaveBar state={state} pending={pending} label={article ? "Save article" : "Create article"} />
    </form>
  );
}
