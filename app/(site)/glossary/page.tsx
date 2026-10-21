import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Figure, PageHeader, reveal } from "@/components/info/page-header";
import { ButtonLink } from "@/components/ui/button";
import { GLOSSARY } from "@/lib/content/glossary";

export const metadata: Metadata = {
  title: "Peptide and skincare glossary",
  description:
    "Plain-English definitions of the terms you'll meet in peptide skincare: INCI names, daltons, fibroblasts, the extracellular matrix, palmitoylation, the SNARE complex, MMPs and more.",
};

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/* A photograph beside some letters, of the thing one of its terms describes. */
const LETTER_PICTURES: Record<string, { src: string; alt: string; caption: string }> = {
  C: {
    src: "/images/articles/matrixyl-collagen-signal-peptides.webp",
    alt: "Close-up of fine pink and cream fibres, like collagen under magnification",
    caption: "Collagen: the fibres that give skin its strength.",
  },
  L: {
    src: "/images/articles/storing-peptide-powders.webp",
    alt: "Amber vials of freeze-dried peptide powder in a refrigerator door",
    caption: "Lyophilised: freeze-dried, and kept cold.",
  },
  P: {
    src: "/images/editorial/actives.webp",
    alt: "A row of amber vials of freeze-dried peptide powder on a travertine bench beside a scale",
    caption: "Peptides, weighed out as pure actives.",
  },
  S: {
    src: "/images/editorial/texture.webp",
    alt: "A clear gel and a white cream swatched side by side on a pale ground",
    caption: "The vehicle: what carries a peptide to the stratum corneum.",
  },
};

function letterOf(term: string) {
  const first = term.normalize("NFKD").replace(/[^A-Za-z]/g, "").charAt(0).toUpperCase();
  return first || "#";
}

export default function GlossaryPage() {
  const sorted = [...GLOSSARY].sort(
    (a, b) => letterOf(a.term).localeCompare(letterOf(b.term)) || a.term.localeCompare(b.term),
  );
  const groups = new Map<string, typeof GLOSSARY>();
  for (const t of sorted) {
    const l = letterOf(t.term);
    groups.set(l, [...(groups.get(l) ?? []), t]);
  }

  return (
    <>
      <PageHeader
        crumbs={[{ href: "/", label: "Home" }, { label: "Glossary" }]}
        title="The glossary"
        lead={`${GLOSSARY.length} terms you'll meet on ingredient lists, in research papers and across the peptide library, in plain English.`}
        figure={
          <Figure ratio="aspect-[4/3]">
            <Image
              src="/images/articles/what-are-peptides.webp"
              alt="A chain of copper and glass beads curving across a cream ground"
              fill
              priority
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </Figure>
        }
      >
        <nav aria-label="Jump to a letter" className="flex flex-wrap gap-1.5">
          {ALPHABET.filter((l) => groups.has(l)).map((l) => (
            <a
              key={l}
              href={`#letter-${l}`}
              className="press grid size-11 place-items-center bg-surface text-body font-medium hover:bg-surface-2"
            >
              {l}
            </a>
          ))}
        </nav>
      </PageHeader>

      <div className="container-bp mt-12 lg:mt-20">
        {[...groups.entries()].map(([letter, terms]) => {
          const pic = LETTER_PICTURES[letter];
          return (
            <section
              key={letter}
              id={`letter-${letter}`}
              aria-labelledby={`h-${letter}`}
              className="mt-16 grid scroll-mt-8 gap-6 lg:mt-24 lg:grid-cols-12 lg:gap-[var(--gutter)]"
            >
              <div className="lg:col-span-3">
                <h2 id={`h-${letter}`} className="display-type text-head" {...reveal(0)}>
                  {letter}
                </h2>
                {pic && (
                  <Figure ratio="aspect-[4/5]" caption={pic.caption} className="mt-8 hidden max-w-[320px] lg:block">
                    <Image src={pic.src} alt={pic.alt} fill sizes="22vw" className="object-cover" />
                  </Figure>
                )}
              </div>
              <dl className="lg:col-span-8 lg:col-start-5">
                {terms.map((t) => (
                  <div
                    key={t.id}
                    id={t.id}
                    className="scroll-mt-8 px-4 py-6 target:bg-accent-soft sm:grid sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] sm:gap-8 sm:px-5"
                  >
                    <dt>
                      <span className="block text-lead font-medium">{t.term}</span>
                      {t.aka && <span className="mt-1 block text-small text-muted">{t.aka}</span>}
                    </dt>
                    <dd className="mt-2 sm:mt-0">
                      <p className="max-w-[60ch] text-body">{t.definition}</p>
                      {t.links && t.links.length > 0 && (
                        <p className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-body">
                          {t.links.map((l) => (
                            <Link key={l.href} href={l.href} className="underline underline-offset-4">
                              {l.label}
                            </Link>
                          ))}
                        </p>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          );
        })}
      </div>

      <section aria-labelledby="deeper-title" className="container-bp mt-28 lg:mt-44">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-[var(--gutter)]">
          <Figure ratio="aspect-[16/9]" className="lg:col-span-6">
            <Image
              src="/images/editorial/science.webp"
              alt="A model of a peptide chain in copper and blue beads beside a single droplet"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="drift object-cover"
            />
          </Figure>
          <div className="lg:col-span-5 lg:col-start-8 lg:pb-2">
            <h2 id="deeper-title" className="display-type text-head" {...reveal(0)}>
              The terms, at work
            </h2>
            <p className="mt-6 max-w-[44ch] text-body" {...reveal(1)}>
              See how they fit together in our guide to how cosmetic peptides work.
            </p>
            <ButtonLink href="/science" className="mt-8">
              Read the science
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
