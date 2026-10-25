/*
 * What each Journal entry carries besides its text: the peptides it is about (drawn beside the standfirst),
 * and the interludes set between its chapters. A pull-out is always a line from the article itself; the page
 * checks it is still there and leaves it out if an edit in the admin has removed it. `after` names the
 * chapter heading the interlude follows. An entry not listed here draws the peptides named in its title.
 */

export type Field = "frost" | "stone" | "sapphire" | "ink";

export type Interlude =
  | { kind: "quote"; after: string; text: string; field: Field }
  | {
      kind: "figure";
      after: string;
      src: string;
      video?: string;
      alt: string;
      caption: string;
      shape: "wide" | "tall" | "square";
    }
  | { kind: "strands"; after: string; title: string; items: { slug: string; note: string }[] };

export type ArticleExtras = { specimens?: string[]; interludes: Interlude[] };

export const ARTICLE_EXTRAS: Record<string, ArticleExtras> = {
  "what-are-peptides": {
    interludes: [
      {
        kind: "strands",
        after: "The four classes of cosmetic peptides",
        title: "One of each class, drawn from its sequence",
        items: [
          { slug: "palmitoyl-pentapeptide-4", note: "Signal" },
          { slug: "ghk-cu", note: "Carrier" },
          { slug: "acetyl-hexapeptide-8", note: "Neurotransmitter-inhibiting" },
          { slug: "acetyl-tetrapeptide-5", note: "Enzyme-inhibiting" },
        ],
      },
      {
        kind: "quote",
        after: "The penetration problem",
        text: "This is one reason the formula matters as much as the ingredient name on the front of the bottle.",
        field: "stone",
      },
      {
        kind: "figure",
        after: "How to choose a peptide product",
        src: "/images/editorial/specimen-drawer.webp",
        alt: "A wooden drawer divided into compartments holding serum bottles, amber vials, a tube and a tin.",
        caption: "Serums, creams and pure powders: the format changes, the INCI name tells you what is inside.",
        shape: "wide",
      },
    ],
  },
  "copper-peptides-ghk-cu-guide": {
    specimens: ["ghk-cu"],
    interludes: [
      {
        kind: "figure",
        after: "Why copper matters",
        src: "/images/found/chalcanthite.webp",
        alt: "A cluster of deep blue copper sulfate crystals on a white ground.",
        caption: "Chalcanthite, a copper sulfate mineral. The blue is copper(II), the same ion GHK holds in a serum.",
        shape: "wide",
      },
      {
        kind: "quote",
        after: "What it does on real faces",
        text: "Expect gradual improvements in firmness, texture and resilience rather than dramatic change.",
        field: "sapphire",
      },
      {
        kind: "figure",
        after: "Why is my serum blue?",
        src: "/images/editorial/ghk-cu-plinth.webp",
        video: "/video/ghk-cu-light.mp4",
        alt: "Our GHK-Cu serum, deep blue in its bottle, on a stone plinth as the light moves across it.",
        caption: "Our GHK-Cu serum at 1%: deep blue, the copper still bound to the peptide.",
        shape: "square",
      },
    ],
  },
  "argireline-neuropeptides-explained": {
    specimens: ["acetyl-hexapeptide-8"],
    interludes: [
      {
        kind: "quote",
        after: "What the studies show",
        text: "Think gentle smoothing over a month or two, not a frozen forehead.",
        field: "sapphire",
      },
      {
        kind: "strands",
        after: "Meet the rest of the family",
        title: "The family, drawn from their sequences",
        items: [
          { slug: "acetyl-hexapeptide-8", note: "SNARE complex, inside the nerve" },
          { slug: "acetyl-octapeptide-3", note: "SNARE complex, a longer mimic" },
          { slug: "pentapeptide-18", note: "Enkephalin receptor, calms the nerve" },
          { slug: "dipeptide-diaminobutyroyl-benzylamide-diacetate", note: "Acetylcholine receptor, on the muscle" },
        ],
      },
    ],
  },
  "how-to-layer-peptides": {
    interludes: [
      {
        kind: "figure",
        after: "The golden rules of layering",
        src: "/images/editorial/texture.webp",
        alt: "A smear of clear gel beside a smear of white cream.",
        caption: "Thinnest to thickest: the water-light gel goes on before the cream.",
        shape: "wide",
      },
      {
        kind: "quote",
        after: "Peptides + vitamin C",
        text: "Keep copper peptides away from pure vitamin C and strong acids in the same routine.",
        field: "frost",
      },
    ],
  },
  "peptides-for-eyes": {
    specimens: ["acetyl-tetrapeptide-5"],
    interludes: [
      {
        kind: "quote",
        after: "Peptides for crow's-feet",
        text: "Eye peptides work best on puffiness and vascular shadows, with gradual help for fine lines.",
        field: "stone",
      },
    ],
  },
  "storing-peptide-powders": {
    interludes: [
      {
        kind: "quote",
        after: 'What "lyophilised" means',
        text: "Water is the enemy of a dry peptide.",
        field: "ink",
      },
      {
        kind: "figure",
        after: "Storage at a glance",
        src: "/images/editorial/cold-chain.webp",
        alt: "Rows of amber vials on a fridge shelf beside a dial thermometer.",
        caption: "Unopened vials in the fridge, at 2–8 °C and in the dark.",
        shape: "tall",
      },
      {
        kind: "figure",
        after: "Making a stock solution",
        src: "/video/powder-dissolve-poster.webp",
        video: "/video/powder-dissolve.mp4",
        alt: "Blue peptide powder falling from a spatula into a beaker of water and clouding through it.",
        caption: "GHK-Cu powder going into distilled water. The copper turns the solution blue.",
        shape: "wide",
      },
    ],
  },
  "matrixyl-collagen-signal-peptides": {
    specimens: ["palmitoyl-pentapeptide-4"],
    interludes: [
      {
        kind: "quote",
        after: "Your skin's repair signals",
        text: "Signal peptides are biomimetic messages that ask your fibroblasts to maintain the matrix.",
        field: "frost",
      },
      {
        kind: "strands",
        after: "The family tree",
        title: "Five signals, one palmitoyl tail",
        items: [
          { slug: "palmitoyl-pentapeptide-4", note: "Matrixyl: a pro-collagen fragment" },
          { slug: "palmitoyl-tripeptide-1", note: "Matrixyl 3000: a GHK fragment" },
          { slug: "palmitoyl-tetrapeptide-7", note: "Matrixyl 3000: an IgG fragment" },
          { slug: "palmitoyl-tripeptide-38", note: "Matrixyl synthe'6: the KMK matrikine" },
          { slug: "palmitoyl-tripeptide-5", note: "SYN-COLL: a thrombospondin-1 mimic" },
        ],
      },
    ],
  },
  "beginner-peptide-routine": {
    interludes: [
      {
        kind: "figure",
        after: "Step 2: build the routine",
        src: "/images/editorial/applied.webp",
        alt: "Drops of blue serum on the back of a hand, beside the dropper bottle.",
        caption: "One serum, a few drops on clean skin, morning and evening.",
        shape: "wide",
      },
      {
        kind: "quote",
        after: "Step 3: the 12-week timeline",
        text: "No visible change yet — that's normal.",
        field: "sapphire",
      },
    ],
  },
};

/** The peptides an entry is about: as listed above, or the ones its title names. */
export function specimenSlugs(
  article: { slug: string; title: string },
  peptides: { slug: string; name: string; inciName: string }[],
): string[] {
  const listed = ARTICLE_EXTRAS[article.slug]?.specimens;
  if (listed) return listed;
  const title = article.title.toLowerCase();
  return peptides.filter((p) => [p.name, p.inciName].some((n) => title.includes(n.toLowerCase()))).map((p) => p.slug);
}
