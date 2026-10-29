import type { SeedCategory } from "./categories";
import type { SeedProduct } from "./products";

/*
 * What Beauty Peps sells today: vials from the AuPeptideLabs shelf. Each product is one APL variant
 * (apl_variant_id), so its stock is APL's stock (see lib/apl.ts). Prices are APL's AUD prices at launch;
 * they are this site's own from here on and can be changed in the admin.
 *
 * Used by the seed (fresh databases) and by `npm run catalogue:apl` (an existing database, e.g. production).
 */

export const aplCategories: SeedCategory[] = [
  {
    slug: "pure-actives",
    name: "Pure Actives",
    tagline: "Single peptides by the vial, for making your own serum.",
    description:
      "Cosmetic peptides as freeze-dried powder in sealed amber vials: the raw ingredient, with the milligrams on the label and the arithmetic for turning it into a serum at the concentrations studied. For topical formulation and external use only.",
    image: "/images/products/ghk-cu-50mg.webp",
    sortOrder: 1,
  },
  {
    slug: "research-peptides",
    name: "Research Peptides",
    tagline: "Freeze-dried peptides and blends for laboratory research.",
    description:
      "Peptides and peptide blends sold for laboratory research only. They are not cosmetics or medicines, they are not for human use, and we give no directions for using them.",
    image: "/images/products/glow-70mg.webp",
    sortOrder: 2,
  },
];

const img = (slug: string) => `/images/products/${slug}.webp`;

const RESEARCH_NOTICE =
  "**Sold for laboratory research only.** Not a cosmetic, not a medicine and not for human or animal use. We give no directions for use and make no claims about effects.";

const TOPICAL_NOTICE =
  "**For topical formulation and external use only.** Not for injection or ingestion. Whoever makes the finished product is responsible for its safety and stability.";

const storeCold = "Store the sealed vial at 2–8 °C, dry and away from light.";

function ghkCu(mg: 50 | 100, price: number, sortOrder: number): SeedProduct {
  const at1 = mg / 10; // mL of serum at 1%
  return {
    slug: `ghk-cu-${mg}mg`,
    aplVariantId: `ghk-cu-${mg}mg`,
    categorySlug: "pure-actives",
    name: `GHK-Cu ${mg} mg`,
    subtitle: "Copper tripeptide-1, freeze-dried, in one sealed vial",
    sku: `BP-GHKCU-${mg}`,
    status: "active",
    featured: true,
    badge: null,
    price,
    compareAtPrice: null,
    stock: 0,
    lowStockThreshold: 5,
    size: `${mg} mg`,
    image: img(`ghk-cu-${mg}mg`),
    gallery: ["/images/editorial/powder-dissolve.webp", "/images/editorial/cold-chain.webp"],
    shortDescription: `${mg} mg of GHK-Cu, the copper peptide, as freeze-dried powder: the raw ingredient for a copper peptide serum you make yourself. ${at1} mL of serum at 1%, or ${at1 * 2} mL at 0.5%.`,
    description: `GHK-Cu is three amino acids (glycine, histidine, lysine) holding one copper ion; the copper is why it is blue. This vial holds **${mg} mg** of it as freeze-dried powder: the raw ingredient, not a finished serum.

**What is in the vial**
- Copper tripeptide-1 (GHK-Cu), ${mg} mg, freeze-dried
- Blue to violet-blue powder that dissolves readily in water

**Making a serum from it**
${mg} mg in ${at1} mL of a water-based serum is 1%; in ${at1 * 2} mL it is 0.5%. Cosmetic formulas use between about 0.05% and 1%. Add it below 40 °C, keep the finished pH between about 5 and 7 (below about 4.5 the copper lets go and the solution turns green), and keep it apart from L-ascorbic acid, strong acids and chelators such as EDTA.

${TOPICAL_NOTICE}`,
    howToUse: `1. Work out your concentration: ${mg} mg in ${at1} mL is 1%.
2. Add a little distilled water to the vial and swirl until the powder is fully dissolved and blue.
3. Stir it into your water-based serum below 40 °C, then check the pH (aim for 5.0–7.0).
4. ${storeCold} Once dissolved, keep it in the fridge and use it within the shelf life of your formula.`,
    ingredients: "Copper Tripeptide-1.",
    keyActives: [{ name: "Copper Tripeptide-1 (GHK-Cu)", amount: `${mg} mg`, note: "Freeze-dried" }],
    peptideSlugs: ["ghk-cu"],
    concerns: ["firmness", "fine-lines", "barrier"],
    skinTypes: [],
    faqs: [
      { q: "How much serum does it make?", a: `At 1%, ${at1} mL. At 0.5%, ${at1 * 2} mL. At 0.1%, ${at1 * 10} mL.` },
      { q: "Why is it blue?", a: "The copper ion bound to the peptide. If a solution turns green, the pH has dropped low enough for the copper to come loose." },
      { q: "Can I inject it or take it by mouth?", a: "No. From Beauty Peps it is a raw ingredient for topical formulations only." },
    ],
    texture: "Freeze-dried blue powder",
    phRange: "Formulate at 5.0 – 7.0",
    routineStep: "Formulation ingredient",
    seoTitle: `GHK-Cu ${mg} mg | Copper Peptide Powder | Beauty Peps`,
    seoDescription: `${mg} mg of freeze-dried GHK-Cu (copper tripeptide-1) for making your own copper peptide serum. Melbourne stock, shipped by Australia Post.`,
    sortOrder,
  };
}

