import type { Metadata } from "next";
import { RoutineBuilder } from "@/components/info/routine-builder";
import { PageHero } from "@/components/info/page-hero";
import { getActiveProducts, getPublishedPeptides } from "@/lib/queries/content";
import type { BuilderProduct } from "@/lib/content/routine";

export const metadata: Metadata = {
  title: "Routine builder — find your peptide routine",
  description:
    "Answer four quick questions about your skin and goals, and we'll build a morning and evening peptide routine — with the reasoning behind every product.",
};

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
      <PageHero
        align="center"
        eyebrow="Routine builder"
        title="Your peptide routine in four questions"
        description="Tell us what you'd like to work on and we'll match you with the right peptides — morning and night, with the reasoning behind every step."
      />
      <section className="container-bp py-14 md:py-20">
        <RoutineBuilder products={builderProducts} peptideNames={peptideNames} />
        <p className="mx-auto mt-10 max-w-2xl text-center text-xs leading-relaxed text-taupe">
          Recommendations are general cosmetic guidance based on your answers, not a diagnosis. If you have a skin
          condition, are pregnant or are under medical care, check with your doctor or dermatologist first.
        </p>
      </section>
    </>
  );
}
