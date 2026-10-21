import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Figure, PageHeader, PictureLink, reveal } from "@/components/info/page-header";
import { ClassDiagram } from "@/components/peptides/class-diagram";
import { EvidenceMeter } from "@/components/peptides/evidence-meter";
import { LoopVideo } from "@/components/site/loop-video";
import { classShortLabel, PeptideEntry } from "@/components/peptides/peptide-entry";
import { CONCERNS, concernLabel, PEPTIDE_CLASSES } from "@/lib/constants";
import { EVIDENCE_LEVELS } from "@/lib/content/evidence";
import { getPeptideSpecimens, getPublishedPeptides } from "@/lib/queries/content";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Peptide Library",
  description:
    "An open, evidence-graded reference to every cosmetic peptide we formulate with: GHK-Cu, Matrixyl, Argireline, SNAP-8 and more. Mechanisms, research, concentrations and how to use them.",
};

type SearchParams = Promise<{ class?: string; concern?: string }>;

export default async function PeptideLibraryPage({ searchParams }: { searchParams: SearchParams }) {
  const { class: classParam, concern } = await searchParams;
  const activeClass = classParam && PEPTIDE_CLASSES[classParam] ? classParam : undefined;
  const activeConcern = CONCERNS.some((c) => c.slug === concern) ? concern : undefined;

  const [all, specimens] = await Promise.all([getPublishedPeptides(), getPeptideSpecimens()]);
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

  const listTitle = [
    activeClass ? `${classShortLabel(activeClass)} peptides` : activeConcern ? "Peptides" : `All ${all.length} peptides`,
    activeConcern ? `for ${concernLabel(activeConcern).toLowerCase()}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <PageHeader
        crumbs={[{ href: "/", label: "Home" }, { label: "Peptide library" }]}
        title="The peptide library"
        lead={`A field guide to the ${all.length} peptides we formulate with: what each one does, how sure the science is, and where to find it.`}
        figureClassName="hidden lg:block"
        figure={
          <Figure ratio="aspect-[4/3]">
            <Image
              src="/images/editorial/actives.webp"
              alt="A row of amber vials of freeze-dried peptide powder on a travertine bench beside a scale"
              fill
              priority
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </Figure>
        }
      />

      <section id="library" className="container-bp mt-20 scroll-mt-24 lg:mt-32" aria-labelledby="library-title">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2 id="library-title" className="display-type text-head" {...reveal(0)}>
            {listTitle}
          </h2>
          <p className="text-body text-muted">
            {activeClass || activeConcern ? (
              <>
                {peptides.length} of {all.length}.{" "}
                <Link href="/peptides#library" scroll={false} className="text-ink underline underline-offset-4">
                  Show all
                </Link>
              </>
            ) : (
              "Graded from 1 to 5 for strength of evidence"
            )}
          </p>
        </div>

        <div className="mt-10 space-y-3">
          <ChipRow label="What it does">
            <Chip href={href({ concern: activeConcern })} active={!activeClass}>
              Any class
            </Chip>
            {Object.keys(PEPTIDE_CLASSES).map((key) => (
              <Chip
                key={key}
                href={href({ class: activeClass === key ? undefined : key, concern: activeConcern })}
                active={activeClass === key}
              >
                {classShortLabel(key)} ({classCounts[key] ?? 0})
              </Chip>
            ))}
          </ChipRow>
          <ChipRow label="What it treats">
            <Chip href={href({ class: activeClass })} active={!activeConcern}>
              Any concern
            </Chip>
            {concernsInUse.map((c) => (
              <Chip
                key={c.slug}
                href={href({ class: activeClass, concern: activeConcern === c.slug ? undefined : c.slug })}
                active={activeConcern === c.slug}
              >
                {c.label}
              </Chip>
            ))}
          </ChipRow>
        </div>

        {peptides.length > 0 ? (
          <ol className="-mx-3 mt-10 sm:-mx-4">
            {peptides.map((p, i) => (
              <PeptideEntry key={p.id} peptide={p} specimen={specimens[p.slug]} index={i} />
            ))}
          </ol>
        ) : (
          <div className="mt-10 bg-surface px-6 py-14 sm:px-10">
            <p className="text-lead text-ink">
              {all.length === 0 ? "The library is being written." : "No peptide in the library matches both of those."}
            </p>
            {all.length > 0 && (
              <Link href="/peptides#library" scroll={false} className="mt-3 inline-block text-body underline underline-offset-4">
                Show all {all.length} peptides
              </Link>
            )}
          </div>
        )}
      </section>

      <section className="container-bp mt-28 lg:mt-48" aria-labelledby="classes-title">
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-[var(--gutter)]">
          <h2 id="classes-title" className="display-type text-head lg:col-span-6" {...reveal(0)}>
            Four ways a peptide works
          </h2>
          <p className="max-w-[52ch] text-body lg:col-span-5 lg:col-start-8 lg:self-end" {...reveal(1)}>
            Cosmetic peptides are grouped by what they do once they reach the skin. The blue beads in each drawing
            are the peptide. Choose a class to narrow the library to it.
          </p>
        </div>
        <ul className="mt-14 grid gap-x-[var(--gutter)] gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(PEPTIDE_CLASSES).map(([key, c], i) => (
            <li key={key} {...reveal(i)}>
              <Link href={href({ class: key })} scroll={false} className="group block">
                <div className={cn("p-5", activeClass === key ? "bg-accent-soft" : "bg-surface group-hover:bg-surface-2")}>
                  <ClassDiagram type={key} />
                </div>
                <h3 className="mt-4 text-lead font-medium group-hover:underline group-hover:underline-offset-4">
                  {classShortLabel(key)} peptides
                </h3>
                <p className="mt-1 text-body">{c.description}</p>
                <p className="mt-2 text-small text-muted">
                  {classCounts[key] === 1 ? "1 peptide" : `${classCounts[key] ?? 0} peptides`} in the library
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="container-bp mt-28 lg:mt-48" aria-labelledby="grades-title">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-[var(--gutter)]">
          <div className="lg:col-span-5">
            <h2 id="grades-title" className="display-type text-head" {...reveal(0)}>
              How we grade evidence
            </h2>
            <div className="mt-8 max-w-[48ch] space-y-4 text-body" {...reveal(1)}>
              <p>
                Most cosmetic peptides are studied first by the companies that make them. That research is useful,
                but it is not the same as independent, placebo-controlled trials, so every monograph carries a grade
                from 1 to 5 based on the best published data we could find.
              </p>
              <p>
                A grade describes the research, not how much we like an ingredient. A grade 3 peptide can still earn
                its place in a routine; it means expectations should be modest.
              </p>
            </div>
            <Figure
              ratio="aspect-[4/3]"
              className="mt-12 hidden lg:block"
              caption="GHK-Cu, blue from its copper, is one of two peptides in the library graded 4."
            >
              <LoopVideo
                src="/video/copper-drop.mp4"
                poster="/video/copper-drop-poster.webp"
                label="Drops of blue copper peptide serum falling onto a brushed copper plate"
              />
            </Figure>
          </div>
          <ol className="lg:col-span-6 lg:col-start-7">
            {Object.entries(EVIDENCE_LEVELS)
              .reverse()
              .map(([level, e], i) => (
                <li key={level} data-reveal="row" style={{ ["--reveal-i" as string]: i }} className="py-6 first:pt-0">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <EvidenceMeter level={Number(level)} size="lg" showLabel={false} />
                    <h3 className="text-lead font-medium">
                      Grade {level}, {e.label.toLowerCase()}
                    </h3>
                  </div>
                  <p className="mt-2 max-w-[56ch] text-body">{e.description}</p>
                </li>
              ))}
          </ol>
        </div>
      </section>

      <section className="container-bp mt-28 lg:mt-48" aria-labelledby="further-title">
        <h2 id="further-title" className="display-type text-head" {...reveal(0)}>
          Read further
        </h2>
        <div className="mt-12 grid gap-x-[var(--gutter)] gap-y-12 md:grid-cols-12 md:items-end">
          <PictureLink
            href="/science"
            src="/images/editorial/science.webp"
            alt="A model of a peptide chain in copper and blue beads beside a single droplet"
            title="The science of peptides"
            text="What a peptide is, how one gets through the skin, and why size matters."
            className="md:col-span-6"
            sizes="(min-width: 768px) 50vw, 100vw"
            index={1}
          />
          <PictureLink
            href="/compare"
            src="/images/articles/how-to-layer-peptides.webp"
            alt="Four serums in frosted bottles above swatches of each texture on stone"
            title="Compare them side by side"
            text="Every peptide in one table: class, grade, concentration and what to pair it with."
            ratio="aspect-[4/5]"
            className="md:col-span-3"
            sizes="(min-width: 768px) 25vw, 100vw"
            index={2}
          />
          <PictureLink
            href="/routine-builder"
            src="/images/articles/beginner-peptide-routine.webp"
            alt="Three peptide serums and a vase on a travertine tray in a bathroom"
            title="Build a routine"
            text="Four questions about your skin, and the formulas that answer them."
            ratio="aspect-[4/5]"
            className="md:col-span-3"
            sizes="(min-width: 768px) 25vw, 100vw"
            index={3}
          />
        </div>
      </section>
    </>
  );
}

function ChipRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-full text-body text-muted sm:w-36 sm:shrink-0">{label}</span>
      {children}
    </div>
  );
}

function Chip({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "true" : undefined}
      className={cn(
        "press inline-flex h-11 items-center px-4 text-body whitespace-nowrap",
        active ? "bg-ink text-white" : "bg-surface text-ink hover:bg-surface-2",
      )}
    >
      {children}
    </Link>
  );
}
