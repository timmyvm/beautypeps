import type { Metadata } from "next";
import { PageHeader } from "@/components/info/page-header";
import { RoutineBuilder } from "@/components/info/routine-builder";
import type { BuilderProduct } from "@/lib/content/routine";
import { getActiveProducts, getPublishedPeptides } from "@/lib/queries/content";

export const metadata: Metadata = {
  title: "Routine builder: find your peptide routine",
  description:
    "Answer four quick questions about your skin and goals, and we'll build a morning and evening peptide routine, with the reasoning behind every product.",
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
      <PageHeader
        crumbs={[{ href: "/", label: "Home" }, { label: "Routine builder" }]}
        title="Your routine in four questions"
        lead="Tell us what you want to work on and we'll match you with the right peptides, morning and night, with the reasoning behind every step."
      />
      <section aria-label="Routine builder" className="container-bp mt-16 lg:mt-24">
        <RoutineBuilder products={builderProducts} peptideNames={peptideNames} />
        <p className="mt-20 max-w-[64ch] text-body text-muted">
          Recommendations are general cosmetic guidance based on your answers, not a diagnosis. If you have a skin
          condition, are pregnant or are under medical care, check with your doctor or dermatologist first.
        </p>
      </section>
    </>
  );
}
