import { CheckCircle2 } from "lucide-react";

const NOTICES: Record<string, string> = {
  saved: "Saved.",
  created: "Created.",
  duplicated: "Duplicated — this copy is a draft. Review it, then set it to Active.",
  deleted: "Deleted.",
  archived: "Archived.",
};

/** Success banner driven by a `?saved=` / `?notice=` query param. */
export function Notice({ value }: { value?: string }) {
  if (!value) return null;
  const message = NOTICES[value] ?? (value === "1" ? NOTICES.saved : null);
  if (!message) return null;
  return (
    <div role="status" className="mb-6 flex items-center gap-2 rounded-xl bg-sage-light px-4 py-3 text-sm text-sage">
      <CheckCircle2 className="size-4 shrink-0" aria-hidden />
      {message}
    </div>
  );
}
