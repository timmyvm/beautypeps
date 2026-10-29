import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Figure, PageHeader, reveal } from "@/components/info/page-header";
import { productFact, SpecimenTile, toneFor } from "@/components/product/product-card";
import { LoopVideo } from "@/components/site/loop-video";
import { ButtonLink } from "@/components/ui/button";
import { getActiveProducts } from "@/lib/queries/content";
import { cn } from "@/lib/utils";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About Beauty Peps",
  description:
    "Beauty Peps sells beauty peptides by the vial from Melbourne, labelled to the milligram, and keeps a free library grading the evidence behind every cosmetic peptide.",
  path: "/about",
});

/* From the shelf to a serum, in the order it happens. Every line here is something the site states elsewhere. */
const KEPT = [
  {
    title: "Kept cold",
    text: "Freeze-dried peptides keep best sealed, dry and dark at 2 to 8 °C, and every product page says so.",
  },
  {
    title: "Labelled",
    text: "Each vial is labelled with its peptide and how many milligrams it holds, and its product page says the same.",
  },
];

const MADE = [
  {
    title: "Measured",
    text: "50 mg of GHK-Cu in 5 mL of serum is 1%. Each product page works out how much serum a vial makes at the concentrations studied.",
  },
  {
    title: "Dissolved",
    text: "Into a water-based serum below 40 °C, because heat breaks peptides down. GHK-Cu turns it blue as it goes in.",
  },
];

const VALUES = [
  {
    title: "Milligrams on every label",
    text: "Every vial says how much peptide it holds, so you can hold it against the research rather than the marketing.",
  },
  {
    title: "Sold for what it is",
    text: "Pure actives are cosmetic ingredients for topical use. Research peptides are labelled research-only and come with no directions.",
  },
  {
    title: "Honest about evidence",
    text: "We grade the research behind every cosmetic peptide in our free library, including where the data is thin.",
  },
];

const STANDARDS = [
  { title: "Milligrams on every label", text: "Each vial is labelled with its peptide and its milligrams, and the product page matches." },
  { title: "Storage on every page", text: "Every product page says how to keep it: sealed, dry, dark and at 2–8 °C." },
  { title: "Research labelled research", text: "GLOW, KLOW and KPV are sold for laboratory research only, never as cosmetics." },
  { title: "Sent from Melbourne", text: "Orders leave by Australia Post, usually the business day after payment clears." },
];

const SPECIMENS = ["ghk-cu-50mg", "glutathione-600mg"];

