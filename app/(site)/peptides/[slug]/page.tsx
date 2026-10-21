import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/info/breadcrumbs";
import { Chapter } from "@/components/info/chapter";
import { JsonLd, siteUrl } from "@/components/info/json-ld";
import { Figure, PictureLink, reveal } from "@/components/info/page-header";
import { Markdown } from "@/components/markdown";
import { ClassDiagram, classDiagramTitle } from "@/components/peptides/class-diagram";
import { EvidenceMeter } from "@/components/peptides/evidence-meter";
import { classLabel, classShortLabel, PeptideEntry } from "@/components/peptides/peptide-entry";
import { ProductCard, SpecimenTile, toneFor } from "@/components/product/product-card";
import { LoopVideo } from "@/components/site/loop-video";
import { ButtonLink } from "@/components/ui/button";
import { concernLabel } from "@/lib/constants";
import { evidenceLevel } from "@/lib/content/evidence";
import { splitTitle } from "@/lib/content/titles";
import {
  getArticlesMentioning,
  getPeptideBySlug,
  getPeptideSpecimens,
  getProductsWithPeptide,
  getRelatedPeptides,
} from "@/lib/queries/content";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const peptide = await getPeptideBySlug(slug);
  if (!peptide) return { title: "Peptide not found" };
  const title = `${peptide.name} (${peptide.inciName}): mechanism, evidence and how to use it`;
  return {
    title,
    description: peptide.summary,
    alternates: { canonical: `/peptides/${peptide.slug}` },
    openGraph: { title, description: peptide.summary, type: "article" },
  };
}

