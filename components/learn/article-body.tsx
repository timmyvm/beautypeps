import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn, slugify } from "@/lib/utils";

/*
 * Markdown renderer for long-form articles: gives every "## " heading a stable
 * id so the table of contents can link to it.
 */

export type TocItem = { id: string; title: string };

function stripInlineMarkdown(s: string) {
  return s
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`~]/g, "")
    .trim();
}

export function extractToc(markdown: string): TocItem[] {
  const items: TocItem[] = [];
  let inFence = false;
  for (const line of markdown.split("\n")) {
    if (line.trim().startsWith("```")) inFence = !inFence;
    if (inFence) continue;
    const m = /^##\s+(.+?)\s*#*\s*$/.exec(line);
    if (m) {
      const title = stripInlineMarkdown(m[1]);
      items.push({ id: slugify(title), title });
    }
  }
  return items;
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
            <h2 id={slugify(textOf(c))} className="scroll-mt-8">
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
          table: ({ children: c }) => (
            <div className="overflow-x-auto">
              <table>{c}</table>
            </div>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
