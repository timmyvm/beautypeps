import { ArrowRight, Microscope, ShieldCheck, Thermometer, TriangleAlert } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/info/breadcrumbs";
import { ClassDiagram } from "@/components/peptides/class-diagram";
import { ButtonLink } from "@/components/ui/button";
import { PEPTIDE_CLASSES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "The science of cosmetic peptides",
  description:
    "How cosmetic peptides work: amino acids and peptide bonds, collagen and the dermis, the four peptide classes, the skin-penetration problem, and how to read the evidence behind peptide claims.",
};

const SECTIONS = [
  { id: "what-is-a-peptide", title: "What is a peptide?" },
  { id: "skin-biology", title: "A skin biology primer" },
  { id: "four-classes", title: "The four peptide classes" },
  { id: "penetration", title: "The penetration problem" },
  { id: "evidence", title: "How to read the evidence" },
  { id: "choosing", title: "Choosing & combining" },
  { id: "stability", title: "Stability & storage" },
];

const CLASS_EXAMPLES: Record<string, { examples: { label: string; slug: string }[]; detail: string }> = {
  signal: {
    examples: [
      { label: "Matrixyl (Palmitoyl Pentapeptide-4)", slug: "palmitoyl-pentapeptide-4" },
      { label: "Palmitoyl Tripeptide-1", slug: "palmitoyl-tripeptide-1" },
      { label: "Matrixyl synthe'6", slug: "palmitoyl-tripeptide-38" },
      { label: "SYN-COLL", slug: "palmitoyl-tripeptide-5" },
    ],
    detail:
      "Many signal peptides are fragments of collagen or other matrix proteins — so-called matrikines. When collagen breaks down, these fragments appear naturally and act as a 'repair needed' message. Applying them topically aims to send the same message to fibroblasts, nudging production of collagen I and III, fibronectin and glycosaminoglycans.",
  },
  carrier: {
    examples: [{ label: "GHK-Cu (Copper Tripeptide-1)", slug: "ghk-cu" }],
    detail:
      "Carrier peptides bind a trace element and help deliver it to the skin. The best known is GHK-Cu: the tripeptide glycyl-histidyl-lysine holding a copper(II) ion. Copper is a cofactor for enzymes such as lysyl oxidase (which cross-links collagen and elastin) and superoxide dismutase (an antioxidant enzyme), and GHK-Cu has been studied for wound-healing and remodelling activity for decades.",
  },
  "neurotransmitter-inhibitor": {
    examples: [
      { label: "Argireline (Acetyl Hexapeptide-8)", slug: "acetyl-hexapeptide-8" },
      { label: "SNAP-8 (Acetyl Octapeptide-3)", slug: "acetyl-octapeptide-3" },
      { label: "Leuphasyl (Pentapeptide-18)", slug: "pentapeptide-18" },
      { label: "Syn-Ake", slug: "dipeptide-diaminobutyroyl-benzylamide-diacetate" },
    ],
    detail:
      "Repeated facial expressions crease the skin over time. These peptides interfere — gently and reversibly — with the signalling chain that tells expression muscles to contract, for example by competing with SNAP-25 for a place in the SNARE complex that releases acetylcholine. They are often called 'topical Botox', but the effect is far milder and is limited by how much reaches the muscle.",
  },
  "enzyme-inhibitor": {
    examples: [
      { label: "Nonapeptide-1 (Melanostatine-5)", slug: "nonapeptide-1" },
      { label: "Acetyl Tetrapeptide-5 (Eyeseryl)", slug: "acetyl-tetrapeptide-5" },
    ],
    detail:
      "Some peptides slow the enzymes and receptors behind visible concerns: matrix metalloproteinases (MMPs) that degrade collagen, or the melanocortin pathway that switches on tyrosinase and pigment production. Nonapeptide-1, for example, competes with α-MSH at the MC1 receptor on melanocytes, which may help soften the look of uneven tone.",
  },
};

