import type { products } from "../db/schema";

export type SeedProduct = Omit<typeof products.$inferInsert, "id" | "categoryId"> & { categorySlug: string };

const img = (slug: string) => `/images/products/${slug}.webp`;

export const seedProducts: SeedProduct[] = [
  /* ------------------------------------------------------------------ */
  /* Serums                                                              */
  /* ------------------------------------------------------------------ */
  {
    slug: "ghk-cu-copper-peptide-serum",
    categorySlug: "serums",
    name: "GHK-Cu Copper Peptide Serum",
    subtitle: "1% copper tripeptide-1 for firmness and recovery",
    sku: "BP-SER-001",
    status: "active",
    featured: true,
    badge: "Bestseller",
    price: 6900,
    compareAtPrice: null,
    stock: 84,
    lowStockThreshold: 12,
    size: "30 mL",
    image: img("ghk-cu-copper-peptide-serum"),
    gallery: ["/images/articles/copper-peptides-ghk-cu-guide.webp", "/images/editorial/texture.webp"],
    shortDescription:
      "Our signature sapphire-blue serum with 1% GHK-Cu — the most-researched carrier peptide — to support firmness, skin renewal and a calmer, more resilient complexion.",
    description: `GHK-Cu is a naturally occurring tripeptide (glycyl-L-histidyl-L-lysine) bound to a copper ion. It was first isolated from human plasma in the 1970s, and its levels in the body decline with age. Few cosmetic peptides have as long a research history: laboratory studies show it can stimulate collagen and glycosaminoglycan synthesis, modulate the enzymes that remodel the skin's matrix, and influence a broad set of genes involved in repair.

We formulate it at **1% (10,000 ppm)** in a simple, buffered water-glycerin base so the peptide stays stable and the copper stays bound. That is why the serum is a vivid sapphire blue — the colour comes from the copper complex itself, not a dye.

On skin, the texture is a weightless, slightly cushioned fluid that absorbs in under a minute. Supporting ingredients are deliberately minimal: sodium hyaluronate and glycerin for hydration, panthenol and allantoin to comfort, and nothing that competes with the copper complex.

**What to expect.** Peptides are a slow, cumulative category. In published studies of copper peptide creams, changes in firmness and fine lines were measured over 8–12 weeks of twice-daily use. Most people notice a smoother, more comfortable feel within the first few weeks.

*A note on pairing:* copper peptides and strong direct acids (AHA/BHA peels) or L-ascorbic acid can interfere with each other at low pH. Use them at different times of day — copper at night, vitamin C in the morning works well.`,
    howToUse: `1. Cleanse and pat skin dry.
2. Apply 3–4 drops to face and neck, morning and/or evening.
3. Follow with moisturiser. In the morning, finish with SPF 50+.
4. Introduce gradually: every other night for the first week, then daily.

*Avoid using in the same routine as strong exfoliating acids or L-ascorbic acid vitamin C.*`,
    ingredients:
      "Aqua (Water), Glycerin, Copper Tripeptide-1, Propanediol, Sodium Hyaluronate, Panthenol, Betaine, Allantoin, Hydroxyethylcellulose, Pentylene Glycol, Phenoxyethanol, Ethylhexylglycerin, Citric Acid.",
    keyActives: [
      { name: "Copper Tripeptide-1 (GHK-Cu)", amount: "1%", note: "Carrier peptide studied for collagen support and skin renewal" },
      { name: "Sodium hyaluronate", amount: "0.2%", note: "Surface hydration and slip" },
      { name: "Panthenol", amount: "1%", note: "Comfort and barrier support" },
    ],
    peptideSlugs: ["ghk-cu"],
    concerns: ["firmness", "fine-lines", "barrier", "dullness"],
    skinTypes: ["All skin types", "Mature", "Dry"],
    faqs: [
      { q: "Why is the serum blue?", a: "The colour comes from the copper ion bound to the GHK peptide. A blue hue is a good visual sign that the copper complex is intact." },
      { q: "Can I use it with retinol?", a: "Yes — many people alternate them (copper one night, retinoid the next) or apply copper in the morning and retinoid at night. If your skin is sensitive, alternate rather than layer." },
      { q: "Can I use it with vitamin C?", a: "Not in the same routine if your vitamin C is L-ascorbic acid at low pH. Use vitamin C in the morning and GHK-Cu at night." },
      { q: "Will it stain my skin or pillowcase?", a: "At 1% the blue tint disappears as it absorbs. Allow a minute before applying moisturiser and you won't notice any colour." },
      { q: "How long until I see results?", a: "Most studies measured results after 8–12 weeks of consistent twice-daily use. Skin often feels smoother and more comfortable within 2–4 weeks." },
    ],
    texture: "Weightless blue fluid",
    phRange: "5.5 – 6.5",
    routineStep: "AM & PM",
    seoTitle: "GHK-Cu Copper Peptide Serum 1% | Beauty Peps",
    seoDescription: "1% GHK-Cu copper peptide serum to support firmness and skin renewal. Fragrance-free, made in Australia.",
    sortOrder: 1,
  },
  {
    slug: "matrixyl-3000-serum",
    categorySlug: "serums",
    name: "Matrixyl 3000 Collagen Peptide Serum",
    subtitle: "8% Matrixyl 3000 signal-peptide complex",
    sku: "BP-SER-002",
    status: "active",
    featured: true,
    badge: null,
    price: 5900,
    compareAtPrice: null,
    stock: 120,
    lowStockThreshold: 15,
    size: "30 mL",
    image: img("matrixyl-3000-serum"),
    gallery: ["/images/articles/matrixyl-collagen-signal-peptides.webp"],
    shortDescription:
      "A clear, silky serum built on two matrikine signal peptides that mimic the fragments skin uses to call for collagen repair.",
    description: `Matrixyl 3000 is a pairing of two palmitoylated signal peptides: **palmitoyl tripeptide-1** (Pal-GHK) and **palmitoyl tetrapeptide-7** (Pal-GQPR). Both are modelled on *matrikines* — small fragments released when collagen and other matrix proteins are broken down, which the skin reads as a signal that repair is needed.

Pal-GHK is associated with stimulating collagen and glycosaminoglycan production, while Pal-GQPR is associated with dampening the inflammatory messenger interleukin-6, which tends to rise with age and UV exposure. The palmitic acid "tail" on each peptide improves its affinity for the skin's lipid-rich surface layers.

We use the complex at **8%**, the upper end of the supplier's recommended range, in a glycerin-rich gel-serum with sodium hyaluronate and panthenol. It is colourless, fragrance-free and sits comfortably under any moisturiser.

In the ingredient supplier's own clinical work, twice-daily use over two months was associated with measurable reductions in wrinkle depth and improvements in elasticity. As with all peptides, think in months, not days.`,
    howToUse: `1. After cleansing (and toner, if you use one), apply 3–4 drops to face, neck and décolletage.
2. Press in gently; follow with moisturiser.
3. Use morning and evening. Finish with SPF in the morning.`,
    ingredients:
      "Aqua (Water), Glycerin, Butylene Glycol, Propanediol, Sodium Hyaluronate, Polysorbate 20, Palmitoyl Tripeptide-1, Palmitoyl Tetrapeptide-7, Carbomer, Panthenol, Allantoin, Xanthan Gum, Phenoxyethanol, Ethylhexylglycerin, Sodium Hydroxide.",
    keyActives: [
      { name: "Matrixyl 3000 (Pal-Tripeptide-1 + Pal-Tetrapeptide-7)", amount: "8% complex", note: "Matrikine signal peptides" },
      { name: "Sodium hyaluronate", amount: "0.3%", note: "Multi-weight hydration" },
      { name: "Panthenol", amount: "1%", note: "Soothing humectant" },
    ],
    peptideSlugs: ["palmitoyl-tripeptide-1", "palmitoyl-tetrapeptide-7"],
    concerns: ["fine-lines", "firmness"],
    skinTypes: ["All skin types", "Mature", "Sensitive"],
    faqs: [
      { q: "Is Matrixyl 3000 the same as Matrixyl?", a: "No. Original Matrixyl is palmitoyl pentapeptide-4 (Pal-KTTKS). Matrixyl 3000 is a different pairing of two peptides. They work in a similar family of ways and can be used together." },
      { q: "Can I use it with retinol or vitamin C?", a: "Yes. Signal peptides are generally compatible with retinoids, vitamin C, niacinamide and hyaluronic acid. Apply the thinnest texture first." },
      { q: "Is it suitable for sensitive skin?", a: "It is fragrance-free and formulated without essential oils. As always, patch test first." },
      { q: "When will I see a difference?", a: "Plan on 8–12 weeks of twice-daily use for changes in the look of fine lines." },
    ],
    texture: "Silky gel-serum",
    phRange: "5.5 – 6.5",
    routineStep: "AM & PM",
    seoTitle: "Matrixyl 3000 Serum 8% | Collagen Peptide Serum | Beauty Peps",
    seoDescription: "8% Matrixyl 3000 signal-peptide serum with palmitoyl tripeptide-1 and palmitoyl tetrapeptide-7.",
    sortOrder: 2,
  },
  {
    slug: "argireline-10-serum",
    categorySlug: "serums",
    name: "Argireline 10% Expression Line Serum",
    subtitle: "Acetyl hexapeptide-8 for forehead, frown and crow's-feet lines",
    sku: "BP-SER-003",
    status: "active",
    featured: true,
    badge: "Bestseller",
    price: 5500,
    compareAtPrice: null,
    stock: 96,
    lowStockThreshold: 15,
    size: "30 mL",
    image: img("argireline-10-serum"),
    gallery: ["/images/articles/argireline-neuropeptides-explained.webp"],
    shortDescription:
      "A 10% Argireline solution that targets the lines formed by repeated expression — the topical, needle-free approach to softening movement lines.",
    description: `Argireline (acetyl hexapeptide-8, formerly listed as acetyl hexapeptide-3) is a short synthetic peptide modelled on part of SNAP-25, a protein involved in the release of neurotransmitters at the nerve–muscle junction. By competing for a place in the SNARE complex, it is thought to modestly reduce the strength of repeated micro-contractions that etch expression lines into skin over time.

It is **not** a topical equivalent of injectable neuromodulators — the effect is far gentler and depends on how much peptide reaches the target. What it offers is a well-tolerated way to soften the *look* of dynamic lines on the forehead, between the brows and around the eyes.

We use a **10% Argireline solution** (the trade solution contains the peptide at a fixed concentration), within the range used in published studies. The base is a clean, fast-absorbing water-glycerin serum with hyaluronic acid and betaine.

In the original published study and the manufacturer's trials, twice-daily application over around 30 days was associated with reductions in wrinkle depth around the eyes.`,
    howToUse: `1. Apply 2–3 drops to areas of expression — forehead, between the brows, crow's-feet and smile lines.
2. Use morning and evening, before moisturiser.
3. Can be layered under or over other serums.`,
    ingredients:
      "Aqua (Water), Glycerin, Acetyl Hexapeptide-8, Propanediol, Sodium Hyaluronate, Betaine, Pentylene Glycol, Hydroxyethylcellulose, Allantoin, Phenoxyethanol, Ethylhexylglycerin, Citric Acid.",
    keyActives: [
      { name: "Argireline solution (Acetyl Hexapeptide-8)", amount: "10%", note: "Neurotransmitter-inhibiting peptide" },
      { name: "Betaine", amount: "2%", note: "Osmolyte hydration" },
      { name: "Sodium hyaluronate", amount: "0.2%", note: "Hydration" },
    ],
    peptideSlugs: ["acetyl-hexapeptide-8"],
    concerns: ["expression-lines", "fine-lines"],
    skinTypes: ["All skin types"],
    faqs: [
      { q: "Is this like Botox in a bottle?", a: "No. Argireline works on a related pathway, but topically its effect is much milder. Think of it as softening the look of expression lines over weeks, not freezing movement." },
      { q: "Can I use it if I have injectables?", a: "Yes. Many people use Argireline between treatments. Ask your injector if you have recently had a procedure." },
      { q: "Can I combine it with SNAP-8?", a: "Yes — our Expression Line Duo pairs them. They work on the same pathway in complementary ways." },
      { q: "Can I use it around the eyes?", a: "Yes, on the orbital bone and crow's-feet area. Avoid the eyelid and lash line." },
    ],
    texture: "Clear, fast-absorbing serum",
    phRange: "5.0 – 6.0",
    routineStep: "AM & PM",
    seoTitle: "Argireline 10% Serum | Expression Line Peptide | Beauty Peps",
    seoDescription: "10% Argireline (acetyl hexapeptide-8) serum to soften the look of forehead and crow's-feet lines.",
    sortOrder: 3,
  },
  {
    slug: "snap-8-serum",
    categorySlug: "serums",
    name: "SNAP-8 Octapeptide Serum",
    subtitle: "Acetyl octapeptide-3, the extended Argireline",
    sku: "BP-SER-004",
    status: "active",
    featured: false,
    badge: null,
    price: 6200,
    compareAtPrice: null,
    stock: 6,
    lowStockThreshold: 10,
    size: "30 mL",
    image: img("snap-8-serum"),
    gallery: [],
    shortDescription:
      "An eight-amino-acid evolution of Argireline that targets the same expression-line pathway — ideal on its own or layered with our Argireline serum.",
    description: `SNAP-8 (acetyl octapeptide-3) extends the Argireline sequence by two amino acids. Like Argireline, it mimics the N-terminal end of the SNAP-25 protein and is designed to compete for a position in the SNARE complex that drives neurotransmitter release, modestly reducing the intensity of repeated facial contractions.

The ingredient manufacturer reports that, in its own comparison, SNAP-8 produced a greater reduction in wrinkle depth than Argireline at the same concentration. Independent data are limited, so we present that as supplier data rather than settled fact — but the two peptides are well tolerated and frequently used together.

We formulate SNAP-8 at **10% of the trade solution** in a lightweight, fragrance-free serum with hyaluronic acid. It is particularly suited to the forehead and around the eyes.`,
    howToUse: `1. Apply 2–3 drops to expression areas morning and evening.
2. Press in and allow to absorb before moisturiser.
3. Pairs well with Argireline 10% — apply one after the other, or alternate AM/PM.`,
    ingredients:
      "Aqua (Water), Glycerin, Acetyl Octapeptide-3, Propanediol, Sodium Hyaluronate, Pentylene Glycol, Hydroxyethylcellulose, Panthenol, Phenoxyethanol, Ethylhexylglycerin, Citric Acid.",
    keyActives: [
      { name: "SNAP-8 solution (Acetyl Octapeptide-3)", amount: "10%", note: "Neurotransmitter-inhibiting peptide" },
      { name: "Sodium hyaluronate", amount: "0.2%", note: "Hydration" },
    ],
    peptideSlugs: ["acetyl-octapeptide-3"],
    concerns: ["expression-lines", "fine-lines"],
    skinTypes: ["All skin types"],
    faqs: [
      { q: "SNAP-8 or Argireline — which should I choose?", a: "If you're new to expression-line peptides, Argireline has the longer track record. SNAP-8 is a good next step, and many people use both." },
      { q: "Can I use it with retinoids?", a: "Yes. Apply SNAP-8 first, wait a minute, then your retinoid or moisturiser." },
      { q: "Is it safe for sensitive skin?", a: "It is fragrance-free and generally well tolerated. Patch test before first use." },
    ],
    texture: "Light, clear serum",
    phRange: "5.0 – 6.0",
    routineStep: "AM & PM",
    seoTitle: "SNAP-8 Serum | Acetyl Octapeptide-3 | Beauty Peps",
    seoDescription: "SNAP-8 acetyl octapeptide-3 serum for the look of expression lines. Fragrance-free.",
    sortOrder: 4,
  },
  {
    slug: "multi-peptide-complex",
    categorySlug: "serums",
    name: "Multi-Peptide 12 Complex Serum",
    subtitle: "Eight peptides, 12% total peptide complexes, one step",
    sku: "BP-SER-005",
    status: "active",
    featured: true,
    badge: "Lab favourite",
    price: 9800,
    compareAtPrice: null,
    stock: 58,
    lowStockThreshold: 10,
    size: "50 mL",
    image: img("multi-peptide-complex"),
    gallery: ["/images/editorial/texture.webp", "/images/editorial/lab.webp"],
    shortDescription:
      "Our most complete formula: eight signal and neurotransmitter-inhibiting peptides at 12% combined complexes, for people who want one peptide step that covers everything.",
    description: `Different peptides work on different parts of the ageing picture, so we built a serum that combines the strongest-evidenced options from each class rather than relying on a single hero.

**Signal peptides** — palmitoyl pentapeptide-4 (Matrixyl), palmitoyl tripeptide-1 and palmitoyl tetrapeptide-7 (Matrixyl 3000), palmitoyl tripeptide-38 (Matrixyl synthe'6) and palmitoyl tripeptide-5 (SYN-COLL) — are matrikine mimics that target collagen support from several angles.

**Neurotransmitter-inhibiting peptides** — acetyl hexapeptide-8 (Argireline) and pentapeptide-18 (Leuphasyl) — address expression lines via complementary points on the nerve–muscle signalling pathway. Acetyl tetrapeptide-5 adds a little help for puffiness when you take it up to the orbital bone.

Together the peptide complexes total **12%** of the formula. The champagne-tinted base is a lightly cushioned serum with sodium hyaluronate, squalane and panthenol so it can be used as the only treatment step for a minimalist routine — or under a moisturiser if your skin is drier.

There is no copper in this formula, so it pairs freely with vitamin C, retinoids and exfoliating acids.`,
    howToUse: `1. Apply 1–2 pumps to face, neck and décolletage after cleansing.
2. Use morning and evening.
3. Follow with moisturiser if needed, and SPF in the morning.`,
    ingredients:
      "Aqua (Water), Glycerin, Butylene Glycol, Propanediol, Squalane, Acetyl Hexapeptide-8, Pentapeptide-18, Palmitoyl Pentapeptide-4, Palmitoyl Tripeptide-1, Palmitoyl Tetrapeptide-7, Palmitoyl Tripeptide-38, Palmitoyl Tripeptide-5, Acetyl Tetrapeptide-5, Sodium Hyaluronate, Panthenol, Polysorbate 20, Carbomer, Allantoin, Tocopherol, Xanthan Gum, Phenoxyethanol, Ethylhexylglycerin, Sodium Hydroxide.",
    keyActives: [
      { name: "Signal peptide complexes (5 peptides)", amount: "8%", note: "Matrixyl, Matrixyl 3000, Matrixyl synthe'6, SYN-COLL" },
      { name: "Neurotransmitter-inhibiting peptides", amount: "3%", note: "Argireline + Leuphasyl" },
      { name: "Acetyl tetrapeptide-5", amount: "1%", note: "Supports the look of puffiness" },
      { name: "Squalane", amount: "2%", note: "Lightweight emollient" },
    ],
    peptideSlugs: [
      "palmitoyl-pentapeptide-4",
      "palmitoyl-tripeptide-1",
      "palmitoyl-tetrapeptide-7",
      "palmitoyl-tripeptide-38",
      "palmitoyl-tripeptide-5",
      "acetyl-hexapeptide-8",
      "pentapeptide-18",
      "acetyl-tetrapeptide-5",
    ],
    concerns: ["fine-lines", "expression-lines", "firmness"],
    skinTypes: ["All skin types", "Mature"],
    faqs: [
      { q: "Do I need any other peptide products with this?", a: "No — it's designed as a single peptide step. Some people add GHK-Cu at night for an extra carrier peptide." },
      { q: "Is 12% too strong?", a: "Peptides don't work like acids; higher concentrations don't cause irritation in the same way. 12% refers to the combined trade complexes, which are themselves dilute solutions of each peptide." },
      { q: "Can I use it with vitamin C and retinol?", a: "Yes. There is no copper in this formula, so it's compatible with L-ascorbic acid, retinoids and AHAs." },
      { q: "How long will a bottle last?", a: "At 1–2 pumps twice daily, a 50 mL bottle lasts around 10–12 weeks — roughly the length of a full peptide 'course'." },
    ],
    texture: "Cushiony champagne serum",
    phRange: "5.5 – 6.5",
    routineStep: "AM & PM",
    seoTitle: "Multi-Peptide Serum | 8 Peptides, 12% Complex | Beauty Peps",
    seoDescription: "Multi-peptide serum combining Matrixyl, Matrixyl 3000, Argireline, Leuphasyl and more in one step.",
    sortOrder: 5,
  },
  {
    slug: "leuphasyl-syn-ake-serum",
    categorySlug: "serums",
    name: "Leuphasyl + Syn-Ake Smoothing Serum",
    subtitle: "Two complementary expression-line peptides",
    sku: "BP-SER-006",
    status: "active",
    featured: false,
    badge: "New",
    price: 7200,
    compareAtPrice: null,
    stock: 40,
    lowStockThreshold: 10,
    size: "30 mL",
    image: img("leuphasyl-syn-ake-serum"),
    gallery: [],
    shortDescription:
      "Pentapeptide-18 and a synthetic tripeptide modelled on temple viper venom, working at two different points of the nerve–muscle signal to smooth the look of expression lines.",
    description: `Most expression-line peptides — Argireline and SNAP-8 — act on the SNARE complex inside the nerve ending. This serum targets the pathway from two other directions.

**Leuphasyl (pentapeptide-18)** is modelled on enkephalins, the body's own calming neuropeptides. It is designed to reduce nerve-cell excitability, so fewer signals are sent to the muscle in the first place.

**Syn-Ake (dipeptide diaminobutyroyl benzylamide diacetate)** is a small synthetic peptide modelled on a component of temple viper venom (no venom is used). It is designed to act at the muscle side of the junction, on the acetylcholine receptor.

Because they act at different points, they are often combined — with each other and with Argireline. Evidence comes primarily from the ingredient manufacturers' own studies, so we describe benefits conservatively: a gradual softening of the look of forehead and crow's-feet lines with consistent use.`,
    howToUse: `1. Apply 2–3 drops to forehead, between the brows and around the eyes, morning and evening.
2. Layer before Argireline or SNAP-8 if you use them.
3. Follow with moisturiser.`,
    ingredients:
      "Aqua (Water), Glycerin, Butylene Glycol, Pentapeptide-18, Dipeptide Diaminobutyroyl Benzylamide Diacetate, Propanediol, Sodium Hyaluronate, Panthenol, Hydroxyethylcellulose, Phenoxyethanol, Ethylhexylglycerin, Citric Acid.",
    keyActives: [
      { name: "Leuphasyl solution (Pentapeptide-18)", amount: "5%", note: "Enkephalin-like neuropeptide" },
      { name: "Syn-Ake (Dipeptide Diaminobutyroyl Benzylamide Diacetate)", amount: "4%", note: "Acetylcholine-receptor antagonist" },
    ],
    peptideSlugs: ["pentapeptide-18", "dipeptide-diaminobutyroyl-benzylamide-diacetate"],
    concerns: ["expression-lines"],
    skinTypes: ["All skin types"],
    faqs: [
      { q: "Does Syn-Ake contain snake venom?", a: "No. It is a fully synthetic peptide designed to mimic the activity of a molecule found in temple viper venom." },
      { q: "Can I use it with Argireline?", a: "Yes — the combination is common because the peptides act at different points of the same signalling pathway." },
      { q: "Will it change my facial expressions?", a: "No. Topical peptides have a subtle effect on the look of lines over weeks; they won't restrict movement." },
    ],
    texture: "Fluid serum",
    phRange: "5.0 – 6.5",
    routineStep: "AM & PM",
    seoTitle: "Leuphasyl + Syn-Ake Serum | Expression Line Peptides | Beauty Peps",
    seoDescription: "Pentapeptide-18 and Syn-Ake serum to smooth the look of expression lines.",
    sortOrder: 6,
  },
  {
    slug: "nonapeptide-brightening-serum",
    categorySlug: "serums",
    name: "Nonapeptide-1 Brightening Serum",
    subtitle: "Melanostatine-5 with 4% niacinamide for even tone",
    sku: "BP-SER-007",
    status: "active",
    featured: false,
    badge: "New",
    price: 6400,
    compareAtPrice: null,
    stock: 70,
    lowStockThreshold: 12,
    size: "30 mL",
    image: img("nonapeptide-brightening-serum"),
    gallery: [],
    shortDescription:
      "A pearlescent serum pairing nonapeptide-1, a pigment-signalling peptide, with niacinamide to help visibly even out tone and dark spots.",
    description: `Uneven tone starts with signalling. When skin is exposed to UV or inflammation, it releases α-MSH, a hormone that binds to the MC1R receptor on melanocytes and switches on melanin production.

**Nonapeptide-1** (traded as Melanostatine-5) is a biomimetic peptide designed to compete with α-MSH at that receptor, quietening the signal before pigment is made. It works upstream of tyrosinase-inhibiting brighteners, which makes it a useful partner to them.

We pair it with **4% niacinamide**, which works at a different stage — it reduces the transfer of finished pigment from melanocytes to the surrounding skin cells — plus sodium hyaluronate and a touch of squalane for a soft, milky finish.

Pigment is slow to change; consistent use alongside daily sunscreen for 8–12 weeks is where tone-evening ingredients show their value. Without sunscreen, no brightening serum can keep up with UV.`,
    howToUse: `1. Apply 3–4 drops to the whole face, focusing on areas of uneven tone, morning and evening.
2. Follow with moisturiser.
3. Daily SPF 50+ is essential when treating pigmentation.`,
    ingredients:
      "Aqua (Water), Niacinamide, Glycerin, Propanediol, Squalane, Nonapeptide-1, Sodium Hyaluronate, Polyglyceryl-4 Caprate, Panthenol, Allantoin, Xanthan Gum, Sodium Gluconate, Phenoxyethanol, Ethylhexylglycerin, Citric Acid.",
    keyActives: [
      { name: "Melanostatine-5 solution (Nonapeptide-1)", amount: "5%", note: "MC1R-targeting biomimetic peptide" },
      { name: "Niacinamide", amount: "4%", note: "Reduces pigment transfer, supports barrier" },
      { name: "Squalane", amount: "1%", note: "Softening emollient" },
    ],
    peptideSlugs: ["nonapeptide-1"],
    concerns: ["dark-spots", "dullness"],
    skinTypes: ["All skin types", "Oily", "Combination"],
    faqs: [
      { q: "Can I use it with vitamin C?", a: "Yes. Vitamin C and nonapeptide-1 target different steps in pigment formation and work well together." },
      { q: "Is niacinamide at 4% irritating?", a: "4% is a well-tolerated level for most skin types. If you are niacinamide-sensitive, start every other day." },
      { q: "Is it safe for melasma?", a: "Pigmentation conditions such as melasma should be assessed by a dermatologist. This is a cosmetic brightening serum, not a treatment." },
    ],
    texture: "Pearlescent milky serum",
    phRange: "5.5 – 6.5",
    routineStep: "AM & PM",
    seoTitle: "Nonapeptide-1 Brightening Serum | Beauty Peps",
    seoDescription: "Nonapeptide-1 (Melanostatine-5) and niacinamide serum for visibly even skin tone.",
    sortOrder: 7,
  },

  /* ------------------------------------------------------------------ */
  /* Treatments                                                          */
  /* ------------------------------------------------------------------ */
  {
    slug: "eye-peptide-gel",
    categorySlug: "treatments",
    name: "Eye Peptide Gel",
    subtitle: "Eyeseryl + Haloxyl for puffiness and dark circles",
    sku: "BP-TRT-001",
    status: "active",
    featured: true,
    badge: null,
    price: 5800,
    compareAtPrice: null,
    stock: 65,
    lowStockThreshold: 10,
    size: "15 mL",
    image: img("eye-peptide-gel"),
    gallery: ["/images/articles/peptides-for-eyes.webp"],
    shortDescription:
      "A cooling, featherlight gel combining acetyl tetrapeptide-5 and the Haloxyl complex with caffeine to help the look of puffiness and shadows.",
    description: `The under-eye area has its own set of problems: fluid that pools overnight, thin skin that shows the blood vessels beneath, and haem pigments from leaked red blood cells that tint the area blue-brown.

**Acetyl tetrapeptide-5** (Eyeseryl) is designed to help reduce the look of puffiness by supporting fluid drainage and reducing glycation-related stiffening of the area. **Haloxyl** combines palmitoyl tripeptide-1 and palmitoyl tetrapeptide-7 with chrysin and N-hydroxysuccinimide — ingredients chosen to help clear the haem by-products that contribute to dark circles while supporting the skin's matrix.

We add **caffeine** for an immediate de-puffing effect and sodium hyaluronate for plumping hydration, in an airless pump that keeps the gel fresh and dispenses exactly the right amount.

The gel feels instantly cooling (more so if you keep it in the fridge) and sits perfectly under concealer.`,
    howToUse: `1. Dispense half a pump onto your ring finger.
2. Tap gently along the orbital bone from inner to outer corner — morning and night.
3. Keep away from the lash line and eyelid. For an extra de-puffing boost, store in the fridge.`,
    ingredients:
      "Aqua (Water), Glycerin, Butylene Glycol, Acetyl Tetrapeptide-5, Caffeine, Steareth-20, N-Hydroxysuccinimide, Chrysin, Palmitoyl Tetrapeptide-7, Palmitoyl Tripeptide-1, Sodium Hyaluronate, Panthenol, Carbomer, Allantoin, Phenoxyethanol, Ethylhexylglycerin, Sodium Hydroxide.",
    keyActives: [
      { name: "Eyeseryl solution (Acetyl Tetrapeptide-5)", amount: "5%", note: "Supports the look of puffiness" },
      { name: "Haloxyl complex", amount: "2%", note: "Pal-tripeptide-1 + Pal-tetrapeptide-7 + chrysin + NHS" },
      { name: "Caffeine", amount: "1.5%", note: "Immediate de-puffing" },
    ],
    peptideSlugs: ["acetyl-tetrapeptide-5", "palmitoyl-tripeptide-1", "palmitoyl-tetrapeptide-7"],
    concerns: ["under-eye", "fine-lines"],
    skinTypes: ["All skin types", "Sensitive"],
    faqs: [
      { q: "Will it help genetic dark circles?", a: "Dark circles caused by bone structure or hereditary pigmentation respond less to topicals. Peptides and caffeine help most with puffiness and vascular-type shadows." },
      { q: "Can I use it under makeup?", a: "Yes — it absorbs quickly and leaves a smooth, non-greasy base for concealer." },
      { q: "Is it ophthalmologist tested?", a: "The formula is fragrance-free and designed for the delicate eye area, but always patch test and avoid direct contact with the eye." },
      { q: "Can contact lens wearers use it?", a: "Yes, apply along the orbital bone and keep away from the lash line." },
    ],
    texture: "Cooling clear gel",
    phRange: "5.5 – 6.5",
    routineStep: "AM & PM",
    seoTitle: "Eye Peptide Gel | Eyeseryl + Haloxyl + Caffeine | Beauty Peps",
    seoDescription: "Cooling eye gel with acetyl tetrapeptide-5, Haloxyl and caffeine for puffiness and dark circles.",
    sortOrder: 8,
  },
  {
    slug: "lip-peptide-plumping-balm",
    categorySlug: "treatments",
    name: "Lip Peptide Plumping Balm",
    subtitle: "Peptide lip treatment with a sheer rose tint",
    sku: "BP-TRT-002",
    status: "active",
    featured: false,
    badge: null,
    price: 3600,
    compareAtPrice: null,
    stock: 110,
    lowStockThreshold: 15,
    size: "8 mL",
    image: img("lip-peptide-plumping-balm"),
    gallery: [],
    shortDescription:
      "A cushiony, non-sticky balm with palmitoyl tripeptide-1 and palmitoyl tripeptide-38 to help lips look fuller, smoother and more defined over time.",
    description: `Lips lose volume and definition with age as collagen and hyaluronic acid decline — and because lip skin has very few oil glands, it dries out easily.

This balm combines two signal peptides: **palmitoyl tripeptide-1**, delivered in a lip-specific complex designed to support collagen and hyaluronic acid, and **palmitoyl tripeptide-38** (Matrixyl synthe'6), which targets several matrix components at once. Squalane and shea butter cushion and protect, while a sheer rose tint gives a your-lips-but-better finish.

There is no stinging "plumper" (no capsicum or menthol), so it is comfortable enough to wear all day and overnight.`,
    howToUse: `1. Apply generously to clean lips with the doe-foot applicator.
2. Reapply throughout the day and as the last step at night.
3. Can be worn alone or over lipstick for a glossy finish.`,
    ingredients:
      "Caprylic/Capric Triglyceride, Ethylene/Propylene/Styrene Copolymer, Butylene/Ethylene/Styrene Copolymer, Hydrogenated Polyisobutene, Squalane, Tribehenin, Butyrospermum Parkii (Shea) Butter, Palmitoyl Tripeptide-1, Palmitoyl Tripeptide-38, Sodium Hyaluronate, Tocopherol, Aroma (Flavour), CI 77491 (Iron Oxides), CI 15850 (Red 7).",
    keyActives: [
      { name: "Palmitoyl tripeptide-1 lip complex", amount: "1%", note: "Signal peptide for lip volume support" },
      { name: "Palmitoyl tripeptide-38", amount: "2% solution", note: "Matrixyl synthe'6" },
      { name: "Squalane + shea", amount: "—", note: "Cushioning moisture" },
    ],
    peptideSlugs: ["palmitoyl-tripeptide-1", "palmitoyl-tripeptide-38"],
    concerns: ["lips"],
    skinTypes: ["All skin types"],
    faqs: [
      { q: "Does it tingle?", a: "No — it contains no capsicum, cinnamon or menthol. The plumping comes from gradual peptide support and instant gloss, not irritation." },
      { q: "How long until I see a difference?", a: "The glossy, cushioned effect is immediate. Supplier studies on lip peptides measured changes in volume and definition after around four weeks." },
      { q: "Is the tint buildable?", a: "It's a sheer rose that adapts to your natural lip colour. Layer for a little more." },
    ],
    texture: "Cushiony, non-sticky gloss balm",
    phRange: "Anhydrous",
    routineStep: "AM & PM",
    seoTitle: "Lip Peptide Plumping Balm | Beauty Peps",
    seoDescription: "Peptide lip balm with palmitoyl tripeptide-1 and palmitoyl tripeptide-38 for fuller-looking lips.",
    sortOrder: 9,
  },
  {
    slug: "scalp-peptide-serum",
    categorySlug: "treatments",
    name: "Scalp Peptide Serum",
    subtitle: "Copper + biotinoyl tripeptide-1 for fuller-looking hair",
    sku: "BP-TRT-003",
    status: "active",
    featured: false,
    badge: null,
    price: 7900,
    compareAtPrice: null,
    stock: 45,
    lowStockThreshold: 10,
    size: "60 mL",
    image: img("scalp-peptide-serum"),
    gallery: [],
    shortDescription:
      "A light, non-greasy leave-on scalp serum with biotinoyl tripeptide-1, GHK-Cu and caffeine to support a healthy scalp environment for fuller-looking hair.",
    description: `Hair density is influenced by what happens at the follicle — anchoring, micro-circulation and the length of the growth phase.

**Biotinoyl tripeptide-1** (the peptide in the Procapil complex, alongside apigenin and oleanolic acid) is a biotin-linked GHK fragment designed to support follicle anchoring. **GHK-Cu** has been studied in laboratory models for its effect on follicle size and the dermal papilla. **Caffeine** and **niacinamide** round out a formula focused on scalp health.

The serum is pale aqua (from the copper peptide), water-light and dries down without residue, so it can be used on clean or second-day hair.

Hair cycles are long. Give any scalp treatment at least three to four months of consistent daily use before judging results, and see a doctor if you are experiencing sudden or patchy hair loss.`,
    howToUse: `1. Part dry or towel-dried hair into sections.
2. Apply the dropper directly to the scalp along each part (about 1 mL total).
3. Massage for 1–2 minutes. Do not rinse. Use once daily.`,
    ingredients:
      "Aqua (Water), Propanediol, Glycerin, Biotinoyl Tripeptide-1, Apigenin, Oleanolic Acid, Copper Tripeptide-1, Caffeine, Niacinamide, Panthenol, PEG-40 Hydrogenated Castor Oil, Butylene Glycol, Phenoxyethanol, Ethylhexylglycerin, Citric Acid.",
    keyActives: [
      { name: "Procapil complex (Biotinoyl Tripeptide-1 + apigenin + oleanolic acid)", amount: "3%", note: "Follicle-anchoring support" },
      { name: "Copper Tripeptide-1 (GHK-Cu)", amount: "0.1%", note: "Carrier peptide" },
      { name: "Caffeine", amount: "1%", note: "Scalp stimulation" },
      { name: "Niacinamide", amount: "2%", note: "Scalp barrier support" },
    ],
    peptideSlugs: ["biotinoyl-tripeptide-1", "ghk-cu"],
    concerns: ["hair-density"],
    skinTypes: ["All skin types"],
    faqs: [
      { q: "Will it make my hair greasy?", a: "No. It's a water-light formula that dries down clean; you can apply it to styled hair." },
      { q: "Can I use it with minoxidil?", a: "Many people do, at different times of day. Speak to your doctor or pharmacist if you use prescription treatments." },
      { q: "How long before I see results?", a: "Hair growth cycles are long — allow 3–4 months of daily use." },
      { q: "Can I use it on my brows?", a: "Yes, a small amount brushed along the brow is fine. Keep away from the eyes." },
    ],
    texture: "Water-light aqua serum",
    phRange: "5.5 – 6.5",
    routineStep: "PM (or AM)",
    seoTitle: "Scalp Peptide Serum | Biotinoyl Tripeptide-1 + GHK-Cu | Beauty Peps",
    seoDescription: "Leave-on scalp serum with biotinoyl tripeptide-1, copper peptide and caffeine for fuller-looking hair.",
    sortOrder: 10,
  },
  {
    slug: "peptide-night-cream",
    categorySlug: "treatments",
    name: "Peptide Night Cream",
    subtitle: "Three signal peptides in a ceramide barrier cream",
    sku: "BP-TRT-004",
    status: "active",
    featured: false,
    badge: null,
    price: 8400,
    compareAtPrice: null,
    stock: 52,
    lowStockThreshold: 10,
    size: "50 mL",
    image: img("peptide-night-cream"),
    gallery: ["/images/editorial/texture.webp"],
    shortDescription:
      "A rich-but-breathable night cream with SYN-COLL, Matrixyl and Matrixyl synthe'6 in a ceramide, cholesterol and squalane base that restores the barrier overnight.",
    description: `Night is when skin does most of its repair work, and it is also when it loses the most water. This cream is designed for both.

The peptide trio — **palmitoyl tripeptide-5** (SYN-COLL), **palmitoyl pentapeptide-4** (Matrixyl) and **palmitoyl tripeptide-38** (Matrixyl synthe'6) — targets collagen support through three distinct signals.

The base mirrors the skin's own lipid barrier: **ceramides NP, AP and EOP**, **cholesterol** and **phytosphingosine**, cushioned with squalane and shea butter. Niacinamide and panthenol support barrier recovery, which makes this an ideal partner on nights you use retinoids or exfoliants.

The texture is a whipped cream that melts on contact, leaving skin comfortable rather than greasy by morning.`,
    howToUse: `1. As the last step of your evening routine, warm a pea-sized amount between fingertips.
2. Press over face and neck.
3. On retinoid nights, apply after your retinoid to cushion it — or before it ("sandwich") if your skin is very sensitive.`,
    ingredients:
      "Aqua (Water), Caprylic/Capric Triglyceride, Glycerin, Squalane, Cetearyl Alcohol, Butyrospermum Parkii (Shea) Butter, Glyceryl Stearate, Niacinamide, Ceramide NP, Ceramide AP, Ceramide EOP, Phytosphingosine, Cholesterol, Palmitoyl Tripeptide-5, Palmitoyl Pentapeptide-4, Palmitoyl Tripeptide-38, Panthenol, Sodium Hyaluronate, Tocopherol, Sodium Lauroyl Lactylate, Carbomer, Xanthan Gum, Phenoxyethanol, Ethylhexylglycerin.",
    keyActives: [
      { name: "SYN-COLL (Palmitoyl Tripeptide-5)", amount: "2.5% solution", note: "TGF-β pathway signal peptide" },
      { name: "Matrixyl (Palmitoyl Pentapeptide-4)", amount: "3% solution", note: "Collagen-fragment signal peptide" },
      { name: "Matrixyl synthe'6 (Palmitoyl Tripeptide-38)", amount: "2% solution", note: "Multi-matrix signal peptide" },
      { name: "Ceramide complex + cholesterol", amount: "—", note: "Barrier lipids" },
    ],
    peptideSlugs: ["palmitoyl-tripeptide-5", "palmitoyl-pentapeptide-4", "palmitoyl-tripeptide-38"],
    concerns: ["barrier", "firmness", "fine-lines"],
    skinTypes: ["Dry", "Mature", "Sensitive", "Combination"],
    faqs: [
      { q: "Is it too heavy for combination skin?", a: "The whipped texture absorbs well. If you're oily in the T-zone, apply mainly to cheeks and neck." },
      { q: "Can I use it in the morning?", a: "Yes, if your skin is dry — just follow with SPF." },
      { q: "Does it contain fragrance?", a: "No. It's fragrance-free and essential-oil-free." },
    ],
    texture: "Whipped, melting cream",
    phRange: "5.5 – 6.0",
    routineStep: "PM",
    seoTitle: "Peptide Night Cream with Ceramides | Beauty Peps",
    seoDescription: "Peptide night cream with SYN-COLL, Matrixyl and Matrixyl synthe'6 in a ceramide barrier base.",
    sortOrder: 11,
  },

  /* ------------------------------------------------------------------ */
  /* Pure actives                                                        */
  /* ------------------------------------------------------------------ */
  {
    slug: "ghk-cu-pure-powder",
    categorySlug: "pure-actives",
    name: "GHK-Cu Pure Peptide Powder",
    subtitle: "Cosmetic-grade copper tripeptide-1, lyophilised",
    sku: "BP-ACT-001",
    status: "active",
    featured: false,
    badge: null,
    price: 5900,
    compareAtPrice: null,
    stock: 30,
    lowStockThreshold: 8,
    size: "1 g",
    image: img("ghk-cu-pure-powder"),
    gallery: ["/images/editorial/actives.webp", "/images/articles/storing-peptide-powders.webp"],
    shortDescription:
      "Freeze-dried, cosmetic-grade GHK-Cu for formulators making their own copper peptide serums. Water soluble; certificate of analysis supplied.",
    description: `This is the same copper tripeptide-1 we use in our serum, supplied as a fine royal-blue lyophilised powder in a crimp-sealed amber vial.

**Specifications**
- INCI: Copper Tripeptide-1
- Appearance: blue to violet-blue powder
- Purity: ≥ 95% (HPLC), batch certificate of analysis included
- Solubility: freely soluble in water

**Formulation notes**
GHK-Cu is water soluble and should be added to the water phase or in the cool-down phase **below 40 °C**. Typical cosmetic use levels range from about **0.05% to 1%**. Keep the final pH between roughly **5.0 and 7.0**; below about pH 4.5 the copper can dissociate from the peptide (the solution shifts from blue towards green). Avoid strong chelators such as high levels of EDTA, and avoid formulating alongside L-ascorbic acid or strong reducing agents.

**For cosmetic formulation and external use only.** Not for injection or ingestion. Formulators are responsible for the safety and stability of finished products.`,
    howToUse: `1. Weigh the required amount with a 0.001 g precision scale.
2. Dissolve fully in distilled water (it dissolves readily at room temperature).
3. Add to your formula in the cool-down phase below 40 °C and check final pH (target 5.0–7.0).
4. Reseal the vial tightly and store at 2–8 °C, away from light and moisture.`,
    ingredients: "Copper Tripeptide-1.",
    keyActives: [{ name: "Copper Tripeptide-1", amount: "1 g", note: "≥ 95% purity (HPLC)" }],
    peptideSlugs: ["ghk-cu"],
    concerns: ["firmness", "fine-lines", "hair-density"],
    skinTypes: [],
    faqs: [
      { q: "How much serum will 1 g make?", a: "At 1%, 1 g of powder makes 100 mL of finished serum. At 0.5% it makes 200 mL." },
      { q: "How should I store it?", a: "Unopened: 2–8 °C in the fridge, dry and dark. Once dissolved, a preserved formula should be used within the shelf life you've validated; unpreserved solutions should be discarded within days." },
      { q: "Can I inject it?", a: "No. This is a cosmetic raw material for topical formulations only." },
      { q: "Do you supply a COA?", a: "Yes, a batch certificate of analysis is included with every vial and available on request." },
    ],
    texture: "Lyophilised blue powder",
    phRange: "Formulate at 5.0 – 7.0",
    routineStep: "Formulation ingredient",
    seoTitle: "GHK-Cu Powder 1 g | Cosmetic Grade Copper Peptide | Beauty Peps",
    seoDescription: "Cosmetic-grade lyophilised GHK-Cu (copper tripeptide-1) powder for formulators. COA included.",
    sortOrder: 12,
  },
  {
    slug: "argireline-pure-powder",
    categorySlug: "pure-actives",
    name: "Argireline Pure Peptide Powder",
    subtitle: "Cosmetic-grade acetyl hexapeptide-8, lyophilised",
    sku: "BP-ACT-002",
    status: "active",
    featured: false,
    badge: null,
    price: 4900,
    compareAtPrice: null,
    stock: 25,
    lowStockThreshold: 8,
    size: "1 g",
    image: img("argireline-pure-powder"),
    gallery: ["/images/editorial/actives.webp"],
    shortDescription:
      "Freeze-dried acetyl hexapeptide-8 powder for making expression-line serums. Water soluble, COA supplied.",
    description: `Pure acetyl hexapeptide-8 (Argireline) as a white lyophilised powder — the active peptide itself, rather than the dilute trade solution.

**Specifications**
- INCI: Acetyl Hexapeptide-8
- Appearance: white powder
- Purity: ≥ 95% (HPLC), batch COA included
- Solubility: water soluble

**Formulation notes**
Because this is the neat peptide, use levels are far lower than for commercial solutions. Typical levels for the pure peptide are around **0.005%–0.05%** (a 10% "Argireline solution" in finished products corresponds to a much lower level of actual peptide). Add in the water phase or cool-down below **40 °C**; stable across roughly **pH 4.5–7.0**. Compatible with most humectants, thickeners and other peptides.

**For cosmetic formulation and external use only.** Not for injection or ingestion.`,
    howToUse: `1. Prepare a stock solution — for example 0.1 g in 99.9 g distilled water (0.1%) — to make small additions easier to weigh.
2. Add the stock solution in the cool-down phase below 40 °C.
3. Preserve your finished formula and check pH (4.5–7.0).
4. Store the powder at 2–8 °C, tightly sealed.`,
    ingredients: "Acetyl Hexapeptide-8.",
    keyActives: [{ name: "Acetyl Hexapeptide-8", amount: "1 g", note: "≥ 95% purity (HPLC)" }],
    peptideSlugs: ["acetyl-hexapeptide-8"],
    concerns: ["expression-lines"],
    skinTypes: [],
    faqs: [
      { q: "Why is the use level so low?", a: "Commercial 'Argireline' is a dilute solution. This is the pure peptide, so a tiny amount goes a long way. Making a stock solution makes dosing practical." },
      { q: "Is it compatible with acids?", a: "It's stable down to about pH 4.5. For lower-pH products, test stability first." },
      { q: "How long does the powder last?", a: "Sealed and refrigerated, lyophilised peptides typically remain stable for 12–24 months. See the batch COA for the retest date." },
    ],
    texture: "Lyophilised white powder",
    phRange: "Formulate at 4.5 – 7.0",
    routineStep: "Formulation ingredient",
    seoTitle: "Argireline Powder 1 g | Acetyl Hexapeptide-8 | Beauty Peps",
    seoDescription: "Cosmetic-grade lyophilised Argireline (acetyl hexapeptide-8) powder for formulators.",
    sortOrder: 13,
  },
  {
    slug: "matrixyl-pure-powder",
    categorySlug: "pure-actives",
    name: "Matrixyl Pure Peptide Powder",
    subtitle: "Cosmetic-grade palmitoyl pentapeptide-4, lyophilised",
    sku: "BP-ACT-003",
    status: "active",
    featured: false,
    badge: null,
    price: 8900,
    compareAtPrice: null,
    stock: 5,
    lowStockThreshold: 6,
    size: "500 mg",
    image: img("matrixyl-pure-powder"),
    gallery: ["/images/editorial/actives.webp"],
    shortDescription:
      "Neat palmitoyl pentapeptide-4 (Pal-KTTKS) for advanced formulators. Lipophilic — supplied with dissolution guidance.",
    description: `Palmitoyl pentapeptide-4 is the original "Matrixyl" — a lipidated fragment of type I procollagen and one of the best-studied signal peptides in cosmetic science.

**Specifications**
- INCI: Palmitoyl Pentapeptide-4
- Appearance: off-white powder
- Purity: ≥ 95% (HPLC), batch COA included
- Solubility: poorly water soluble; disperse with a solubiliser/co-solvent

**Formulation notes**
The palmitoyl chain makes this peptide lipophilic. Pre-dissolve in a glycol co-solvent (e.g. butylene glycol or propanediol, warmed gently) with a solubiliser such as polysorbate 20, then add to the formula in the cool-down phase **below 40 °C**. Typical levels for the neat peptide are in the low **ppm range (roughly 0.0003%–0.001%)**, which is why commercial products use dilute solutions. Stable at around **pH 4.0–7.0**.

**For cosmetic formulation and external use only.** Not for injection or ingestion.`,
    howToUse: `1. Pre-dissolve in a co-solvent/solubiliser blend; make a concentrated stock (e.g. 0.01%).
2. Add the stock to your formula in the cool-down phase below 40 °C.
3. Check pH (4.0–7.0) and preserve appropriately.
4. Store the powder at 2–8 °C, sealed and dry.`,
    ingredients: "Palmitoyl Pentapeptide-4.",
    keyActives: [{ name: "Palmitoyl Pentapeptide-4", amount: "500 mg", note: "≥ 95% purity (HPLC)" }],
    peptideSlugs: ["palmitoyl-pentapeptide-4"],
    concerns: ["fine-lines", "firmness"],
    skinTypes: [],
    faqs: [
      { q: "Why won't it dissolve in water?", a: "The palmitic acid chain makes it oil-loving. Use a co-solvent and solubiliser as described above." },
      { q: "Is 500 mg a lot?", a: "Yes — at ppm-level use rates, 500 mg is enough for very large batches. It's intended for experienced formulators." },
      { q: "Is it the same as Matrixyl 3000?", a: "No. Matrixyl 3000 is a different pair of peptides. This is palmitoyl pentapeptide-4 only." },
    ],
    texture: "Lyophilised off-white powder",
    phRange: "Formulate at 4.0 – 7.0",
    routineStep: "Formulation ingredient",
    seoTitle: "Matrixyl Powder | Palmitoyl Pentapeptide-4 | Beauty Peps",
    seoDescription: "Cosmetic-grade palmitoyl pentapeptide-4 (Matrixyl) powder for advanced formulators.",
    sortOrder: 14,
  },
  {
    slug: "snap-8-pure-powder",
    categorySlug: "pure-actives",
    name: "SNAP-8 Pure Peptide Powder",
    subtitle: "Cosmetic-grade acetyl octapeptide-3, lyophilised",
    sku: "BP-ACT-004",
    status: "active",
    featured: false,
    badge: null,
    price: 6900,
    compareAtPrice: null,
    stock: 0,
    lowStockThreshold: 6,
    size: "1 g",
    image: img("snap-8-pure-powder"),
    gallery: ["/images/editorial/actives.webp"],
    shortDescription:
      "Neat acetyl octapeptide-3 for formulating expression-line serums. Water soluble, COA supplied.",
    description: `SNAP-8 (acetyl octapeptide-3) is an eight-amino-acid extension of the Argireline sequence, supplied here as a pure white lyophilised powder.

**Specifications**
- INCI: Acetyl Octapeptide-3
- Appearance: white powder
- Purity: ≥ 95% (HPLC), batch COA included
- Solubility: water soluble

**Formulation notes**
As with pure Argireline, neat-peptide use levels are low — typically around **0.005%–0.05%**. Prepare a stock solution in distilled water and add in the cool-down phase **below 40 °C**. Works well alongside acetyl hexapeptide-8 and pentapeptide-18. Stable at roughly **pH 4.5–7.0**.

**For cosmetic formulation and external use only.** Not for injection or ingestion.`,
    howToUse: `1. Make a stock solution in distilled water (e.g. 0.1%).
2. Add to your formula below 40 °C; check pH (4.5–7.0).
3. Store the powder at 2–8 °C, sealed and away from light.`,
    ingredients: "Acetyl Octapeptide-3.",
    keyActives: [{ name: "Acetyl Octapeptide-3", amount: "1 g", note: "≥ 95% purity (HPLC)" }],
    peptideSlugs: ["acetyl-octapeptide-3"],
    concerns: ["expression-lines"],
    skinTypes: [],
    faqs: [
      { q: "When will it be back in stock?", a: "New batches are released after QC testing. Join the waitlist via our newsletter to hear first." },
      { q: "Can I combine it with Argireline powder?", a: "Yes, they're commonly combined at similar use levels." },
      { q: "Is it for injection?", a: "No. Cosmetic formulation and topical use only." },
    ],
    texture: "Lyophilised white powder",
    phRange: "Formulate at 4.5 – 7.0",
    routineStep: "Formulation ingredient",
    seoTitle: "SNAP-8 Powder | Acetyl Octapeptide-3 | Beauty Peps",
    seoDescription: "Cosmetic-grade lyophilised SNAP-8 (acetyl octapeptide-3) powder for formulators.",
    sortOrder: 15,
  },

  /* ------------------------------------------------------------------ */
  /* Kits                                                                */
  /* ------------------------------------------------------------------ */
  {
    slug: "copper-ritual-kit",
    categorySlug: "kits",
    name: "The Copper Ritual Kit",
    subtitle: "GHK-Cu Serum + Peptide Night Cream + Eye Peptide Gel",
    sku: "BP-KIT-001",
    status: "active",
    featured: true,
    badge: "Value set",
    price: 17900,
    compareAtPrice: 21100,
    stock: 22,
    lowStockThreshold: 6,
    size: "3 full sizes",
    image: img("copper-ritual-kit"),
    gallery: ["/images/editorial/unboxing.webp"],
    shortDescription:
      "Our complete evening ritual in a keepsake box: copper peptide serum, ceramide night cream and eye gel — save $32 on buying separately.",
    description: `The Copper Ritual brings together the three products we reach for every night, in full sizes, in a gift-ready box.

**Inside the box**
- **GHK-Cu Copper Peptide Serum** (30 mL) — 1% copper tripeptide-1 for firmness and renewal
- **Peptide Night Cream** (50 mL) — three signal peptides in a ceramide barrier base
- **Eye Peptide Gel** (15 mL) — Eyeseryl, Haloxyl and caffeine for puffiness and shadows

Together they cover the three things a night routine should do: deliver a hero active, support the barrier, and treat the eye area — with formulas designed to be layered without pilling or clashing.

Each set includes a printed routine card with layering order and a 12-week tracker.`,
    howToUse: `**Evening:**
1. Cleanse.
2. GHK-Cu Serum — 3–4 drops to face and neck.
3. Eye Peptide Gel — half a pump, tapped along the orbital bone.
4. Peptide Night Cream — a pea-sized amount to seal.

**Morning (optional):** Eye Gel, then moisturiser and SPF.`,
    ingredients:
      "See individual products: GHK-Cu Copper Peptide Serum, Peptide Night Cream, Eye Peptide Gel.",
    keyActives: [
      { name: "Copper Tripeptide-1", amount: "1%", note: "In the serum" },
      { name: "Signal peptide trio + ceramides", amount: "—", note: "In the night cream" },
      { name: "Acetyl tetrapeptide-5 + Haloxyl", amount: "—", note: "In the eye gel" },
    ],
    peptideSlugs: [
      "ghk-cu",
      "palmitoyl-tripeptide-5",
      "palmitoyl-pentapeptide-4",
      "palmitoyl-tripeptide-38",
      "acetyl-tetrapeptide-5",
      "palmitoyl-tripeptide-1",
      "palmitoyl-tetrapeptide-7",
    ],
    concerns: ["firmness", "fine-lines", "under-eye", "barrier"],
    skinTypes: ["All skin types", "Mature", "Dry"],
    faqs: [
      { q: "Are these full sizes?", a: "Yes — all three products are full size." },
      { q: "Is it gift-wrapped?", a: "It comes in a rigid ivory keepsake box with tissue. Add a gift note at checkout." },
      { q: "How long does the kit last?", a: "Used nightly, around 8–10 weeks for the serum and eye gel, longer for the cream." },
    ],
    texture: "Serum, gel and cream",
    phRange: "—",
    routineStep: "PM routine",
    seoTitle: "Copper Peptide Ritual Kit | Beauty Peps",
    seoDescription: "GHK-Cu serum, peptide night cream and eye gel in one gift set. Save $32.",
    sortOrder: 16,
  },
  {
    slug: "expression-line-duo",
    categorySlug: "kits",
    name: "Expression Line Duo",
    subtitle: "Argireline 10% + SNAP-8, layered together",
    sku: "BP-KIT-002",
    status: "active",
    featured: false,
    badge: "Value set",
    price: 9900,
    compareAtPrice: 11700,
    stock: 34,
    lowStockThreshold: 6,
    size: "2 × 30 mL",
    image: img("expression-line-duo"),
    gallery: ["/images/articles/argireline-neuropeptides-explained.webp"],
    shortDescription:
      "Our two neurotransmitter-inhibiting serums, designed to be layered on the forehead, frown lines and crow's-feet — save $18.",
    description: `Argireline and SNAP-8 target the same SNARE-complex pathway with slightly different peptide lengths, and the combination is one of the most popular "topical alternatives" routines for expression lines.

**Inside**
- **Argireline 10% Expression Line Serum** (30 mL)
- **SNAP-8 Octapeptide Serum** (30 mL)

Both are fragrance-free, water-light and layer without pilling. Use them together morning and night on areas of movement.`,
    howToUse: `1. Apply 2 drops of Argireline to expression areas.
2. Follow immediately with 2 drops of SNAP-8.
3. Moisturise. Use AM & PM.`,
    ingredients: "See individual products: Argireline 10% Expression Line Serum, SNAP-8 Octapeptide Serum.",
    keyActives: [
      { name: "Acetyl Hexapeptide-8 (Argireline)", amount: "10% solution", note: "" },
      { name: "Acetyl Octapeptide-3 (SNAP-8)", amount: "10% solution", note: "" },
    ],
    peptideSlugs: ["acetyl-hexapeptide-8", "acetyl-octapeptide-3"],
    concerns: ["expression-lines", "fine-lines"],
    skinTypes: ["All skin types"],
    faqs: [
      { q: "Do I need both?", a: "Not necessarily — each works on its own. The duo is for people who want to maximise this pathway." },
      { q: "Which goes first?", a: "Either order works as they're similar textures. We suggest Argireline first." },
    ],
    texture: "Two light serums",
    phRange: "5.0 – 6.0",
    routineStep: "AM & PM",
    seoTitle: "Argireline + SNAP-8 Expression Line Duo | Beauty Peps",
    seoDescription: "Argireline 10% and SNAP-8 serums together for the look of expression lines. Save $18.",
    sortOrder: 17,
  },
  {
    slug: "peptide-discovery-set",
    categorySlug: "kits",
    name: "Peptide Discovery Set",
    subtitle: "Five 10 mL minis to find your peptide",
    sku: "BP-KIT-003",
    status: "active",
    featured: false,
    badge: "New",
    price: 8900,
    compareAtPrice: 11500,
    stock: 40,
    lowStockThreshold: 8,
    size: "5 × 10 mL",
    image: img("peptide-discovery-set"),
    gallery: [],
    shortDescription:
      "Try our five core serums in 10 mL minis — about three weeks of each — and discover which peptide your skin loves.",
    description: `Not sure where to start? The Discovery Set lets you try the five serums that cover every peptide class, in travel-friendly 10 mL dropper bottles.

**Inside**
- GHK-Cu Copper Peptide Serum (10 mL) — *carrier peptide*
- Matrixyl 3000 Collagen Peptide Serum (10 mL) — *signal peptides*
- Argireline 10% Expression Line Serum (10 mL) — *neurotransmitter-inhibiting peptide*
- Multi-Peptide 12 Complex Serum (10 mL) — *multi-class*
- Nonapeptide-1 Brightening Serum (10 mL) — *pigment-signalling peptide*

Each mini holds roughly three weeks of once-daily use. The set includes a fold-out guide to the four peptide classes and a voucher for the value of the set off your first full-size purchase.`,
    howToUse: `Try one serum at a time for 2–3 weeks to see how your skin responds, or use two together — one AM, one PM. Keep GHK-Cu and acid/vitamin C products in separate routines.`,
    ingredients: "See individual full-size products for complete ingredient lists.",
    keyActives: [
      { name: "GHK-Cu", amount: "1%", note: "" },
      { name: "Matrixyl 3000", amount: "8%", note: "" },
      { name: "Argireline", amount: "10%", note: "" },
      { name: "Multi-peptide complexes", amount: "12%", note: "" },
      { name: "Nonapeptide-1 + niacinamide", amount: "5% + 4%", note: "" },
    ],
    peptideSlugs: ["ghk-cu", "palmitoyl-tripeptide-1", "palmitoyl-tetrapeptide-7", "acetyl-hexapeptide-8", "nonapeptide-1"],
    concerns: ["fine-lines", "expression-lines", "firmness", "dark-spots"],
    skinTypes: ["All skin types"],
    faqs: [
      { q: "Is this a good gift?", a: "Yes — it's our most popular gift for peptide beginners." },
      { q: "Are the minis refillable?", a: "They're glass and recyclable; we don't currently offer refills." },
      { q: "Can I use all five at once?", a: "We suggest no more than two per routine. Keep GHK-Cu separate from vitamin C and acids." },
    ],
    texture: "Five serums",
    phRange: "—",
    routineStep: "AM & PM",
    seoTitle: "Peptide Discovery Set | 5 Mini Peptide Serums | Beauty Peps",
    seoDescription: "Try five peptide serums in 10 mL minis: GHK-Cu, Matrixyl 3000, Argireline, Multi-Peptide and Nonapeptide-1.",
    sortOrder: 18,
  },
];
