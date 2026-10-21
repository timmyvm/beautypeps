import { cn } from "@/lib/utils";

export const EVIDENCE_LEVELS: Record<number, { label: string; description: string }> = {
  1: { label: "Emerging", description: "In-vitro or anecdotal data only" },
  2: { label: "Early", description: "Manufacturer in-vitro + small in-vivo panels" },
  3: { label: "Moderate", description: "Several in-vivo studies, mostly manufacturer-run" },
  4: { label: "Good", description: "Independent clinical studies with consistent results" },
  5: { label: "Strong", description: "Multiple independent, controlled clinical trials" },
};

export function EvidenceDots({ level }: { level: number }) {
  return (
    <span className="inline-flex items-center gap-1" title={`${level}/5 · ${EVIDENCE_LEVELS[level]?.label ?? ""}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={cn("size-2 rounded-full", i <= level ? "bg-accent" : "bg-stone")} />
      ))}
      <span className="sr-only">{level} out of 5</span>
    </span>
  );
}