export default async function PeptideMonographPage({ params }: { params: Params }) {
  const { slug } = await params;
  const peptide = await getPeptideBySlug(slug);
  if (!peptide) notFound();

  const [products, related, specimens, articles] = await Promise.all([
    getProductsWithPeptide(peptide.slug),
    getRelatedPeptides(peptide, 3),
    getPeptideSpecimens(),
    getArticlesMentioning([peptide.name, peptide.inciName, ...peptide.aliases], 2),
  ]);
  const evidence = evidenceLevel(peptide.evidenceLevel);
  const lead = products[0];
  const descriptor = [
    `${peptide.inciName === peptide.name ? "A" : `${peptide.inciName}, a`} ${classShortLabel(peptide.peptideClass).toLowerCase()} peptide`,
    peptide.typicalConcentration && `used at ${peptide.typicalConcentration}`,
  ]
    .filter(Boolean)
    .join(", ");
  const isCopper = peptide.peptideClass === "carrier";

  const facts: [string, string | null | undefined][] = [
    ["INCI name", peptide.inciName],
    ["Also known as", peptide.aliases.join(", ") || null],
    ["Class", classLabel(peptide.peptideClass)],
    ["Sequence", peptide.sequence],
    ["Molecular weight", peptide.molecularWeight],
    ["First described", peptide.discovered],
    ["Typical concentration", peptide.typicalConcentration],
    ["Formula pH", peptide.phRange],
  ];

  return (
    <article>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: `${peptide.name} (${peptide.inciName})`,
          description: peptide.summary,
          about: { "@type": "ChemicalSubstance", name: peptide.inciName, alternateName: [peptide.name, ...peptide.aliases] },
          author: { "@type": "Organization", name: "Beauty Peps Lab" },
          publisher: { "@type": "Organization", name: "Beauty Peps" },
          dateModified: peptide.updatedAt.toISOString(),
          mainEntityOfPage: `${siteUrl()}/peptides/${peptide.slug}`,
        }}
      />

      <header className="container-bp pt-8 lg:pt-10">
        <Breadcrumbs items={[{ href: "/", label: "Home" }, { href: "/peptides", label: "Peptide library" }, { label: peptide.name }]} />
        <div className="mt-8 grid gap-10 lg:mt-12 lg:grid-cols-12 lg:items-end lg:gap-[var(--gutter)]">
          <div className="lg:col-span-7 lg:pb-2">
            <h1 className="display-type text-[10.5vw] text-ink sm:text-[clamp(2.75rem,5.9vw,5.75rem)]">{peptide.name}</h1>
            <p className="mt-5 max-w-[40ch] text-lead text-ink">{descriptor}</p>
            <p className="mt-8 max-w-[56ch] text-body text-ink">{peptide.summary}</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-5">
              <EvidenceMeter level={evidence.level} size="lg" />
              {products.length > 0 && (
                <ButtonLink href="#find-it-in">
                  In {products.length === 1 ? "one of our formulas" : `${products.length} of our formulas`}
                </ButtonLink>
              )}
            </div>
          </div>
          {lead && (
            <div className="lg:col-span-5">
              <Link href={`/products/${lead.slug}`} className="group block">
                <SpecimenTile
                  product={lead}
                  tone={toneFor(lead.slug)}
                  priority
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="aspect-square lg:aspect-[6/5]"
                />
                <p className="mt-3 text-small text-ink">
                  <span className="font-medium group-hover:underline group-hover:underline-offset-4">{lead.name}</span>
                  <span className="text-muted">, where {peptide.name} does the work</span>
                </p>
              </Link>
            </div>
          )}
        </div>
      </header>

      <section aria-labelledby="facts-title" className="mt-20 bg-surface py-16 lg:mt-32 lg:py-24">
        <div className="container-bp">
          <h2 id="facts-title" className="display-type text-head" {...reveal(0)}>
            The facts
          </h2>
          <dl className="mt-10 grid gap-x-[var(--gutter)] gap-y-8 sm:grid-cols-2 lg:grid-cols-4" {...reveal(1)}>
            {facts
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k} className="min-w-0">
                  <dt className="text-small text-muted">{k}</dt>
                  <dd className={k === "Sequence" ? "mt-1 text-body break-words" : "mt-1 text-body"}>{v}</dd>
                </div>
              ))}
          </dl>
        </div>
      </section>

      <div className="container-bp">
        {peptide.benefits.length > 0 && (
          <Chapter id="benefits" title="At a glance">
            <ul className="space-y-4">
              {peptide.benefits.map((b) => (
                <li key={b} className="flex gap-4 text-lead">
                  <span aria-hidden className="mt-[0.55em] size-2.5 shrink-0 bg-accent" />
                  {b}
                </li>
              ))}
            </ul>
            {peptide.concerns.length > 0 && (
              <p className="mt-8 text-body">
                Most relevant for{" "}
                {peptide.concerns.map((c, i) => (
                  <span key={c}>
                    {i > 0 && (i === peptide.concerns.length - 1 ? " and " : ", ")}
                    <Link href={`/shop?concern=${c}`} className="underline underline-offset-4">
                      {concernLabel(c).toLowerCase()}
                    </Link>
                  </span>
                ))}
                .
              </p>
            )}
          </Chapter>
        )}

        {peptide.mechanism?.trim() && (
          <Chapter
            id="how-it-works"
            title="How it works"
            aside={
              <figure className="mt-10" {...reveal(1)}>
                <div className="bg-surface p-6">
                  <ClassDiagram type={peptide.peptideClass} />
                </div>
                <figcaption className="mt-3 max-w-[40ch] text-small">
                  {classDiagramTitle(peptide.peptideClass)}. The blue beads are the peptide.
                </figcaption>
              </figure>
            }
          >
            <Markdown>{peptide.mechanism}</Markdown>
          </Chapter>
        )}

        {peptide.evidence?.trim() && (
          <Chapter
            id="evidence"
            title="What the evidence says"
            aside={
              <div className="mt-8" {...reveal(1)}>
                <EvidenceMeter level={evidence.level} size="lg" />
                <p className="mt-4 max-w-[40ch] text-body">{evidence.description}</p>
                <Link href="/peptides#grades-title" className="mt-3 inline-block text-body underline underline-offset-4">
                  How we grade evidence
                </Link>
              </div>
            }
          >
            <Markdown>{peptide.evidence}</Markdown>
          </Chapter>
        )}

        {peptide.usage?.trim() && (
          <Chapter
            id="how-to-use"
            title="How to use it"
            aside={
              isCopper ? (
                <Figure
                  ratio="aspect-[4/5]"
                  className="mt-10 hidden max-w-[420px] lg:block"
                  caption="Copper peptide serum is blue from its copper. Green or brown means it has broken down."
                >
                  <LoopVideo
                    src="/video/copper-drop.mp4"
                    poster="/video/copper-drop-poster.webp"
                    label="Drops of blue copper peptide serum falling onto a brushed copper plate"
                  />
                </Figure>
              ) : (
                <Figure ratio="aspect-[4/5]" className="mt-10 hidden max-w-[420px] lg:block">
                  <Image
                    src="/images/editorial/ritual.webp"
                    alt="A woman pressing serum from a glass dropper onto her cheekbone"
                    fill
                    sizes="30vw"
                    className="drift object-cover object-[50%_30%]"
                  />
                </Figure>
              )
            }
          >
            <Markdown>{peptide.usage}</Markdown>
            {(peptide.pairsWith.length > 0 || peptide.avoidWith.length > 0) && (
              <div className="mt-12 grid gap-10 sm:grid-cols-2">
                {peptide.pairsWith.length > 0 && (
                  <div>
                    <h3 className="text-lead font-medium">Pairs well with</h3>
                    <ul className="mt-3 space-y-2 text-body">
                      {peptide.pairsWith.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {peptide.avoidWith.length > 0 && (
                  <div>
                    <h3 className="text-lead font-medium">Keep apart from</h3>
                    <ul className="mt-3 space-y-2 text-body">
                      {peptide.avoidWith.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </Chapter>
        )}

        {peptide.studies.length > 0 && (
          <Chapter id="studies" title="Key studies">
            <ol className="list-decimal space-y-6 pl-6 text-body marker:text-muted">
              {peptide.studies.map((study, i) => (
                <li key={i} className="pl-2">
                  <p className="font-medium">{study.title}</p>
                  <p className="text-muted">
                    {study.source}
                    {study.year ? `, ${study.year}` : ""}
                  </p>
                  {study.url && (
                    <a href={study.url} target="_blank" rel="noreferrer noopener" className="mt-1 inline-block underline underline-offset-4">
                      Read the study<span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  )}
                </li>
              ))}
            </ol>
            <p className="mt-12 bg-surface p-6 text-body sm:p-8">
              Educational information, not medical advice. This monograph summarises published cosmetic research on
              topical {peptide.name}; results in studies are averages and yours will vary. Our products are cosmetics
              for external use only. Patch test anything new, and talk to your doctor or dermatologist about skin
              concerns, or if you are pregnant or breastfeeding.
            </p>
          </Chapter>
        )}
      </div>

      {products.length > 0 && (
        <section id="find-it-in" aria-labelledby="find-title" className="container-bp mt-28 scroll-mt-24 lg:mt-44">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h2 id="find-title" className="display-type text-head" {...reveal(0)}>
              Formulas with {peptide.name}
            </h2>
            <Link href="/routine-builder" className="text-body underline underline-offset-4">
              Not sure which? Build a routine
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-x-[var(--gutter)] gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p, i) => (
              <div key={p.id} {...reveal(i % 4)}>
                <ProductCard product={p} index={i} />
              </div>
            ))}
          </div>
        </section>
      )}

      {articles.length > 0 && (
        <section aria-labelledby="journal-title" className="container-bp mt-28 lg:mt-44">
          <h2 id="journal-title" className="display-type text-head" {...reveal(0)}>
            From the journal
          </h2>
          <div className="mt-12 grid gap-x-[var(--gutter)] gap-y-12 md:grid-cols-2">
            {articles.map((a, i) => {
              const t = splitTitle(a.title);
              return (
                <PictureLink
                  key={a.id}
                  href={`/learn/${a.slug}`}
                  src={a.coverImage ?? "/images/editorial/texture.webp"}
                  alt=""
                  title={t.head}
                  text={t.deck ?? a.excerpt}
                  ratio="aspect-[3/2]"
                  sizes="(min-width: 768px) 50vw, 100vw"
                  index={i + 1}
                />
              );
            })}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="container-bp mt-28 lg:mt-44">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h2 id="related-title" className="display-type text-head" {...reveal(0)}>
              Related peptides
            </h2>
            <Link href="/compare" className="text-body underline underline-offset-4">
              Compare all of them
            </Link>
          </div>
          <ol className="-mx-3 mt-10 sm:-mx-4">
            {related.map((p, i) => (
              <PeptideEntry key={p.id} peptide={p} specimen={specimens[p.slug]} index={i} />
            ))}
          </ol>
        </section>
      )}
    </article>
  );
}
