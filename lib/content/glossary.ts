export type GlossaryTerm = {
  id: string; // anchor id: other pages link to /glossary#<id>
  term: string;
  aka?: string;
  definition: string;
  links?: { label: string; href: string }[];
};

export const GLOSSARY: GlossaryTerm[] = [
  {
    id: "acetylation",
    term: "Acetylation",
    definition:
      "Adding an acetyl group (CH₃CO–) to the start of a peptide chain. It protects the peptide from being broken down by enzymes and can improve how well it moves into the skin. The 'Acetyl' in Acetyl Hexapeptide-8 refers to this.",
    links: [{ label: "Acetyl Hexapeptide-8", href: "/peptides/acetyl-hexapeptide-8" }],
  },
  {
    id: "acetylcholine",
    term: "Acetylcholine",
    definition:
      "The neurotransmitter that nerves release to tell muscles to contract. Neurotransmitter-inhibiting peptides aim to reduce how much is released at the nerve–muscle junction, softening repeated expression.",
  },
  {
    id: "alpha-msh",
    term: "α-MSH",
    aka: "Alpha-melanocyte-stimulating hormone",
    definition:
      "A signalling peptide that binds the MC1 receptor on melanocytes and switches on melanin production. Nonapeptide-1 is designed to compete with α-MSH at this receptor.",
    links: [{ label: "Nonapeptide-1", href: "/peptides/nonapeptide-1" }],
  },
  {
    id: "amidation",
    term: "Amidation",
    definition:
      "Modifying the end (C-terminus) of a peptide into an amide. Like acetylation, it increases resistance to enzymes and can make a peptide behave more like its natural counterpart.",
  },
  {
    id: "amino-acid",
    term: "Amino acid",
    definition:
      "The building blocks of peptides and proteins. Twenty standard amino acids, each written with a one- or three-letter code (e.g. K or Lys for lysine), combine in different orders to make every peptide.",
  },
  {
    id: "collagen",
    term: "Collagen (types I & III)",
    definition:
      "The main structural protein of the dermis, giving skin its strength. Type I is the most abundant in adult skin; type III is more elastic and plentiful in younger skin. Production slows with age and UV exposure speeds up its breakdown.",
    links: [{ label: "Signal peptides", href: "/peptides?class=signal" }],
  },
  {
    id: "chelation",
    term: "Chelation",
    definition:
      "When a molecule binds a metal ion at multiple points, holding it in a stable complex. GHK chelates copper(II) to form GHK-Cu. Strong chelators such as EDTA in the same formula can compete for the copper.",
    links: [{ label: "GHK-Cu", href: "/peptides/ghk-cu" }],
  },
  {
    id: "cool-down-phase",
    term: "Cool-down phase",
    definition:
      "The final stage of making an emulsion, once it has cooled below about 40°C. Heat-sensitive ingredients (peptides, many vitamins and fragrances) are added here to avoid degradation.",
    links: [{ label: "Storing peptide powders", href: "/learn/storing-peptide-powders" }],
  },
  {
    id: "dalton",
    term: "Dalton (Da)",
    aka: "500 Dalton rule",
    definition:
      "The unit used for molecular weight. The '500 Dalton rule' is a guideline that molecules much heavier than about 500 Da struggle to penetrate intact skin unaided. Most cosmetic peptides are 400–1,000 Da, which is why delivery matters.",
    links: [{ label: "The penetration problem", href: "/science#penetration" }],
  },
  {
    id: "dermis",
    term: "Dermis",
    definition:
      "The thick layer of skin beneath the epidermis. It contains fibroblasts, blood vessels, collagen and elastin: the structure behind firmness and bounce.",
  },
  {
    id: "double-blind",
    term: "Double-blind",
    definition:
      "A study design in which neither the participants nor the researchers assessing results know who received the active product and who received the placebo. It reduces bias in reported results.",
  },
  {
    id: "elastin",
    term: "Elastin",
    definition:
      "A stretchy protein in the dermis that lets skin snap back after being pulled or creased. It is made slowly in adulthood and is damaged by UV.",
  },
  {
    id: "epidermis",
    term: "Epidermis",
    definition:
      "The outer, protective layer of skin. Its living lower layers constantly produce new cells that move up, flatten and form the stratum corneum.",
  },
  {
    id: "evidence-level",
    term: "Evidence level",
    definition:
      "Our 1–5 grading of the published research behind each peptide, from laboratory-only data (1) to multiple independent clinical trials (5). It describes research quality, not how effective an ingredient feels.",
    links: [{ label: "How we grade evidence", href: "/peptides#library" }],
  },
  {
    id: "ex-vivo",
    term: "Ex-vivo",
    definition:
      "Testing on living human skin samples (usually donated surgical tissue) kept alive in the lab. More realistic than cell culture, but without circulation or an immune system.",
  },
  {
    id: "extracellular-matrix",
    term: "Extracellular matrix (ECM)",
    definition:
      "The network of proteins and sugars between cells (collagen, elastin, fibronectin and glycosaminoglycans) that gives skin its structure and hydration. Signal peptides aim to encourage fibroblasts to rebuild it.",
  },
  {
    id: "fibroblast",
    term: "Fibroblast",
    definition:
      "The main cell type of the dermis. Fibroblasts produce collagen, elastin and other ECM components, and respond to chemical signals, including signal peptides.",
  },
  {
    id: "fibronectin",
    term: "Fibronectin",
    definition:
      "A glycoprotein in the extracellular matrix that helps cells attach to the collagen network. Several signal peptides have been shown in vitro to increase its production.",
  },
  {
    id: "glycosaminoglycans",
    term: "Glycosaminoglycans (GAGs)",
    definition:
      "Long sugar chains in the dermis (hyaluronic acid is the best known) that bind large amounts of water, cushioning the skin and keeping it plump.",
  },
  {
    id: "humectant",
    term: "Humectant",
    definition:
      "An ingredient that attracts and holds water, such as glycerin or hyaluronic acid. Most peptide serums are built on a humectant base.",
  },
  {
    id: "in-vitro",
    term: "In-vitro",
    definition:
      "Latin for 'in glass': experiments on cells or proteins in a lab dish. Useful for understanding mechanisms, but it can't show whether an ingredient reaches its target through real skin.",
  },
  {
    id: "in-vivo",
    term: "In-vivo",
    definition:
      "Testing on living people (or animals). For cosmetics this usually means volunteers applying a product for several weeks while skin is measured with imaging or instruments.",
  },
  {
    id: "inci",
    term: "INCI",
    aka: "International Nomenclature of Cosmetic Ingredients",
    definition:
      "The standardised names used on cosmetic ingredient lists worldwide. Trade names like 'Argireline' map to INCI names like 'Acetyl Hexapeptide-8'. The number in a peptide's INCI name is just an identifier, not a strength.",
  },
  {
    id: "liposome",
    term: "Liposome",
    definition:
      "A tiny bubble made of lipid layers, similar to a cell membrane, that can carry actives inside it. Liposomes can protect peptides and help them into the upper layers of skin.",
  },
  {
    id: "lyophilised",
    term: "Lyophilised",
    aka: "Freeze-dried",
    definition:
      "Dried by freezing and then removing water under vacuum. Lyophilised peptide powders are very stable when kept dry, cool and sealed, and are dissolved into water-based formulas when needed.",
    links: [{ label: "Pure actives", href: "/shop?category=pure-actives" }],
  },
  {
    id: "matrikine",
    term: "Matrikine",
    definition:
      "A peptide fragment released when ECM proteins such as collagen break down, which then signals cells to repair the matrix. Many signal peptides, including Matrixyl's KTTKS sequence, are synthetic matrikines.",
    links: [{ label: "Matrixyl", href: "/peptides/palmitoyl-pentapeptide-4" }],
  },
  {
    id: "melanocyte",
    term: "Melanocyte",
    definition:
      "Pigment-producing cells in the base of the epidermis. They make melanin in response to UV and inflammation and pass it to surrounding skin cells.",
  },
  {
    id: "mmps",
    term: "MMPs",
    aka: "Matrix metalloproteinases",
    definition:
      "Enzymes that break down collagen and other ECM proteins. They're needed for normal remodelling, but UV exposure switches them on strongly, a major cause of photoageing.",
  },
  {
    id: "neurotransmitter-inhibitor",
    term: "Neurotransmitter-inhibiting peptide",
    definition:
      "A peptide that interferes with the signal from nerve to expression muscle, aiming to soften lines caused by repeated movement. Examples include Argireline, SNAP-8 and Leuphasyl.",
    links: [{ label: "Browse the class", href: "/peptides?class=neurotransmitter-inhibitor" }],
  },
  {
    id: "oxidation",
    term: "Oxidation",
    definition:
      "A chemical reaction, often with oxygen, that can degrade ingredients. Copper can catalyse oxidation of L-ascorbic acid, which is why copper peptides and pure vitamin C are best used at different times.",
  },
  {
    id: "palmitoylation",
    term: "Palmitoylation",
    definition:
      "Attaching palmitic acid (a 16-carbon fatty acid) to a peptide. It makes the peptide more oil-compatible so it can move into the skin's lipid barrier more easily. The 'Palmitoyl' in Palmitoyl Tripeptide-1 refers to this.",
    links: [{ label: "Palmitoyl Tripeptide-1", href: "/peptides/palmitoyl-tripeptide-1" }],
  },
  {
    id: "patch-test",
    term: "Patch test",
    definition:
      "Applying a small amount of a new product to a discreet area (inner arm or behind the ear) once or twice daily for several days before using it on your face, to check for irritation or allergy.",
  },
  {
    id: "penetration-enhancer",
    term: "Penetration enhancer",
    definition:
      "An ingredient that temporarily loosens the skin barrier's lipids to help other molecules pass through, for example certain glycols or fatty acids. Used carefully, they can improve delivery of actives.",
  },
  {
    id: "peptide",
    term: "Peptide",
    definition:
      "A short chain of amino acids joined by peptide bonds, typically 2 to 50 units. Shorter than proteins, they can act as messengers in the skin.",
    links: [{ label: "What are peptides?", href: "/learn/what-are-peptides" }],
  },
  {
    id: "peptide-bond",
    term: "Peptide bond",
    definition:
      "The chemical link between two amino acids. Breaking these bonds (hydrolysis) destroys a peptide, something heat, extreme pH and protease enzymes can all cause.",
  },
  {
    id: "ph",
    term: "pH",
    definition:
      "A scale of acidity (0–14, with 7 neutral). Skin's surface is mildly acidic (around 4.5–5.5). Most peptides are formulated around pH 5–7 for stability.",
  },
  {
    id: "photoageing",
    term: "Photoageing",
    definition:
      "Skin ageing caused by UV exposure rather than time alone: lines, laxity, uneven pigment and rough texture. In sunny Australia, daily broad-spectrum SPF is the most effective way to reduce it.",
  },
  {
    id: "placebo-controlled",
    term: "Placebo-controlled",
    definition:
      "A study in which one group uses the active product and another uses an identical-looking product without the active. It separates the peptide's effect from the effect of simply moisturising.",
  },
  {
    id: "preservative",
    term: "Preservative",
    definition:
      "An ingredient that prevents bacteria, yeast and mould growing in water-containing products. Essential for safety in any serum or cream, and it protects peptides from microbial enzymes too.",
  },
  {
    id: "protease",
    term: "Protease",
    definition:
      "An enzyme that cuts peptide bonds. Skin and microbes both produce proteases, which is one reason chemically protected peptides (acetylated, amidated or palmitoylated) are favoured in skincare.",
  },
  {
    id: "signal-peptide",
    term: "Signal peptide",
    definition:
      "A peptide that acts as a messenger to fibroblasts, encouraging production of collagen, elastin and other matrix components. The Matrixyl family are classic examples.",
    links: [{ label: "Browse the class", href: "/peptides?class=signal" }],
  },
  {
    id: "snare-complex",
    term: "SNARE complex",
    definition:
      "A group of proteins (including SNAP-25) that helps vesicles inside nerve endings fuse with the membrane and release acetylcholine. Argireline and SNAP-8 mimic part of SNAP-25 and compete for a place in this complex.",
    links: [{ label: "Argireline explained", href: "/learn/argireline-neuropeptides-explained" }],
  },
  {
    id: "stratum-corneum",
    term: "Stratum corneum",
    definition:
      "The outermost layer of the epidermis: flattened dead cells in a lipid matrix, often compared to bricks and mortar. It is the main barrier any topical ingredient must cross.",
  },
  {
    id: "tewl",
    term: "Transepidermal water loss (TEWL)",
    definition:
      "Water that evaporates from the body through the skin. A higher TEWL reading signals a weaker barrier; it's commonly measured in skincare studies.",
  },
  {
    id: "tyrosinase",
    term: "Tyrosinase",
    definition:
      "The key enzyme in melanin production. Many brightening ingredients either inhibit it directly or, like Nonapeptide-1, reduce the signals that switch it on.",
  },
  {
    id: "vehicle",
    term: "Vehicle",
    aka: "Base formula",
    definition:
      "Everything in a product other than the active ingredient. In a placebo-controlled study, the 'vehicle' group uses the same formula without the peptide.",
  },
];
