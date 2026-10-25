"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, type RefObject } from "react";

/*
 * The stage every scroll scene runs on (tasteskill references/scenes.md, rebuilt for React).
 *
 * A scene is a <section className="scene"> holding one <div className="scene-stage">. Without script, with
 * reduced motion, or below the desktop grid (phones and tablets) when set to "rest", it is an ordinary section showing its finished composition
 * (.is-rest). When it runs (.is-live) the section is (hold + 1) screens tall, the stage sticks to the
 * viewport, and a GSAP timeline running 0 → 1 is scrubbed by the native scroll. Nothing captures the wheel.
 */

export type SceneContext = { root: HTMLElement; q: <T extends Element = HTMLElement>(sel: string) => T[]; phone: boolean };
export type SceneBuild = (tl: gsap.core.Timeline, ctx: SceneContext) => void;

let registered = false;
let refreshQueued = false;

/** Fonts and pictures decide every height a trigger measures; measure again once they are in. */
function queueRefresh() {
  if (refreshQueued) return;
  refreshQueued = true;
  const done = () => {
    refreshQueued = false;
    ScrollTrigger.refresh();
  };
  const fonts = document.fonts?.ready ?? Promise.resolve();
  const load =
    document.readyState === "complete"
      ? Promise.resolve()
      : new Promise((r) => window.addEventListener("load", r, { once: true }));
  Promise.all([fonts, load]).then(() => requestAnimationFrame(done));
}

export function useScene(
  ref: RefObject<HTMLElement | null>,
  {
    hold = 2,
    phone = "rest",
    scrub = true,
    build,
  }: { hold?: number; phone?: "rest" | "same"; scrub?: boolean | number; build: SceneBuild },
) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (!registered) {
      gsap.registerPlugin(ScrollTrigger);
      registered = true;
    }
    const q = <T extends Element = HTMLElement>(sel: string) => [...root.querySelectorAll<T>(sel)] as T[];
    const toRest = () => {
      root.classList.remove("is-live");
      root.classList.add("is-rest");
      root.style.removeProperty("--hold");
    };

    const mm = gsap.matchMedia();
    // "phone" here means anything narrower than the desktop grid the scenes are composed on (64rem).
    mm.add({ motion: "(prefers-reduced-motion: no-preference)", phone: "(max-width: 1023.98px)" }, (c) => {
      const isPhone = !!c.conditions?.phone;
      if (!c.conditions?.motion || (isPhone && phone === "rest")) {
        toRest();
        return () => root.classList.remove("is-rest");
      }
      root.classList.remove("is-rest");
      root.classList.add("is-live");
      root.style.setProperty("--hold", String(hold));
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub,
          invalidateOnRefresh: true,
          onUpdate: (self) => root.style.setProperty("--p", self.progress.toFixed(4)),
        },
      });
      build(tl, { root, q, phone: isPhone });
      // Pad to exactly 1, so positions in build() read as fractions of the hold.
      if (tl.duration() < 1) tl.to({}, { duration: 1 - tl.duration() }, tl.duration());
      queueRefresh();
      return () => {
        root.classList.remove("is-live");
        root.style.removeProperty("--hold");
        root.style.removeProperty("--p");
      };
    });
    return () => mm.revert();
    // The build is fixed per scene; re-running it on every render would rebuild the timeline.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
