import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
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

export function EvidenceDots({ level, className }: { level: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)} aria-label={`Evidence level ${level} of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={cn("size-1.5 rounded-full", i <= level ? "bg-copper" : "bg-stone")} />
      ))}
    </span>
  );
}

/** Compact link card to a Peptide Library monograph. */
export function PeptideCard({
  peptide,
  tone = "light",
  className,
}: {
  peptide: PeptideTeaser;
  tone?: "light" | "dark";
  className?: string;
}) {
  const cls = PEPTIDE_CLASSES[peptide.peptideClass]?.label ?? peptide.peptideClass;
  return (
    <Link
      href={`/peptides/${peptide.slug}`}
      className={cn(
        "group flex h-full flex-col rounded-2xl border p-6 transition-colors",
        tone === "light"
          ? "border-stone/70 bg-cream hover:border-copper/50"
          : "border-cream/15 bg-cream/5 hover:border-copper-light/50",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className={cn("font-display text-2xl", tone === "light" ? "text-espresso" : "text-cream")}>
            {peptide.name}
          </h3>
          <p className={cn("mt-1 text-xs", tone === "light" ? "text-taupe" : "text-cream/50")}>{peptide.inciName}</p>
        </div>
        <ArrowUpRight
          className={cn(
            "size-5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
            tone === "light" ? "text-copper" : "text-copper-light",
          )}
          aria-hidden
        />
      </div>
      <p className={cn("mt-4 line-clamp-3 text-sm leading-relaxed", tone === "light" ? "text-cocoa" : "text-cream/70")}>
        {peptide.summary}
      </p>
      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
        <Badge tone={tone === "light" ? "copper" : "neutral"}>{cls}</Badge>
        {peptide.evidenceLevel ? <EvidenceDots level={peptide.evidenceLevel} /> : null}
      </div>
    </Link>
  );
}
