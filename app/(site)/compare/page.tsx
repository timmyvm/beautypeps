import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Figure, PageHeader, PictureLink, reveal } from "@/components/info/page-header";
import { EvidenceMeter } from "@/components/peptides/evidence-meter";
import { ButtonLink } from "@/components/ui/button";
import { classShortLabel, SpecimenThumb } from "@/components/peptides/peptide-entry";
import { concernLabel } from "@/lib/constants";
import { PAIRINGS, PEPTIDE_USAGE } from "@/lib/content/compare";
import { getPeptideSpecimens, getPublishedPeptides } from "@/lib/queries/content";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Compare peptides side by side",
  description:
    "Compare GHK-Cu, Matrixyl, Argireline, SNAP-8, Leuphasyl and more side by side: what each is best for, typical concentration, evidence grade, pH, when to use it and what to pair it with.",
};

const VERDICT = {
  great: { label: "Good together", className: "text-ink" },
  ok: { label: "Alternate them", className: "text-ink" },
  separate: { label: "Keep apart", className: "text-danger" },
} as const;

export default async function ComparePage() {
  const [peptides, specimens] = await Promise.all([getPublishedPeptides(), getPeptideSpecimens()]);
  const rows = peptides.map((p) => {
    const meta = PEPTIDE_USAGE[p.slug];
    return {
      ...p,
      bestFor: meta?.bestFor ?? p.concerns.slice(0, 2).map(concernLabel).join(", "),
      when: meta?.when ?? "AM / PM",
      onset: meta?.onset ?? "8–12 weeks",
    };
  });

  return (
    <>
      <PageHeader
        crumbs={[{ href: "/", label: "Home" }, { href: "/peptides", label: "Peptide library" }, { label: "Compare" }]}
        title="Every peptide, side by side"
        lead="What each one is for, the concentration studies use, how strong the evidence is, and where it fits in a routine."
        figure={
          <Figure ratio="aspect-[4/3]">
            <Image
              src="/images/editorial/lab.webp"
              alt="A formulation bench with beakers, a scale and amber vials in morning light"
              fill
              priority
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </Figure>
        }
      >
        <ButtonLink href="/routine-builder">Find yours in four questions</ButtonLink>
      </PageHeader>

      <section aria-labelledby="chart-title" className="container-bp mt-20 lg:mt-32">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2 id="chart-title" className="display-type text-head" {...reveal(0)}>
            The chart
          </h2>
          <p className="max-w-[48ch] text-body text-muted">Choose a name for the full monograph.</p>
        </div>

        {rows.length === 0 ? (
          <p className="mt-10 bg-surface px-6 py-14 text-lead">The chart fills in as monographs are published.</p>
        ) : (
          <>
            <div className="-mx-4 mt-10 hidden xl:block">
              <table className="w-full border-separate border-spacing-0 text-left text-body">
                <thead>
                  <tr className="[&>th]:sticky [&>th]:top-0 [&>th]:z-10 [&>th]:bg-surface [&>th]:px-4 [&>th]:py-4 [&>th]:font-medium">
                    <th scope="col">Peptide</th>
                    <th scope="col">Best for</th>
                    <th scope="col">Typical use</th>
                    <th scope="col">Evidence</th>
                    <th scope="col">When</th>
                    <th scope="col">Pairs well with</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((p, i) => (
                    <tr
                      key={p.id}
                      data-reveal="row"
                      style={{ ["--reveal-i" as string]: Math.min(i, 8) }}
                      className="align-top [&>*]:border-b [&>*]:border-surface-2 [&>*]:px-4 [&>*]:py-5" /* taste-skill-ignore: rows of a real table */
                    >
                      <th scope="row" className="w-[300px] font-normal">
                        <Link href={`/peptides/${p.slug}`} className="group flex items-start gap-4">
                          <SpecimenThumb specimen={specimens[p.slug]} className="size-16 shrink-0" sizes="64px" />
                          <span>
                            <span className="block text-lead font-medium group-hover:underline group-hover:underline-offset-4">
                              {p.name}
                            </span>
                            <span className="block text-small text-muted">
                              {p.inciName}, {classShortLabel(p.peptideClass).toLowerCase()}
                            </span>
                          </span>
                        </Link>
                      </th>
                      <td className="min-w-[170px]">{p.bestFor}</td>
                      <td className="min-w-[170px]">
                        {p.typicalConcentration ?? "Not published"}
                        {p.phRange && <span className="block text-small text-muted">pH {p.phRange}</span>}
                      </td>
                      <td className="whitespace-nowrap">
                        <EvidenceMeter level={p.evidenceLevel} />
                      </td>
                      <td className="whitespace-nowrap">
                        {p.when}
                        <span className="block text-small text-muted">Results in {p.onset}</span>
                      </td>
                      <td className="min-w-[200px]">{p.pairsWith.slice(0, 3).join(", ") || "Most routines"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ol className="-mx-4 mt-10 xl:hidden">
              {rows.map((p, i) => (
                <li
                  key={p.id}
                  data-reveal="row"
                  style={{ ["--reveal-i" as string]: Math.min(i, 8) }}
                  className={cn("px-4 py-6", i % 2 === 0 ? "bg-surface" : "bg-bg")}
                >
                  <Link href={`/peptides/${p.slug}`} className="group flex items-start gap-4">
                    <SpecimenThumb specimen={specimens[p.slug]} className="size-16 shrink-0" sizes="64px" />
                    <span>
                      <span className="block text-lead font-medium group-hover:underline group-hover:underline-offset-4">
                        {p.name}
                      </span>
                      <span className="block text-small text-muted">
                        {p.inciName}, {classShortLabel(p.peptideClass).toLowerCase()}
                      </span>
                    </span>
                  </Link>
                  <p className="mt-4 text-body">{p.bestFor}</p>
                  <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 text-body md:grid-cols-4">
                    <Fact label="Typical use" value={p.typicalConcentration ?? "Not published"} />
                    <Fact label="pH" value={p.phRange ?? "Not published"} />
                    <Fact label="When" value={p.when} />
                    <Fact label="Results in" value={p.onset} />
                    <div className="col-span-2 md:col-span-4">
                      <dt className="text-small text-muted">Evidence</dt>
                      <dd className="mt-1">
                        <EvidenceMeter level={p.evidenceLevel} />
                      </dd>
                    </div>
                    {p.pairsWith.length > 0 && (
                      <Fact label="Pairs well with" value={p.pairsWith.slice(0, 3).join(", ")} className="col-span-2 md:col-span-4" />
                    )}
                  </dl>
                </li>
              ))}
            </ol>

            <p className="mt-6 max-w-[72ch] text-body text-muted">
              Typical concentrations are those used in published or manufacturer studies. Results in is the time
              frame in which studies measured visible change; yours will vary.
            </p>
          </>
        )}
      </section>

      <section aria-labelledby="pairings-title" className="container-bp mt-28 lg:mt-44">
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-[var(--gutter)]">
          <h2 id="pairings-title" className="display-type text-head lg:col-span-6" {...reveal(0)}>
            Pairings, and one to keep apart
          </h2>
          <p className="max-w-[52ch] text-body lg:col-span-5 lg:col-start-8 lg:self-end" {...reveal(1)}>
            Peptides are among the easiest actives to combine. Stack different mechanisms for a broader effect and mind
            a few rules of chemistry.
          </p>
        </div>
        <ul className="-mx-4 mt-12">
          {PAIRINGS.map((pair, i) => {
            const v = VERDICT[pair.verdict];
            return (
              <li
                key={pair.title}
                data-reveal="row"
                style={{ ["--reveal-i" as string]: i }}
                className={cn(
                  "grid gap-3 px-4 py-7 lg:grid-cols-12 lg:gap-[var(--gutter)]",
                  pair.verdict === "separate" ? "bg-danger-light" : i % 2 === 0 ? "bg-surface" : "bg-bg",
                )}
              >
                <div className="lg:col-span-4">
                  <h3 className="text-lead font-medium">{pair.title}</h3>
                  <p className="mt-1 text-body">
                    {pair.peptides.map((p, j) => (
                      <span key={p.label}>
                        {j > 0 && " + "}
                        {p.slug ? (
                          <Link href={`/peptides/${p.slug}`} className="underline underline-offset-4">
                            {p.label}
                          </Link>
                        ) : (
                          p.label
                        )}
                      </span>
                    ))}
                  </p>
                </div>
                <p className={cn("text-body font-medium lg:col-span-2", v.className)}>{v.label}</p>
                <p className="max-w-[60ch] text-body lg:col-span-6">{pair.text}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="routine-title" className="container-bp mt-28 lg:mt-44">
        <h2 id="routine-title" className="display-type text-head" {...reveal(0)}>
          Put it into a routine
        </h2>
        <div className="mt-12 grid gap-x-[var(--gutter)] gap-y-12 md:grid-cols-3">
          <PictureLink
            href="/routine-builder"
            src="/images/articles/beginner-peptide-routine.webp"
            alt="Three peptide serums and a vase on a travertine tray in a bathroom"
            title="Build a routine"
            text="Four questions about your skin, and the formulas that answer them."
            index={1}
          />
          <PictureLink
            href="/learn/how-to-layer-peptides"
            src="/images/articles/how-to-layer-peptides.webp"
            alt="Four serums in frosted bottles above swatches of each texture on stone"
            title="The layering guide"
            text="Peptides with retinol, vitamin C, acids and niacinamide, step by step."
            index={2}
          />
          <PictureLink
            href="/science"
            src="/images/editorial/science.webp"
            alt="A model of a peptide chain in copper and blue beads beside a single droplet"
            title="Why they work"
            text="The biology behind each class of peptide, in plain English."
            index={3}
          />
        </div>
      </section>
    </>
  );
}

function Fact({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-small text-muted">{label}</dt>
      <dd className="mt-1">{value}</dd>
    </div>
  );
}
