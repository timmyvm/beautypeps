/*
 * Practical usage data for the comparison chart that isn't stored on the
 * peptide record. Keyed by peptide slug; unknown slugs fall back gracefully.
 */
export type PeptideUsageMeta = {
  when: "AM / PM" | "PM" | "AM";
  onset: string; // typical time to visible change in studies
  bestFor: string; // one-line summary for the chart
};

export const PEPTIDE_USAGE: Record<string, PeptideUsageMeta> = {
  "ghk-cu": { when: "AM / PM", onset: "8–12 weeks", bestFor: "Firmness, density, barrier recovery" },
  "palmitoyl-pentapeptide-4": { when: "AM / PM", onset: "8–12 weeks", bestFor: "Fine lines, texture" },
  "palmitoyl-tripeptide-1": { when: "AM / PM", onset: "8 weeks", bestFor: "Fine lines, firmness" },
  "palmitoyl-tetrapeptide-7": { when: "AM / PM", onset: "8 weeks", bestFor: "Calming, supporting Matrixyl 3000" },
  "acetyl-hexapeptide-8": { when: "AM / PM", onset: "4 weeks", bestFor: "Forehead & crow's-feet expression lines" },
  "acetyl-octapeptide-3": { when: "AM / PM", onset: "4 weeks", bestFor: "Expression lines (boosts Argireline)" },
  "pentapeptide-18": { when: "AM / PM", onset: "4 weeks", bestFor: "Expression lines, paired with Argireline" },
  "dipeptide-diaminobutyroyl-benzylamide-diacetate": { when: "AM / PM", onset: "4 weeks", bestFor: "Expression lines" },
  "palmitoyl-tripeptide-38": { when: "AM / PM", onset: "4–8 weeks", bestFor: "Wrinkle depth, lips" },
  "acetyl-tetrapeptide-5": { when: "AM", onset: "2–4 weeks", bestFor: "Under-eye puffiness" },
  "nonapeptide-1": { when: "AM / PM", onset: "8 weeks", bestFor: "Uneven tone, dark spots" },
  "biotinoyl-tripeptide-1": { when: "PM", onset: "12+ weeks", bestFor: "Scalp, fuller-looking hair" },
  "palmitoyl-tripeptide-5": { when: "AM / PM", onset: "8 weeks", bestFor: "Firmness, collagen support" },
};

export const PAIRINGS = [
  {
    title: "The expression-line trio",
    peptides: [
      { label: "Argireline", slug: "acetyl-hexapeptide-8" },
      { label: "SNAP-8", slug: "acetyl-octapeptide-3" },
      { label: "Leuphasyl", slug: "pentapeptide-18" },
    ],
    verdict: "great" as const,
    text: "Argireline and SNAP-8 act on the SNARE complex, while Leuphasyl works upstream at the nerve's enkephalin receptor. Manufacturer data suggests Argireline + Leuphasyl is more effective than either alone.",
  },
  {
    title: "Build & repair",
    peptides: [
      { label: "Matrixyl", slug: "palmitoyl-pentapeptide-4" },
      { label: "GHK-Cu", slug: "ghk-cu" },
    ],
    verdict: "great" as const,
    text: "A collagen-signalling peptide plus a copper carrier peptide covers two complementary routes to firmer-looking skin. Both are gentle and suit twice-daily use.",
  },
  {
    title: "Movement + matrix",
    peptides: [
      { label: "Argireline", slug: "acetyl-hexapeptide-8" },
      { label: "Matrixyl 3000", slug: "palmitoyl-tripeptide-1" },
    ],
    verdict: "great" as const,
    text: "Lines have two causes: repeated movement and a thinning matrix. Pairing a neurotransmitter-inhibitor with a signal peptide addresses both, which is the logic behind multi-peptide serums.",
  },
  {
    title: "Peptides + retinoids",
    peptides: [
      { label: "Any peptide", slug: "" },
      { label: "Retinol / retinal", slug: "" },
    ],
    verdict: "ok" as const,
    text: "Compatible. To minimise irritation, many people use peptides in the morning and retinoids at night, or alternate nights while their skin adjusts.",
  },
  {
    title: "Copper peptides + L-ascorbic acid or strong acids",
    peptides: [
      { label: "GHK-Cu", slug: "ghk-cu" },
      { label: "Vitamin C / AHA / BHA", slug: "" },
    ],
    verdict: "separate" as const,
    text: "Use at different times of day. Low pH can pull copper out of the peptide complex, and free copper can oxidise vitamin C. GHK-Cu at night, vitamin C in the morning works well.",
  },
  {
    title: "Brightening + SPF",
    peptides: [
      { label: "Nonapeptide-1", slug: "nonapeptide-1" },
      { label: "Broad-spectrum SPF 50+", slug: "" },
    ],
    verdict: "great" as const,
    text: "Any pigment-focused active is wasted without daily sun protection. Nonapeptide-1 also layers well with niacinamide.",
  },
];
