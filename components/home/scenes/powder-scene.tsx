"use client";

import gsap from "gsap";
import Image from "next/image";
import { useRef } from "react";
import { useScene } from "@/components/motion/use-scene";
import { LoopVideo } from "@/components/site/loop-video";
import { cn } from "@/lib/utils";

const reveal = (i: number) => ({ "data-reveal": "", style: { ["--reveal-i" as string]: i } });

const STAGES = [
  {
    name: "Weighed",
    text: "Each peptide arrives freeze-dried and is weighed to the percentage printed on the label.",
    span: "lg:col-span-3",
    height: "lg:h-[30vh]",
    phoneHeight: "h-[34vw]",
    field: "bg-field-frost",
  },
  {
    name: "Dissolved",
    text: "It goes into a water and glycerin base below 40 °C, and GHK-Cu turns it blue as it goes in.",
    span: "lg:col-span-4",
    height: "lg:h-[44vh]",
    phoneHeight: "h-[46vw]",
    field: "bg-field-stone",
  },
  {
    name: "Applied",
    text: "Morning and night, for the 8 to 12 weeks in which studies measure change.",
    span: "lg:col-span-5",
    height: "lg:h-[60vh]",
    phoneHeight: "h-[62vw]",
    field: "bg-surface",
  },
];

/*
 * Scene: "From powder to skin". Three tiles grow in size with the stages (the dealt "tiles that grow"), and
 * as the visitor scrolls the last one opens like a window until the hand pressing the serum in fills the
 * screen, with the one fact that matters most: how long it takes. At rest the three tiles simply stand.
 */
export function PowderScene({ powderImage }: { powderImage: string }) {
  const ref = useRef<HTMLElement>(null);

  useScene(ref, {
    hold: 2,
    build(tl, { root, q }) {
      const [slot] = q("[data-slot]");
      const [full] = q("[data-full]");
      const stage = root.querySelector<HTMLElement>(".scene-stage");
      if (!slot || !full || !stage) return;
      const slotInset = () => {
        const s = stage.getBoundingClientRect();
        const r = slot.getBoundingClientRect();
        return `inset(${Math.round(r.top - s.top)}px ${Math.round(s.right - r.right)}px ${Math.round(s.bottom - r.bottom)}px ${Math.round(r.left - s.left)}px)`;
      };
      gsap.set(q("[data-statement]"), { autoAlpha: 0, y: 24 });
      tl.fromTo(full, { clipPath: slotInset }, { clipPath: "inset(0px 0px 0px 0px)", duration: 0.5, ease: "power2.inOut" }, 0.2)
        .fromTo(full.querySelector("video, img"), { scale: 1.12 }, { scale: 1, duration: 0.6, ease: "power1.out" }, 0.2)
        .to(q("[data-statement]"), { autoAlpha: 1, y: 0, duration: 0.18, ease: "power2.out" }, 0.66);
    },
  });

  return (
    <section ref={ref} className="scene powder-scene" data-scene="powder" aria-labelledby="powder-title">
      <div className="scene-stage">
        <div className="powder-frame container-bp pt-3">
          <div className="relative grid grid-cols-1 gap-7 lg:grid-cols-12 lg:items-end lg:gap-2.5">
            {/* The heading sits in the empty ground above the two smaller tiles */}
            <h2 id="powder-title" className="display-type text-head lg:absolute lg:top-0 lg:left-0 lg:w-[58%]" {...reveal(0)}>
              From powder to skin
            </h2>
            {STAGES.map((s, i) => (
              <div key={s.name} className={s.span} {...reveal(i + 1)}>
                <div data-slot={i === 2 ? "" : undefined} className={cn("relative w-full overflow-hidden", s.phoneHeight, s.height, s.field)}>
                  {i === 0 && (
                    <Image src={powderImage} alt="Amber vial of freeze-dried peptide powder with a steel spatula" fill sizes="25vw" className="object-contain p-[12%]" />
                  )}
                  {i === 1 && (
                    <LoopVideo
                      src="/video/powder-dissolve.mp4"
                      poster="/video/powder-dissolve-poster.webp"
                      label="Blue GHK-Cu powder falling from a spatula into a beaker of water and blooming into blue clouds"
                    />
                  )}
                  {i === 2 && (
                    <div data-rest-only="" className="h-full">
                      <LoopVideo
                        src="/video/applied.mp4"
                        poster="/video/applied-poster.webp"
                        label="Fingertips pressing two drops of blue serum into the back of a hand"
                      />
                    </div>
                  )}
                </div>
                <h3 className="mt-3 text-lead font-medium">{s.name}</h3>
                <p className="mt-1 max-w-[42ch] text-body">{s.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Live only: the same picture at full size, seen through a window that opens to the whole screen */}
        <div data-full="" data-live-only="" className="powder-full">
          <LoopVideo src="/video/applied.mp4" poster="/video/applied-poster.webp" label="Fingertips pressing two drops of blue serum into the back of a hand" />
          <div data-statement="" className="absolute bottom-[var(--margin)] left-[var(--margin)] max-w-[34rem] bg-ink p-6 text-white md:p-8">
            <p className="text-lead font-medium">Eight to twelve weeks, morning and night.</p>
            <p className="mt-2 text-body text-white/85">That is how long the studies behind every grade run before they measure a change.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
