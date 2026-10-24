/*
 * Reads a peptide's written sequence ("Pal-Lys-Thr-Thr-Lys-Ser", "Gly-His-Lys : Cu²⁺",
 * "Tyr-D-Ala-Gly-Phe-Leu") into the parts the sequence drawing needs: an optional cap on the first
 * end, the residues in order, an optional end group, and a bound metal ion.
 */

export type ResidueKind = "nonpolar" | "polar" | "positive" | "negative";

export type Residue = {
  code: string; // as written, without a D- prefix: "Gly", "β-Ala", "Met(O₂)"
  name: string; // "glycine"
  kind: ResidueKind;
  note: string; // one plain sentence about it
  mirror: boolean; // a D- (mirror-image) form
};

export type Cap = { code: string; label: string; name: string; note: string; kind: "fatty" | "small" | "vitamin" };
export type End = { code: string; label: string; name: string; note: string; ring?: boolean };
export type Ion = { code: string; label: string; name: string; note: string };

export type Sequence = { cap: Cap | null; residues: Residue[]; end: End | null; ion: Ion | null; raw: string };

export const KIND_LABEL: Record<ResidueKind, string> = {
  nonpolar: "Water-shy",
  polar: "Water-loving",
  positive: "Positive charge",
  negative: "Negative charge",
};

const AMINO: Record<string, Omit<Residue, "code" | "mirror">> = {
  Gly: { name: "glycine", kind: "nonpolar", note: "The smallest amino acid, with a single hydrogen for a side chain." },
  Ala: { name: "alanine", kind: "nonpolar", note: "Small and water-shy; it packs neatly into a chain." },
  Val: { name: "valine", kind: "nonpolar", note: "A branched, water-shy side chain." },
  Leu: { name: "leucine", kind: "nonpolar", note: "A branched, water-shy side chain." },
  Ile: { name: "isoleucine", kind: "nonpolar", note: "A branched, water-shy side chain." },
  Met: { name: "methionine", kind: "nonpolar", note: "Carries a sulfur atom in its side chain." },
  Phe: { name: "phenylalanine", kind: "nonpolar", note: "A benzene ring: bulky and water-shy." },
  Trp: { name: "tryptophan", kind: "nonpolar", note: "The largest amino acid, with a double ring." },
  Pro: { name: "proline", kind: "nonpolar", note: "Its side chain loops back onto the chain and puts a kink in it." },
  Ser: { name: "serine", kind: "polar", note: "Carries an alcohol group, so it sits happily in water." },
  Thr: { name: "threonine", kind: "polar", note: "Carries an alcohol group, so it sits happily in water." },
  Tyr: { name: "tyrosine", kind: "polar", note: "A ring with an alcohol group on it." },
  Asn: { name: "asparagine", kind: "polar", note: "A water-loving amide side chain." },
  Gln: { name: "glutamine", kind: "polar", note: "A water-loving amide side chain." },
  Cys: { name: "cysteine", kind: "polar", note: "Carries a sulfur that can bridge to another cysteine." },
  Lys: { name: "lysine", kind: "positive", note: "Its long side chain ends in a positive charge." },
  Arg: { name: "arginine", kind: "positive", note: "Strongly basic, with a positive charge." },
  His: { name: "histidine", kind: "positive", note: "Its ring grips metal ions such as copper." },
  Asp: { name: "aspartic acid", kind: "negative", note: "Carries a negative charge." },
  Glu: { name: "glutamic acid", kind: "negative", note: "Carries a negative charge." },
  Dab: { name: "diaminobutyric acid", kind: "positive", note: "Not one of the twenty protein amino acids; it carries a second amine." },
  "β-Ala": { name: "beta-alanine", kind: "nonpolar", note: "Its amine sits one carbon further along than usual, which skin enzymes are slow to cut." },
  "Met(O₂)": { name: "methionine sulfone", kind: "polar", note: "Methionine with its sulfur fully oxidised." },
};

const CAPS: Record<string, Cap> = {
  Pal: { code: "Pal", label: "Palmitoyl", name: "palmitoyl tail", kind: "fatty", note: "A 16-carbon fatty acid that helps the peptide pass the skin's oily outer layer." },
  Ac: { code: "Ac", label: "Ac", name: "acetyl cap", kind: "small", note: "An acetyl group on the first end, which shields the chain from enzymes." },
  Biotinoyl: { code: "Biotinoyl", label: "Biotin", name: "biotin", kind: "vitamin", note: "Biotin (vitamin B7) bonded to the first end of the chain." },
};

const ENDS: Record<string, End> = {
  "NH₂": { code: "NH₂", label: "NH₂", name: "amide end", note: "The last acid group is turned into an amide, which makes the chain more stable." },
  OH: { code: "OH", label: "OH", name: "acid end", note: "The chain ends in its natural acid group." },
  "NH-Benzyl": { code: "NH-Benzyl", label: "Benzyl", name: "benzylamide end", ring: true, note: "A benzene ring bonded to the last end, which helps it bind its target." },
};

const ION: Ion = { code: "Cu²⁺", label: "Cu", name: "copper ion", note: "One copper ion held by glycine and histidine; it is what makes the serum blue." };

/** Parse a written sequence. Unknown tokens are kept as residues so nothing silently disappears. */
export function parseSequence(raw: string): Sequence {
  let text = raw.split("·")[0].trim(); // drop a counter-ion note such as "· 2 AcOH"
  let ion: Ion | null = null;
  const metal = text.match(/:\s*Cu²⁺\s*$/);
  if (metal) {
    ion = ION;
    text = text.slice(0, metal.index).trim();
  }

  // Tokens joined by hyphens; "D-" and "β-" prefix the next residue, "NH-Benzyl" is one end group.
  const tokens = text.split("-").map((t) => t.trim()).filter(Boolean);
  const parts: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if ((t === "D" || t === "β" || t === "NH") && tokens[i + 1]) {
      parts.push(`${t}-${tokens[++i]}`);
    } else parts.push(t);
  }

  let cap: Cap | null = null;
  let end: End | null = null;
  if (parts.length && CAPS[parts[0]]) cap = CAPS[parts.shift()!];
  if (parts.length && ENDS[parts[parts.length - 1]]) end = ENDS[parts.pop()!];

  const residues: Residue[] = parts.map((p) => {
    const mirror = p.startsWith("D-");
    const code = mirror ? p.slice(2) : p;
    const known = AMINO[code];
    return {
      code,
      mirror,
      ...(known ?? { name: code, kind: "nonpolar" as const, note: "A building block of the chain." }),
      ...(mirror ? { note: `${known?.note ?? ""} This is its mirror-image (D-) form, which skin enzymes barely recognise, so it lasts longer.`.trim() } : {}),
    };
  });

  return { cap, residues, end, ion, raw };
}
