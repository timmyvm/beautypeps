import { CONCERNS } from "@/lib/constants";

/* Pure recommendation logic for the routine builder: no React, easy to test. */

export type BuilderProduct = {
  id: string;
  slug: string;
  name: string;
  subtitle: string | null;
  price: number;
  image: string;
  size: string | null;
  stock: number;
  concerns: string[];
  peptideSlugs: string[];
  skinTypes: string[];
  routineStep: string | null;
  categorySlug: string | null;
  featured: boolean;
};

export type SkinType = "normal" | "dry" | "oily" | "combination" | "sensitive" | "mature";
export type Experience = "new" | "some" | "advanced";
export type Preference = "minimal" | "complete";

export type Answers = {
  concerns: string[];
  skinType: SkinType | null;
  experience: Experience | null;
  preference: Preference | null;
};

export const BUILDER_CONCERNS = CONCERNS.map((c) => ({ value: c.slug, label: c.label }));

export const SKIN_TYPE_OPTIONS: { value: SkinType; label: string; hint: string }[] = [
  { value: "normal", label: "Balanced", hint: "Rarely tight or shiny" },
  { value: "dry", label: "Dry", hint: "Feels tight, can flake" },
  { value: "oily", label: "Oily", hint: "Shiny by midday" },
  { value: "combination", label: "Combination", hint: "Oily T-zone, drier cheeks" },
  { value: "sensitive", label: "Sensitive", hint: "Reacts easily, flushes" },
  { value: "mature", label: "Mature", hint: "Thinner, less bounce" },
];

export const EXPERIENCE_OPTIONS: { value: Experience; label: string; hint: string }[] = [
  { value: "new", label: "New to actives", hint: "Cleanser, moisturiser, maybe SPF" },
  { value: "some", label: "Some experience", hint: "I've used a serum or vitamin C" },
  { value: "advanced", label: "Advanced", hint: "I use retinoids or acids regularly" },
];

export const PREFERENCE_OPTIONS: { value: Preference; label: string; hint: string }[] = [
  { value: "minimal", label: "Keep it minimal", hint: "One peptide serum, plus what you already use" },
  { value: "complete", label: "Complete routine", hint: "Two peptide serums, morning and night" },
];

export type RoutineStep = {
  step: string;
  product?: BuilderProduct;
  generic?: string; // advice when it's not one of our products
  note?: string;
};

export type Recommendation = {
  am: RoutineStep[];
  pm: RoutineStep[];
  products: BuilderProduct[];
  matched: Record<string, string[]>; // product id -> matched concern slugs
  notes: string[];
  introOrder: BuilderProduct[];
  kit?: BuilderProduct;
};

const isCream = (p: BuilderProduct) => /cream|moistur/i.test(p.name) || /moistur/i.test(p.routineStep ?? "");

function scoreProduct(p: BuilderProduct, a: Answers) {
  const overlap = p.concerns.filter((c) => a.concerns.includes(c)).length;
  let score = overlap * 3;
  if (a.skinType && p.skinTypes.some((s) => s.toLowerCase().includes(a.skinType!) || /all/i.test(s))) score += 1;
  if (p.featured) score += 0.5;
  return score;
}

