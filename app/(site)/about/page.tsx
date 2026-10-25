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
    "Beauty Peps is a Melbourne peptide skincare brand built by formulators. We publish our concentrations, make small batches and put education first.",
  path: "/about",
});

/* How a formula is made, in the order it happens. Every line here is something the site states elsewhere. */
const KEPT = [
  {
    title: "Kept cold",
    text: "Peptides arrive freeze-dried and keep best sealed, dry and dark at 2 to 8 °C. Pure actives leave us that way, with the same storage advice in their directions.",
  },
  {
    title: "Checked",
    text: "Every peptide raw material is checked against its certificate of analysis before it is used.",
  },
];

const MADE = [
  {
    title: "Weighed",
    text: "Each peptide is weighed to the percentage printed on the label, so the number on the front is the number in the bottle.",
  },
  {
    title: "Dissolved",
    text: "It goes into a water and glycerin base below 40 °C, because heat breaks peptides down. GHK-Cu turns the base blue as it goes in.",
  },
];

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
];

const STANDARDS = [
  { title: "Concentrations on every label", text: "Key active percentages are published on each product page." },
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
        title="Weighed in Melbourne"
        lead="Beauty Peps began in a small Melbourne lab with one frustration: bottles shouting peptides on the front, with a trace of them at the end of the ingredient list."
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
          So we set out to make the opposite: peptide formulas built around the concentrations used in research, with
          those numbers published, and an open library on what each peptide does and how good the evidence is.
        </p>
        <ButtonLink href="/peptides" className="mt-8">
          Read the peptide library
        </ButtonLink>
      </PageHeader>

      {/* The making, in the order it happens: cold store, the bench, the drawer. */}
      <section aria-labelledby="making-title" className="container-bp mt-28 lg:mt-44">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-[var(--gutter)]">
          <h2 id="making-title" className="display-type text-head lg:col-span-6" {...reveal(0)}>
            From powder to bottle
          </h2>
          <p className="max-w-[44ch] text-lead lg:col-span-5 lg:col-start-8" {...reveal(1)}>
            Every formula is made the same way, in small runs, by the team that wrote the library.
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

        <div className="mt-20 lg:mt-32">
          <Figure ratio="aspect-[4/3] sm:aspect-[3/2]">
            <Image
              src="/images/editorial/specimen-drawer.webp"
              alt="An oak specimen drawer divided into twelve compartments, each holding a Beauty Peps bottle, vial, tube or tin beside a blank tag"
              fill
              sizes="(min-width: 1024px) 92vw, 100vw"
              className="object-cover"
            />
          </Figure>
          <div className="mt-8 grid gap-6 lg:grid-cols-12 lg:gap-[var(--gutter)]">
            <h3 className="text-lead font-medium lg:col-span-4" {...reveal(0)}>
              Numbered
            </h3>
            <div className="lg:col-span-6 lg:col-start-7" {...reveal(1)}>
              <p className="max-w-[52ch] text-body">
                Small runs keep what reaches you fresh, and every bottle carries its batch number.
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
