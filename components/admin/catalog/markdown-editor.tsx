"use client";

import { useId, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Label } from "@/components/ui/form";
import { cn } from "@/lib/utils";

export function countWords(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

/** Markdown textarea with Write / Preview tabs. Posts its value under `name`. */
export function MarkdownEditor({
  name,
  label,
  defaultValue,
  error,
  hint,
  rows = 10,
  onValueChange,
  showWordCount,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  error?: string;
  hint?: string;
  rows?: number;
  onValueChange?: (value: string) => void;
  showWordCount?: boolean;
}) {
  const id = useId();
  const [value, setValue] = useState(defaultValue ?? "");
  const [tab, setTab] = useState<"write" | "preview">("write");

  return (
    <div>
      <div className="mb-1.5 flex items-end justify-between gap-3">
        <Label htmlFor={id} className="mb-0">
          {label}
        </Label>
        <div className="flex border border-surface-2 bg-white text-[13px] font-medium" role="tablist">
          {(["write", "preview"] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cn(
                "px-3 py-1 capitalize transition-colors",
                tab === t ? "bg-ink text-white" : "text-muted hover:text-ink",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Textarea stays mounted (hidden in preview) so its value is always submitted. */}
      <textarea
        id={id}
        name={name}
        rows={rows}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onValueChange?.(e.target.value);
        }}
        aria-invalid={!!error}
        className={cn(
          "w-full border border-stone bg-white px-4 py-3 font-mono text-[13px] leading-relaxed text-ink placeholder:text-muted focus:border-ink focus:ring-2 focus:ring-ink/10 focus:outline-none aria-[invalid=true]:border-danger",
          tab === "preview" && "hidden",
        )}
        placeholder="Write in Markdown — ## headings, **bold**, - lists, | tables |"
      />
      {tab === "preview" && (
        <div className="min-h-40 border border-stone bg-white px-5 py-4">
          {value.trim() ? (
            <div className="prose-bp prose-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm text-muted">Nothing to preview yet.</p>
          )}
        </div>
      )}
      <div className="mt-1.5 flex justify-between gap-3 text-[13px]">
        {error ? (
          <p className="text-danger" role="alert">
            {error}
          </p>
        ) : (
          <p className="text-muted">{hint ?? "Markdown supported."}</p>
        )}
        {showWordCount && <p className="shrink-0 text-muted">{countWords(value)} words</p>}
      </div>
    </div>
  );
}
