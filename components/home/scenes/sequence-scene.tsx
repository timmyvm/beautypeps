"use client";

import gsap from "gsap";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { useScene } from "@/components/motion/use-scene";
import { TILE_BG, type TileTone } from "@/components/product/product-card";
import { SequenceStrand } from "@/components/peptides/sequence-strand";
import { cn } from "@/lib/utils";

export type SequenceBeat = {
  slug: string;
  image: string;
  product: string;
  figure: string; // "1%"
  of: string; // "Copper Tripeptide-1 (GHK-Cu)"
  line: string;
  strands: { label: string; sequence: string }[];
  tone: TileTone;
};

/*
 * Scene: "Inside the percentage". Each label prints a concentration; the scene shows what that figure is
 * made of. Three formulas in turn: the specimen wipes into its tile, the figure rises, and the peptide is
 * drawn from its own sequence, bead by bead, as the visitor scrolls. At rest (no script, reduced motion,
 * a phone) the three are simply listed.
 */
export function SequenceScene({ beats }: { beats: SequenceBeat[] }) {
  const ref = useRef<HTMLElement>(null);

  useScene(ref, {
    hold: 3,
    build(tl, { q }) {
      const items = q("[data-beat]");
      const parts = (el: Element) => ({
        tile: el.querySelector("[data-tile]"),
        img: el.querySelector("[data-tile] img"),
        figure: el.querySelector("[data-figure]"),
        copy: el.querySelectorAll("[data-copy]"),
        bonds: el.querySelectorAll("[data-bond]"),
        beads: el.querySelectorAll("[data-bead]"),
      });
      const step = 1 / items.length;

      items.forEach((el, i) => {
        const p = parts(el);
        const at = i * step;
        const visibleAtRest = i === 0;
        const strands = el.querySelector("[data-strands]");
        // Starting states: the first formula is on screen when the stage arrives (readable at progress 0).
        // Set straight away (not on the timeline), so the stage is right before the scroll reaches it.
        if (!visibleAtRest) {
          gsap.set(p.tile, { clipPath: "inset(100% 0% 0% 0%)" });
          gsap.set(p.img, { scale: 1.15 });
          gsap.set(p.figure, { autoAlpha: 0, y: 48 });
          gsap.set([...p.copy, strands], { autoAlpha: 0, y: 32 });
        }
        gsap.set(p.bonds, { strokeDasharray: 1, strokeDashoffset: 1 });
        gsap.set(p.beads, { autoAlpha: 0, scale: 0.4, transformOrigin: "50% 50%" });

        // Arrive
        const inAt = visibleAtRest ? 0 : at - step * 0.12;
        if (!visibleAtRest) {
          tl.to(p.tile, { clipPath: "inset(0% 0% 0% 0%)", duration: step * 0.32, ease: "power2.inOut" }, inAt)
            .to(p.img, { scale: 1, duration: step * 0.45, ease: "power2.out" }, inAt)
            .to(p.figure, { autoAlpha: 1, y: 0, duration: step * 0.24, ease: "power3.out" }, inAt + step * 0.06)
            .to(
              [...p.copy, strands],
              { autoAlpha: 1, y: 0, duration: step * 0.22, stagger: step * 0.04, ease: "power2.out" },
              inAt + step * 0.14,
            );
        }
        tl.to(p.bonds, { strokeDashoffset: 0, duration: step * 0.3, ease: "power1.inOut" }, inAt + step * 0.18).to(
          p.beads,
          { autoAlpha: 1, scale: 1, duration: step * 0.12, stagger: step * 0.03, ease: "back.out(1.6)" },
          inAt + step * 0.22,
        );

        // Leave (all but the last), wholly gone before the next formula's words arrive, so two never overlap
        if (i < items.length - 1) {
          const outAt = at + step * 0.72;
          tl.to(
            [p.figure, ...p.copy, strands],
            { autoAlpha: 0, y: -32, duration: step * 0.14, stagger: step * 0.01, ease: "power2.in" },
            outAt,
          );
        }
      });
    },
  });

  return (
    <section ref={ref} className="scene seq-scene" data-scene="sequence" aria-labelledby="inside-title">
      <div className="scene-stage">
        <div className="seq-frame container-bp">
          <div className="seq-head">
            <h2 id="inside-title" className="display-type text-head">
              Inside the percentage
            </h2>
            <p className="mt-4 max-w-[38ch] text-lead">
              Every label prints how much of each peptide is in the bottle. This is what that figure is made of.
            </p>
          </div>

          <ol className="seq-beats">
            {beats.map((b, i) => (
              <li key={b.slug} data-beat={i} className="seq-beat">
                <Link
                  href={`/products/${b.slug}`}
                  data-tile=""
                  className={cn("seq-tile specimen group relative block overflow-hidden", TILE_BG[b.tone])}
                  aria-label={b.product}
                >
                  <Image
                    src={b.image}
                    alt={b.product}
                    fill
                    sizes="(min-width: 1024px) 42vw, 100vw"
                    className="object-contain p-[8%]"
                  />
                </Link>
                <div className="seq-text">
                  <p>
                    <span data-figure="" className="seq-figure block display-type tabular">
                      {b.figure}
                    </span>
                    <span className="sr-only"> {b.of}</span>
                  </p>
                  <h3 data-copy="" className="mt-3 text-lead font-medium">
                    {b.of}, in {b.product}
                  </h3>
                  <p data-copy="" className="mt-3 max-w-[44ch] text-body">
                    {b.line}
                  </p>
                  <div data-strands="" className="mt-8 flex flex-col gap-6">
                    {b.strands.map((s) => (
                      <div key={s.label}>
                        <SequenceStrand sequence={s.sequence} label={s.label} draw="scene" className="seq-strand" />
                        <p className="mt-2 text-small text-muted">
                          {s.label} · {s.sequence}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
