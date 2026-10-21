"use client";

import { useEffect, useState } from "react";

const fmt = new Intl.DateTimeFormat("en-AU", { timeZone: "Australia/Melbourne", hour: "numeric", minute: "2-digit" });
const day = new Intl.DateTimeFormat("en-AU", { timeZone: "Australia/Melbourne", weekday: "long" });

/**
 * The studio's local time, kept current. The footer is part of every page's static shell, so the
 * time is read in the browser; until then the line holds its height.
 */
export function MelbourneTime() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    // Sync to the clock, then tick each half minute.
    const tick = () => setNow(new Date());
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);
  return <time className="tabular">{now ? `${day.format(now)} ${fmt.format(now)}` : " "}</time>;
}
