import { ArrowRight, Check, Clock, Info, Split } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/info/page-hero";
import { EvidenceMeter } from "@/components/peptides/evidence-meter";
import { CLASS_TONES, classLabel } from "@/components/peptides/peptide-card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { concernLabel } from "@/lib/constants";
import { PAIRINGS, PEPTIDE_USAGE } from "@/lib/content/compare";
import { getPublishedPeptides } from "@/lib/queries/content";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Compare peptides — side-by-side evidence chart",
  description:
    "Compare GHK-Cu, Matrixyl, Argireline, SNAP-8, Leuphasyl and more side by side: what each is best for, typical concentration, evidence level, pH, when to use it and what to pair it with.",
};

export default async function ComparePage() {
  const peptides = await getPublishedPeptides();
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
      <PageHero
        eyebrow="Compare"
        title="Every peptide, side by side"
        description="What each peptide is best for, the concentrations used in research, how strong the evidence is, and how to fit it into your routine. Tap any name for the full monograph."
      />

      <section className="container-bp py-14">
        {rows.length === 0 ? (
          <EmptyState title="Comparison coming soon" description="Peptide monographs are being published." />
        ) : (
          <>
            {/* Desktop table — header sticks below the site header while scrolling */}
            <div className="hidden rounded-2xl border border-stone/70 bg-cream xl:block">
              <table className="w-full border-separate border-spacing-0 text-left text-[13px]">
                <thead className="text-[11px] tracking-wider text-cocoa uppercase">
                  <tr className="[&>th]:sticky [&>th]:top-20 [&>th]:z-10 [&>th]:border-b [&>th]:border-stone [&>th]:bg-ivory [&>th]:px-4 [&>th]:py-4 [&>th]:font-semibold">
                    <th scope="col" className="rounded-tl-2xl !pl-5">Peptide</th>
                    <th scope="col">Class</th>
                    <th scope="col">Best for</th>
                    <th scope="col">Typical % · pH</th>
                    <th scope="col">Evidence</th>
                    <th scope="col">When · results in</th>
                    <th scope="col" className="rounded-tr-2xl">Pairs well with</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((p, i) => (
                    <tr
                      key={p.id}
                      className={cn(
                        "align-top hover:bg-ivory/40 [&>*]:px-4 [&>*]:py-4",
                        i < rows.length - 1 && "[&>*]:border-b [&>*]:border-stone/50",
                      )}
                    >
                      <th scope="row" className="w-[210px] !pl-5 font-normal">
                        <Link href={`/peptides/${p.slug}`} className="group">
                          <span className="block font-display text-lg leading-tight text-espresso group-hover:text-copper-dark">
                            {p.name}
                          </span>
                          <span className="mt-0.5 block text-xs text-taupe">{p.inciName}</span>
                        </Link>
                      </th>
                      <td>
                        <Badge tone={CLASS_TONES[p.peptideClass] ?? "neutral"}>{classLabel(p.peptideClass)}</Badge>
                      </td>
                      <td className="min-w-[150px] text-cocoa">{p.bestFor}</td>
                      <td className="min-w-[150px]">
                        <span className="block text-espresso">{p.typicalConcentration ?? "—"}</span>
                        <span className="mt-1 block text-xs text-taupe">pH {p.phRange ?? "—"}</span>
                      </td>
                      <td className="whitespace-nowrap">
                        <EvidenceMeter level={p.evidenceLevel} />
                      </td>
                      <td className="whitespace-nowrap">
                        <span className="block text-espresso">{p.when}</span>
                        <span className="mt-1 block text-xs text-taupe">{p.onset}</span>
                      </td>
                      <td className="min-w-[180px] text-cocoa">{p.pairsWith.slice(0, 3).join(", ") || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul className="grid gap-4 md:grid-cols-2 xl:hidden">
              {rows.map((p) => (
                <li key={p.id} className="rounded-2xl border border-stone/70 bg-cream p-5">
                  <div className="flex items-start justify-between gap-3">
                    <Link href={`/peptides/${p.slug}`}>
                      <span className="block font-display text-xl text-espresso">{p.name}</span>
                      <span className="mt-0.5 block text-xs text-taupe">{p.inciName}</span>
                    </Link>
                    <Badge tone={CLASS_TONES[p.peptideClass] ?? "neutral"}>{classLabel(p.peptideClass)}</Badge>
                  </div>
                  <p className="mt-3 text-sm text-cocoa">{p.bestFor}</p>
                  <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-stone/60 pt-4 text-sm">
                    <MobileFact label="Typical %" value={p.typicalConcentration ?? "—"} />
                    <MobileFact label="pH" value={p.phRange ?? "—"} />
                    <MobileFact label="When" value={p.when} />
                    <MobileFact label="Results in" value={p.onset} />
                    <div className="col-span-2">
                      <dt className="text-xs text-taupe">Evidence</dt>
                      <dd className="mt-1">
                        <EvidenceMeter level={p.evidenceLevel} />
                      </dd>
                    </div>
                    {p.pairsWith.length > 0 && (
                      <MobileFact label="Pairs well with" value={p.pairsWith.slice(0, 3).join(", ")} className="col-span-2" />
                    )}
                  </dl>
                </li>
              ))}
            </ul>

            <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-taupe">
              <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              Typical concentrations are those used in published or manufacturer studies. &ldquo;Results in&rdquo; is
              the time frame in which studies typically measured visible change — individual results vary.
            </p>
          </>
        )}
      </section>

      {/* Pairings */}
      <section className="border-t border-stone/60 bg-ivory/50 py-16 md:py-20">
        <div className="container-bp">
          <p className="eyebrow mb-3">Layering</p>
          <h2 className="font-display text-3xl text-espresso md:text-4xl">Common pairings — and one to keep apart</h2>
          <p className="mt-4 max-w-2xl text-cocoa">
            Peptides are among the easiest actives to combine. Stack different mechanisms for a broader effect, and
            mind a few chemistry rules.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {PAIRINGS.map((pair) => (
              <div
                key={pair.title}
                className={cn(
                  "flex flex-col rounded-2xl border bg-cream p-6",
                  pair.verdict === "separate" ? "border-danger/30" : "border-stone/70",
                )}
              >
                <div className="flex items-center gap-2">
                  {pair.verdict === "separate" ? (
                    <Badge tone="danger">
                      <Split className="size-3" aria-hidden /> Use separately
                    </Badge>
                  ) : pair.verdict === "ok" ? (
                    <Badge tone="amber">
                      <Clock className="size-3" aria-hidden /> Alternate
                    </Badge>
                  ) : (
                    <Badge tone="sage">
                      <Check className="size-3" aria-hidden /> Great together
                    </Badge>
                  )}
                </div>
                <h3 className="mt-4 font-display text-xl text-espresso">{pair.title}</h3>
                <p className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                  {pair.peptides.map((p, i) => (
                    <span key={p.label} className="flex items-center gap-1.5">
                      {i > 0 && <span className="text-taupe">+</span>}
                      {p.slug ? (
                        <Link href={`/peptides/${p.slug}`} className="font-medium text-copper-dark hover:underline">
                          {p.label}
                        </Link>
                      ) : (
                        <span className="font-medium text-espresso">{p.label}</span>
                      )}
                    </span>
                  ))}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-cocoa">{pair.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-wrap gap-3">
            <ButtonLink href="/routine-builder">
              Build my routine <ArrowRight className="size-4" />
            </ButtonLink>
            <ButtonLink href="/learn/how-to-layer-peptides" variant="outline">
              Read the layering guide
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}

function MobileFact({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-xs text-taupe">{label}</dt>
      <dd className="mt-0.5 text-espresso">{value}</dd>
    </div>
  );
}
