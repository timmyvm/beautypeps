import type { PeptideStudy, peptides } from "../db/schema";

export type SeedPeptide = Omit<typeof peptides.$inferInsert, "id">;

/** PubMed search link — avoids hard-coding PMIDs/DOIs we can't verify offline. */
const pubmed = (query: string) => `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(query)}`;

const S = {
  gorouhi: {
    title: "Role of topical peptides in preventing or treating aged skin",
    source: "Gorouhi F, Maibach HI. International Journal of Cosmetic Science",
    year: 2009,
    url: pubmed("Role of topical peptides in preventing or treating aged skin"),
  },
  schagen: {
    title: "Topical Peptide Treatments with Effective Anti-Aging Results",
    source: "Schagen SK. Cosmetics (MDPI)",
    year: 2017,
    url: "https://www.mdpi.com/search?q=Topical+Peptide+Treatments+with+Effective+Anti-Aging+Results",
  },
  lintner: {
    title: "Biologically active peptides: from a laboratory bench curiosity to a functional skin care product",
    source: "Lintner K, Peschard O. International Journal of Cosmetic Science",
    year: 2000,
    url: pubmed("Biologically active peptides: from a laboratory bench curiosity to a functional skin care product"),
  },
  errante: {
    title: "Cosmeceutical Peptides in the Framework of Sustainable Wellness Economy",
    source: "Errante F, Ledwoń P, Latajka R, Rovero P, Papini AM. Frontiers in Chemistry",
    year: 2020,
    url: pubmed("Cosmeceutical Peptides in the Framework of Sustainable Wellness Economy"),
  },
} satisfies Record<string, PeptideStudy>;

const supplier = (who: string): PeptideStudy => ({
  title: "Manufacturer in-vitro and in-vivo efficacy dossier",
  source: `${who} (supplier data)`,
});

