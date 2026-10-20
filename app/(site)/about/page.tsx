import { ArrowRight, BadgeCheck, Droplets, FlaskConical, Leaf, Rabbit, Recycle, ScrollText } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/misc";

export const metadata: Metadata = {
  title: "About Beauty Peps",
  description:
    "Beauty Peps is a Melbourne peptide skincare brand built by formulators. We publish our concentrations, make small batches and put education first.",
};

const VALUES = [
  {
    icon: ScrollText,
    title: "Published concentrations",
    text: "Every key active is listed with its percentage, so you can compare it with the research — not just the marketing.",
  },
  {
    icon: FlaskConical,
    title: "Formulated, not white-labelled",
    text: "Each formula is developed by our own team to keep peptides stable, at the right pH, in a base your skin will enjoy using.",
  },
  {
    icon: BadgeCheck,
    title: "Honest about evidence",
    text: "We grade the research behind every peptide in our free library — including where the data is thin.",
  },
  {
    icon: Droplets,
    title: "Small batches",
    text: "We make in small runs so what reaches you is fresh, with batch numbers on every bottle.",
  },
];

const STANDARDS = [
  { icon: ScrollText, title: "Concentrations on every label", text: "Key active percentages are published on each product page." },
  { icon: BadgeCheck, title: "Batch identity checks", text: "Every peptide raw material is checked against its certificate of analysis before use." },
  { icon: Leaf, title: "Fragrance-free where possible", text: "Our serums contain no added fragrance or essential oils." },
  { icon: Rabbit, title: "Cruelty-free", text: "We never test on animals, and neither do our ingredient suppliers for our products." },
  { icon: Recycle, title: "Recyclable glass", text: "Glass bottles and jars, minimal plastic, and recyclable paper packaging." },
  { icon: Droplets, title: "Stability tested", text: "Formulas are monitored for colour, pH and texture over time before release." },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-ivory">
        <div className="container-bp grid gap-12 py-14 md:py-20 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="eyebrow mb-4">About us</p>
            <h1 className="font-display text-4xl leading-[1.05] text-espresso md:text-6xl">
              Peptides, with the <em className="text-copper-dark">numbers</em> on the label
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-cocoa">
              Beauty Peps began in a small Melbourne lab with a simple frustration: products shouting
              &ldquo;peptides&rdquo; on the front, with a trace amount buried at the end of the ingredient list.
            </p>
            <p className="mt-4 max-w-xl leading-relaxed text-cocoa">
              So we set out to make the opposite — peptide formulas built around the concentrations used in research,
              with those numbers published, and an open library explaining what each peptide does and how good the
              evidence really is.
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-sand">
            <Image
              src="/images/editorial/lab.webp"
              alt="Serums and glassware in the Beauty Peps formulation lab"
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="container-bp py-16 md:py-24">
        <SectionHeading
          align="center"
          eyebrow="What we believe"
          title="Skincare you can actually understand"
          description="Four principles guide every formula and every page on this site."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v) => (
            <div key={v.title} className="rounded-2xl border border-stone/70 bg-cream p-6">
              <span className="grid size-11 place-items-center rounded-full bg-copper-light/50 text-copper-dark">
                <v.icon className="size-5" aria-hidden />
              </span>
              <h3 className="mt-5 font-display text-xl text-espresso">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-cocoa">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Story split */}
      <section className="bg-espresso text-cream">
        <div className="container-bp grid gap-12 py-16 md:py-24 lg:grid-cols-2 lg:items-center">
          <div className="relative aspect-[3/2] overflow-hidden rounded-2xl">
            <Image src="/images/editorial/texture.webp" alt="Peptide serum and cream textures" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <div>
            <p className="text-xs font-semibold tracking-[0.22em] text-copper-light uppercase">Education first</p>
            <h2 className="mt-4 font-display text-3xl leading-tight md:text-5xl">The library came before the shop</h2>
            <p className="mt-6 leading-relaxed text-cream/75">
              Before we sold a single bottle, we wrote monographs on every peptide we wanted to use — the sequence, the
              proposed mechanism, the studies, the caveats. That library is still free, still growing, and still the
              way we decide what goes into a formula.
            </p>
            <p className="mt-4 leading-relaxed text-cream/75">
              If a peptide doesn&apos;t have research we can stand behind at a sensible concentration, it doesn&apos;t
              make it into a Beauty Peps bottle.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/peptides" variant="copper">
                Explore the library <ArrowRight className="size-4" />
              </ButtonLink>
              <Link
                href="/science"
                className="inline-flex h-11 items-center rounded-full border border-cream/25 px-6 text-sm font-medium text-cream transition-colors hover:bg-cream/10"
              >
                How peptides work
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Standards */}
      <section className="container-bp py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr]">
          <div>
            <p className="eyebrow mb-3">Our standards</p>
            <h2 className="font-display text-3xl leading-tight text-espresso md:text-4xl">What goes into every batch</h2>
            <p className="mt-5 leading-relaxed text-cocoa">
              Beauty Peps products are cosmetics, made for topical use. Here&apos;s what you can expect from each one.
            </p>
            <div className="relative mt-8 aspect-[3/2] overflow-hidden rounded-2xl bg-sand">
              <Image src="/images/editorial/unboxing.webp" alt="A Beauty Peps order packed in an ivory box" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
            </div>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {STANDARDS.map((s) => (
              <li key={s.title} className="rounded-2xl border border-stone/70 bg-cream p-6">
                <s.icon className="size-5 text-copper" aria-hidden />
                <p className="mt-4 font-medium text-espresso">{s.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-cocoa">{s.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="container-bp">
        <div className="flex flex-col items-center rounded-2xl bg-ivory px-6 py-14 text-center md:py-20">
          <p className="eyebrow mb-3">Start with the science</p>
          <h2 className="max-w-2xl font-display text-3xl text-espresso md:text-5xl">Find the peptides that fit your skin</h2>
          <p className="mt-4 max-w-xl text-cocoa">
            Take the two-minute routine builder, or browse the full range of serums, treatments and pure actives.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/routine-builder">
              Build my routine <ArrowRight className="size-4" />
            </ButtonLink>
            <ButtonLink href="/shop" variant="outline">
              Shop all
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
