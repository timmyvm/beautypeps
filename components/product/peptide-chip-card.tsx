import Link from "next/link";
import { SequenceStrand } from "@/components/peptides/sequence-strand";
import { PEPTIDE_CLASSES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type PeptideTeaser = {
  slug: string;
  name: string;
  inciName: string;
  peptideClass: string;
  summary: string;
  evidenceLevel?: number;
  /** Written sequence ("Gly-His-Lys : Cu²⁺"); when given, the row draws the peptide from it. */
  sequence?: string | null;
};

/**
 * Peptides as rows of the field guide: name and INCI on the left, the peptide drawn from its own sequence
 * in the middle (when known), class and grade on the right.
 */
export function PeptideRows({ peptides, className }: { peptides: PeptideTeaser[]; className?: string }) {
  const drawn = peptides.some((p) => p.sequence);
  return (
    <ul className={className}>
      {peptides.map((p, i) => {
        const cls = PEPTIDE_CLASSES[p.peptideClass]?.label ?? p.peptideClass;
        return (
          <li key={p.slug} data-reveal="row" style={{ ["--reveal-i" as string]: Math.min(i, 6) }}>
            <Link
              href={`/peptides/${p.slug}`}
              className={cn(
                "group grid items-center gap-x-8 gap-y-4 px-4 py-6 transition-colors lg:px-6",
                drawn ? "sm:grid-cols-[minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)_auto]" : "sm:grid-cols-[minmax(0,1fr)_auto]",
                i % 2 === 0 ? "bg-surface hover:bg-surface-2" : "bg-bg hover:bg-surface",
              )}
            >
              <span className="min-w-0">
                <span className="block text-lead font-medium group-hover:underline group-hover:underline-offset-4">{p.name}</span>
                <span className="block text-small text-muted">{p.inciName}</span>
                <span className="mt-2 line-clamp-2 block max-w-[62ch] text-body">{p.summary}</span>
              </span>
              {p.sequence ? (
                <div className="order-last min-w-0 sm:col-span-2 lg:order-none lg:col-span-1">
                  <SequenceStrand
                    sequence={p.sequence}
                    label={p.name}
                    className="[&_svg]:h-[clamp(4.5rem,7vw,6.5rem)] [&_svg]:w-auto [&_svg]:max-w-full"
                  />
                  <span className="mt-1 block text-small text-muted">{p.sequence}</span>
                </div>
              ) : null}
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
