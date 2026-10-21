import type { Metadata } from "next";
import { Figure, PageHeader, reveal } from "@/components/info/page-header";
import { RoutineBuilder } from "@/components/info/routine-builder";
import { LoopVideo } from "@/components/site/loop-video";
import type { BuilderProduct } from "@/lib/content/routine";
import { getActiveProducts, getPublishedPeptides } from "@/lib/queries/content";

export const metadata: Metadata = {
  title: "Routine builder: find your peptide routine",
  description:
    "Answer four quick questions about your skin and goals, and we'll build a morning and evening peptide routine, with the reasoning behind every product.",
};

const RULES = [
  {
    title: "Your concerns lead",
    text: "Every formula is scored by how many of your concerns it treats. The closest match becomes your serum, and an eye, lip or scalp concern adds the treatment made for it.",
  },
  {
    title: "Your skin adjusts it",
    text: "Dry or mature skin, or a wish for a complete routine, adds a night cream. Sensitive skin is told to start every other night.",
  },
  {
    title: "Experience sets the pace",
    text: "New to actives means one serum, brought in slowly. Used to them, with room for more, means a second serum that works by a different mechanism.",
  },
  {
    title: "Copper goes in the evening",
    text: "With two serums, a copper peptide moves to the evening so vitamin C can have the morning to itself.",
  },
  {
    title: "Only what is in stock",
    text: "Pure actives and sets stay out of the routine. If a set covers the same ground, the result says so.",
  },
];

export default async function RoutineBuilderPage() {
  const [products, peptides] = await Promise.all([getActiveProducts(), getPublishedPeptides()]);

  const builderProducts: BuilderProduct[] = products.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    subtitle: p.subtitle,
    price: p.price,
    image: p.image,
    size: p.size,
    stock: p.stock,
    concerns: p.concerns,
    peptideSlugs: p.peptideSlugs,
    skinTypes: p.skinTypes,
    routineStep: p.routineStep,
    categorySlug: p.categorySlug,
    featured: p.featured,
  }));
  const peptideNames = Object.fromEntries(peptides.map((p) => [p.slug, p.name]));

  return (
    <>
      <PageHeader
        crumbs={[{ href: "/", label: "Home" }, { label: "Routine builder" }]}
        title="Your routine in four questions"
        lead="Tell us what you want to work on and we'll match you with the right peptides, morning and night, with the reasoning behind every step."
      />
      <section aria-label="Routine builder" className="container-bp mt-16 lg:mt-24">
        <RoutineBuilder products={builderProducts} peptideNames={peptideNames} />
      </section>

      <section aria-labelledby="how-title" className="container-bp mt-28 lg:mt-44">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-[var(--gutter)]">
          <div className="lg:col-span-5">
            <h2 id="how-title" className="display-type text-head" {...reveal(0)}>
              How it chooses
            </h2>
            <Figure
              ratio="aspect-[4/3]"
              className="mt-10 max-w-[520px]"
              caption="Copper peptide serum is blue. With two serums in a routine, it takes the evening."
            >
              <LoopVideo
                src="/video/copper-drop.mp4"
                poster="/video/copper-drop-poster.webp"
                label="Drops of blue copper peptide serum falling onto a brushed copper plate"
              />
            </Figure>
          </div>
          <dl className="space-y-10 lg:col-span-6 lg:col-start-7">
            {RULES.map((r, i) => (
              <div key={r.title} {...reveal(i + 1)}>
                <dt className="text-lead font-medium">{r.title}</dt>
                <dd className="mt-2 max-w-[56ch] text-body">{r.text}</dd>
              </div>
            ))}
          </dl>
        </div>
        <p className="mt-20 max-w-[64ch] text-body text-muted">
          Recommendations are general cosmetic guidance based on your answers, not a diagnosis. If you have a skin
          condition, are pregnant or are under medical care, check with your doctor or dermatologist first.
        </p>
      </section>
    </>
  );
}
