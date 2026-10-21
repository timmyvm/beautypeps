import { notFound } from "next/navigation";
import { productFact, specimenTrimSrc, toneFor } from "@/components/product/product-card";
import { formatMoney } from "@/lib/format";
import { OG_SIZE, ogCard } from "@/lib/og";
import { getPeptidesBySlugs, getProductBySlug } from "@/lib/queries/catalog";
import { getActiveProducts } from "@/lib/queries/content";

export const alt = "A Beauty Peps formula on its colour tile, with its lead peptide and evidence grade";
export const size = OG_SIZE;
export const contentType = "image/jpeg";

// Drawn at build for every page that exists then; later ones are drawn on their first request and kept.
export async function generateStaticParams() {
  const products = await getActiveProducts();
  return products.map((x) => ({ slug: x.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const [lead] = await getPeptidesBySlugs(product.peptideSlugs.slice(0, 1));
  return ogCard({
    title: product.name,
    facts: [
      productFact(product),
      lead?.evidenceLevel ? `evidence grade ${lead.evidenceLevel} of 5` : "",
      formatMoney(product.price).replace(/\.00$/, ""),
    ].filter(Boolean),
    image: specimenTrimSrc(product.image) ?? product.image,
    tone: toneFor(product.slug),
  });
}
