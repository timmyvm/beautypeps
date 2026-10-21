import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Chapter, Note } from "@/components/info/chapter";
import { Figure, PageHeader, reveal } from "@/components/info/page-header";
import { ClassDiagram } from "@/components/peptides/class-diagram";
import { classShortLabel } from "@/components/peptides/peptide-entry";
import { LoopVideo } from "@/components/site/loop-video";
import { ButtonLink } from "@/components/ui/button";
import { PEPTIDE_CLASSES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "The science of cosmetic peptides",
  description:
    "How cosmetic peptides work: amino acids and peptide bonds, collagen and the dermis, the four peptide classes, the skin-penetration problem, and how to read the evidence behind peptide claims.",
  path: "/science",
});

const SECTIONS = [
  { id: "what-is-a-peptide", title: "What is a peptide?" },
  { id: "skin-biology", title: "A skin biology primer" },
  { id: "four-classes", title: "The four peptide classes" },
  { id: "penetration", title: "The penetration problem" },
  { id: "evidence", title: "How to read the evidence" },
  { id: "choosing", title: "Choosing and combining" },
  { id: "stability", title: "Stability and storage" },
];

const CLASS_EXAMPLES: Record<string, { examples: { label: string; slug: string }[]; detail: string }> = {
  signal: {
    examples: [
      { label: "Matrixyl", slug: "palmitoyl-pentapeptide-4" },
      { label: "Palmitoyl Tripeptide-1", slug: "palmitoyl-tripeptide-1" },
      { label: "Matrixyl synthe'6", slug: "palmitoyl-tripeptide-38" },
      { label: "SYN-COLL", slug: "palmitoyl-tripeptide-5" },
    ],
    detail:
      "Many signal peptides are fragments of collagen or other matrix proteins, known as matrikines. When collagen breaks down these fragments appear naturally and act as a message that repair is needed. Applied to the skin, they aim to send fibroblasts the same message, nudging production of collagen I and III, fibronectin and glycosaminoglycans.",
  },
  carrier: {
    examples: [{ label: "GHK-Cu", slug: "ghk-cu" }],
    detail:
      "Carrier peptides bind a trace element and help deliver it. The best known is GHK-Cu: the tripeptide glycyl-histidyl-lysine holding a copper(II) ion. Copper is a cofactor for lysyl oxidase, which cross-links collagen and elastin, and for the antioxidant enzyme superoxide dismutase. GHK-Cu has been studied for wound healing and remodelling for decades.",
  },
  "neurotransmitter-inhibitor": {
    examples: [
      { label: "Argireline", slug: "acetyl-hexapeptide-8" },
      { label: "SNAP-8", slug: "acetyl-octapeptide-3" },
      { label: "Leuphasyl", slug: "pentapeptide-18" },
      { label: "Syn-Ake", slug: "dipeptide-diaminobutyroyl-benzylamide-diacetate" },
    ],
    detail:
      "Repeated expressions crease the skin over time. These peptides interfere, gently and reversibly, with the chain of signals that tells expression muscles to contract, for example by competing with SNAP-25 for a place in the SNARE complex that releases acetylcholine. They are called topical Botox, but the effect is far milder and limited by how much reaches the muscle.",
  },
  "enzyme-inhibitor": {
    examples: [
      { label: "Melanostatine-5", slug: "nonapeptide-1" },
      { label: "Eyeseryl", slug: "acetyl-tetrapeptide-5" },
    ],
    detail:
      "Some peptides slow the enzymes and receptors behind visible concerns: the matrix metalloproteinases (MMPs) that degrade collagen, or the melanocortin pathway that switches on tyrosinase and pigment. Nonapeptide-1, for example, competes with α-MSH at the MC1 receptor on melanocytes, which may soften the look of uneven tone.",
  },
};

