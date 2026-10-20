import { AlertTriangle, ArrowRight, Check, ExternalLink, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/info/breadcrumbs";
import { JsonLd, siteUrl } from "@/components/info/json-ld";
import { Markdown } from "@/components/markdown";
import { ClassDiagram } from "@/components/peptides/class-diagram";
import { EvidenceMeter } from "@/components/peptides/evidence-meter";
import { CLASS_TONES, classLabel, PeptideCard } from "@/components/peptides/peptide-card";
import { ProductCard } from "@/components/product/product-card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { concernLabel, PEPTIDE_CLASSES } from "@/lib/constants";
import { evidenceLevel } from "@/lib/content/evidence";
import { getPeptideBySlug, getProductsWithPeptide, getRelatedPeptides } from "@/lib/queries/content";
import { formatDate } from "@/lib/format";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const peptide = await getPeptideBySlug(slug);
  if (!peptide) return { title: "Peptide not found" };
  const title = `${peptide.name} (${peptide.inciName}) — mechanism, evidence & how to use`;
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

  const [products, related] = await Promise.all([getProductsWithPeptide(peptide.slug), getRelatedPeptides(peptide, 3)]);
  const evidence = evidenceLevel(peptide.evidenceLevel);
  const peptideClass = PEPTIDE_CLASSES[peptide.peptideClass];

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

  const sections = [
    { id: "how-it-works", title: "How it works", body: peptide.mechanism },
    { id: "evidence", title: "What the evidence says", body: peptide.evidence },
    { id: "how-to-use", title: "How to use it", body: peptide.usage },
  ].filter((s) => s.body?.trim());

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

      {/* Header */}
      <header className="border-b border-stone/60 bg-ivory">
        <div className="container-bp pt-8 pb-12 md:pb-16">
          <Breadcrumbs
            items={[{ href: "/", label: "Home" }, { href: "/peptides", label: "Peptide Library" }, { label: peptide.name }]}
          />
          <div className="mt-10 grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={CLASS_TONES[peptide.peptideClass] ?? "neutral"}>{classLabel(peptide.peptideClass)}</Badge>
                <span className="text-xs text-taupe">Monograph · updated {formatDate(peptide.updatedAt)}</span>
              </div>
              <h1 className="mt-5 font-display text-5xl leading-none text-espresso md:text-7xl">{peptide.name}</h1>
              <p className="mt-4 text-sm tracking-wide text-cocoa">
                INCI: <span className="text-espresso">{peptide.inciName}</span>
                {peptide.aliases.length > 0 && <> · also sold as {peptide.aliases.join(", ")}</>}
              </p>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-cocoa">{peptide.summary}</p>
            </div>
            <div className="rounded-2xl border border-stone/70 bg-cream p-6">
              <p className="eyebrow mb-3">Strength of evidence</p>
              <EvidenceMeter level={evidence.level} size="lg" />
              <p className="mt-3 text-sm leading-relaxed text-cocoa">{evidence.description}</p>
              <Link
                href="/peptides#library"
                className="mt-4 inline-block text-xs text-copper-dark underline underline-offset-4"
              >
                How we grade evidence
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container-bp grid gap-12 py-14 lg:grid-cols-[1fr_320px] lg:gap-16">
        {/* Main column */}
        <div className="min-w-0">
          {/* In-page nav */}
          <nav aria-label="On this page" className="mb-10 flex flex-wrap gap-2">
            {[
              { id: "benefits", title: "At a glance" },
              ...sections.map(({ id, title }) => ({ id, title })),
              ...(peptide.studies.length ? [{ id: "studies", title: "Key studies" }] : []),
              ...(products.length ? [{ id: "find-it-in", title: "Find it in" }] : []),
            ].map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="rounded-full border border-stone bg-cream px-3.5 py-1.5 text-xs text-cocoa hover:border-copper/50 hover:text-espresso"
              >
                {s.title}
              </a>
            ))}
          </nav>

          {peptide.benefits.length > 0 && (
            <section id="benefits" className="scroll-mt-28">
              <h2 className="font-display text-3xl text-espresso">At a glance</h2>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {peptide.benefits.map((b) => (
                  <li key={b} className="flex gap-3 rounded-xl bg-ivory p-4 text-sm leading-relaxed text-cocoa">
                    <Check className="mt-0.5 size-4 shrink-0 text-copper" aria-hidden />
                    {b}
                  </li>
                ))}
              </ul>
              {peptide.concerns.length > 0 && (
                <p className="mt-5 text-sm text-cocoa">
                  <span className="text-taupe">Most relevant for:</span>{" "}
                  {peptide.concerns.map((c, i) => (
                    <span key={c}>
                      {i > 0 && " · "}
                      <Link href={`/shop?concern=${c}`} className="text-espresso underline-offset-4 hover:underline">
                        {concernLabel(c)}
                      </Link>
                    </span>
                  ))}
                </p>
              )}
            </section>
          )}

          {sections.map((s) => (
            <section key={s.id} id={s.id} className="mt-14 scroll-mt-28">
              <h2 className="mb-5 font-display text-3xl text-espresso">{s.title}</h2>
              {s.id === "how-it-works" && peptideClass && (
                <figure className="mb-6 rounded-2xl border border-stone/60 bg-ivory p-4 sm:p-6">
                  <ClassDiagram type={peptide.peptideClass} className="mx-auto max-w-sm" />
                  <figcaption className="mt-3 text-center text-xs text-cocoa">
                    Schematic: how a {peptideClass.label.toLowerCase()} works. {peptideClass.description}
                  </figcaption>
                </figure>
              )}
              <Markdown>{s.body}</Markdown>
            </section>
          ))}

          {peptide.studies.length > 0 && (
            <section id="studies" className="mt-14 scroll-mt-28">
              <h2 className="mb-5 font-display text-3xl text-espresso">Key studies</h2>
              <ol className="space-y-3">
                {peptide.studies.map((study, i) => (
                  <li key={i} className="flex gap-4 rounded-xl border border-stone/60 bg-cream p-4">
                    <span className="font-display text-lg text-copper">{String(i + 1).padStart(2, "0")}</span>
                    <div className="min-w-0 text-sm">
                      <p className="font-medium text-espresso">{study.title}</p>
                      <p className="mt-1 text-cocoa">
                        {study.source}
                        {study.year ? ` · ${study.year}` : ""}
                      </p>
                      {study.url && (
                        <a
                          href={study.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="mt-2 inline-flex items-center gap-1 text-xs text-copper-dark underline underline-offset-4"
                        >
                          View source <ExternalLink className="size-3" aria-hidden />
                          <span className="sr-only">(opens in a new tab)</span>
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <aside className="mt-14 flex gap-4 rounded-2xl border border-amber/30 bg-amber-light/40 p-5 text-sm leading-relaxed text-cocoa">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber" aria-hidden />
            <p>
              <strong className="text-espresso">Educational information, not medical advice.</strong> This monograph
              summarises published cosmetic research on topical {peptide.name}. Results in studies are averages and
              individual results vary. Our products are cosmetics for external use only; they are not intended to
              diagnose, treat or prevent any condition. Patch test new products and speak to your doctor or
              dermatologist about skin concerns, or if you are pregnant or breastfeeding.
            </p>
          </aside>
        </div>

        {/* Quick facts */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl border border-stone/70 bg-cream p-6">
            <p className="eyebrow mb-4">Quick facts</p>
            <dl className="space-y-3.5 text-sm">
              {facts
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs text-taupe">{k}</dt>
                    <dd className={k === "Sequence" ? "font-mono text-xs break-all text-espresso" : "text-espresso"}>
                      {v}
                    </dd>
                  </div>
                ))}
            </dl>
            {peptide.pairsWith.length > 0 && (
              <div className="mt-5 border-t border-stone/60 pt-5">
                <p className="mb-2 text-xs text-taupe">Pairs well with</p>
                <ul className="flex flex-wrap gap-1.5">
                  {peptide.pairsWith.map((p) => (
                    <li key={p} className="rounded-lg bg-sage-light px-2.5 py-1 text-xs leading-snug text-sage">
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {peptide.avoidWith.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-xs text-taupe">Use separately from</p>
                <ul className="flex flex-wrap gap-1.5">
                  {peptide.avoidWith.map((p) => (
                    <li key={p} className="rounded-lg bg-danger-light px-2.5 py-1 text-xs leading-snug text-danger">
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="mt-4 rounded-2xl bg-espresso p-6 text-cream">
            <Sparkles className="size-5 text-copper-light" aria-hidden />
            <p className="mt-3 font-display text-xl">Not sure where it fits?</p>
            <p className="mt-2 text-sm text-cream/70">Answer four questions and we&apos;ll build a peptide routine around your skin.</p>
            <ButtonLink href="/routine-builder" variant="copper" size="sm" className="mt-5">
              Build my routine
            </ButtonLink>
          </div>
        </aside>
      </div>

      {products.length > 0 && (
        <section id="find-it-in" className="scroll-mt-28 border-t border-stone/60 bg-ivory/50 py-16">
          <div className="container-bp">
            <p className="eyebrow mb-3">Find it in</p>
            <h2 className="mb-10 font-display text-3xl text-espresso md:text-4xl">
              Formulas featuring {peptide.name}
            </h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="container-bp py-16">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow mb-3">Keep reading</p>
              <h2 className="font-display text-3xl text-espresso">Related peptides</h2>
            </div>
            <Link href="/compare" className="hidden items-center gap-1 text-sm text-copper-dark sm:flex">
              Compare all <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {related.map((p) => (
              <PeptideCard key={p.id} peptide={p} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