function glutathione(mg: 600 | 1500, price: number, sortOrder: number): SeedProduct {
  return {
    slug: `glutathione-${mg}mg`,
    aplVariantId: `glutathione-${mg}mg`,
    categorySlug: "pure-actives",
    name: `Glutathione ${mg} mg`,
    subtitle: "L-glutathione, freeze-dried, in one sealed vial",
    sku: `BP-GSH-${mg}`,
    status: "active",
    featured: mg === 600,
    badge: null,
    price,
    compareAtPrice: null,
    stock: 0,
    lowStockThreshold: 5,
    size: `${mg} mg`,
    image: img(`glutathione-${mg}mg`),
    gallery: ["/images/editorial/cold-chain.webp"],
    shortDescription: `${mg} mg of L-glutathione as freeze-dried powder, the raw ingredient for a topical antioxidant serum you make in small batches.`,
    description: `Glutathione is a tripeptide (glutamate, cysteine and glycine, the first joined through its side chain) that cells use as their main antioxidant. This vial holds **${mg} mg** as freeze-dried powder: the raw ingredient, not a finished product.

**What is in the vial**
- L-glutathione, ${mg} mg, freeze-dried
- White powder, freely soluble in water

**Working with it**
In water glutathione oxidises over days, faster when warm and in light. Make small batches, add it below 40 °C, keep the finished product cold and dark, and expect it to keep for weeks rather than months. Studies of glutathione applied to the skin are few and small; most of its reputation for tone comes from oral and injected use, which this is not for.

${TOPICAL_NOTICE}`,
    howToUse: `1. Dissolve the amount you need in distilled water at room temperature.
2. Stir it into a water-based serum below 40 °C.
3. Make small batches and keep them in the fridge, away from light.
4. ${storeCold}`,
    ingredients: "Glutathione.",
    keyActives: [{ name: "L-Glutathione", amount: `${mg} mg`, note: "Freeze-dried" }],
    peptideSlugs: [],
    concerns: ["dullness"],
    skinTypes: [],
    faqs: [
      { q: "How long does a glutathione serum keep?", a: "Not long: it oxidises in water. Make what you will use in a few weeks and keep it cold and dark." },
      { q: "Can I inject it or take it by mouth?", a: "No. From Beauty Peps it is a raw ingredient for topical formulations only." },
    ],
    texture: "Freeze-dried white powder",
    phRange: null,
    routineStep: "Formulation ingredient",
    seoTitle: `Glutathione ${mg} mg | Freeze-Dried Powder | Beauty Peps`,
    seoDescription: `${mg} mg of freeze-dried L-glutathione for topical formulation. Melbourne stock, shipped by Australia Post.`,
    sortOrder,
  };
}

function research(p: {
  slug: string;
  name: string;
  subtitle: string;
  sku: string;
  mg: number;
  price: number;
  contents: string;
  about: string;
  peptideSlugs: string[];
  sortOrder: number;
}): SeedProduct {
  return {
    slug: p.slug,
    aplVariantId: p.slug,
    categorySlug: "research-peptides",
    name: p.name,
    subtitle: p.subtitle,
    sku: p.sku,
    status: "active",
    featured: false,
    badge: "Research only",
    price: p.price,
    compareAtPrice: null,
    stock: 0,
    lowStockThreshold: 3,
    size: `${p.mg} mg`,
    image: img(p.slug),
    gallery: [],
    shortDescription: `${p.contents}, ${p.mg} mg freeze-dried in one sealed vial. Sold for laboratory research only; not for human use.`,
    description: `${p.about}

**What is in the vial**
- ${p.contents}, ${p.mg} mg in total, freeze-dried

${RESEARCH_NOTICE}`,
    howToUse: null,
    ingredients: null,
    keyActives: [{ name: p.contents, amount: `${p.mg} mg` }],
    peptideSlugs: p.peptideSlugs,
    concerns: [],
    skinTypes: [],
    faqs: [
      { q: "Is this a cosmetic?", a: "No. It is sold for laboratory research only and is not for human or animal use." },
      { q: "How should it be stored?", a: storeCold },
    ],
    texture: "Freeze-dried powder",
    phRange: null,
    routineStep: null,
    seoTitle: `${p.name} | Research Peptide | Beauty Peps`,
    seoDescription: `${p.contents}, ${p.mg} mg freeze-dried. For laboratory research only.`,
    sortOrder: p.sortOrder,
  };
}

