import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { concernLabel, PEPTIDE_CLASSES } from "@/lib/constants";
import type { Peptide } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import { EvidenceMeter } from "./evidence-meter";

export const CLASS_TONES: Record<string, "copper" | "sapphire" | "sage" | "amber"> = {
  signal: "copper",
  carrier: "sapphire",
  "neurotransmitter-inhibitor": "sage",
  "enzyme-inhibitor": "amber",
};

export function classLabel(peptideClass: string) {
  return PEPTIDE_CLASSES[peptideClass]?.label ?? peptideClass;
}

export function PeptideCard({
  peptide,
  className,
}: {
  peptide: Pick<Peptide, "slug" | "name" | "inciName" | "peptideClass" | "summary" | "evidenceLevel" | "concerns">;
  className?: string;
}) {
  return (
    <Link
      href={`/peptides/${peptide.slug}`}
      className={cn(
        "group flex h-full flex-col rounded-2xl border border-stone/70 bg-cream p-6 transition-all hover:-translate-y-0.5 hover:border-copper/40 hover:shadow-lg hover:shadow-espresso/5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <Badge tone={CLASS_TONES[peptide.peptideClass] ?? "neutral"}>{classLabel(peptide.peptideClass)}</Badge>
        <ArrowUpRight
          className="size-4 text-taupe transition-colors group-hover:text-copper-dark"
          aria-hidden
        />
      </div>
      <h3 className="mt-5 font-display text-2xl leading-tight text-espresso">{peptide.name}</h3>
      <p className="mt-1 text-xs tracking-wide text-taupe">INCI: {peptide.inciName}</p>
      <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-cocoa">{peptide.summary}</p>
      <div className="mt-auto pt-5">
        {peptide.concerns.length > 0 && (
          <p className="mb-3 line-clamp-1 text-xs text-cocoa">
            <span className="text-taupe">Best for:</span> {peptide.concerns.slice(0, 3).map(concernLabel).join(" · ")}
          </p>
        )}
        <div className="flex items-center justify-between border-t border-stone/60 pt-3">
          <span className="text-[11px] tracking-wider text-taupe uppercase">Evidence</span>
          <EvidenceMeter level={peptide.evidenceLevel} />
        </div>
      </div>
    </Link>
  );
}