export default function SciencePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-cream">
        <Image
          src="/images/editorial/science.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-transparent" />
        <div className="relative container-bp py-20 md:py-32">
          <Breadcrumbs
            className="text-cream/60 [&_a:hover]:text-cream [&_span]:text-cream"
            items={[{ href: "/", label: "Home" }, { label: "The science" }]}
          />
          <p className="mt-10 text-xs font-semibold tracking-[0.22em] text-copper-light uppercase">The science</p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl leading-[1.05] md:text-6xl">
            How cosmetic peptides actually work
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-cream/75 md:text-lg">
            A plain-English guide to the biology behind peptide skincare — what they are, what they&apos;re thought to
            do in the skin, why delivery matters, and how to tell good evidence from good marketing.
          </p>
          <p className="mt-8 text-xs text-cream/50">15 minute read · Written by the Beauty Peps formulation team</p>
        </div>
      </section>

      <div className="container-bp grid gap-12 py-16 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-20">
        <nav aria-label="On this page" className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow mb-4">On this page</p>
          <ol className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:block lg:space-y-1 lg:border-l lg:border-stone lg:px-0">
            {SECTIONS.map((s, i) => (
              <li key={s.id} className="shrink-0">
                <a
                  href={`#${s.id}`}
                  className="flex items-center gap-2 rounded-full border border-stone bg-cream px-3.5 py-1.5 text-xs text-cocoa hover:text-espresso lg:-ml-px lg:rounded-none lg:border-0 lg:border-l lg:border-transparent lg:bg-transparent lg:py-1.5 lg:pl-4 lg:text-sm lg:hover:border-copper"
                >
                  <span className="text-taupe tabular-nums">{String(i + 1).padStart(2, "0")}</span> {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="min-w-0 max-w-3xl">
          {/* 1 */}
          <Section id="what-is-a-peptide" n={1} title="What is a peptide?">
            <p>
              Every protein in your body — collagen, elastin, keratin, the enzymes that keep skin ticking — is built from
              the same 20 building blocks: <Term slug="amino-acid">amino acids</Term>. Link two amino acids with a{" "}
              <Term slug="peptide-bond">peptide bond</Term> and you have a dipeptide; three makes a tripeptide; up to
              about 50 is a peptide. Beyond that, the chain usually folds into a protein.
            </p>
            <p>
              That size difference matters. A collagen molecule is roughly 300,000 Daltons — far too large to pass
              through the skin, which is why &ldquo;collagen&rdquo; in a cream acts as a humectant rather than
              topping up the collagen in your dermis. Cosmetic peptides are tiny by comparison: GHK is just three amino
              acids (about 340 Daltons), and most cosmetic peptides sit between 400 and 1,000 Daltons.
            </p>
            <Callout title="Why short chains are interesting">
              Short peptides can act as messages. The body already uses fragments of broken-down proteins as signals —
              for example, pieces of degraded collagen tell fibroblasts that repair is needed. Many cosmetic peptides
              are synthetic copies of these naturally occurring fragments.
            </Callout>
            <p>
              Peptides are written using one- or three-letter amino-acid codes. Matrixyl&apos;s core sequence is
              KTTKS (lysine–threonine–threonine–lysine–serine); GHK-Cu is glycine–histidine–lysine bound to copper. On a
              label you&apos;ll see the <Term slug="inci">INCI</Term> name instead, such as &ldquo;Palmitoyl
              Pentapeptide-4&rdquo; — the number simply identifies which pentapeptide it is, not how strong it is.
            </p>
          </Section>

          {/* 2 */}
          <Section id="skin-biology" n={2} title="A skin biology primer">
            <figure className="not-prose my-8 overflow-hidden rounded-2xl border border-stone/60 bg-ivory">
              <SkinLayersDiagram />
              <figcaption className="border-t border-stone/60 px-5 py-3 text-xs text-cocoa">
                Simplified cross-section: peptides must cross the stratum corneum to reach living cells in the epidermis
                and the fibroblasts of the dermis.
              </figcaption>
            </figure>
            <p>
              Skin has two main layers. The <strong>epidermis</strong> is the protective outer layer, topped by the{" "}
              <Term slug="stratum-corneum">stratum corneum</Term> — 15–20 layers of flattened, dead cells held in a
              lipid &ldquo;mortar&rdquo;. Its job is to keep water in and everything else out, which is exactly what makes
              topical skincare hard.
            </p>
            <p>
              Beneath it sits the <strong>dermis</strong>, home to <Term slug="fibroblast">fibroblasts</Term>: the cells
              that build and maintain the <Term slug="extracellular-matrix">extracellular matrix</Term> (ECM). The ECM is
              the skin&apos;s scaffolding — mostly <Term slug="collagen">collagen I and III</Term>, with{" "}
              <Term slug="elastin">elastin</Term> for spring and{" "}
              <Term slug="glycosaminoglycans">glycosaminoglycans</Term> such as hyaluronic acid for cushioning and water.
            </p>
            <h3>What changes with age and sun</h3>
            <ul>
              <li>
                <strong>Collagen production slows.</strong> Adult skin is commonly estimated to lose around 1% of its
                dermal collagen per year, and fibroblasts become less active.
              </li>
              <li>
                <strong>Breakdown speeds up.</strong> UV exposure switches on{" "}
                <Term slug="mmps">matrix metalloproteinases</Term> (MMPs) — enzymes that degrade collagen. This is the
                main driver of photoageing, which is why daily SPF remains the single most effective anti-ageing step.
              </li>
              <li>
                <strong>Expression lines deepen.</strong> Repeated contraction of facial muscles folds the skin in the
                same place thousands of times a day.
              </li>
              <li>
                <strong>Pigment becomes uneven.</strong> Melanocytes respond to UV and inflammation via signals such as{" "}
                <Term slug="alpha-msh">α-MSH</Term>, switching on <Term slug="tyrosinase">tyrosinase</Term>.
              </li>
            </ul>
            <p>Each peptide class targets one of these processes.</p>
          </Section>

          {/* 3 */}
          <Section id="four-classes" n={3} title="The four peptide classes">
            <p>
              Researchers usually group cosmetic peptides by mechanism. The categories overlap — GHK-Cu, for instance, is
              both a carrier and a signal — but they&apos;re a useful map.
            </p>
            <div className="not-prose mt-8 space-y-6">
              {Object.entries(PEPTIDE_CLASSES).map(([key, c], i) => (
                <div key={key} className="grid gap-6 rounded-2xl border border-stone/70 bg-cream p-6 md:grid-cols-[240px_1fr]">
                  <div className="self-start rounded-xl bg-ivory p-3">
                    <ClassDiagram type={key} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-[0.18em] text-copper-dark uppercase">Class {i + 1}</p>
                    <h3 className="mt-1 font-display text-2xl text-espresso">{c.label}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-cocoa">{CLASS_EXAMPLES[key]?.detail ?? c.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {CLASS_EXAMPLES[key]?.examples.map((e) => (
                        <Link
                          key={e.slug}
                          href={`/peptides/${e.slug}`}
                          className="rounded-full border border-stone bg-ivory px-3 py-1 text-xs text-espresso hover:border-copper/50"
                        >
                          {e.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* 4 */}
          <Section id="penetration" n={4} title="The penetration problem">
            <p>
              A peptide can only work if it reaches its target. For many years the rule of thumb has been the{" "}
              <Term slug="dalton">500 Dalton rule</Term>: molecules much larger than ~500 Da struggle to cross intact
              skin on their own. Most cosmetic peptides sit above that line, and many are water-loving, while the
              stratum corneum favours oil-loving molecules.
            </p>
            <p>Formulators use several tricks to close the gap:</p>
            <div className="not-prose my-8 grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: "Palmitoylation",
                  text: "Attaching palmitic acid (a 16-carbon fatty acid) makes a peptide more lipophilic, helping it partition into skin lipids. That's the 'Palmitoyl' in Palmitoyl Pentapeptide-4.",
                  href: "/glossary#palmitoylation",
                },
                {
                  title: "Acetylation & amidation",
                  text: "Capping the ends of a chain (the 'Acetyl' in Acetyl Hexapeptide-8) improves stability against enzymes in the skin and can aid penetration.",
                  href: "/glossary#acetylation",
                },
                {
                  title: "Delivery systems",
                  text: "Liposomes and other encapsulation systems can carry peptides into the upper layers and protect them on the way.",
                  href: "/glossary#liposome",
                },
                {
                  title: "Concentration & contact time",
                  text: "Leave-on serums at studied concentrations give peptides a fighting chance. A rinse-off cleanser with a trace of peptide does not.",
                  href: "/compare",
                },
              ].map((t) => (
                <Link key={t.title} href={t.href} className="group rounded-2xl border border-stone/70 bg-cream p-5 hover:border-copper/40">
                  <p className="font-display text-lg text-espresso group-hover:text-copper-dark">{t.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-cocoa">{t.text}</p>
                </Link>
              ))}
            </div>
            <p>
              Even so, only a small fraction of any topical active reaches the dermis. That&apos;s not a reason to
              dismiss peptides — very small amounts of a signalling molecule can matter — but it is why we publish
              concentrations and why we&apos;re cautious about dramatic claims.
            </p>
          </Section>

          {/* 5 */}
          <Section id="evidence" n={5} title="How to read the evidence">
            <figure className="not-prose relative my-8 aspect-[3/2] overflow-hidden rounded-2xl bg-sand">
              <Image src="/images/editorial/lab.webp" alt="Glassware and serums in a cosmetic formulation lab" fill sizes="(min-width: 1024px) 768px, 100vw" className="object-cover" />
            </figure>
            <p>
              Peptide marketing loves a number: &ldquo;up to 350% more collagen&rdquo;, &ldquo;wrinkles reduced by up to
              30%&rdquo;. Here&apos;s how to put those numbers in context.
            </p>
            <div className="not-prose my-8 overflow-x-auto rounded-2xl border border-stone/70">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="bg-ivory text-xs tracking-wider text-cocoa uppercase">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Study type</th>
                    <th className="px-4 py-3 font-semibold">What it shows</th>
                    <th className="px-4 py-3 font-semibold">Watch out for</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone/60 bg-cream text-cocoa">
                  <tr>
                    <td className="px-4 py-3 font-medium text-espresso">In-vitro</td>
                    <td className="px-4 py-3">Effects on cells in a dish — e.g. fibroblasts making more collagen.</td>
                    <td className="px-4 py-3">No skin barrier, so it doesn&apos;t prove the peptide reaches its target.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-espresso">Ex-vivo</td>
                    <td className="px-4 py-3">Effects on donated human skin samples kept alive in the lab.</td>
                    <td className="px-4 py-3">Closer to reality, but short-lived and without blood supply or immune system.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-espresso">In-vivo (open)</td>
                    <td className="px-4 py-3">Volunteers apply the product; changes are measured over weeks.</td>
                    <td className="px-4 py-3">No placebo group — moisturising alone improves the look of fine lines.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-espresso">Controlled trial</td>
                    <td className="px-4 py-3">Peptide vs. the same base without it (placebo), ideally blinded and randomised.</td>
                    <td className="px-4 py-3">The gold standard — check the sample size and who ran it.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <h3>Five questions to ask of any claim</h3>
            <ol>
              <li>
                <strong>&ldquo;Up to&rdquo; or average?</strong> &ldquo;Up to 30%&rdquo; usually describes the single
                best responder. The average is often far lower.
              </li>
              <li>
                <strong>Compared with what?</strong> A result against untreated skin includes the effect of simply
                moisturising. Look for placebo-controlled comparisons.
              </li>
              <li>
                <strong>How many people, for how long?</strong> Ten volunteers over 28 days is a pilot, not proof.
              </li>
              <li>
                <strong>Who ran it?</strong> Most peptide data comes from ingredient manufacturers. It&apos;s valuable, but
                independent replication carries more weight.
              </li>
              <li>
                <strong>At what concentration?</strong> A study at 10% says little about a product containing 0.1%.
              </li>
            </ol>
            <p>
              That&apos;s why every <Link href="/peptides">Peptide Library</Link> monograph carries an evidence grade
              from 1 (lab only) to 5 (multiple independent clinical trials). Most cosmetic peptides sit at 2–3, a
              handful at 4. None of that makes them useless — it means realistic expectations: subtle, cumulative
              improvements over 8–12 weeks, not overnight transformations.
            </p>
          </Section>

          {/* 6 */}
          <Section id="choosing" n={6} title="Choosing & combining peptides">
            <p>Start with your main concern, then pick the class that targets it:</p>
            <div className="not-prose my-8 overflow-x-auto rounded-2xl border border-stone/70">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="bg-ivory text-xs tracking-wider text-cocoa uppercase">
                  <tr>
                    <th className="px-4 py-3 font-semibold">If your concern is…</th>
                    <th className="px-4 py-3 font-semibold">Look for</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone/60 bg-cream text-cocoa">
                  {[
                    ["Fine lines, loss of firmness", "Signal peptides (Matrixyl family) and GHK-Cu", "/shop?concern=firmness"],
                    ["Forehead & crow's-feet expression lines", "Neurotransmitter-inhibitors (Argireline, SNAP-8, Leuphasyl)", "/shop?concern=expression-lines"],
                    ["Dullness, uneven tone, dark spots", "Nonapeptide-1 alongside SPF", "/shop?concern=dark-spots"],
                    ["Puffiness & dark circles", "Acetyl Tetrapeptide-5 and eye-specific signal peptides", "/shop?concern=under-eye"],
                    ["Barrier recovery, post-procedure feel", "GHK-Cu and gentle signal peptides", "/shop?concern=barrier"],
                    ["Thinning-looking hair", "Biotinoyl Tripeptide-1 and copper peptides for the scalp", "/shop?concern=hair-density"],
                  ].map(([concern, look, href]) => (
                    <tr key={concern}>
                      <td className="px-4 py-3 font-medium text-espresso">{concern}</td>
                      <td className="px-4 py-3">
                        <Link href={href} className="text-copper-dark underline-offset-4 hover:underline">
                          {look}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h3>Layering basics</h3>
            <ul>
              <li>
                <strong>Peptides play well with most things</strong> — niacinamide, hyaluronic acid, ceramides and
                sunscreen are all easy partners.
              </li>
              <li>
                <strong>Different mechanisms stack.</strong> A signal peptide plus a neurotransmitter-inhibitor targets two
                different causes of lines; that&apos;s why multi-peptide formulas exist.
              </li>
              <li>
                <strong>Keep copper peptides away from strong acids</strong> and direct L-ascorbic acid in the same step.
                Low pH can destabilise the copper complex, and copper can oxidise vitamin C. Use them at different times
                of day.
              </li>
              <li>
                <strong>With retinoids,</strong> many people alternate nights or apply the peptide in the morning. Both
                approaches are sensible; the goal is to avoid irritation, not to keep them apart for chemical reasons.
              </li>
              <li>
                <strong>Apply thinnest to thickest:</strong> water-light serums first, then creams, then SPF in the
                morning.
              </li>
            </ul>
            <p>
              Want this tailored to your skin? The <Link href="/routine-builder">routine builder</Link> does the
              matching for you, and <Link href="/learn/how-to-layer-peptides">our layering guide</Link> goes deeper.
            </p>
          </Section>

          {/* 7 */}
          <Section id="stability" n={7} title="Stability & storage">
            <div className="not-prose my-8 grid gap-4 sm:grid-cols-3">
              {[
                { icon: Thermometer, title: "Keep them cool", text: "Heat speeds degradation. Store serums below 25°C and pure powders in the fridge." },
                { icon: ShieldCheck, title: "Mind the pH", text: "Most peptides are happiest between pH 5 and 7. Very acidic or alkaline formulas can break peptide bonds." },
                { icon: Microscope, title: "Water is the enemy of powders", text: "Lyophilised (freeze-dried) peptides stay stable for years when dry and sealed. Once dissolved, use within weeks." },
              ].map((c) => (
                <div key={c.title} className="rounded-2xl border border-stone/70 bg-cream p-5">
                  <c.icon className="size-5 text-copper" aria-hidden />
                  <p className="mt-3 font-display text-lg text-espresso">{c.title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-cocoa">{c.text}</p>
                </div>
              ))}
            </div>
            <p>
              Peptides can also be broken down by enzymes (proteases) on the skin and in poorly preserved formulas,
              which is another reason chemically modified peptides — acetylated, amidated or palmitoylated — are
              preferred in skincare. If you formulate with our pure actives, add them in the{" "}
              <Term slug="cool-down-phase">cool-down phase</Term> below 40°C and read{" "}
              <Link href="/learn/storing-peptide-powders">our storage guide</Link>.
            </p>
            <Callout title="A word on colour" icon={<TriangleAlert className="size-4" aria-hidden />}>
              Copper peptide serums are naturally blue. If a GHK-Cu product turns green or brown, the copper complex may
              have degraded or oxidised — it&apos;s time to replace it.
            </Callout>
          </Section>

          {/* Closing CTA */}
          <div className="mt-16 grid overflow-hidden rounded-2xl border border-stone/70 bg-ivory md:grid-cols-2">
            <div className="relative min-h-56">
              <Image src="/images/editorial/texture.webp" alt="" fill sizes="(min-width: 768px) 400px, 100vw" className="object-cover" />
            </div>
            <div className="p-8">
              <p className="eyebrow mb-3">Go deeper</p>
              <h2 className="font-display text-2xl text-espresso">Explore every peptide, one monograph at a time</h2>
              <p className="mt-3 text-sm leading-relaxed text-cocoa">
                Sequences, mechanisms, study summaries and usage notes — graded for strength of evidence.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <ButtonLink href="/peptides" size="sm">
                  Peptide Library <ArrowRight className="size-3.5" />
                </ButtonLink>
                <ButtonLink href="/compare" variant="outline" size="sm">
                  Compare peptides
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Section({ id, n, title, children }: { id: string; n: number; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 border-b border-stone/60 py-12 first:pt-0 last:border-0">
      <p className="font-display text-sm text-copper">{String(n).padStart(2, "0")}</p>
      <h2 className="mt-1 font-display text-3xl text-espresso md:text-4xl">{title}</h2>
      <div className="prose-bp prose-lg mt-6">{children}</div>
    </section>
  );
}

function Term({ slug, children }: { slug: string; children: ReactNode }) {
  return (
    <Link href={`/glossary#${slug}`} className="decoration-dotted underline-offset-4" title="See glossary">
      {children}
    </Link>
  );
}

function Callout({ title, icon, children }: { title: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <aside className="not-prose my-8 rounded-2xl border-l-4 border-copper bg-copper-light/25 p-5">
      <p className="flex items-center gap-2 text-sm font-semibold text-espresso">
        {icon}
        {title}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-cocoa">{children}</p>
    </aside>
  );
}

function SkinLayersDiagram() {
  return (
    <svg viewBox="0 0 720 260" role="img" aria-label="Diagram of skin layers" className="h-auto w-full">
      <rect x="0" y="0" width="720" height="40" className="fill-cream" />
      {/* Peptide drops on surface */}
      {[120, 300, 520].map((x) => (
        <g key={x}>
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={x + i * 13} cy={26} r={5} className="fill-cream stroke-copper" strokeWidth={2} />
          ))}
        </g>
      ))}
      <text x="16" y="24" className="fill-copper-dark text-[12px] font-semibold">
        Topical peptides
      </text>
      {/* Stratum corneum bricks */}
      <rect x="0" y="40" width="720" height="34" className="fill-sand" />
      {Array.from({ length: 24 }).map((_, i) => (
        <rect key={i} x={i * 30 + ((i % 2) * 8)} y={46 + (i % 2) * 12} width={26} height={9} rx={2} className="fill-stone" />
      ))}
      <text x="704" y="62" textAnchor="end" className="fill-espresso text-[11px] font-medium">
        Stratum corneum
      </text>
      {/* Living epidermis */}
      <rect x="0" y="74" width="720" height="56" className="fill-blush/60" />
      {Array.from({ length: 16 }).map((_, i) => (
        <circle key={i} cx={24 + i * 44} cy={102} r={13} className="fill-blush stroke-cocoa/20" />
      ))}
      <text x="704" y="122" textAnchor="end" className="fill-espresso text-[11px] font-medium">
        Living epidermis
      </text>
      {/* Dermis */}
      <rect x="0" y="130" width="720" height="130" className="fill-ivory" />
      {Array.from({ length: 6 }).map((_, i) => (
        <path
          key={i}
          d={`M0 ${150 + i * 18} q 30 -10 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0`}
          className="fill-none stroke-taupe/60"
          strokeWidth={1.5}
        />
      ))}
      {[160, 380, 590].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy={200} rx={30} ry={14} className="fill-copper-light stroke-copper/50" />
          <ellipse cx={x} cy={200} rx={8} ry={6} className="fill-copper/50" />
        </g>
      ))}
      <text x="380" y="236" textAnchor="middle" className="fill-cocoa text-[11px]">
        Fibroblasts build collagen & elastin
      </text>
      <text x="704" y="250" textAnchor="end" className="fill-espresso text-[11px] font-medium">
        Dermis
      </text>
    </svg>
  );
}
