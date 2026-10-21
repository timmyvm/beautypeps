import Image from "next/image";
import Link from "next/link";
import { specimenTrimSrc, TILE_BG, toneFor } from "@/components/product/product-card";
import { PEPTIDE_CLASSES } from "@/lib/constants";
import type { Peptide } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import { EvidenceMeter } from "./evidence-meter";

const SHORT_CLASS: Record<string, string> = {
  signal: "Signal",
  carrier: "Carrier",
  "neurotransmitter-inhibitor": "Neurotransmitter-inhibiting",
  "enzyme-inhibitor": "Enzyme-inhibiting",
};

export function classShortLabel(peptideClass: string) {
  return SHORT_CLASS[peptideClass] ?? peptideClass;
}

export function classLabel(peptideClass: string) {
  return PEPTIDE_CLASSES[peptideClass]?.label ?? peptideClass;
}

export type Specimen = { slug: string; name: string; image: string };

/** A small flat-colour tile holding the cut-out of a formula. */
export function SpecimenThumb({
  specimen,
  className,
  sizes = "96px",
}: {
  specimen?: Specimen;
  className?: string;
  sizes?: string;
}) {
  if (!specimen) return <div className={cn("bg-surface", className)} aria-hidden />;
  const trim = specimenTrimSrc(specimen.image);
  return (
    <div className={cn("relative overflow-hidden", TILE_BG[toneFor(specimen.slug)], className)}>
      <Image
        src={trim ?? specimen.image}
        alt={specimen.name}
        fill
        sizes={sizes}
        className={trim ? "object-contain p-[14%]" : "object-cover"}
      />
    </div>
  );
}

/*
 * One entry in the field guide: the specimen it is found in, the name, INCI and class in words,
 * one line of what it does, and the evidence grade.
 */
export function PeptideEntry({
  peptide,
  specimen,
  index = 0,
  compact = false,
}: {
  peptide: Pick<Peptide, "slug" | "name" | "inciName" | "peptideClass" | "summary" | "evidenceLevel" | "typicalConcentration">;
  specimen?: Specimen;
  index?: number;
  compact?: boolean;
}) {
  return (
    <li data-reveal="row" style={{ ["--reveal-i" as string]: Math.min(index, 8) }}>
      <Link
        href={`/peptides/${peptide.slug}`}
        className={cn(
          "group grid grid-cols-[72px_minmax(0,1fr)] items-center gap-x-5 gap-y-3 px-3 py-4 transition-colors sm:grid-cols-[96px_minmax(0,1fr)] sm:px-4 lg:grid-cols-[112px_minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-x-8",
          index % 2 === 0 ? "bg-surface hover:bg-surface-2" : "bg-bg hover:bg-surface",
        )}
      >
        <SpecimenThumb specimen={specimen} className="aspect-square w-full" sizes="(min-width: 1024px) 112px, 96px" />
        <span className="min-w-0">
          <h3 className="text-lead font-medium text-ink group-hover:underline group-hover:underline-offset-4">{peptide.name}</h3>
          <span className="mt-1 block text-body text-ink">
            {peptide.inciName}, a {classShortLabel(peptide.peptideClass).toLowerCase()} peptide
          </span>
          {!compact && <span className="mt-2 hidden max-w-[60ch] text-body text-ink sm:line-clamp-2">{peptide.summary}</span>}
        </span>
        <span className="col-span-2 flex flex-col gap-1 lg:col-span-1 lg:items-end lg:text-right">
          <EvidenceMeter level={peptide.evidenceLevel} />
          {peptide.typicalConcentration && (
            <span className="text-small text-muted">Used at {peptide.typicalConcentration}</span>
          )}
        </span>
      </Link>
    </li>
  );
}
