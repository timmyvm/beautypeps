"use client";

import { useState, type ReactNode } from "react";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

type Point = { day: string; revenue: number; orders: number };
type SeriesKey = "revenue" | "orders" | "aov";

const dayLabel = new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short", timeZone: "UTC" });
const fullDayLabel = new Intl.DateTimeFormat("en-AU", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
const asDate = (day: string) => new Date(`${day}T00:00:00Z`);

/** Round the axis max up to a clean step so ticks land on readable numbers, with headroom above the tallest bar. */
function niceScale(max: number, ticks = 4) {
  const top = Math.max(max, 1);
  const rough = top / ticks;
  const pow = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= rough) ?? 10 * pow;
  let ceil = Math.ceil(top / step) * step;
  if (ceil <= max) ceil += step;
  return { step, max: ceil };
}

function compactDollars(cents: number) {
  const d = cents / 100;
  if (d >= 1000) return `$${(d / 1000).toFixed(d % 1000 === 0 ? 0 : 1)}K`;
  return `$${Math.round(d)}`;
}

const SERIES: Record<
  SeriesKey,
  { label: string; value: (p: Point) => number | null; axis: (v: number) => string; full: (v: number) => string; integer?: boolean }
> = {
  revenue: { label: "Revenue", value: (p) => p.revenue, axis: compactDollars, full: formatMoney },
  orders: { label: "Paid orders", value: (p) => p.orders, axis: (v) => String(v), full: (v) => String(v), integer: true },
  aov: {
    label: "Average order",
    value: (p) => (p.orders ? Math.round(p.revenue / p.orders) : null),
    axis: compactDollars,
    full: formatMoney,
  },
};

/**
 * Sales for the period: the three figures are the chart's tabs, the bars are the one hue on the screen.
 * Plain HTML columns so the square data-ends stay crisp at any width; each column is the hover / focus
 * target and carries its own tooltip.
 */
export function SalesCard({
  data,
  totals,
  rangeControl,
}: {
  data: Point[];
  totals: { revenue: number; orders: number; aov: number };
  rangeControl?: ReactNode;
}) {
  const [key, setKey] = useState<SeriesKey>("revenue");
  const series = SERIES[key];
  const values = data.map(series.value);
  const n = data.length;
  const scale = niceScale(Math.max(0, ...values.map((v) => v ?? 0)));
  const step = series.integer ? Math.max(1, Math.round(scale.step)) : scale.step;
  const max = series.integer ? Math.max(step * 4, Math.ceil(scale.max / step) * step) : scale.max;
  const ticks: number[] = [];
  for (let v = 0; v <= max; v += step) ticks.push(v);
  const labelEvery = Math.ceil(n / 5);

  const tabs: { key: SeriesKey; figure: string }[] = [
    { key: "revenue", figure: formatMoney(totals.revenue) },
    { key: "orders", figure: String(totals.orders) },
    { key: "aov", figure: totals.orders ? formatMoney(totals.aov) : "—" },
  ];

  return (
    <section className="border border-surface-2 bg-white" aria-labelledby="sales-title">
      <div className="flex flex-col gap-3 px-5 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 id="sales-title" className="text-[16px] font-semibold text-ink">
          Sales
        </h2>
        {rangeControl}
      </div>

      <div role="tablist" aria-label="Sales figure" className="mt-3 grid grid-cols-3 border-b border-surface-2 px-5">
        {tabs.map((t) => {
          const active = t.key === key;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls="sales-plot"
              onClick={() => setKey(t.key)}
              className={cn(
                "-mb-px min-w-0 border-b-2 py-3 pr-3 text-left transition-colors",
                active ? "border-ink" : "border-transparent hover:border-surface-2",
              )}
            >
              <span className={cn("block text-[13px]", active ? "text-ink" : "text-muted")}>{SERIES[t.key].label}</span>
              <span className="mt-0.5 block truncate text-[20px] leading-tight font-medium text-ink tabular-nums sm:text-[24px]">
                {t.figure}
              </span>
            </button>
          );
        })}
      </div>

      <figure id="sales-plot" role="tabpanel" className="px-5 pt-8 pb-5">
        <div className="flex gap-3">
          <div className="relative h-56 w-12 shrink-0 text-right text-[13px] text-muted tabular-nums" aria-hidden>
            {ticks.map((t) => (
              <span key={t} className="absolute right-0 translate-y-1/2" style={{ bottom: `${(t / max) * 100}%` }}>
                {series.axis(t)}
              </span>
            ))}
          </div>

          <div className="relative h-56 flex-1">
            {ticks.map((t) => (
              <div
                key={t}
                className={cn("absolute inset-x-0 h-px", t === 0 ? "bg-stone" : "bg-surface")}
                style={{ bottom: `${(t / max) * 100}%` }}
                aria-hidden
              />
            ))}
            <ul className="absolute inset-0 flex items-stretch gap-[2px]" aria-label={`${series.label} by day`}>
              {data.map((d, i) => {
                const v = values[i];
                const pct = v ? (v / max) * 100 : 0;
                const align = i < n * 0.15 ? "left-0" : i > n * 0.85 ? "right-0" : "left-1/2 -translate-x-1/2";
                const text = v === null ? "no paid orders" : series.full(v);
                return (
                  <li
                    key={d.day}
                    tabIndex={0}
                    aria-label={`${fullDayLabel.format(asDate(d.day))}: ${text}`}
                    className="group relative flex flex-1 cursor-default items-end justify-center outline-none"
                  >
                    {v ? (
                      <span
                        className="block w-full max-w-5 bg-accent transition-opacity group-hover:opacity-75 group-focus-visible:opacity-75"
                        style={{ height: `max(${pct}%, 2px)` }}
                      />
                    ) : null}
                    <span
                      role="tooltip"
                      className={cn(
                        "pointer-events-none absolute bottom-full z-10 mb-1 hidden w-max border border-surface-2 bg-white px-3 py-2 text-left shadow-[0_4px_16px_rgb(0_0_0/0.08)] group-hover:block group-focus-visible:block",
                        align,
                      )}
                    >
                      <span className="block text-[14px] font-medium text-ink tabular-nums">{text}</span>
                      <span className="block text-[13px] text-muted">
                        {fullDayLabel.format(asDate(d.day))} · {d.orders} paid {d.orders === 1 ? "order" : "orders"}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="mt-2 flex gap-3" aria-hidden>
          <div className="w-12 shrink-0" />
          <div className="flex flex-1 gap-[2px] text-[13px] text-muted">
            {data.map((d, i) => {
              // Fewer ticks on narrow screens; never crowd the right-aligned last label.
              const last = i === n - 1;
              const fine = last || (i % labelEvery === 0 && n - 1 - i >= labelEvery * 0.8);
              const coarse = last || (i % (labelEvery * 2) === 0 && n - 1 - i >= labelEvery * 1.6);
              return (
                <span key={d.day} className="relative flex-1">
                  {fine ? (
                    <span
                      className={cn(
                        "absolute top-0 whitespace-nowrap",
                        last ? "right-0" : i === 0 ? "left-0" : "left-1/2 -translate-x-1/2",
                        !coarse && "hidden sm:block",
                      )}
                    >
                      {dayLabel.format(asDate(d.day))}
                    </span>
                  ) : null}
                </span>
              );
            })}
          </div>
        </div>

        <figcaption className="sr-only">
          {series.label} per day over {n} days. Total revenue {formatMoney(totals.revenue)} from {totals.orders} paid orders.
        </figcaption>
      </figure>
    </section>
  );
}
