"use client";

import gsap from "gsap";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { useScene } from "@/components/motion/use-scene";
import { LoopVideo } from "@/components/site/loop-video";
import { cn } from "@/lib/utils";

export type CopperFrame = {
  src: string;
  video?: string;
  alt: string;
  name: string;
  fact: string;
  href?: string;
  /** width / height */
  ratio: number;
  lifted?: boolean;
};

/*
 * Scene: "Blue by copper". The heading and two notes hold the left column while the run of frames (the
 * mineral, a drop, the powder meeting water, the collar, the bottles) travels right to left under the
 * scroll, one frame standing taller than the rest. At rest it is a strip that scrolls sideways by hand.
 */
export function CopperScene({ frames }: { frames: CopperFrame[] }) {
  const ref = useRef<HTMLElement>(null);

  useScene(ref, {
    hold: 2,
    build(tl, { q }) {
      const [track] = q("[data-track]");
      const [view] = q("[data-view]");
      if (!track || !view) return;
      const distance = () => Math.max(0, track.scrollWidth - view.clientWidth);
      gsap.set(track, { x: 0 });
      tl.to(track, { x: () => -distance(), duration: 1, ease: "none" }, 0);
      // Each picture drifts a little against the run, so the frames read as windows.
      q("[data-frame] img, [data-frame] video").forEach((m) => {
        gsap.set(m, { xPercent: -4, scale: 1.08 });
        tl.to(m, { xPercent: 4, duration: 1, ease: "none" }, 0);
      });
      tl.fromTo(q("[data-note]"), { autoAlpha: 0.25 }, { autoAlpha: 1, duration: 0.2, stagger: 0.35 }, 0.05);
    },
  });

  return (
    <section ref={ref} className="scene copper-scene" data-scene="copper" aria-labelledby="blue-title">
      <div className="scene-stage">
        <div className="copper-frame container-bp">
          <div className="copper-side">
            <div>
              <h2 id="blue-title" className="display-type text-head">
                Blue by copper
              </h2>
              <Link href="/peptides/ghk-cu" className="mt-4 inline-block text-body text-accent underline underline-offset-4">
                Read the GHK-Cu monograph
              </Link>
            </div>
            <div className="copper-notes space-y-4 text-body">
              <p data-note="">The blue is the copper ion held by the peptide, not a dye. Anything we make with GHK-Cu comes out this colour.</p>
              <p data-note="">Use it at night, apart from vitamin C and strong acids, which loosen the copper.</p>
            </div>
          </div>

          <div data-view="" className="copper-view">
            <ul data-track="" className="copper-track">
              {frames.map((f) => {
                const media = (
                  <div
                    data-frame=""
                    className={cn("copper-pic relative overflow-hidden bg-surface", f.lifted && "is-lifted")}
                    style={{ aspectRatio: f.ratio }}
                  >
                    {f.video ? (
                      <LoopVideo src={f.video} poster={f.src} label={f.alt} />
                    ) : (
                      <Image src={f.src} alt={f.alt} fill sizes={f.lifted ? "(min-width: 1024px) 40vw, 80vw" : "(min-width: 1024px) 26vw, 60vw"} className="object-cover" />
                    )}
                  </div>
                );
                return (
                  <li key={f.src} className="copper-item">
                    {f.href ? (
                      <Link href={f.href} className="group block">
                        {media}
                      </Link>
                    ) : (
                      media
                    )}
                    <p className="mt-2 flex justify-between gap-4 text-small">
                      <span className="font-medium">{f.name}</span>
                      <span className="text-muted">{f.fact}</span>
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
