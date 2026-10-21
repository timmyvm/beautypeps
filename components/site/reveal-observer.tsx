"use client";

import { useEffect } from "react";

const PENDING = "[data-reveal]:not(.is-in), .shutter:not(.is-in)";

/*
 * Streamed sections hydrate after this observer (it lives in the root layout's shell), and a class added
 * before React has claimed an element reads as a hydration mismatch. So an element is only marked once
 * React has hydrated it (React tags every node it owns with a `__reactFiber$…` key); the rest are retried.
 */
const hydrated = (el: Element) => Object.keys(el).some((k) => k.startsWith("__reactFiber$"));

/*
 * Fires [data-reveal] entrances and .shutter openings once, as each element enters.
 * The hidden starting states only exist under html.js + prefers-reduced-motion: no-preference,
 * so without script (or with reduced motion) everything is simply there. Pages arriving by client
 * navigation are picked up by the MutationObserver, so this mounts once for the whole session.
 */
export function RevealObserver() {
  useEffect(() => {
    // Anything at or above the viewport's lower edge is revealed, so content a fast scroll jumped
    // past never stays hidden.
    let retry = 0;
    let tries = 0;
    const sweep = () => {
      const limit = window.innerHeight * 0.92;
      let waiting = false;
      document.querySelectorAll(PENDING).forEach((el) => {
        if (el.getBoundingClientRect().top >= limit) return;
        // Past ~2 s, reveal regardless: nothing in view may stay hidden.
        if (!hydrated(el) && tries < 40) {
          waiting = true;
          return;
        }
        el.classList.add("is-in");
        io.unobserve(el);
      });
      window.clearTimeout(retry);
      if (waiting) {
        tries++;
        retry = window.setTimeout(sweep, 50);
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) sweep();
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0 },
    );

    const observe = () => document.querySelectorAll(PENDING).forEach((el) => io.observe(el));
    observe();

    // Content swapped in later (filters, client navigation) gets observed too.
    const mo = new MutationObserver(observe);
    mo.observe(document.body, { childList: true, subtree: true });

    // Passive check after scrolling settles (catches jumps where nothing was intersecting).
    let idle = 0;
    const onScroll = () => {
      window.clearTimeout(idle);
      idle = window.setTimeout(sweep, 120);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // Safety net: nothing in view stays hidden if the observer never fires.
    const t = window.setTimeout(sweep, 900);

    return () => {
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(t);
      window.clearTimeout(idle);
      window.clearTimeout(retry);
    };
  }, []);

  return null;
}
