"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const PENDING = "[data-reveal]:not(.is-in), .shutter:not(.is-in)";

/*
 * Fires [data-reveal] entrances and .shutter openings once, as each element enters.
 * The hidden starting states only exist under html.js + prefers-reduced-motion: no-preference,
 * so without script (or with reduced motion) everything is simply there.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    // Anything at or above the viewport's lower edge is revealed, so content a fast scroll jumped
    // past never stays hidden.
    const sweep = () => {
      const limit = window.innerHeight * 0.92;
      document.querySelectorAll(PENDING).forEach((el) => {
        if (el.getBoundingClientRect().top < limit) {
          el.classList.add("is-in");
          io.unobserve(el);
        }
      });
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
    };
  }, [pathname]);

  return null;
}