export default function SciencePage() {
  return (
    <>
      <PageHeader
        crumbs={[{ href: "/", label: "Home" }, { label: "The science" }]}
        title="How cosmetic peptides work"
        lead="A plain-English guide to the biology behind peptide skincare: what peptides are, how they reach the skin, and how to tell good evidence from good marketing."
        figure={
          <Figure ratio="aspect-[4/3]" caption="GHK, three amino acids holding one copper ion, drawn as beads.">
            <Image
              src="/images/editorial/science.webp"
              alt="A model of a peptide chain in copper and blue beads beside a single droplet, on a dark ground"
              fill
              loading="eager"
              fetchPriority="high"
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </Figure>
        }
      >
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <ButtonLink href="/peptides">Open the peptide library</ButtonLink>
          <p className="text-body text-muted">A fifteen-minute read by our formulation team</p>
        </div>
      </PageHeader>

      <nav aria-labelledby="contents-title" className="container-bp mt-20 lg:mt-32">
        <div className="bg-surface px-6 py-10 sm:px-10 lg:grid lg:grid-cols-12 lg:gap-[var(--gutter)] lg:py-14">
          <h2 id="contents-title" className="text-lead font-medium lg:col-span-3">
            In this guide
          </h2>
          <ol className="mt-6 list-decimal gap-x-[var(--gutter)] space-y-3 pl-6 text-lead marker:text-muted sm:columns-2 lg:col-span-9 lg:mt-0">
            {SECTIONS.map((s) => (
              <li key={s.id} className="break-inside-avoid pl-2">
                <a href={`#${s.id}`} className="link-quiet">
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </div>
      </nav>

      <div className="container-bp">
        <Chapter
          id="what-is-a-peptide"
          title="What is a peptide?"
          aside={
            <ChapterPicture
              src="/images/articles/what-are-peptides.webp"
              alt="A chain of copper and glass beads curving across a cream ground"
              caption="A peptide is a short chain of amino acids, joined end to end."
            />
          }
        >
          <Prose>
            <p>
              Every protein in your body, from collagen and elastin to keratin and the enzymes that keep skin working,
              is built from the same 20 building blocks: <Term slug="amino-acid">amino acids</Term>. Link two with a{" "}
              <Term slug="peptide-bond">peptide bond</Term> and you have a dipeptide; three makes a tripeptide; up to
              about 50 is a peptide. Beyond that, the chain usually folds into a protein.
            </p>
            <p>
              That size difference matters. A collagen molecule weighs roughly 300,000 daltons, far too large to pass
              through the skin, which is why collagen in a cream works as a humectant rather than topping up the
              collagen in your dermis. Cosmetic peptides are tiny by comparison: GHK is three amino acids, about 340
              daltons, and most cosmetic peptides sit between 400 and 1,000.
            </p>
            <Note title="Why short chains are interesting">
              Short peptides can act as messages. The body already uses fragments of broken-down proteins as signals:
              pieces of degraded collagen tell fibroblasts that repair is needed. Many cosmetic peptides are synthetic
              copies of these fragments.
            </Note>
            <p>
              Peptides are written in one- or three-letter amino-acid codes. Matrixyl&apos;s core sequence is KTTKS
              (lysine, threonine, threonine, lysine, serine); GHK-Cu is glycine, histidine and lysine bound to copper.
              On a label you will see the <Term slug="inci">INCI</Term> name instead, such as Palmitoyl Pentapeptide-4.
              The number identifies which pentapeptide it is, not how strong it is.
            </p>
          </Prose>
        </Chapter>

        <Chapter
          id="skin-biology"
          title="A skin biology primer"
          aside={
            <ChapterPicture
              src="/images/articles/matrixyl-collagen-signal-peptides.webp"
              alt="Close-up of fine pink and cream fibres, like collagen seen under magnification"
              caption="The dermis is mostly collagen: fibres that give skin its strength."
            />
          }
        >
          <figure className="mb-10" {...reveal(1)}>
            <div className="bg-surface">
              <SkinLayers />
            </div>
            <figcaption className="mt-3 max-w-[60ch] text-small">
              From the top: peptides on the surface, the stratum corneum, the living epidermis, and the dermis, where
              fibroblasts build collagen and elastin. A peptide has to cross the first two to reach the third.
            </figcaption>
          </figure>
          <Prose>
            <p>
              Skin has two main layers. The <strong>epidermis</strong> is the protective outer layer, topped by the{" "}
              <Term slug="stratum-corneum">stratum corneum</Term>: 15 to 20 layers of flattened, dead cells held in a
              lipid mortar. Its job is to keep water in and everything else out, which is exactly what makes topical
              skincare hard.
            </p>
            <p>
              Beneath it sits the <strong>dermis</strong>, home to <Term slug="fibroblast">fibroblasts</Term>, the
              cells that build and maintain the <Term slug="extracellular-matrix">extracellular matrix</Term>. The
              matrix is the skin&apos;s scaffolding: mostly <Term slug="collagen">collagen I and III</Term>, with{" "}
              <Term slug="elastin">elastin</Term> for spring and{" "}
              <Term slug="glycosaminoglycans">glycosaminoglycans</Term> such as hyaluronic acid for cushioning and
              water.
            </p>
            <h3>What changes with age and sun</h3>
            <ul>
              <li>
                <strong>Collagen production slows.</strong> Adult skin is commonly estimated to lose around 1% of its
                dermal collagen a year, and fibroblasts become less active.
              </li>
              <li>
                <strong>Breakdown speeds up.</strong> UV switches on{" "}
                <Term slug="mmps">matrix metalloproteinases</Term>, enzymes that degrade collagen. This is the main
                driver of photoageing, which is why daily SPF remains the most effective anti-ageing step.
              </li>
              <li>
                <strong>Expression lines deepen.</strong> Facial muscles fold the skin in the same place thousands of
                times a day.
              </li>
              <li>
                <strong>Pigment becomes uneven.</strong> Melanocytes respond to UV and inflammation through signals
                such as <Term slug="alpha-msh">α-MSH</Term>, switching on <Term slug="tyrosinase">tyrosinase</Term>.
              </li>
            </ul>
            <p>Each class of peptide targets one of these processes.</p>
          </Prose>
        </Chapter>

        <section id="four-classes" aria-labelledby="four-classes-title" className="mt-24 scroll-mt-24 lg:mt-36">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-[var(--gutter)]">
            <h2 id="four-classes-title" className="display-type text-head lg:col-span-5" {...reveal(0)}>
              The four peptide classes
            </h2>
            <p className="max-w-[60ch] text-body lg:col-span-7 lg:col-start-6">
              Researchers group cosmetic peptides by mechanism. The groups overlap (GHK-Cu is both a carrier and a
              signal) but they make a useful map. In every drawing the blue beads are the peptide.
            </p>
          </div>
          <ul className="-mx-4 mt-14">
            {Object.entries(PEPTIDE_CLASSES).map(([key, c], i) => {
              const ex = CLASS_EXAMPLES[key];
              return (
                <li
                  key={key}
                  data-reveal="row"
                  style={{ ["--reveal-i" as string]: i }}
                  className={cn(
                    "grid gap-6 px-4 py-8 lg:grid-cols-12 lg:gap-[var(--gutter)] lg:py-10",
                    i % 2 === 0 ? "bg-surface" : "bg-bg",
                  )}
                >
                  <div className={cn("p-4 lg:col-span-4", i % 2 === 0 ? "bg-bg" : "bg-surface")}>
                    <ClassDiagram type={key} />
                  </div>
                  <div className="lg:col-span-7 lg:col-start-6">
                    <h3 className="text-lead font-medium">{classShortLabel(key)} peptides</h3>
                    <p className="mt-3 max-w-[64ch] text-body">{ex?.detail ?? c.description}</p>
                    {ex && (
                      <p className="mt-4 text-body">
                        In the library:{" "}
                        {ex.examples.map((e, j) => (
                          <span key={e.slug}>
                            {j > 0 && ", "}
                            <Link href={`/peptides/${e.slug}`} className="underline underline-offset-4">
                              {e.label}
                            </Link>
                          </span>
                        ))}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

      </div>

      <section
        id="penetration"
        aria-labelledby="penetration-title"
        className="mt-24 scroll-mt-8 bg-field-frost py-20 lg:mt-36 lg:py-28"
      >
        <div className="container-bp">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-[var(--gutter)]">
            <h2 id="penetration-title" className="display-type text-head lg:col-span-5" {...reveal(0)}>
              The penetration problem
            </h2>
            <Prose className="lg:col-span-6 lg:col-start-7">
              <p>
                A peptide can only work if it reaches its target. For years the rule of thumb has been the{" "}
                <Term slug="dalton">500 dalton rule</Term>: molecules much larger than about 500 daltons struggle to
                cross intact skin on their own. Most cosmetic peptides sit above that line, and many are water-loving,
                while the stratum corneum favours oil-loving molecules.
              </p>
              <p>Formulators use four tricks to close the gap.</p>
            </Prose>
          </div>
          <dl className="mt-14 grid gap-x-[var(--gutter)] gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Palmitoylation",
                text: "Attaching palmitic acid, a 16-carbon fatty acid, makes a peptide more oil-loving so it moves into skin lipids. It is the Palmitoyl in Palmitoyl Pentapeptide-4.",
                href: "/glossary#palmitoylation",
              },
              {
                title: "Acetylation and amidation",
                text: "Capping the ends of a chain, the Acetyl in Acetyl Hexapeptide-8, protects it from enzymes in the skin and can help it penetrate.",
                href: "/glossary#acetylation",
              },
              {
                title: "Delivery systems",
                text: "Liposomes and other encapsulation systems carry peptides into the upper layers and protect them on the way.",
                href: "/glossary#liposome",
              },
              {
                title: "Concentration and contact time",
                text: "Leave-on serums at studied concentrations give peptides a chance. A rinse-off cleanser with a trace of peptide does not.",
                href: "/compare",
              },
            ].map((t, i) => (
              <div key={t.title} {...reveal(i + 1)}>
                <dt className="text-lead font-medium">
                  <Link href={t.href} className="link-quiet">
                    {t.title}
                  </Link>
                </dt>
                <dd className="mt-2 text-body">{t.text}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-16 grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-[var(--gutter)]">
            <Figure
              ratio="aspect-[16/9]"
              className="lg:col-span-5"
              caption="The vehicle matters: a leave-on serum gives a peptide time to work."
            >
              <Image
                src="/images/editorial/texture.webp"
                alt="A clear gel and a white cream swatched side by side on a pale ground"
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            </Figure>
            <p className="max-w-[60ch] text-body lg:col-span-6 lg:col-start-7 lg:pb-8">
              Even so, only a small fraction of any topical active reaches the dermis. That is not a reason to dismiss
              peptides, since very small amounts of a signalling molecule can matter, but it is why we publish
              concentrations and why we are cautious about dramatic claims.
            </p>
          </div>
        </div>
      </section>

      <div className="container-bp">

        <Chapter
          id="evidence"
          title="How to read the evidence"
          aside={
            <ChapterPicture
              src="/images/editorial/lab.webp"
              alt="A formulation bench with beakers, a scale and amber vials in morning light"
              caption="Most peptide research starts in the lab of the company that makes it."
            />
          }
        >
          <Prose>
            <p>
              Peptide marketing loves a number: up to 350% more collagen, wrinkles reduced by up to 30%. Here is how to
              put those numbers in context.
            </p>
          </Prose>
          <Table
            head={["Study type", "What it shows", "Watch out for"]}
            rows={[
              ["In vitro", "Effects on cells in a dish, such as fibroblasts making more collagen.", "No skin barrier, so it cannot show the peptide reaches its target."],
              ["Ex vivo", "Effects on donated human skin kept alive in the lab.", "Closer to life, but short-lived and without blood supply or immune system."],
              ["In vivo, open", "Volunteers apply the product and changes are measured over weeks.", "No placebo group, and moisturising alone improves the look of fine lines."],
              ["Controlled trial", "Peptide against the same base without it, ideally blinded and randomised.", "The gold standard: check the sample size and who ran it."],
            ]}
          />
          <Prose>
            <h3>Five questions to ask of any claim</h3>
            <ol>
              <li>
                <strong>Up to, or on average?</strong> Up to 30% usually describes the single best responder. The
                average is often far lower.
              </li>
              <li>
                <strong>Compared with what?</strong> A result against untreated skin includes the effect of simply
                moisturising. Look for placebo-controlled comparisons.
              </li>
              <li>
                <strong>How many people, for how long?</strong> Ten volunteers over 28 days is a pilot, not proof.
              </li>
              <li>
                <strong>Who ran it?</strong> Most peptide data comes from ingredient manufacturers. It is valuable, but
                independent replication carries more weight.
              </li>
              <li>
                <strong>At what concentration?</strong> A study at 10% says little about a product containing 0.1%.
              </li>
            </ol>
            <p>
              That is why every monograph in the <Link href="/peptides">peptide library</Link> carries an evidence
              grade from 1 (lab only) to 5 (several independent clinical trials). Most cosmetic peptides sit at 2 or 3,
              a handful at 4. That does not make them useless; it means realistic expectations: subtle, cumulative
              change over 8 to 12 weeks, not overnight transformation.
            </p>
          </Prose>
        </Chapter>

        <Chapter
          id="choosing"
          title="Choosing and combining"
          aside={
            <ChapterPicture
              src="/images/articles/how-to-layer-peptides.webp"
              alt="Four serums in frosted bottles above swatches of each texture on stone"
              caption="Thinnest to thickest: water-light serums first, creams after."
            />
          }
        >
          <Prose>
            <p>Start with your main concern, then pick the class that targets it.</p>
          </Prose>
          <Table
            head={["If your concern is", "Look for"]}
            rows={[
              ["Fine lines, loss of firmness", <Shop key="f" href="/shop?concern=firmness">Signal peptides (the Matrixyl family) and GHK-Cu</Shop>],
              ["Expression lines on the forehead and around the eyes", <Shop key="e" href="/shop?concern=expression-lines">Neurotransmitter inhibitors: Argireline, SNAP-8, Leuphasyl</Shop>],
              ["Dullness, uneven tone, dark spots", <Shop key="d" href="/shop?concern=dark-spots">Nonapeptide-1 alongside SPF</Shop>],
              ["Puffiness and dark circles", <Shop key="u" href="/shop?concern=under-eye">Acetyl Tetrapeptide-5 and eye-specific signal peptides</Shop>],
              ["Barrier recovery", <Shop key="b" href="/shop?concern=barrier">GHK-Cu and gentle signal peptides</Shop>],
              ["Thinning-looking hair", <Shop key="h" href="/shop?concern=hair-density">Biotinoyl Tripeptide-1 and copper peptides for the scalp</Shop>],
            ]}
          />
          <Prose>
            <h3>Layering basics</h3>
            <ul>
              <li>
                <strong>Peptides play well with most things.</strong> Niacinamide, hyaluronic acid, ceramides and
                sunscreen are all easy partners.
              </li>
              <li>
                <strong>Different mechanisms stack.</strong> A signal peptide plus a neurotransmitter inhibitor
                targets two causes of lines, which is why multi-peptide formulas exist.
              </li>
              <li>
                <strong>Keep copper peptides away from strong acids</strong> and L-ascorbic acid in the same step. Low
                pH can loosen the copper complex, and copper can oxidise vitamin C. Use them at different times of
                day.
              </li>
              <li>
                <strong>With retinoids,</strong> many people alternate nights or use the peptide in the morning. The
                aim is to avoid irritation; there is no chemical reason to keep them apart.
              </li>
              <li>
                <strong>Apply thinnest to thickest:</strong> water-light serums first, then creams, then SPF in the
                morning.
              </li>
            </ul>
            <p>
              Want this matched to your skin? The <Link href="/routine-builder">routine builder</Link> does it for
              you, and <Link href="/learn/how-to-layer-peptides">our layering guide</Link> goes deeper.
            </p>
          </Prose>
        </Chapter>

      </div>

      <section
        id="stability"
        aria-labelledby="stability-title"
        className="mt-24 scroll-mt-8 bg-field-ink py-20 text-field-ink-ink lg:mt-36 lg:py-28"
      >
        <div className="container-bp grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-[var(--gutter)]">
          <figure className="lg:col-span-5" {...reveal(1)}>
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-white/10">
              <LoopVideo
                src="/video/copper-drop.mp4"
                poster="/video/copper-drop-poster.webp"
                label="Drops of blue copper peptide serum falling onto a brushed copper plate"
              />
            </div>
            <figcaption className="mt-3 max-w-[40ch] text-small text-white/80">
              GHK-Cu serum is blue from its copper. Green or brown means the complex has broken down.
            </figcaption>
          </figure>
          <div className="lg:col-span-6 lg:col-start-7">
            <h2 id="stability-title" className="display-type text-head" {...reveal(0)}>
              Stability and storage
            </h2>
            <dl className="mt-10 grid gap-x-[var(--gutter)] gap-y-8 sm:grid-cols-3">
              {[
                { title: "Keep them cool", text: "Heat speeds degradation. Store serums below 25 °C and pure powders in the fridge." },
                { title: "Mind the pH", text: "Most peptides are happiest between pH 5 and 7. Very acidic or alkaline formulas can break peptide bonds." },
                { title: "Keep powders dry", text: "Freeze-dried peptides stay stable for years when dry and sealed. Once dissolved, use them within weeks." },
              ].map((c, i) => (
                <div key={c.title} {...reveal(i + 1)}>
                  <dt className="text-lead font-medium">{c.title}</dt>
                  <dd className="mt-2 text-body">{c.text}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-10 max-w-[60ch] text-body">
              Peptides can also be broken down by enzymes called proteases, on the skin and in poorly preserved
              formulas, which is another reason acetylated, amidated or palmitoylated peptides are preferred in
              skincare. If you formulate with our pure actives, add them in the{" "}
              <Term slug="cool-down-phase" className="text-white underline underline-offset-4">
                cool-down phase
              </Term>{" "}
              below 40 °C and read{" "}
              <Link href="/learn/storing-peptide-powders" className="text-white underline underline-offset-4">
                our storage guide
              </Link>
              .
            </p>
            <p className="mt-6 max-w-[60ch] text-body">
              <strong className="font-medium">A word on colour.</strong> Copper peptide serums are naturally blue. If a
              GHK-Cu product turns green or brown, the copper complex may have degraded or oxidised, and it is time to
              replace it.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="next-title" className="container-bp mt-28 lg:mt-44">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-[var(--gutter)]">
          <Figure ratio="aspect-[4/3]" className="lg:col-span-6">
            <Image
              src="/images/editorial/actives.webp"
              alt="A row of amber vials of freeze-dried peptide powder on a travertine bench beside a scale"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="drift object-cover"
            />
          </Figure>
          <div className="lg:col-span-5 lg:col-start-8 lg:pb-2">
            <h2 id="next-title" className="display-type text-head" {...reveal(0)}>
              Every peptide, one by one
            </h2>
            <p className="mt-6 max-w-[44ch] text-body" {...reveal(1)}>
              Sequences, mechanisms, study summaries and how to use each one, graded for strength of evidence.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4" {...reveal(2)}>
              <ButtonLink href="/peptides">Open the peptide library</ButtonLink>
              <Link href="/compare" className="text-body underline underline-offset-4">
                Compare peptides
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* A real table from a small screen up; on a phone each row becomes a short list, so nothing scrolls sideways. */
function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="my-10">
      <table className="hidden w-full text-left text-body sm:table">
        <thead className="bg-surface">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-4 py-3 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        {/* taste-skill-ignore: the rules separate the rows of a real data table */}
        <tbody className="divide-y divide-surface-2 align-top" /* taste-skill-ignore */>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) =>
                j === 0 ? (
                  <th key={j} scope="row" className="px-4 py-4 font-medium">
                    {c}
                  </th>
                ) : (
                  <td key={j} className="px-4 py-4">
                    {c}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <ul className="space-y-2 sm:hidden">
        {rows.map((r, i) => (
          <li key={i} className="bg-surface p-4">
            <p className="text-body font-medium">{r[0]}</p>
            <dl className="mt-2 space-y-2 text-body">
              {r.slice(1).map((c, j) => (
                <div key={j}>
                  <dt className="text-small text-muted">{head[j + 1]}</dt>
                  <dd>{c}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Shop({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="text-accent underline underline-offset-4">
      {children}
    </Link>
  );
}

function Prose({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("prose-bp", className)}>{children}</div>;
}

function ChapterPicture({ src, alt, caption }: { src: string; alt: string; caption: string }) {
  return (
    <figure className="mt-10 max-w-[480px]" {...reveal(1)}>
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface">
        <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 30vw, 100vw" className="object-cover" />
      </div>
      <figcaption className="mt-3 max-w-[40ch] text-small">{caption}</figcaption>
    </figure>
  );
}

function Term({ slug, children, className }: { slug: string; children: ReactNode; className?: string }) {
  return (
    <Link href={`/glossary#${slug}`} title="See the glossary" className={className}>
      {children}
    </Link>
  );
}

/* The skin in cross-section, drawn without words: the caption beside it names the layers. */
function SkinLayers() {
  return (
    <svg viewBox="0 0 720 260" role="img" aria-label="Cross-section of skin with peptides on the surface" className="h-auto w-full">
      {[120, 300, 520].map((x) => (
        <g key={x}>
          <line x1={x} y1={22} x2={x + 26} y2={22} className="stroke-accent" strokeWidth={2.4} />
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={x + i * 13} cy={22} r={5} className="fill-accent" />
          ))}
        </g>
      ))}
      <rect x="0" y="40" width="720" height="34" className="fill-field-stone" />
      {Array.from({ length: 24 }).map((_, i) => (
        <rect key={i} x={i * 30 + (i % 2) * 8} y={46 + (i % 2) * 12} width={26} height={9} className="fill-white" />
      ))}
      <rect x="0" y="74" width="720" height="56" className="fill-field-frost" />
      {Array.from({ length: 16 }).map((_, i) => (
        <circle key={i} cx={24 + i * 44} cy={102} r={13} className="fill-white" />
      ))}
      {Array.from({ length: 6 }).map((_, i) => (
        <path
          key={i}
          d={`M0 ${150 + i * 18} q 30 -10 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0`}
          className="fill-none stroke-field-stone"
          strokeWidth={2}
        />
      ))}
      {[160, 380, 590].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy={200} rx={30} ry={14} className="fill-field-frost" />
          <ellipse cx={x} cy={200} rx={8} ry={6} className="fill-ink" />
        </g>
      ))}
    </svg>
  );
}
