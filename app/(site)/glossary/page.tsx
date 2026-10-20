import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/info/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { GLOSSARY } from "@/lib/content/glossary";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Peptide & skincare glossary",
  description:
    "Plain-English definitions of the terms you'll meet in peptide skincare: INCI names, Daltons, fibroblasts, the extracellular matrix, palmitoylation, SNARE complex, MMPs and more.",
};

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function letterOf(term: string) {
  const first = term.normalize("NFKD").replace(/[^A-Za-z]/g, "").charAt(0).toUpperCase();
  return first || "#";
}

export default function GlossaryPage() {
  const sorted = [...GLOSSARY].sort((a, b) => letterOf(a.term).localeCompare(letterOf(b.term)) || a.term.localeCompare(b.term));
  const groups = new Map<string, typeof GLOSSARY>();
  for (const t of sorted) {
    const l = letterOf(t.term);
    groups.set(l, [...(groups.get(l) ?? []), t]);
  }

  return (
    <>
      <PageHero
        eyebrow="Glossary"
        title="The language of peptides, decoded"
        description={`${GLOSSARY.length} terms you'll meet on ingredient lists, in research papers and across our Peptide Library — explained in plain English.`}
      />

      <nav
        aria-label="Jump to letter"
        className="sticky top-16 z-30 border-b border-stone/60 bg-cream/95 backdrop-blur md:top-20"
      >
        <div className="container-bp scrollbar-none flex gap-1 overflow-x-auto py-3">
          {ALPHABET.map((l) =>
            groups.has(l) ? (
              <a
                key={l}
                href={`#letter-${l}`}
                className="grid size-8 shrink-0 place-items-center rounded-full text-sm font-medium text-espresso hover:bg-copper-light/50"
              >
                {l}
              </a>
            ) : (
              <span key={l} className="grid size-8 shrink-0 place-items-center text-sm text-stone" aria-hidden>
                {l}
              </span>
            ),
          )}
        </div>
      </nav>

      <div className="container-bp py-14">
        <div className="mx-auto max-w-4xl space-y-14">
          {[...groups.entries()].map(([letter, terms]) => (
            <section key={letter} id={`letter-${letter}`} className="scroll-mt-40" aria-labelledby={`h-${letter}`}>
              <h2 id={`h-${letter}`} className="mb-6 border-b border-stone pb-3 font-display text-4xl text-copper">
                {letter}
              </h2>
              <dl className="space-y-4">
                {terms.map((t) => (
                  <div
                    key={t.id}
                    id={t.id}
                    className={cn(
                      "scroll-mt-40 rounded-2xl border border-stone/60 bg-cream p-5 transition-colors md:grid md:grid-cols-[220px_1fr] md:gap-8",
                      "target:border-copper target:bg-copper-light/20",
                    )}
                  >
                    <dt>
                      <span className="font-display text-xl text-espresso">{t.term}</span>
                      {t.aka && <span className="mt-1 block text-xs text-taupe">{t.aka}</span>}
                    </dt>
                    <dd className="mt-2 md:mt-0">
                      <p className="text-sm leading-relaxed text-cocoa">{t.definition}</p>
                      {t.links && t.links.length > 0 && (
                        <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                          {t.links.map((l) => (
                            <Link key={l.href} href={l.href} className="inline-flex items-center gap-1 text-copper-dark hover:underline">
                              {l.label} <ArrowRight className="size-3" aria-hidden />
                            </Link>
                          ))}
                        </p>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>

        <div className="mx-auto mt-16 flex max-w-4xl flex-col items-start gap-4 rounded-2xl bg-ivory p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-2xl text-espresso">Ready for the deep dive?</p>
            <p className="mt-1 text-sm text-cocoa">See these terms in action in our guide to how peptides work.</p>
          </div>
          <ButtonLink href="/science">
            Read the science <ArrowRight className="size-4" />
          </ButtonLink>
        </div>
      </div>
    </>
  );
}
