import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Figure, PageHeader, reveal } from "@/components/info/page-header";
import { productFact, SpecimenTile, toneFor } from "@/components/product/product-card";
import { ButtonLink } from "@/components/ui/button";
import { getActiveProducts } from "@/lib/queries/content";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About Beauty Peps",
  description:
    "Beauty Peps is a Melbourne peptide skincare brand built by formulators. We publish our concentrations, make small batches and put education first.",
};

const VALUES = [
  {
    title: "Published concentrations",
    text: "Every key active is listed with its percentage, so you can hold it against the research rather than the marketing.",
  },
  {
    title: "Formulated, not white-labelled",
    text: "Our own team develops each formula to keep peptides stable, at the right pH, in a base you will enjoy using.",
  },
  {
    title: "Honest about evidence",
    text: "We grade the research behind every peptide in our free library, including where the data is thin.",
  },
  {
    title: "Small batches",
    text: "We make in small runs so what reaches you is fresh, with a batch number on every bottle.",
  },
];

const STANDARDS = [
  { title: "Concentrations on every label", text: "Key active percentages are published on each product page." },
  { title: "Batch identity checks", text: "Every peptide raw material is checked against its certificate of analysis before use." },
  { title: "Fragrance-free where possible", text: "Our serums contain no added fragrance or essential oils." },
  { title: "Cruelty-free", text: "We never test on animals, and neither do our ingredient suppliers for our products." },
  { title: "Recyclable glass", text: "Glass bottles and jars, minimal plastic, and recyclable paper packaging." },
  { title: "Stability tested", text: "Formulas are watched for colour, pH and texture over time before release." },
];

const SPECIMENS = ["ghk-cu-copper-peptide-serum", "matrixyl-pure-powder"];

export default async function AboutPage() {
  const products = await getActiveProducts();
  const specimens = SPECIMENS.map((s) => products.find((p) => p.slug === s)).filter((p) => p !== undefined);

  return (
    <>
      <PageHeader
        crumbs={[{ href: "/", label: "Home" }, { label: "About" }]}
        title="The numbers on the label"
        lead="Beauty Peps began in a small Melbourne lab with one frustration: bottles shouting peptides on the front, with a trace of them at the end of the ingredient list."
        figure={
          <Figure ratio="aspect-[4/3]">
            <Image
              src="/images/editorial/lab.webp"
              alt="Serums and glassware on the bench of the Beauty Peps formulation lab"
              fill
              priority
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </Figure>
        }
      >
        <p className="max-w-[52ch] text-body">
          So we set out to make the opposite: peptide formulas built around the concentrations used in research, with
          those numbers published, and an open library on what each peptide does and how good the evidence is.
        </p>
      </PageHeader>

      <section aria-labelledby="values-title" className="container-bp mt-28 lg:mt-44">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-[var(--gutter)]">
          <div className="grid grid-cols-2 gap-2 lg:col-span-5">
            {specimens.map((p, i) => (
              <Link key={p.id} href={`/products/${p.slug}`} className={cn("group block", i === 1 && "mt-12")} {...reveal(i)}>
                <SpecimenTile product={p} tone={toneFor(p.slug, i)} sizes="(min-width: 1024px) 20vw, 50vw" className="aspect-[4/5]" />
                <p className="mt-2 text-small font-medium group-hover:underline group-hover:underline-offset-4">{p.name}</p>
                <p className="text-small text-muted">{productFact(p)}</p>
              </Link>
            ))}
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <h2 id="values-title" className="display-type text-head" {...reveal(0)}>
              Four things we hold to
            </h2>
            <dl className="mt-10 grid gap-x-[var(--gutter)] gap-y-10 sm:grid-cols-2">
              {VALUES.map((v, i) => (
                <div key={v.title} {...reveal(i + 1)}>
                  <dt className="text-lead font-medium">{v.title}</dt>
                  <dd className="mt-2 text-body">{v.text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section aria-labelledby="library-title" className="mt-28 bg-field-ink py-20 text-field-ink-ink lg:mt-44 lg:py-32">
        <div className="container-bp grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-[var(--gutter)]">
          <Figure ratio="aspect-[3/2]" className="lg:col-span-6">
            <Image
              src="/images/editorial/texture.webp"
              alt="A clear peptide serum and a white cream swatched side by side"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="drift object-cover"
            />
          </Figure>
          <div className="lg:col-span-5 lg:col-start-8">
            <h2 id="library-title" className="display-type text-head" {...reveal(0)}>
              The library came before the shop
            </h2>
            <div className="mt-6 max-w-[48ch] space-y-4 text-body" {...reveal(1)}>
              <p>
                Before we sold a single bottle, we wrote a monograph on every peptide we wanted to use: the sequence,
                the proposed mechanism, the studies and the caveats. That library is still free, still growing, and
                still how we decide what goes into a formula.
              </p>
              <p>If a peptide lacks research we can stand behind at a sensible concentration, it stays out.</p>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4" {...reveal(2)}>
              <ButtonLink href="/peptides">Explore the library</ButtonLink>
              <Link href="/science" className="text-body text-white underline underline-offset-4">
                How peptides work
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="standards-title" className="container-bp mt-28 lg:mt-44">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-[var(--gutter)]">
          <div className="lg:col-span-4">
            <h2 id="standards-title" className="display-type text-head" {...reveal(0)}>
              What goes into every batch
            </h2>
            <p className="mt-6 max-w-[40ch] text-body" {...reveal(1)}>
              Beauty Peps products are cosmetics, made for topical use. This is what you can expect from each one.
            </p>
            <Figure ratio="aspect-[4/3]" className="mt-10 hidden lg:block">
              <Image
                src="/images/editorial/unboxing.webp"
                alt="A Beauty Peps order packed in an ivory box with tissue paper"
                fill
                sizes="30vw"
                className="object-cover"
              />
            </Figure>
          </div>
          <dl className="grid content-start gap-x-[var(--gutter)] sm:grid-cols-2 lg:col-span-7 lg:col-start-6">
            {STANDARDS.map((s, i) => (
              <div
                key={s.title}
                data-reveal="row"
                style={{ ["--reveal-i" as string]: i }}
                className={cn("px-5 py-6", Math.floor(i / 2) % 2 === 0 ? "bg-surface" : "bg-bg")}
              >
                <dt className="text-lead font-medium">{s.title}</dt>
                <dd className="mt-2 text-body">{s.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section aria-labelledby="start-title" className="container-bp mt-28 lg:mt-44">
        <div className="bg-field-frost px-6 py-16 sm:px-10 lg:grid lg:grid-cols-12 lg:items-end lg:gap-[var(--gutter)] lg:px-16 lg:py-24">
          <div className="lg:col-span-7">
            <h2 id="start-title" className="display-type text-head" {...reveal(0)}>
              Find the peptides that fit your skin
            </h2>
            <p className="mt-6 max-w-[48ch] text-body" {...reveal(1)}>
              Take the two-minute routine builder, or browse the full range of serums, treatments and pure actives.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4 lg:col-span-4 lg:col-start-9 lg:mt-0 lg:justify-end">
            <ButtonLink href="/routine-builder">Build my routine</ButtonLink>
            <Link href="/shop" className="text-body underline underline-offset-4">
              Shop all
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
