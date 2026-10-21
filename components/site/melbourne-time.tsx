"use client";

import { useEffect, useState } from "react";

const fmt = new Intl.DateTimeFormat("en-AU", { timeZone: "Australia/Melbourne", hour: "numeric", minute: "2-digit" });
const day = new Intl.DateTimeFormat("en-AU", { timeZone: "Australia/Melbourne", weekday: "long" });

/** The studio's local time, kept current. Server renders a time too, so there is always text. */
export function MelbourneTime({ initial }: { initial: string }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    // Sync to the clock, then tick each minute.
    const tick = () => setNow(new Date());
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);
  const label = now ? `${day.format(now)} ${fmt.format(now)}` : initial;
  return (
    <time suppressHydrationWarning className="tabular">
      {label}
    </time>
  );
}