export const aplProducts: SeedProduct[] = [
  ghkCu(50, 7499, 1),
  ghkCu(100, 10999, 2),
  {
    slug: "snap-8-10mg",
    aplVariantId: "snap-8-10mg",
    categorySlug: "pure-actives",
    name: "SNAP-8 10 mg",
    subtitle: "Acetyl octapeptide-3, freeze-dried, in one sealed vial",
    sku: "BP-SNAP8-10",
    status: "active",
    featured: true,
    badge: null,
    price: 26900,
    compareAtPrice: null,
    stock: 0,
    lowStockThreshold: 3,
    size: "10 mg",
    image: img("snap-8-10mg"),
    gallery: ["/images/editorial/cold-chain.webp"],
    shortDescription:
      "10 mg of SNAP-8 (acetyl octapeptide-3) as freeze-dried powder: the raw ingredient for an expression-line serum you make yourself.",
    description: `SNAP-8 is Argireline extended by two amino acids: eight in all, capped at both ends. Like Argireline it is modelled on a piece of SNAP-25, a protein nerve endings need to signal a muscle to contract. This vial holds **10 mg** of the pure peptide as freeze-dried powder: the raw ingredient, not a finished serum.

**What is in the vial**
- Acetyl octapeptide-3 (SNAP-8), 10 mg, freeze-dried
- White powder, soluble in water

**Making a serum from it**
10 mg in 10 mL of serum is 0.1% pure peptide. Add it to the water phase below 40 °C. The evidence behind SNAP-8 is mostly the manufacturer's own; see its monograph for the grade.

${TOPICAL_NOTICE}`,
    howToUse: `1. Add a little distilled water to the vial and swirl until the powder is dissolved.
2. Stir it into your water-based serum below 40 °C (10 mg in 10 mL is 0.1%).
3. ${storeCold}`,
    ingredients: "Acetyl Octapeptide-3.",
    keyActives: [{ name: "Acetyl Octapeptide-3 (SNAP-8)", amount: "10 mg", note: "Freeze-dried" }],
    peptideSlugs: ["acetyl-octapeptide-3"],
    concerns: ["expression-lines", "fine-lines"],
    skinTypes: [],
    faqs: [
      { q: "How is it different from Argireline?", a: "Two more amino acids on the same chain. The maker reports a stronger effect than Argireline; independent studies are scarce." },
      { q: "Can I inject it?", a: "No. From Beauty Peps it is a raw ingredient for topical formulations only." },
    ],
    texture: "Freeze-dried white powder",
    phRange: null,
    routineStep: "Formulation ingredient",
    seoTitle: "SNAP-8 10 mg | Acetyl Octapeptide-3 Powder | Beauty Peps",
    seoDescription: "10 mg of freeze-dried SNAP-8 (acetyl octapeptide-3) for topical formulation. Melbourne stock.",
    sortOrder: 3,
  },
  glutathione(600, 7999, 4),
  glutathione(1500, 14999, 5),
  research({
    slug: "glow-70mg",
    name: "GLOW 70 mg",
    subtitle: "GHK-Cu, BPC-157 and TB-500 blend",
    sku: "BP-GLOW-70",
    mg: 70,
    price: 14999,
    contents: "GHK-Cu, BPC-157 and TB-500",
    about: "A freeze-dried blend of three peptides in one vial: GHK-Cu (the copper tripeptide), BPC-157 (a fifteen-amino-acid fragment first described from a gastric protein) and TB-500 (a synthetic fragment of thymosin beta-4).",
    peptideSlugs: [],
    sortOrder: 6,
  }),
  research({
    slug: "klow-80mg",
    name: "KLOW 80 mg",
    subtitle: "GHK-Cu, BPC-157, TB-500 and KPV blend",
    sku: "BP-KLOW-80",
    mg: 80,
    price: 18999,
    contents: "GHK-Cu, BPC-157, TB-500 and KPV",
    about: "The GLOW blend with a fourth peptide, KPV (lysine, proline, valine: the last three amino acids of alpha-MSH), freeze-dried together in one vial.",
    peptideSlugs: [],
    sortOrder: 7,
  }),
  research({
    slug: "kpv-10mg",
    name: "KPV 10 mg",
    subtitle: "Lys-Pro-Val tripeptide",
    sku: "BP-KPV-10",
    mg: 10,
    price: 8999,
    contents: "KPV (Lys-Pro-Val)",
    about: "KPV is three amino acids, lysine, proline and valine: the end of alpha-melanocyte-stimulating hormone (alpha-MSH), studied in the laboratory for its effects on inflammation.",
    peptideSlugs: [],
    sortOrder: 8,
  }),
];

/** The demo formulas the site launched with. They stay in the database as drafts until they are real. */
export const DEMO_PRODUCT_SLUGS = [
  "ghk-cu-copper-peptide-serum",
  "matrixyl-3000-serum",
  "argireline-10-serum",
  "snap-8-serum",
  "multi-peptide-complex",
  "leuphasyl-syn-ake-serum",
  "nonapeptide-brightening-serum",
  "eye-peptide-gel",
  "lip-peptide-plumping-balm",
  "scalp-peptide-serum",
  "peptide-night-cream",
  "ghk-cu-pure-powder",
  "argireline-pure-powder",
  "matrixyl-pure-powder",
  "snap-8-pure-powder",
  "copper-ritual-kit",
  "expression-line-duo",
  "peptide-discovery-set",
];
