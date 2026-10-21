import Link from "next/link";
import { PEPTIDE_CLASSES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type PeptideTeaser = {
  slug: string;
  name: string;
  inciName: string;
  peptideClass: string;
  summary: string;
  evidenceLevel?: number;
};

/** Peptides as rows of the field guide: name and INCI on the left, class and grade on the right. */
export function PeptideRows({ peptides, className }: { peptides: PeptideTeaser[]; className?: string }) {
  return (
    <ul className={className}>
      {peptides.map((p, i) => {
        const cls = PEPTIDE_CLASSES[p.peptideClass]?.label ?? p.peptideClass;
        return (
          <li key={p.slug} data-reveal="row" style={{ ["--reveal-i" as string]: Math.min(i, 6) }}>
            <Link
              href={`/peptides/${p.slug}`}
              className={cn(
                "group grid gap-2 px-4 py-5 transition-colors sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-8 lg:px-6",
                i % 2 === 0 ? "bg-surface hover:bg-surface-2" : "bg-bg hover:bg-surface",
              )}
            >
              <span className="min-w-0">
                <span className="block text-lead font-medium group-hover:underline group-hover:underline-offset-4">
                  {p.name}
                </span>
                <span className="block text-small text-muted">{p.inciName}</span>
                <span className="mt-2 line-clamp-2 block max-w-[62ch] text-body">{p.summary}</span>
              </span>
              <span className="tabular text-body sm:text-right">
                {p.evidenceLevel ? `Evidence grade ${p.evidenceLevel} of 5` : null}
                <span className="block text-small text-muted">{cls}</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
