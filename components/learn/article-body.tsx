import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn, slugify } from "@/lib/utils";

/*
 * Markdown renderer for long-form articles. An article is read as chapters: the text before the first
 * "## " heading is its standfirst, and every "## " heading opens a section with a stable id, so the
 * contents can link to it and the page can set each one as its own row.
 */

export type TocItem = { id: string; title: string };
export type ArticleSection = TocItem & { heading: string; body: string };

function stripInlineMarkdown(s: string) {
  return s
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`~]/g, "")
    .trim();
}

/** The article's plain text, for checking that a pull-out really is a line from it. */
export function plainText(markdown: string) {
  return stripInlineMarkdown(markdown)
    .replace(/^[>#|\-\d.\s]+/gm, " ")
    .replace(/\|/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function splitSections(markdown: string): { intro: string; sections: ArticleSection[] } {
  const sections: ArticleSection[] = [];
  const intro: string[] = [];
  let current: { heading: string; lines: string[] } | null = null;
  const close = () => {
    if (!current) return;
    const title = stripInlineMarkdown(current.heading);
    sections.push({ id: slugify(title), title, heading: current.heading, body: current.lines.join("\n").trim() });
  };
  let inFence = false;
  for (const line of markdown.split("\n")) {
    if (line.trim().startsWith("```")) inFence = !inFence;
    const m = inFence ? null : /^##\s+(.+?)\s*#*\s*$/.exec(line);
    if (m) {
      close();
      current = { heading: m[1], lines: [] };
    } else if (current) {
      current.lines.push(line);
    } else {
      intro.push(line);
    }
  }
  close();
  return { intro: intro.join("\n").trim(), sections };
}

export function extractToc(markdown: string): TocItem[] {
  return splitSections(markdown).sections.map(({ id, title }) => ({ id, title }));
}

function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (node && typeof node === "object" && "props" in node) {
    return textOf((node as { props: { children?: ReactNode } }).props.children);
  }
  return "";
}

export function ArticleBody({ children, className }: { children: string; className?: string }) {
  return (
    <div className={cn("prose-bp", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children: c }) => (
            <h2 id={slugify(textOf(c))} className="scroll-mt-8" data-reveal="">
              {c}
            </h2>
          ),
          a: ({ href, children: c }) => {
            const external = href?.startsWith("http");
            return (
              <a href={href} {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}>
                {c}
              </a>
            );
          },
          // The writer's own asides are set as a pull-out on a field of colour, not a ruled quote.
          blockquote: ({ children: c }) => (
            <aside className="not-prose my-10 bg-field-frost px-6 py-7 text-lead text-ink sm:px-8 [&_p+p]:mt-3 [&_strong]:font-medium">
              {c}
            </aside>
          ),
          table: ({ children: c }) => <ResponsiveTable>{c}</ResponsiveTable>,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

type El = ReactElement<{ children?: ReactNode }>;
const elements = (node: ReactNode) => Children.toArray(node).filter(isValidElement) as El[];

/**
 * A table that reads on a phone: below 640px each row becomes a block of its own, and every cell is
 * introduced by its column's heading, so nothing has to scroll sideways.
 */
function ResponsiveTable({ children }: { children: ReactNode }) {
  const parts = elements(children);
  const head = parts.find((p) => p.type === "thead");
  const labels = head ? elements(elements(head.props.children)[0]?.props.children).map((th) => textOf(th.props.children)) : [];
  const rows = parts.map((part) =>
    part.type !== "tbody"
      ? part
      : cloneElement(
          part,
          undefined,
          elements(part.props.children).map((tr) =>
            cloneElement(
              tr,
              undefined,
              elements(tr.props.children).map((td, i) => cloneElement(td as ReactElement<Record<string, unknown>>, { "data-label": labels[i] ?? "" })),
            ),
          ),
        ),
  );
  return (
    <div className="sm:overflow-x-auto">
      <table
        className={cn(
          "max-sm:block max-sm:w-full max-sm:text-body",
          "max-sm:[&_thead]:hidden max-sm:[&_tbody]:grid max-sm:[&_tbody]:gap-2 max-sm:[&_tr]:block max-sm:[&_tr]:border-0 max-sm:[&_tr]:bg-surface max-sm:[&_tr]:p-5 max-sm:[&_td]:p-0",
          "max-sm:[&_td]:block max-sm:[&_td+td]:mt-3 max-sm:[&_td]:before:block max-sm:[&_td]:before:text-small max-sm:[&_td]:before:text-muted max-sm:[&_td]:before:content-[attr(data-label)]",
          "max-sm:[&_a]:underline max-sm:[&_a]:underline-offset-4 max-sm:[&_strong]:font-medium",
        )}
      >
        {rows}
      </table>
    </div>
  );
}