export const seedPeptides: SeedPeptide[] = [
  /* ------------------------------------------------------------------ */
  {
    slug: "ghk-cu",
    name: "GHK-Cu",
    inciName: "Copper Tripeptide-1",
    aliases: ["Copper peptide", "Glycyl-L-histidyl-L-lysine copper complex", "Cu-GHK"],
    peptideClass: "carrier",
    sequence: "Gly-His-Lys : Cu²⁺",
    molecularWeight: "≈ 404 Da (GHK ≈ 340 Da + Cu²⁺)",
    discovered: "Isolated from human plasma by Loren Pickart in 1973",
    summary:
      "GHK-Cu is a naturally occurring tripeptide that binds copper with high affinity. It is one of the most extensively researched cosmetic peptides, studied for collagen and glycosaminoglycan synthesis, wound repair and broad effects on skin-remodelling genes.",
    benefits: [
      "Supports the look of firmer, more elastic skin",
      "Helps skin feel calmer and more resilient",
      "Supports the skin's natural renewal and repair processes",
      "Studied for effects on collagen, elastin and glycosaminoglycans",
      "Also used in scalp formulas for hair-density support",
    ],
    mechanism: `GHK (glycyl-L-histidyl-L-lysine) is found in human plasma, saliva and urine. It has a strong affinity for copper(II) ions, and in the body it is thought to act as a **carrier** — delivering copper, an essential cofactor for enzymes such as lysyl oxidase (which cross-links collagen and elastin) and superoxide dismutase (an antioxidant enzyme).

Plasma levels of GHK decline with age: reviews by its discoverer report roughly 200 ng/mL at age 20 falling to around 80 ng/mL by age 60. That decline is part of why GHK-Cu attracted interest as a topical "replacement" signal.

In cell and animal studies, GHK-Cu has been shown to stimulate fibroblast production of collagen, elastin, decorin and glycosaminoglycans, and to modulate the balance between matrix metalloproteinases (MMPs, which break down collagen) and their inhibitors (TIMPs). It also attracts immune and endothelial cells to sites of injury, which is why it was first studied in wound healing.

More recent work using gene-expression databases found that GHK influences the activity of a large number of human genes, nudging many towards a profile associated with tissue repair. These findings are intriguing but come from cell-based data; they don't by themselves tell us what a topical cosmetic does on intact skin.`,
    evidence: `**In vitro:** Strong. Multiple independent studies show GHK-Cu stimulates matrix protein and glycosaminoglycan synthesis in fibroblast cultures and modulates MMP/TIMP activity.

**Animal studies:** Consistent evidence of improved wound contraction, angiogenesis and tissue remodelling in rodent and other models.

**Human cosmetic studies:** Several small studies of creams and eye creams containing copper peptides have reported improvements in laxity, fine lines, density and skin thickness over roughly 8–12 weeks, and one small comparative study reported increased collagen production in biopsied skin after a month of use. These studies are generally small, not always placebo-controlled, and some are only available as conference abstracts or manufacturer reports.

**Bottom line:** GHK-Cu has the deepest mechanistic research base of any cosmetic peptide and encouraging — but modest-sized — human data. It is a reasonable first choice for firmness and overall skin quality, with realistic expectations about the pace of change.`,
    usage: `- **Typical concentration:** 0.05%–1% in finished products (our serum uses 1%).
- **pH:** Formulate and use around **pH 5–7**. At low pH the copper can dissociate — a solution shifting from blue to green is a warning sign.
- **Layering:** Apply to clean skin before creams. Separate from **L-ascorbic acid vitamin C** and strong **AHA/BHA exfoliants** (use them at a different time of day).
- **Retinoids:** Compatible for most people; alternate nights if your skin is sensitive.
- **Results:** Skin often feels smoother within weeks; studies measured firmness and line changes at 8–12 weeks.`,
    typicalConcentration: "0.05% – 1%",
    phRange: "5.0 – 7.0",
    pairsWith: ["Hyaluronic acid", "Niacinamide", "Ceramides", "Signal peptides", "Retinoids (alternate nights if sensitive)"],
    avoidWith: ["L-ascorbic acid (same routine)", "Strong AHA/BHA exfoliants (same routine)", "High levels of EDTA/chelators"],
    concerns: ["firmness", "fine-lines", "barrier", "dullness", "hair-density"],
    studies: [
      {
        title: "Regenerative and Protective Actions of the GHK-Cu Peptide in the Light of the New Gene Data",
        source: "Pickart L, Margolina A. International Journal of Molecular Sciences",
        year: 2018,
        url: pubmed("Regenerative and Protective Actions of the GHK-Cu Peptide in the Light of the New Gene Data"),
      },
      {
        title: "GHK Peptide as a Natural Modulator of Multiple Cellular Pathways in Skin Regeneration",
        source: "Pickart L, Vasquez-Soltero JM, Margolina A. BioMed Research International",
        year: 2015,
        url: pubmed("GHK Peptide as a Natural Modulator of Multiple Cellular Pathways in Skin Regeneration"),
      },
      S.gorouhi,
      S.schagen,
    ],
    evidenceLevel: 4,
    sortOrder: 1,
  },
  /* ------------------------------------------------------------------ */
  {
    slug: "palmitoyl-pentapeptide-4",
    name: "Matrixyl",
    inciName: "Palmitoyl Pentapeptide-4",
    aliases: ["Pal-KTTKS", "Palmitoyl pentapeptide-3 (former INCI)", "Matrixyl (Sederma)"],
    peptideClass: "signal",
    sequence: "Pal-Lys-Thr-Thr-Lys-Ser",
    molecularWeight: "≈ 802 Da",
    discovered: "KTTKS identified as a pro-collagen fragment in 1993; palmitoylated form commercialised as Matrixyl in 2000",
    summary:
      "Palmitoyl pentapeptide-4 is a lipid-linked fragment of type I procollagen that acts as a matrikine — a signal telling fibroblasts to make more matrix. It is one of the few cosmetic peptides with a published, placebo-controlled human study.",
    benefits: [
      "Helps reduce the look of fine lines and wrinkles",
      "Supports skin firmness and texture",
      "Well tolerated, including by sensitive skin",
      "Compatible with most other actives",
    ],
    mechanism: `When collagen is broken down, small fragments are released. Some of these fragments — called **matrikines** — are recognised by fibroblasts as a sign of damage and trigger production of new matrix proteins. Research in the early 1990s identified the pentapeptide **KTTKS** (lysine-threonine-threonine-lysine-serine), from the propeptide of type I collagen, as one such signal: in cell culture it stimulated production of collagen I and III and fibronectin.

On its own, KTTKS is quite water-loving and penetrates skin poorly. Attaching a **palmitic acid** (C16 fatty acid) chain makes the peptide more lipophilic, improving its affinity for the stratum corneum and stability in formulations. The resulting Pal-KTTKS was introduced to cosmetics as Matrixyl.

Because it mimics a natural feedback signal rather than forcing a reaction, palmitoyl pentapeptide-4 is gentle and doesn't cause the irritation associated with retinoids or acids.`,
    evidence: `**In vitro:** KTTKS and Pal-KTTKS stimulate matrix protein synthesis in fibroblast culture.

**Human studies:** A frequently cited 12-week, double-blind, placebo-controlled, split-face study in women with photoaged skin found that a moisturiser with a few parts per million of Pal-KTTKS produced statistically significant improvements in wrinkles and fine lines versus the vehicle, as assessed by image analysis and expert grading. The supplier's own studies report similar results.

**Caveats:** Effect sizes are modest, and most human data are industry-funded. Penetration into the dermis in real-world use is still debated.

**Bottom line:** One of the better-evidenced signal peptides, with genuine placebo-controlled data — a solid choice for gradual improvement in fine lines.`,
    usage: `- **Typical concentration:** The commercial solution is usually used at 2%–8% (a few ppm of actual peptide in the finished product).
- **pH:** Stable around **pH 4–7**.
- **Layering:** Compatible with retinoids, vitamin C, niacinamide, hyaluronic acid and other peptides.
- **When:** Morning and/or evening.
- **Results:** Published studies measured change at 8–12 weeks.`,
    typicalConcentration: "2% – 8% of trade solution",
    phRange: "4.0 – 7.0",
    pairsWith: ["Retinoids", "Vitamin C", "Niacinamide", "Hyaluronic acid", "Other signal peptides"],
    avoidWith: ["Very low-pH products (below pH 3.5) in the same layer"],
    concerns: ["fine-lines", "firmness"],
    studies: [
      {
        title: "A pentapeptide from type I procollagen promotes extracellular matrix production",
        source: "Katayama K, et al. Journal of Biological Chemistry",
        year: 1993,
        url: pubmed("A pentapeptide from type I procollagen promotes extracellular matrix production"),
      },
      {
        title: "Topical palmitoyl pentapeptide provides improvement in photoaged human facial skin",
        source: "Robinson LR, et al. International Journal of Cosmetic Science",
        year: 2005,
        url: pubmed("Topical palmitoyl pentapeptide provides improvement in photoaged human facial skin"),
      },
      S.lintner,
      S.gorouhi,
    ],
    evidenceLevel: 4,
    sortOrder: 2,
  },
  /* ------------------------------------------------------------------ */
  {
    slug: "palmitoyl-tripeptide-1",
    name: "Palmitoyl Tripeptide-1",
    inciName: "Palmitoyl Tripeptide-1",
    aliases: ["Pal-GHK", "Palmitoyl oligopeptide (former INCI)", "Part of Matrixyl 3000 & Biopeptide CL"],
    peptideClass: "signal",
    sequence: "Pal-Gly-His-Lys",
    molecularWeight: "≈ 579 Da",
    discovered: "Developed by Sederma as a lipophilic GHK matrikine; launched within Matrixyl 3000 in the 2000s",
    summary:
      "Palmitoyl tripeptide-1 is a palmitoylated version of the GHK sequence, designed as a collagen-signalling matrikine. It's best known as one half of the Matrixyl 3000 complex and is also used in lip and eye formulas.",
    benefits: [
      "Supports the look of smoother, firmer skin",
      "Signals collagen and glycosaminoglycan production",
      "Used in lip treatments for the look of volume",
      "Gentle and fragrance-free friendly",
    ],
    mechanism: `The GHK sequence appears within the alpha-2 chain of type I collagen. When collagen is degraded, GHK-containing fragments are released, and laboratory studies suggest they act as matrikines that stimulate fibroblasts to rebuild.

Unlike GHK-Cu, **palmitoyl tripeptide-1** is not complexed with copper. Instead, a palmitic acid chain is attached to improve skin affinity. It is therefore considered a **signal peptide** rather than a carrier peptide — its proposed role is to "message" fibroblasts to increase collagen and glycosaminoglycan synthesis.

It is most commonly paired with palmitoyl tetrapeptide-7 (as Matrixyl 3000): one peptide pushes matrix building, the other calms the inflammatory signals that accelerate matrix breakdown.`,
    evidence: `**In vitro:** Supplier studies report increased collagen and glycosaminoglycan synthesis in fibroblast cultures.

**Human studies:** Most clinical data come from the supplier testing the combined Matrixyl 3000 complex, reporting improvements in wrinkle depth, roughness and elasticity over about two months. Independent, placebo-controlled studies of the single peptide are limited.

**Bottom line:** Plausible mechanism and a long track record in cosmetics, but the human evidence is mostly manufacturer-sponsored. Best used as part of a peptide complex.`,
    usage: `- **Typical concentration:** As Matrixyl 3000, 3%–8% of the trade complex.
- **pH:** Around **pH 4.5–7**.
- **Layering:** Compatible with nearly all actives, including retinoids and vitamin C.
- **When:** Morning and evening.`,
    typicalConcentration: "3% – 8% (as Matrixyl 3000)",
    phRange: "4.5 – 7.0",
    pairsWith: ["Palmitoyl tetrapeptide-7", "Hyaluronic acid", "Retinoids", "Vitamin C"],
    avoidWith: [],
    concerns: ["fine-lines", "firmness", "lips", "under-eye"],
    studies: [S.gorouhi, S.schagen, supplier("Sederma (Croda)")],
    evidenceLevel: 3,
    sortOrder: 3,
  },
  /* ------------------------------------------------------------------ */
  {
    slug: "palmitoyl-tetrapeptide-7",
    name: "Palmitoyl Tetrapeptide-7",
    inciName: "Palmitoyl Tetrapeptide-7",
    aliases: ["Pal-GQPR", "Palmitoyl tetrapeptide-3 (former INCI)", "Rigin", "Part of Matrixyl 3000"],
    peptideClass: "signal",
    sequence: "Pal-Gly-Gln-Pro-Arg",
    molecularWeight: null,
    discovered: "Developed by Sederma; derived from a fragment of immunoglobulin G",
    summary:
      "Palmitoyl tetrapeptide-7 is designed to quieten interleukin-6, an inflammatory messenger that rises with age and UV exposure and contributes to matrix breakdown. It's the 'calming' half of Matrixyl 3000.",
    benefits: [
      "Helps reduce the visible effects of inflammation on skin",
      "Supports firmness by protecting existing matrix",
      "Complements collagen-building peptides",
      "Suitable for sensitive and reactive skin",
    ],
    mechanism: `Chronic, low-grade inflammation — sometimes called "inflammaging" — accelerates the breakdown of collagen and elastin. One of the key messengers involved is **interleukin-6 (IL-6)**, which is released by skin cells in response to stressors such as UV light.

Palmitoyl tetrapeptide-7 is a short peptide derived from immunoglobulin G. In supplier cell studies it reduced IL-6 secretion by keratinocytes and fibroblasts, including after UV exposure. The proposed benefit is indirect: by dampening this inflammatory signal, it may slow the enzyme activity that degrades the matrix.

It is almost always used alongside palmitoyl tripeptide-1, combining a "build" signal with a "protect" signal.`,
    evidence: `**In vitro:** Supplier data show dose-dependent reductions in IL-6 release from skin cells.

**Human studies:** Available clinical data are for the Matrixyl 3000 combination and come from the manufacturer. Independent trials of the single peptide are scarce.

**Bottom line:** A sensible mechanism and an excellent safety profile; the evidence is mostly supplier-generated, so treat it as a supporting player in a complex.`,
    usage: `- **Typical concentration:** As part of Matrixyl 3000, 3%–8% of the trade complex.
- **pH:** Around **pH 4.5–7**.
- **Layering:** Compatible with all common actives.
- **When:** Morning and evening; a good choice after sun exposure.`,
    typicalConcentration: "3% – 8% (as Matrixyl 3000)",
    phRange: "4.5 – 7.0",
    pairsWith: ["Palmitoyl tripeptide-1", "Niacinamide", "Antioxidants", "Sunscreen"],
    avoidWith: [],
    concerns: ["fine-lines", "firmness", "barrier", "under-eye"],
    studies: [S.schagen, S.gorouhi, supplier("Sederma (Croda)")],
    evidenceLevel: 3,
    sortOrder: 4,
  },
  /* ------------------------------------------------------------------ */
  {
    slug: "acetyl-hexapeptide-8",
    name: "Argireline",
    inciName: "Acetyl Hexapeptide-8",
    aliases: ["Acetyl hexapeptide-3 (former INCI)", "Argireline (Lipotec / Lubrizol)"],
    peptideClass: "neurotransmitter-inhibitor",
    sequence: "Ac-Glu-Glu-Met-Gln-Arg-Arg-NH₂",
    molecularWeight: "≈ 889 Da",
    discovered: "Designed by Lipotec and published in 2002",
    summary:
      "Argireline is a synthetic hexapeptide modelled on the SNAP-25 protein. It is designed to modestly reduce the intensity of repeated facial muscle contractions, softening the look of expression lines on the forehead and around the eyes.",
    benefits: [
      "Helps soften the look of expression lines",
      "Targets forehead, frown and crow's-feet areas",
      "Non-irritating, needle-free approach",
      "Layers well with other peptides",
    ],
    mechanism: `Every facial expression starts with a nerve releasing the neurotransmitter **acetylcholine** onto a muscle. To release it, small vesicles inside the nerve ending must fuse with the cell membrane — a process driven by a protein assembly called the **SNARE complex**, made of SNAP-25, syntaxin and VAMP.

Argireline mimics the N-terminal end of **SNAP-25**. The idea is that it competes with native SNAP-25 for a place in the SNARE complex, producing a less efficient complex and therefore slightly less acetylcholine release. Less release means less intense micro-contractions, and over time, softer-looking lines formed by repeated movement.

This pathway is related to how botulinum toxin works (which cleaves SNAP-25), but the effect of a topical peptide is far weaker and fully reversible.`,
    evidence: `**In vitro:** The original publication showed Argireline inhibited SNARE complex formation and neurotransmitter release in cell models.

**Human studies:** The original study reported reduced wrinkle depth around the eyes after 30 days of twice-daily use of a 10% Argireline solution in a small group of volunteers. A later randomised, placebo-controlled study in Chinese subjects also reported improvements in periorbital wrinkles versus placebo.

**Caveats:** Studies are small, and how much peptide reaches the neuromuscular junction through intact skin remains uncertain.

**Bottom line:** Among neurotransmitter-inhibiting peptides, Argireline has the most published human data. Expect subtle smoothing of dynamic lines — not an injectable-like result.`,
    usage: `- **Typical concentration:** 3%–10% of the trade solution (our serum uses 10%). Neat peptide powders are used at far lower levels.
- **pH:** Around **pH 4.5–7**.
- **Where:** Forehead, glabella (between the brows), crow's-feet and smile lines.
- **Layering:** Pairs well with SNAP-8, Leuphasyl and Syn-Ake, plus signal peptides.
- **Results:** Studies measured change at about 4 weeks of twice-daily use.`,
    typicalConcentration: "3% – 10% of trade solution",
    phRange: "4.5 – 7.0",
    pairsWith: ["Acetyl octapeptide-3 (SNAP-8)", "Pentapeptide-18 (Leuphasyl)", "Signal peptides", "Hyaluronic acid"],
    avoidWith: [],
    concerns: ["expression-lines", "fine-lines"],
    studies: [
      {
        title: "A synthetic hexapeptide (Argireline) with antiwrinkle activity",
        source: "Blanes-Mira C, et al. International Journal of Cosmetic Science",
        year: 2002,
        url: pubmed("A synthetic hexapeptide (Argireline) with antiwrinkle activity"),
      },
      {
        title: "The anti-wrinkle efficacy of argireline, a synthetic hexapeptide, in Chinese subjects: a randomized, placebo-controlled study",
        source: "Wang Y, et al. American Journal of Clinical Dermatology",
        year: 2013,
        url: pubmed("anti-wrinkle efficacy of argireline synthetic hexapeptide Chinese subjects"),
      },
      S.gorouhi,
    ],
    evidenceLevel: 3,
    sortOrder: 5,
  },
  /* ------------------------------------------------------------------ */
  {
    slug: "acetyl-octapeptide-3",
    name: "SNAP-8",
    inciName: "Acetyl Octapeptide-3",
    aliases: ["SNAP-8 (Lipotec / Lubrizol)", "Extended Argireline"],
    peptideClass: "neurotransmitter-inhibitor",
    sequence: "Ac-Glu-Glu-Met-Gln-Arg-Arg-Ala-Asp-NH₂",
    molecularWeight: "≈ 1075 Da",
    discovered: "Developed by Lipotec as an elongation of the Argireline sequence",
    summary:
      "SNAP-8 extends the Argireline sequence by two amino acids, targeting the same SNARE-complex pathway. The manufacturer reports stronger activity than Argireline in its own testing; independent data remain limited.",
    benefits: [
      "Helps soften the look of expression lines",
      "Complements Argireline in layered routines",
      "Lightweight and non-irritating",
      "Suitable for the eye area (on the orbital bone)",
    ],
    mechanism: `SNAP-8 works on the same principle as Argireline: it mimics the N-terminal end of the **SNAP-25** protein and competes for a position in the **SNARE complex**, the molecular machinery that lets nerve endings release acetylcholine.

The two extra amino acids (alanine and aspartic acid) were added to make the mimic closer to the native protein sequence, which the developer reports improves its ability to destabilise SNARE complex formation.

Because SNAP-8 and Argireline act on the same target, they're frequently used together to maximise exposure to this pathway rather than for a different mechanism.`,
    evidence: `**In vitro:** Supplier data show inhibition of SNARE complex formation and neurotransmitter release, reported as greater than Argireline at equal concentration.

**Human studies:** Efficacy data come mainly from the manufacturer's small in-vivo studies on crow's-feet wrinkles over about four weeks. We are not aware of large independent placebo-controlled trials.

**Bottom line:** A logical upgrade or partner to Argireline, with promising but largely supplier-generated evidence.`,
    usage: `- **Typical concentration:** 3%–10% of the trade solution.
- **pH:** Around **pH 4.5–7**.
- **Where:** Areas of repeated expression.
- **Layering:** With Argireline (either order), Leuphasyl and signal peptides.`,
    typicalConcentration: "3% – 10% of trade solution",
    phRange: "4.5 – 7.0",
    pairsWith: ["Acetyl hexapeptide-8 (Argireline)", "Pentapeptide-18", "Hyaluronic acid"],
    avoidWith: [],
    concerns: ["expression-lines", "fine-lines"],
    studies: [supplier("Lipotec / Lubrizol"), S.errante],
    evidenceLevel: 2,
    sortOrder: 6,
  },
  /* ------------------------------------------------------------------ */
  {
    slug: "pentapeptide-18",
    name: "Leuphasyl",
    inciName: "Pentapeptide-18",
    aliases: ["Leuphasyl (Lipotec / Lubrizol)", "Enkephalin-mimetic peptide"],
    peptideClass: "neurotransmitter-inhibitor",
    sequence: "Tyr-D-Ala-Gly-Phe-Leu",
    molecularWeight: null,
    discovered: "Developed by Lipotec as an enkephalin mimic",
    summary:
      "Pentapeptide-18 is modelled on enkephalins — the body's own calming neuropeptides. It is designed to reduce nerve-cell excitability so that fewer contraction signals are sent, complementing SNARE-targeting peptides like Argireline.",
    benefits: [
      "Helps soften the look of expression lines",
      "Works on a different step from Argireline/SNAP-8",
      "Often combined for a broader approach",
      "Well tolerated",
    ],
    mechanism: `Enkephalins are natural pentapeptides that bind to receptors on nerve cells and reduce their excitability. Pentapeptide-18 mimics this structure (with a D-alanine for stability against enzymes).

The proposed mechanism is that by binding the **enkephalin receptor** on the outside of the nerve ending, it decreases the influx of calcium that's needed for vesicle release — so **less acetylcholine is released** per signal.

This acts *upstream* of the SNARE complex that Argireline targets, which is why the two are frequently combined: one turns down the signal, the other makes the release machinery less efficient.`,
    evidence: `**In vitro:** Supplier data on reduced neuronal excitability and neurotransmitter release.

**Human studies:** Manufacturer studies reported wrinkle reduction with Leuphasyl alone and a greater effect when combined with Argireline. Independent clinical data are limited.

**Bottom line:** A plausible complementary mechanism, with supplier-generated efficacy data. Most useful as part of an expression-line combination.`,
    usage: `- **Typical concentration:** 2%–5% of the trade solution.
- **pH:** Around **pH 5–7**.
- **Layering:** Commonly paired with Argireline, SNAP-8 and Syn-Ake.`,
    typicalConcentration: "2% – 5% of trade solution",
    phRange: "5.0 – 7.0",
    pairsWith: ["Argireline", "SNAP-8", "Syn-Ake"],
    avoidWith: [],
    concerns: ["expression-lines"],
    studies: [supplier("Lipotec / Lubrizol"), S.errante],
    evidenceLevel: 2,
    sortOrder: 7,
  },
  /* ------------------------------------------------------------------ */
  {
    slug: "dipeptide-diaminobutyroyl-benzylamide-diacetate",
    name: "Syn-Ake",
    inciName: "Dipeptide Diaminobutyroyl Benzylamide Diacetate",
    aliases: ["Syn-Ake (DSM-Firmenich)", "Synthetic 'snake venom' peptide"],
    peptideClass: "neurotransmitter-inhibitor",
    sequence: "β-Ala-Pro-Dab-NH-Benzyl · 2 AcOH",
    molecularWeight: null,
    discovered: "Developed by Pentapharm (now DSM-Firmenich), modelled on Waglerin-1 from temple viper venom",
    summary:
      "Syn-Ake is a small synthetic peptide modelled on a component of temple viper venom (no venom is involved). It is designed to act at the muscle side of the nerve–muscle junction, on the acetylcholine receptor.",
    benefits: [
      "Helps soften the look of expression lines",
      "Acts at the muscle receptor, not the nerve ending",
      "Complements Argireline and Leuphasyl",
      "Very small molecule",
    ],
    mechanism: `Waglerin-1, a peptide in the venom of the temple viper (*Tropidolaemus wagleri*), blocks the **muscular nicotinic acetylcholine receptor**. Syn-Ake is a small synthetic molecule designed to mimic that activity in a cosmetic-safe way.

Where Argireline and SNAP-8 act inside the nerve ending (reducing how much acetylcholine is released), Syn-Ake is proposed to act on the **receptor on the muscle cell**, reducing how strongly the muscle responds to the acetylcholine that is released. The intended result is more relaxed micro-contractions and softer-looking lines.`,
    evidence: `**In vitro:** Supplier data show reversible antagonism of the muscular acetylcholine receptor in cell models.

**Human studies:** Manufacturer studies report reduced wrinkle size on the forehead and around the eyes over about four weeks. We're not aware of large independent trials.

**Bottom line:** An interesting mechanism that rounds out an expression-line routine; evidence is largely supplier-generated.`,
    usage: `- **Typical concentration:** 1%–4% of the trade solution.
- **pH:** Around **pH 4–7**.
- **Layering:** With Leuphasyl, Argireline and SNAP-8.`,
    typicalConcentration: "1% – 4% of trade solution",
    phRange: "4.0 – 7.0",
    pairsWith: ["Pentapeptide-18", "Argireline", "SNAP-8"],
    avoidWith: [],
    concerns: ["expression-lines"],
    studies: [supplier("DSM-Firmenich (formerly Pentapharm)"), S.gorouhi],
    evidenceLevel: 2,
    sortOrder: 8,
  },
  /* ------------------------------------------------------------------ */
  {
    slug: "palmitoyl-tripeptide-38",
    name: "Matrixyl synthe'6",
    inciName: "Palmitoyl Tripeptide-38",
    aliases: ["Pal-KMO₂K", "Matrixyl synthe'6 (Sederma)"],
    peptideClass: "signal",
    sequence: "Pal-Lys-Met(O₂)-Lys-OH",
    molecularWeight: null,
    discovered: "Developed by Sederma (Croda), launched around 2010",
    summary:
      "Palmitoyl tripeptide-38 is a signal peptide reported to stimulate six major components of the skin matrix at once — including collagens I, III and IV, fibronectin, hyaluronic acid and laminin-5.",
    benefits: [
      "Helps reduce the look of wrinkles, including forehead lines",
      "Targets multiple matrix components",
      "Used in lip formulas for definition and volume",
      "Well tolerated",
    ],
    mechanism: `Palmitoyl tripeptide-38 is derived from a lysine-methionine-lysine (KMK) matrikine sequence. The methionine is oxidised to a sulfone (Met(O₂)) for stability, and a palmitic acid chain improves skin affinity.

According to the developer, it signals fibroblasts and keratinocytes to increase synthesis of **six key matrix constituents**: collagens I, III and IV, fibronectin, hyaluronic acid and laminin-5 — spanning both the dermis and the dermal–epidermal junction.

The "synthe'6" name refers to these six targets. In practice, it is used alongside other signal peptides and in lip treatments.`,
    evidence: `**In vitro:** Supplier data show increased synthesis of the six matrix components in cultured skin cells.

**Human studies:** Manufacturer studies report wrinkle reduction (including forehead and crow's-feet) over around two months. Independent clinical evidence is limited.

**Bottom line:** A modern, broad-acting signal peptide with supplier-generated data; well suited to multi-peptide formulas.`,
    usage: `- **Typical concentration:** 1%–2% of the trade solution.
- **pH:** Around **pH 4.5–7**.
- **Layering:** Compatible with retinoids, vitamin C and other peptides.`,
    typicalConcentration: "1% – 2% of trade solution",
    phRange: "4.5 – 7.0",
    pairsWith: ["Other signal peptides", "Hyaluronic acid", "Retinoids"],
    avoidWith: [],
    concerns: ["fine-lines", "firmness", "lips"],
    studies: [supplier("Sederma (Croda)"), S.schagen],
    evidenceLevel: 2,
    sortOrder: 9,
  },
  /* ------------------------------------------------------------------ */
  {
    slug: "acetyl-tetrapeptide-5",
    name: "Eyeseryl",
    inciName: "Acetyl Tetrapeptide-5",
    aliases: ["Eyeseryl (Lipotec / Lubrizol)"],
    peptideClass: "enzyme-inhibitor",
    sequence: "Ac-β-Ala-His-Ser-His-OH",
    molecularWeight: null,
    discovered: "Developed by Lipotec for the under-eye area",
    summary:
      "Acetyl tetrapeptide-5 is an eye-area peptide designed to help the look of puffiness. It is reported to inhibit angiotensin-converting enzyme (ACE) activity, reduce vascular permeability and limit glycation.",
    benefits: [
      "Helps reduce the look of under-eye puffiness",
      "Supports skin elasticity around the eyes",
      "Anti-glycation activity in supplier tests",
      "Light, non-irritating",
    ],
    mechanism: `Under-eye bags have several causes, including fluid accumulation when tiny blood vessels become more permeable, poor lymphatic drainage, and the gradual stiffening of collagen through **glycation** (sugar molecules binding to proteins).

Acetyl tetrapeptide-5 is reported by its developer to:
- **Inhibit ACE** (angiotensin-converting enzyme), which is involved in regulating vascular pressure and fluid balance;
- **Reduce vascular permeability**, helping limit fluid leaking into the tissue;
- **Inhibit glycation** of collagen, helping it stay supple.

It is often combined with ingredients that address dark circles (such as Haloxyl) and with caffeine for an immediate de-puffing effect.`,
    evidence: `**In vitro:** Supplier assays show ACE inhibition and anti-glycation activity.

**Human studies:** Manufacturer studies report reduced under-eye puffiness and improved elasticity over a few weeks. Independent data are limited.

**Bottom line:** A targeted, well-tolerated eye peptide; most evidence is from the supplier. Works best as part of a formula that also addresses hydration and circulation.`,
    usage: `- **Typical concentration:** 5%–10% of the trade solution.
- **pH:** Around **pH 5–7**.
- **Where:** Along the orbital bone, morning and night. Keep away from the lash line.`,
    typicalConcentration: "5% – 10% of trade solution",
    phRange: "5.0 – 7.0",
    pairsWith: ["Caffeine", "Haloxyl (Pal-tripeptide-1 + Pal-tetrapeptide-7)", "Hyaluronic acid"],
    avoidWith: [],
    concerns: ["under-eye"],
    studies: [supplier("Lipotec / Lubrizol"), S.errante],
    evidenceLevel: 2,
    sortOrder: 10,
  },
  /* ------------------------------------------------------------------ */
  {
    slug: "nonapeptide-1",
    name: "Melanostatine-5",
    inciName: "Nonapeptide-1",
    aliases: ["Melanostatine-5 (Infinitec)", "α-MSH antagonist peptide"],
    peptideClass: "enzyme-inhibitor",
    sequence: "Met-Pro-D-Phe-Arg-D-Trp-Phe-Lys-Pro-Val-NH₂",
    molecularWeight: null,
    discovered: "Developed by Infinitec Activos as a biomimetic of α-MSH",
    summary:
      "Nonapeptide-1 is a biomimetic peptide that competes with α-MSH at the MC1R receptor on melanocytes, turning down the signal that switches on pigment production. It's used to help even out tone and dark spots.",
    benefits: [
      "Helps visibly even out skin tone",
      "Targets the signal upstream of melanin production",
      "Complements vitamin C, niacinamide and tyrosinase inhibitors",
      "Non-irritating alternative to harsher brighteners",
    ],
    mechanism: `When skin is exposed to UV or inflammation, keratinocytes release **α-melanocyte-stimulating hormone (α-MSH)**. α-MSH binds to the **melanocortin-1 receptor (MC1R)** on melanocytes, which ramps up tyrosinase — the key enzyme in melanin synthesis.

Nonapeptide-1 mimics part of α-MSH but acts as an **antagonist**: it occupies MC1R without activating it, so less tyrosinase activation and less melanin follow. (Strictly speaking it's a receptor antagonist; we group it with the "inhibitor" peptides because the end result is reduced activity of the pigment-making enzyme.)

Because it works at the signalling stage, it's complementary to ingredients that act further down the line — vitamin C and tyrosinase inhibitors (during melanin synthesis) and niacinamide (pigment transfer to surrounding cells).`,
    evidence: `**In vitro:** Supplier data show reduced melanin production in melanocyte cultures stimulated by α-MSH.

**Human studies:** Manufacturer studies report a lightening effect on skin tone over around four to eight weeks. Independent trials are limited.

**Bottom line:** A logical, gentle addition to a brightening routine — but no brightener can outpace daily UV exposure, so sunscreen remains the most important step.`,
    usage: `- **Typical concentration:** 1%–5% of the trade solution.
- **pH:** Around **pH 5–7**.
- **Layering:** With niacinamide, vitamin C, azelaic acid and daily SPF 50+.
- **Results:** Pigment changes slowly — allow 8–12 weeks.`,
    typicalConcentration: "1% – 5% of trade solution",
    phRange: "5.0 – 7.0",
    pairsWith: ["Niacinamide", "Vitamin C", "Azelaic acid", "Sunscreen"],
    avoidWith: [],
    concerns: ["dark-spots", "dullness"],
    studies: [supplier("Infinitec Activos"), S.errante],
    evidenceLevel: 2,
    sortOrder: 11,
  },
  /* ------------------------------------------------------------------ */
  {
    slug: "biotinoyl-tripeptide-1",
    name: "Biotinoyl Tripeptide-1",
    inciName: "Biotinoyl Tripeptide-1",
    aliases: ["Biotin-GHK", "Part of Procapil (Sederma)"],
    peptideClass: "signal",
    sequence: "Biotinoyl-Gly-His-Lys",
    molecularWeight: null,
    discovered: "Developed by Sederma (Croda) for hair and lash products",
    summary:
      "Biotinoyl tripeptide-1 links biotin to the GHK peptide. It's used in scalp and lash formulas — most often in the Procapil complex — to support follicle anchoring and fuller-looking hair.",
    benefits: [
      "Supports fuller-looking hair",
      "Designed to support follicle anchoring",
      "Used in scalp, brow and lash serums",
      "Lightweight, leave-on friendly",
    ],
    mechanism: `Hair is held in place by the follicle's connection to the surrounding tissue, which involves proteins such as **laminin-5** and **collagen IV** at the follicle's basement membrane. Weaker anchoring is associated with increased shedding.

Biotinoyl tripeptide-1 combines **biotin** (vitamin B7) with **GHK**. The developer reports that it stimulates the expression of these anchoring proteins in the follicle, helping hair stay in the growth phase longer.

In the Procapil complex it's combined with **apigenin** (a flavonoid studied for scalp micro-circulation) and **oleanolic acid** (studied for 5-α-reductase activity), so the complex targets several follicle-related pathways together.`,
    evidence: `**In vitro / ex vivo:** Supplier studies on hair follicles show increased anchoring-protein expression.

**Human studies:** Manufacturer studies on the Procapil complex report improved anagen-to-telogen ratios over about four months. Independent controlled trials are limited.

**Bottom line:** A popular, well-tolerated cosmetic option for hair density, with mostly supplier-generated data. Hair loss can have medical causes — see a doctor about sudden or significant shedding.`,
    usage: `- **Typical concentration:** As Procapil, 3%–5% of the trade complex.
- **pH:** Around **pH 5–7**.
- **How:** Leave-on scalp serum, applied daily to the scalp. Allow 3–4 months for results.`,
    typicalConcentration: "3% – 5% (as Procapil)",
    phRange: "5.0 – 7.0",
    pairsWith: ["Caffeine", "GHK-Cu", "Niacinamide"],
    avoidWith: [],
    concerns: ["hair-density"],
    studies: [supplier("Sederma (Croda)")],
    evidenceLevel: 2,
    sortOrder: 12,
  },
  /* ------------------------------------------------------------------ */
  {
    slug: "palmitoyl-tripeptide-5",
    name: "SYN-COLL",
    inciName: "Palmitoyl Tripeptide-5",
    aliases: ["Pal-KVK", "SYN-COLL (DSM-Firmenich)"],
    peptideClass: "signal",
    sequence: "Pal-Lys-Val-Lys-OH",
    molecularWeight: null,
    discovered: "Developed by Pentapharm (now DSM-Firmenich)",
    summary:
      "Palmitoyl tripeptide-5 is designed to mimic thrombospondin-1's ability to activate TGF-β, a key growth factor for collagen synthesis, while also helping protect existing collagen from breakdown.",
    benefits: [
      "Supports collagen production via the TGF-β pathway",
      "Helps protect existing collagen",
      "Helps reduce the look of wrinkles",
      "Pairs well with barrier-repair ingredients",
    ],
    mechanism: `**TGF-β** (transforming growth factor beta) is one of the most important signals for collagen production. It's stored in the skin in an inactive form and needs to be "switched on". One natural activator is **thrombospondin-1**, a matrix protein that contains a short activating sequence.

Palmitoyl tripeptide-5 is designed to mimic that activating action, encouraging fibroblasts to produce more collagen through the body's own TGF-β pathway. The developer also reports that it reduces the activity of **MMP-1 and MMP-3**, enzymes that degrade collagen.

The palmitoyl chain improves skin affinity and stability.`,
    evidence: `**In vitro:** Supplier data show increased collagen synthesis in fibroblasts and reduced MMP activity.

**Human studies:** Manufacturer studies report wrinkle reduction over around 12 weeks. Independent placebo-controlled trials are limited.

**Bottom line:** A mechanistically appealing signal peptide that works well alongside Matrixyl-type peptides; evidence is mainly from the supplier.`,
    usage: `- **Typical concentration:** 1%–2.5% of the trade solution.
- **pH:** Around **pH 4.5–7**.
- **Layering:** Pairs with other signal peptides, ceramides and retinoids. Our Night Cream combines it with Matrixyl and Matrixyl synthe'6.`,
    typicalConcentration: "1% – 2.5% of trade solution",
    phRange: "4.5 – 7.0",
    pairsWith: ["Palmitoyl pentapeptide-4", "Palmitoyl tripeptide-38", "Ceramides", "Retinoids"],
    avoidWith: [],
    concerns: ["fine-lines", "firmness"],
    studies: [supplier("DSM-Firmenich (formerly Pentapharm)"), S.schagen],
    evidenceLevel: 2,
    sortOrder: 13,
  },
];