export function recommend(all: BuilderProduct[], a: Answers): Recommendation {
  // Research peptides are never part of a skincare routine; pure actives become the serum you make.
  const inStock = all.filter((p) => p.stock > 0 && p.categorySlug !== "research-peptides");
  const kits = inStock.filter((p) => p.categorySlug === "kits");
  const pool = inStock.filter((p) => p.categorySlug !== "kits");

  const findFor = (concern: string) =>
    pool
      .filter((p) => p.categorySlug === "treatments" && p.concerns.includes(concern) && !isCream(p))
      .sort((x, y) => scoreProduct(y, a) - scoreProduct(x, a))[0];

  const eye = a.concerns.includes("under-eye") ? findFor("under-eye") : undefined;
  const lip = a.concerns.includes("lips") ? findFor("lips") : undefined;
  const scalp = a.concerns.includes("hair-density") ? findFor("hair-density") : undefined;
  const cream = a.preference === "complete" || a.skinType === "dry" || a.skinType === "mature"
    ? pool.filter(isCream).sort((x, y) => scoreProduct(y, a) - scoreProduct(x, a))[0]
    : undefined;

  const special = new Set([eye, lip, scalp, cream].filter(Boolean).map((p) => p!.id));
  const serums = pool
    .filter(
      (p) =>
        !special.has(p.id) &&
        (p.categorySlug === "serums" || p.categorySlug === "pure-actives" || (!p.categorySlug && !isCream(p))),
    )
    .map((p) => ({ p, s: scoreProduct(p, a) }))
    .sort((x, y) => y.s - x.s);

  const faceConcerns = a.concerns.filter((c) => !["under-eye", "lips", "hair-density"].includes(c));
  const chosenSerums: BuilderProduct[] = [];
  if (serums.length && (faceConcerns.length > 0 || (!eye && !lip && !scalp))) {
    chosenSerums.push(serums[0].p);
    const wantSecond = a.preference === "complete" && a.experience !== "new";
    if (wantSecond) {
      const covered = new Set(serums[0].p.concerns);
      const second = serums.slice(1).find(
        ({ p }) =>
          p.concerns.some((c) => faceConcerns.includes(c) && !covered.has(c)) ||
          p.peptideSlugs.some((s) => !serums[0].p.peptideSlugs.includes(s)),
      );
      if (second && second.s > 0) chosenSerums.push(second.p);
    }
  }

  const [serumA, serumB] = chosenSerums;
  const hasCopper = (p?: BuilderProduct) => !!p?.peptideSlugs.includes("ghk-cu");

  // Put a copper serum at night when two serums are used, so vitamin C can live in the morning.
  let amSerum = serumA;
  let pmSerum = serumB ?? serumA;
  if (serumB && hasCopper(serumA) && !hasCopper(serumB)) {
    amSerum = serumB;
    pmSerum = serumA;
  }

  const am: RoutineStep[] = [{ step: "Cleanse", generic: "A gentle, low-foam cleanser, or just water in the morning." }];
  const madeFrom = (p: BuilderProduct) => p.categorySlug === "pure-actives";
  if (amSerum) {
    am.push({
      step: "Peptide serum",
      product: amSerum,
      note: madeFrom(amSerum)
        ? "The serum you make from this vial: 2–3 drops on damp skin. Its page has the arithmetic."
        : "2–3 drops on damp skin; press in.",
    });
  }
  if (eye) am.push({ step: "Eye", product: eye, note: "Tap a rice-grain amount around the orbital bone." });
  am.push({
    step: "Moisturise",
    generic: a.skinType === "oily" ? "A light gel moisturiser." : "Your usual moisturiser.",
  });
  am.push({ step: "Protect", generic: "Broad-spectrum SPF 50+, every day. The most important anti-ageing step." });
  if (lip) am.push({ step: "Lips", product: lip, note: "Apply as often as you like through the day." });

  const pm: RoutineStep[] = [{ step: "Cleanse", generic: "Double cleanse if you wore sunscreen or makeup." }];
  if (pmSerum) {
    pm.push({
      step: "Peptide serum",
      product: pmSerum,
      note: a.experience === "advanced" ? "On retinoid nights, apply the peptide first and let it absorb." : undefined,
    });
  }
  if (eye) pm.push({ step: "Eye", product: eye });
  pm.push(
    cream
      ? { step: "Night cream", product: cream, note: "Seal everything in." }
      : { step: "Moisturise", generic: "Your usual moisturiser." },
  );
  if (lip) pm.push({ step: "Lips", product: lip });
  if (scalp) pm.push({ step: "Scalp", product: scalp, note: "Massage into a dry scalp; no need to rinse." });

  const products = [...new Map([...chosenSerums, eye, lip, scalp, cream].filter(Boolean).map((p) => [p!.id, p!])).values()];

  const matched: Record<string, string[]> = {};
  for (const p of products) matched[p.id] = p.concerns.filter((c) => a.concerns.includes(c));

  const notes: string[] = [
    "Patch test each new product on your inner arm for 2–3 days before using it on your face.",
  ];
  if (a.experience === "new" || a.skinType === "sensitive") {
    notes.push("Introduce one product at a time, about two weeks apart, so you know how your skin responds.");
  }
  if (a.skinType === "sensitive") notes.push("Start every other night for the first week, then build to daily.");
  if (products.some(hasCopper)) {
    notes.push("Keep copper peptides (GHK-Cu) in a different step from L-ascorbic acid vitamin C and strong AHA/BHA exfoliants.");
  }
  if (a.experience === "advanced") {
    notes.push("Using a retinoid? Alternate nights with your PM serum at first, or keep peptides in the morning.");
  }
  notes.push("Give it 8–12 weeks of consistent use: that's the time frame most peptide studies measure.");

  const introOrder = [...products].sort((x, y) => (matched[y.id]?.length ?? 0) - (matched[x.id]?.length ?? 0));

  const kit = kits
    .map((k) => ({ k, s: scoreProduct(k, a) }))
    .filter((x) => x.s >= 3)
    .sort((x, y) => y.s - x.s)[0]?.k;

  return { am, pm, products, matched, notes, introOrder, kit };
}

/** The formulas that answer the concerns chosen so far, for the live preview beside the questions. */
export function previewMatches(all: BuilderProduct[], a: Answers, limit = 4): BuilderProduct[] {
  const pool = all.filter((p) => p.stock > 0 && p.categorySlug !== "research-peptides" && p.categorySlug !== "kits");
  if (a.concerns.length === 0) return pool.filter((p) => p.featured).concat(pool.filter((p) => !p.featured)).slice(0, limit);
  return pool
    .map((p) => ({ p, s: scoreProduct(p, a) }))
    .filter((x) => x.p.concerns.some((c) => a.concerns.includes(c)))
    .sort((x, y) => y.s - x.s)
    .slice(0, limit)
    .map((x) => x.p);
}
