/** How we grade the published research behind each peptide (shown on every monograph). */
export const EVIDENCE_LEVELS: Record<number, { label: string; short: string; description: string }> = {
  1: {
    label: "Laboratory only",
    short: "Lab data",
    description:
      "Results come from cell cultures (in-vitro) only. Promising mechanisms, but nothing yet shows the effect on living skin.",
  },
  2: {
    label: "Early human data",
    short: "Early",
    description:
      "Lab data plus ex-vivo skin explants or small, uncontrolled pilot studies on volunteers. Treat claims as preliminary.",
  },
  3: {
    label: "Moderate",
    short: "Moderate",
    description:
      "Controlled in-vivo studies exist, but mostly run or funded by the ingredient manufacturer, with modest sample sizes.",
  },
  4: {
    label: "Good",
    short: "Good",
    description:
      "Several in-vivo studies, including at least one independent or peer-reviewed placebo-controlled trial, point the same way.",
  },
  5: {
    label: "Strong",
    short: "Strong",
    description:
      "Multiple independent, randomised, placebo-controlled clinical trials with consistent results. Rare for cosmetic peptides.",
  },
};

export function evidenceLevel(level: number) {
  const clamped = Math.min(5, Math.max(1, Math.round(level)));
  return { level: clamped, ...EVIDENCE_LEVELS[clamped] };
}