export default async function AboutPage() {
  const products = await getActiveProducts();
  const specimens = SPECIMENS.map((s) => products.find((p) => p.slug === s)).filter((p) => p !== undefined);
  const shelf = products.slice(0, 8);

  return (
    <>
      <PageHeader
        crumbs={[{ href: "/", label: "Home" }, { label: "About" }]}
        title="Sent from Melbourne"
        lead="Beauty Peps began with one frustration: bottles shouting peptides on the front, with a trace of them at the end of the ingredient list."
        figure={
          <Figure ratio="aspect-[4/5]" className="shutter-now">
            <Image
              src="/images/editorial/melbourne-sill.webp"
              alt="Three amber vials of peptide powder and a glass beaker on a bluestone window sill, a balance behind them and the Melbourne skyline outside"
              fill
              loading="eager"
              fetchPriority="high"
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </Figure>
        }
      >
        <p className="max-w-[52ch] text-body">
          So we sell the peptide itself: freeze-dried, by the vial, labelled to the milligram, with an open library on
          what each peptide does and how good the evidence is.
        </p>
        <ButtonLink href="/peptides" className="mt-8">
          Read the peptide library
        </ButtonLink>
      </PageHeader>

      {/* From the shelf to a serum, in the order it happens: cold store, the bench, the vials. */}
      <section aria-labelledby="making-title" className="container-bp mt-28 lg:mt-44">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-[var(--gutter)]">
          <h2 id="making-title" className="display-type text-head lg:col-span-6" {...reveal(0)}>
            From shelf to serum
          </h2>
          <p className="max-w-[44ch] text-lead lg:col-span-5 lg:col-start-8" {...reveal(1)}>
            Every vial is a raw ingredient, and every product page does the arithmetic for turning it into a serum.
          </p>
        </div>

        <div className="mt-14 grid gap-10 lg:mt-20 lg:grid-cols-12 lg:gap-[var(--gutter)]">
          <Figure ratio="aspect-[4/5]" className="lg:col-span-5">
            <Image
              src="/images/editorial/cold-chain.webp"
              alt="Rows of amber vials of white peptide powder on a refrigerator shelf, a dial thermometer beside them reading about 4 °C"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </Figure>
          <dl className="flex flex-col justify-end gap-10 lg:col-span-5 lg:col-start-7 lg:pb-4">
            {KEPT.map((s, i) => (
              <div key={s.title} {...reveal(i)}>
                <dt className="text-lead font-medium">{s.title}</dt>
                <dd className="mt-2 max-w-[44ch] text-body">{s.text}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-20 grid gap-10 lg:mt-32 lg:grid-cols-12 lg:gap-[var(--gutter)]">
          <dl className="order-2 flex flex-col justify-end gap-10 lg:order-1 lg:col-span-5 lg:pb-4">
            {MADE.map((s, i) => (
              <div key={s.title} {...reveal(i)}>
                <dt className="text-lead font-medium">{s.title}</dt>
                <dd className="mt-2 max-w-[44ch] text-body">{s.text}</dd>
              </div>
            ))}
          </dl>
          <Figure
            ratio="aspect-[5/4]"
            className="order-1 lg:order-2 lg:col-span-6 lg:col-start-7"
            caption="GHK-Cu powder meeting water. The blue is the copper the peptide holds, not a dye."
          >
            <LoopVideo
              src="/video/powder-dissolve.mp4"
              poster="/video/powder-dissolve-poster.webp"
              label="Blue GHK-Cu powder falling from a spatula into a beaker of water and blooming into blue clouds"
            />
          </Figure>
        </div>

        {/* What is on the shelf now, as it is sold */}
        <div className="mt-20 lg:mt-32">
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {shelf.map((p, i) => (
              <li key={p.id} {...reveal(i % 4)}>
                <Link href={`/products/${p.slug}`} className="group block">
                  <SpecimenTile product={p} tone={toneFor(p.slug, i)} sizes="(min-width: 640px) 23vw, 50vw" className="aspect-[4/5]" />
                  <p className="mt-2 text-small font-medium group-hover:underline group-hover:underline-offset-4">{p.name}</p>
                  <p className="text-small text-muted">{productFact(p)}</p>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8 grid gap-6 lg:grid-cols-12 lg:gap-[var(--gutter)]">
            <h3 className="text-lead font-medium lg:col-span-4" {...reveal(0)}>
              On the shelf
            </h3>
            <div className="lg:col-span-6 lg:col-start-7" {...reveal(1)}>
              <p className="max-w-[52ch] text-body">
                Pure actives for making your own serum, and research peptides labelled for research only. Stock is
                counted live, so what you see here is what can be sent.
              </p>
              <Link href="/shop" className="mt-4 inline-block text-body underline underline-offset-4">
                See the range
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="values-title" className="container-bp mt-28 lg:mt-44">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-[var(--gutter)]">
          <div className="order-2 grid grid-cols-2 gap-2 lg:order-1 lg:col-span-5">
            {specimens.map((p, i) => (
              <Link key={p.id} href={`/products/${p.slug}`} className={cn("group block", i === 1 && "mt-12")} {...reveal(i)}>
                <SpecimenTile product={p} tone={toneFor(p.slug, i)} sizes="(min-width: 1024px) 20vw, 50vw" className="aspect-[4/5]" />
                <p className="mt-2 text-small font-medium group-hover:underline group-hover:underline-offset-4">{p.name}</p>
                <p className="text-small text-muted">{productFact(p)}</p>
              </Link>
            ))}
          </div>
          <div className="order-1 lg:order-2 lg:col-span-6 lg:col-start-7">
            <h2 id="values-title" className="display-type text-head" {...reveal(0)}>
              Three things we hold to
            </h2>
            <dl className="mt-10 space-y-10">
              {VALUES.map((v, i) => (
                <div key={v.title} className="grid gap-2 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:gap-[var(--gutter)]" {...reveal(i + 1)}>
                  <dt className="text-lead font-medium">{v.title}</dt>
                  <dd className="text-body">{v.text}</dd>
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
              The library comes first
            </h2>
            <div className="mt-6 max-w-[48ch] space-y-4 text-body" {...reveal(1)}>
              <p>
                Every cosmetic peptide we write about has a monograph: the sequence, the proposed mechanism, the studies
                and the caveats. The library is free, it keeps growing, and it is how we decide what goes on the shelf.
              </p>
              <p>Where the research is thin, the grade says so.</p>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4" {...reveal(2)}>
              <ButtonLink href="/science">How peptides work</ButtonLink>
              <Link href="/compare" className="text-body text-white underline underline-offset-4">
                Compare every peptide
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="standards-title" className="container-bp mt-28 lg:mt-44">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-[var(--gutter)]">
          <div className="lg:col-span-5">
            <h2 id="standards-title" className="display-type text-head" {...reveal(0)}>
              What you can expect
            </h2>
            <p className="mt-6 max-w-[40ch] text-body" {...reveal(1)}>
              Pure actives are cosmetic ingredients for topical use; research peptides are for laboratory research only.
              This is what comes with each.
            </p>

          </div>
          <dl className="grid content-start gap-x-[var(--gutter)] gap-y-10 sm:grid-cols-2 lg:col-span-6 lg:col-start-7">
            {STANDARDS.map((s, i) => (
              <div key={s.title} data-reveal="row" style={{ ["--reveal-i" as string]: i }}>
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
              Take the two-minute routine builder, or browse every vial on the shelf.
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
