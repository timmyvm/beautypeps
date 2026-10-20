import { ArrowRight, BookOpen, FlaskConical, Scale } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/info/page-hero";
import { ClassDiagram } from "@/components/peptides/class-diagram";
import { EvidenceMeter } from "@/components/peptides/evidence-meter";
import { PeptideCard } from "@/components/peptides/peptide-card";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, SectionHeading } from "@/components/ui/misc";
import { CONCERNS, concernLabel, PEPTIDE_CLASSES } from "@/lib/constants";
import { EVIDENCE_LEVELS } from "@/lib/content/evidence";
import { getPublishedPeptides } from "@/lib/queries/content";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Peptide Library",
  description:
    "An open, evidence-graded reference to every cosmetic peptide we formulate with — GHK-Cu, Matrixyl, Argireline, SNAP-8 and more. Mechanisms, research, concentrations and how to use them.",
};

type SearchParams = Promise<{ class?: string; concern?: string }>;

export default async function PeptideLibraryPage({ searchParams }: { searchParams: SearchParams }) {
  const { class: classParam, concern } = await searchParams;
  const activeClass = classParam && PEPTIDE_CLASSES[classParam] ? classParam : undefined;
  const activeConcern = CONCERNS.some((c) => c.slug === concern) ? concern : undefined;

  const all = await getPublishedPeptides();
  const peptides = all.filter(
    (p) => (!activeClass || p.peptideClass === activeClass) && (!activeConcern || p.concerns.includes(activeConcern)),
  );
  const classCounts = Object.fromEntries(
    Object.keys(PEPTIDE_CLASSES).map((k) => [k, all.filter((p) => p.peptideClass === k).length]),
  );
  const concernsInUse = CONCERNS.filter((c) => all.some((p) => p.concerns.includes(c.slug)));

  const href = (next: { class?: string; concern?: string }) => {
    const qs = new URLSearchParams();
    if (next.class) qs.set("class", next.class);
    if (next.concern) qs.set("concern", next.concern);
    const s = qs.toString();
    return s ? `/peptides?${s}#library` : "/peptides#library";
  };

  return (
    <>
      <PageHero
        eyebrow="The Peptide Library"
        title={
          <>
            An open reference to every peptide we <em className="text-copper-dark">formulate with</em>
          </>
        }
        description="Plain-English monographs on each cosmetic peptide: what it is, how it's thought to work, what the published research actually shows, and how to use it well. Every entry is graded for strength of evidence — including the limits of that evidence."
      >
        <div className="mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
          {[
            { icon: FlaskConical, label: `${all.length} peptides`, text: "Monographs with mechanisms & sequences" },
            { icon: Scale, label: "Evidence-graded", text: "From lab-only to clinical trials" },
            { icon: BookOpen, label: "Fully referenced", text: "Links to the original studies" },
          ].map((s) => (
            <div key={s.label} className="flex items-start gap-3 rounded-2xl border border-stone/70 bg-cream p-4">
              <s.icon className="mt-0.5 size-5 shrink-0 text-copper" aria-hidden />
              <div>
                <p className="text-sm font-medium text-espresso">{s.label}</p>
                <p className="text-xs text-cocoa">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </PageHero>

      {/* The four classes */}
      <section className="container-bp py-16 md:py-20">
        <SectionHeading
          eyebrow="Start here"
          title="Four ways a peptide can talk to your skin"
          description="Cosmetic peptides are usually grouped by what they do once they reach the skin. Tap a class to filter the library."
          action={
            <ButtonLink href="/science" variant="outline" size="sm">
              Read the full science <ArrowRight className="size-3.5" />
            </ButtonLink>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(PEPTIDE_CLASSES).map(([key, c]) => (
            <Link
              key={key}
              href={href({ class: activeClass === key ? undefined : key, concern: activeConcern })}
              aria-current={activeClass === key ? "true" : undefined}
              className={cn(
                "group flex flex-col rounded-2xl border p-5 transition-colors",
                activeClass === key
                  ? "border-copper bg-copper-light/30"
                  : "border-stone/70 bg-cream hover:border-copper/40",
              )}
            >
              <div className="rounded-xl bg-ivory p-2">
                <ClassDiagram type={key} />
              </div>
              <p className="mt-4 font-display text-lg text-espresso">{c.label}</p>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-cocoa">{c.description}</p>
              <p className="mt-4 text-xs font-medium text-copper-dark">
                {classCounts[key] ?? 0} in the library {activeClass === key ? "· showing" : "→"}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Library grid */}
      <section id="library" className="scroll-mt-24 border-t border-stone/60 bg-ivory/50 py-16 md:py-20">
        <div className="container-bp">
          <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow mb-3">Monographs</p>
              <h2 className="font-display text-3xl text-espresso md:text-4xl">
                {activeClass ? PEPTIDE_CLASSES[activeClass].label + "s" : "All peptides"}
                {activeConcern ? ` for ${concernLabel(activeConcern).toLowerCase()}` : ""}
              </h2>
              <p className="mt-2 text-sm text-cocoa">
                Showing {peptides.length} of {all.length}
              </p>
            </div>
            {(activeClass || activeConcern) && (
              <Link href="/peptides#library" className="text-sm text-copper-dark underline underline-offset-4">
                Clear filters
              </Link>
            )}
          </div>

          <div className="scrollbar-none -mx-4 mb-10 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            <FilterChip href={href({ class: activeClass })} active={!activeConcern}>
              Any concern
            </FilterChip>
            {concernsInUse.map((c) => (
              <FilterChip
                key={c.slug}
                href={href({ class: activeClass, concern: activeConcern === c.slug ? undefined : c.slug })}
                active={activeConcern === c.slug}
              >
                {c.label}
              </FilterChip>
            ))}
          </div>

          {peptides.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {peptides.map((p) => (
                <PeptideCard key={p.id} peptide={p} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<FlaskConical className="size-8" />}
              title={all.length === 0 ? "The library is being written" : "No peptides match those filters"}
              description={
                all.length === 0
                  ? "Monographs will appear here as soon as they're published."
                  : "Try a different class or concern."
              }
              action={
                all.length > 0 ? (
                  <ButtonLink href="/peptides#library" variant="outline" size="sm">
                    Show all peptides
                  </ButtonLink>
                ) : undefined
              }
            />
          )}
        </div>
      </section>

      {/* How to read a monograph */}
      <section className="container-bp py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="eyebrow mb-3">How to read a monograph</p>
            <h2 className="font-display text-3xl leading-tight text-espresso md:text-4xl">
              Not all evidence is created equal
            </h2>
            <p className="mt-5 leading-relaxed text-cocoa">
              Most cosmetic peptides are studied first by the companies that make them. That research is useful, but
              it isn&apos;t the same as independent, placebo-controlled clinical trials. So every monograph carries an
              evidence grade from 1 to 5, based on the best published data we could find — and we tell you when the
              data is thin.
            </p>
            <p className="mt-4 leading-relaxed text-cocoa">
              Grades describe the <strong className="text-espresso">quality of the research</strong>, not how much we
              like an ingredient. A level-3 peptide can still be a great addition to your routine; it just means
              expectations should be realistic.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/compare">
                Compare all peptides <ArrowRight className="size-4" />
              </ButtonLink>
              <ButtonLink href="/glossary" variant="outline">
                Glossary of terms
              </ButtonLink>
            </div>
          </div>
          <ol className="divide-y divide-stone/60 rounded-2xl border border-stone/70 bg-cream">
            {Object.entries(EVIDENCE_LEVELS)
              .reverse()
              .map(([level, e]) => (
                <li key={level} className="flex flex-col gap-2 p-5 sm:flex-row sm:items-start sm:gap-6">
                  <div className="w-40 shrink-0">
                    <EvidenceMeter level={Number(level)} size="lg" showLabel={false} />
                    <p className="mt-2 text-sm font-semibold text-espresso">
                      Level {level} · {e.label}
                    </p>
                  </div>
                  <p className="text-sm leading-relaxed text-cocoa">{e.description}</p>
                </li>
              ))}
          </ol>
        </div>
      </section>
    </>
  );
}

function FilterChip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "true" : undefined}
      className={cn(
        "shrink-0 rounded-full border px-4 py-2 text-xs font-medium whitespace-nowrap transition-colors",
        active ? "border-espresso bg-espresso text-cream" : "border-stone bg-cream text-cocoa hover:border-taupe",
      )}
    >
      {children}
    </Link>
  );
}
