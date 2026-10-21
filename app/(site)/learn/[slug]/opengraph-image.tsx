import { notFound } from "next/navigation";
import { OG_SIZE, ogCard } from "@/lib/og";
import { getArticleBySlug, getPublishedArticles } from "@/lib/queries/content";

export const alt = "A Beauty Peps Journal article: its cover photograph beside the title";
export const size = OG_SIZE;
export const contentType = "image/jpeg";

// Drawn at build for every page that exists then; later ones are drawn on their first request and kept.
export async function generateStaticParams() {
  const articles = await getPublishedArticles();
  return articles.map((x) => ({ slug: x.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();
  return ogCard({
    title: article.title,
    facts: [article.category, `${article.readMinutes} minute read`].filter(Boolean),
    image: article.coverImage ?? "/images/editorial/texture.webp",
    tone: "stone",
    fit: "cover",
  });
}
