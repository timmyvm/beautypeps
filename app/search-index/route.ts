import { cacheLife, cacheTag } from "next/cache";
import { TAGS } from "@/lib/cache-tags";
import { concernLabel } from "@/lib/constants";
import { GLOSSARY } from "@/lib/content/glossary";
import { listProducts } from "@/lib/queries/catalog";
import { getPublishedArticles, getPublishedPeptides } from "@/lib/queries/content";

/*
 * Everything the header's instant search looks through, as one small JSON file. Built once and cached with
 * the catalogue and content tags, so an edit in the admin refreshes it; the browser filters it as you type.
 */

export type SearchIndex = {
  products: { slug: string; name: string; fact: string; price: number; image: string; terms: string }[];
  peptides: { slug: string; name: string; inci: string; sequence: string; grade: number; terms: string }[];
  articles: { slug: string; title: string; category: string; terms: string }[];
  glossary: { id: string; term: string; terms: string }[];
};

async function buildIndex(): Promise<SearchIndex> {
  "use cache";
  cacheLife("days");
  cacheTag(TAGS.catalog, TAGS.content);
  const [products, peptides, articles] = await Promise.all([listProducts({ sort: "featured" }), getPublishedPeptides(), getPublishedArticles()]);
  const peptideName = new Map(peptides.map((p) => [p.slug, `${p.name} ${p.inciName} ${p.aliases.join(" ")}`]));

  return {
    products: products.map((p) => ({
      slug: p.slug,
      name: p.name,
      fact: p.keyActives?.[0] ? `${p.keyActives[0].amount} ${p.keyActives[0].name}` : (p.subtitle ?? ""),
      price: p.price,
      image: p.image,
      terms: [
        p.name,
        p.subtitle,
        ...(p.keyActives ?? []).map((k) => k.name),
        ...(p.concerns ?? []).map(concernLabel),
        ...(p.peptideSlugs ?? []).map((s) => peptideName.get(s) ?? s),
      ]
        .filter(Boolean)
        .join(" "),
    })),
    peptides: peptides.map((p) => ({
      slug: p.slug,
      name: p.name,
      inci: p.inciName,
      sequence: p.sequence ?? "",
      grade: p.evidenceLevel,
      terms: [p.name, p.inciName, ...p.aliases, p.summary, p.peptideClass, ...p.concerns.map(concernLabel)].join(" "),
    })),
    articles: articles.map((a) => ({ slug: a.slug, title: a.title, category: a.category, terms: `${a.title} ${a.excerpt} ${a.category}` })),
    glossary: GLOSSARY.map((g) => ({ id: g.id, term: g.term, terms: `${g.term} ${g.aka ?? ""} ${g.definition}` })),
  };
}

export async function GET() {
  return Response.json(await buildIndex());
}
