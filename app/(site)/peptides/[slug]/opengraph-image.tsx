import { notFound } from "next/navigation";
import { specimenTrimSrc } from "@/components/product/product-card";
import { OG_SIZE, ogCard } from "@/lib/og";
import { getPeptideBySlug, getProductsWithPeptide, getPublishedPeptides } from "@/lib/queries/content";

export const alt = "A Peptide Library entry: the peptide's name, INCI name and evidence grade beside a formula that carries it";
export const size = OG_SIZE;
export const contentType = "image/jpeg";

// Drawn at build for every page that exists then; later ones are drawn on their first request and kept.
export async function generateStaticParams() {
  const peptides = await getPublishedPeptides();
  return peptides.map((x) => ({ slug: x.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const peptide = await getPeptideBySlug(slug);
  if (!peptide) notFound();
  const [lead] = await getProductsWithPeptide(peptide.slug);
  const specimen = lead && specimenTrimSrc(lead.image);
  return ogCard({
    title: peptide.name,
    facts: [
      peptide.inciName !== peptide.name ? peptide.inciName : "",
      `evidence grade ${peptide.evidenceLevel} of 5`,
    ].filter(Boolean),
    image: specimen ?? "/images/editorial/science.webp",
    tone: specimen ? "frost" : "ink",
    fit: specimen ? "contain" : "cover",
  });
}
