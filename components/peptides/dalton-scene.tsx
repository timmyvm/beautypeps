"use client";

import gsap from "gsap";
import { useRef, type CSSProperties, type ReactNode } from "react";
import { useScene } from "@/components/motion/use-scene";
import { parseSequence } from "@/lib/content/sequence";
import { cn } from "@/lib/utils";
import { strandSize } from "./peptide-strand";
import { SequenceStrand } from "./sequence-strand";

export type DaltonRow = { key: string; name: string; note: string; sequence: string; da: number };

const MAX = 1100; // the chart's right edge, in daltons
const LINE = 500; // the rule of thumb
const at = (da: number) => `${((da / MAX) * 100).toFixed(2)}%`;

/*
 * Scene: "The 500 dalton line". Six of the library's peptides, drawn from their sequences and weighed:
 * each bar runs to the peptide's molecular weight, against a field that marks what can cross intact skin
 * on its own. At rest it is the finished chart; live, the bars are weighed out one by one as the visitor
 * scrolls, lightest first, and the closing sentence takes the place of the opening one.
 */
export function DaltonScene({
  rows,
  title,
  intro,
  outro,
}: {
  rows: DaltonRow[];
  title: ReactNode;
  intro: ReactNode;
  outro: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  useScene(ref, {
    hold: 1.25,
    build(tl, { q }) {
      const items = q("[data-row]");
      gsap.set(q("[data-bar]"), { scaleX: 0 });
      gsap.set(q("[data-strand]"), { autoAlpha: 0, y: 14 });
      gsap.set(q("[data-weight]"), { autoAlpha: 0 });
      gsap.set(q("[data-end]"), { autoAlpha: 0, y: 18 });
      const step = 0.62 / Math.max(1, items.length);
      items.forEach((row, i) => {
        const t = 0.05 + i * step;
        tl.to(row.querySelector("[data-bar]"), { scaleX: 1, duration: step * 0.9, ease: "power2.out" }, t)
          .to(
            row.querySelectorAll("[data-strand]"),
            { autoAlpha: 1, y: 0, duration: step * 0.6, ease: "power2.out" },
            t + step * 0.45,
          )
          .to(row.querySelectorAll("[data-weight]"), { autoAlpha: 1, duration: step * 0.4 }, t + step * 0.45);
      });
      // The opening sentence is fully gone before the closing one arrives in its place.
      tl.to(q("[data-start]"), { autoAlpha: 0, y: -14, duration: 0.06, ease: "power1.in" }, 0.74).to(
        q("[data-end]"),
        { autoAlpha: 1, y: 0, duration: 0.1, ease: "power2.out" },
        0.83,
      );
    },
  });

  return (
    <section ref={ref} className="scene" aria-labelledby="penetration-title">
      <div className="scene-stage">
        <div className="container-bp flex flex-col py-20 lg:py-28 [.is-live_&]:h-svh [.is-live_&]:py-[7svh]">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-[var(--gutter)]">
            <h2 id="penetration-title" className="display-type text-head lg:col-span-5">
              {title}
            </h2>
            {/* Live, the closing sentence replaces the opening one in the same place */}
            <div className="grid lg:col-span-6 lg:col-start-7">
              <div data-start="" className="[grid-area:1/1]">
                {intro}
              </div>
              <div data-end="" data-live-only="" className="[grid-area:1/1]">
                {outro}
              </div>
            </div>
          </div>

          <figure className="mt-14 flex min-h-0 flex-col [.is-live_&]:mt-[5svh] [.is-live_&]:flex-1">
            <div className="flex min-h-0 flex-col [.is-live_&]:flex-1" role="img" aria-label={chartLabel(rows)}>
              {/* The scale: under the line, and over it */}
              <div aria-hidden className="grid grid-cols-1 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-x-[var(--gutter)]">
                <span className="hidden lg:block" />
                <div className="relative flex h-16 items-end pb-2 text-small font-medium lg:h-20">
                  <span className="absolute inset-y-0 left-0 bg-field-frost" style={{ width: at(LINE) }} />
                  <span className="relative px-3">Under</span>
                  {/* The line itself, named where it falls */}
                  <span className="absolute bottom-2 flex items-baseline gap-2 pl-3" style={{ left: at(LINE) }}>
                    <span className="display-type text-[clamp(2rem,1.4rem+2.4vw,3.5rem)]">500</span>
                    <span>daltons</span>
                  </span>
                </div>
              </div>
              <ol aria-hidden className="flex min-h-0 flex-col [.is-live_&]:flex-1">
                {rows.map((r) => {
                  const under = r.da <= LINE;
                  const { width } = strandSize(parseSequence(r.sequence), false);
                  return (
                    <li
                      key={r.key}
                      data-row=""
                      className="grid min-h-[8rem] grid-cols-1 lg:min-h-[6.5rem] lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-x-[var(--gutter)] [.is-live_&]:min-h-0 [.is-live_&]:flex-1"
                    >
                      <p className="hidden self-center lg:block">
                        <span className="flex items-baseline justify-between gap-3">
                          <span className="text-body font-medium">{r.name}</span>
                          <span data-weight="" className="tabular text-lead whitespace-nowrap">
                            {r.da.toLocaleString("en-AU")} Da
                          </span>
                        </span>
                        <span className="block text-small text-muted">{r.note}</span>
                      </p>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 bg-field-frost" style={{ width: at(LINE) }} />
                        <p className="relative px-3 pt-2 text-small lg:hidden">
                          <span className="font-medium">{r.name}</span>{" "}
                          <span data-weight="" className="tabular whitespace-nowrap">
                            {r.da.toLocaleString("en-AU")} Da
                          </span>
                          <span className="block text-muted">{r.note}</span>
                        </p>
                        <span
                          data-bar=""
                          className={cn("absolute bottom-3 left-0 h-2 origin-left lg:h-3", under ? "bg-accent" : "bg-ink")}
                          style={{ width: at(r.da) }}
                        />
                        <span
                          data-strand=""
                          className="absolute bottom-7 lg:bottom-8 [&_svg]:h-auto [&_svg]:w-[calc(var(--strand-w)*0.75)] lg:[&_svg]:w-[var(--strand-w)]"
                          style={
                            { right: `calc(100% - ${at(r.da)})`, "--strand-w": `${Math.round(width * 0.36)}px` } as CSSProperties
                          }
                        >
                          <SequenceStrand sequence={r.sequence} size="sm" draw="none" label={r.name} />
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </figure>

          <div data-rest-only="" className="mt-10 lg:grid lg:grid-cols-12 lg:gap-[var(--gutter)]">
            <div className="lg:col-span-6 lg:col-start-7">{outro}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function chartLabel(rows: DaltonRow[]) {
  return `Molecular weights against the 500 dalton line: ${rows.map((r) => `${r.name} ${r.da} daltons`).join(", ")}.`;
}
