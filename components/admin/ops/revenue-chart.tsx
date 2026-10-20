import Link from "next/link";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

type Point = { day: string; revenue: number; orders: number };

const dayLabel = new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short", timeZone: "UTC" });
const fullDayLabel = new Intl.DateTimeFormat("en-AU", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
const asDate = (day: string) => new Date(`${day}T00:00:00Z`);

/** Round the axis max up to a clean step so ticks land on readable numbers. */
function niceScale(maxCents: number, ticks = 4) {
  const max = Math.max(maxCents / 100, 1);
  const rough = max / ticks;
  const pow = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= rough) ?? 10 * pow;
  return { step: step * 100, max: Math.ceil(max / step) * step * 100 };
}

function compactDollars(cents: number) {
  const d = cents / 100;
  if (d >= 1000) return `$${(d / 1000).toFixed(d % 1000 === 0 ? 0 : 1)}K`;
  return `$${Math.round(d)}`;
}

/**
 * Single-series column chart (revenue per day). Plain HTML so the 4px rounded
 * data-ends stay crisp at any width. Each full-height column is the hover /
 * focus target and carries its own tooltip; a table view mirrors the data.
 */
export function RevenueChart({ data }: { data: Point[] }) {
  const n = data.length;
  const { step, max } = niceScale(Math.max(0, ...data.map((d) => d.revenue)));
  const ticks: number[] = [];
  for (let v = 0; v <= max; v += step) ticks.push(v);
  const labelEvery = Math.ceil(n / 6);
  const total = data.reduce((s, d) => s + d.revenue, 0);

  return (
    <figure>
      <div className="flex gap-3">
        {/* Y axis */}
        <div className="relative h-56 w-12 shrink-0 text-right text-[11px] text-taupe tabular-nums" aria-hidden>
          {ticks.map((t) => (
            <span key={t} className="absolute right-0 -translate-y-1/2" style={{ bottom: `${(t / max) * 100}%` }}>
              {compactDollars(t)}
            </span>
          ))}
        </div>

        {/* Plot */}
        <div className="relative h-56 flex-1">
          {ticks.map((t) => (
            <div
              key={t}
              className={cn("absolute inset-x-0 h-px", t === 0 ? "bg-stone" : "bg-sand")}
              style={{ bottom: `${(t / max) * 100}%` }}
              aria-hidden
            />
          ))}
          <ul className="absolute inset-0 flex items-stretch gap-[2px]" aria-label="Revenue by day">
            {data.map((d, i) => {
              const pct = max ? (d.revenue / max) * 100 : 0;
              const align = i < n * 0.15 ? "left-0" : i > n * 0.85 ? "right-0" : "left-1/2 -translate-x-1/2";
              const label = `${fullDayLabel.format(asDate(d.day))}: ${formatMoney(d.revenue)} from ${d.orders} paid ${d.orders === 1 ? "order" : "orders"}`;
              return (
                <li
                  key={d.day}
                  tabIndex={0}
                  aria-label={label}
                  className="group relative flex flex-1 cursor-default items-end justify-center outline-none"
                >
                  <span
                    className="block w-full max-w-6 rounded-t-[4px] bg-copper transition-opacity group-hover:opacity-75 group-focus-visible:opacity-75"
                    style={{ height: d.revenue > 0 ? `max(${pct}%, 3px)` : 0 }}
                  />
                  <span
                    role="tooltip"
                    className={cn(
                      "pointer-events-none absolute bottom-full z-10 mb-1 hidden w-max rounded-lg bg-espresso px-3 py-2 text-left shadow-lg group-hover:block group-focus-visible:block",
                      align,
                    )}
                  >
                    <span className="block text-sm font-semibold text-cream tabular-nums">{formatMoney(d.revenue)}</span>
                    <span className="block text-[11px] text-cream/70">
                      {fullDayLabel.format(asDate(d.day))} · {d.orders} {d.orders === 1 ? "order" : "orders"}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* X axis */}
      <div className="mt-2 flex gap-3" aria-hidden>
        <div className="w-12 shrink-0" />
        <div className="flex flex-1 gap-[2px] text-[11px] text-taupe">
          {data.map((d, i) => (
            <span key={d.day} className="relative flex-1">
              {(i % labelEvery === 0 || i === n - 1) && (i === n - 1 || n - 1 - i >= labelEvery / 2) ? (
                <span className={cn("absolute top-0 whitespace-nowrap", i === n - 1 ? "right-0" : "left-1/2 -translate-x-1/2")}>
                  {dayLabel.format(asDate(d.day))}
                </span>
              ) : null}
            </span>
          ))}
        </div>
      </div>

      <figcaption className="sr-only">
        Revenue from paid orders per day, {n} days, totalling {formatMoney(total)}.
      </figcaption>

      <details className="mt-8 text-sm">
        <summary className="cursor-pointer text-xs font-medium text-cocoa hover:text-espresso">View as table</summary>
        <div className="mt-3 max-h-72 overflow-y-auto rounded-xl border border-stone/60">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-ivory">
              <tr>
                <th className="px-3 py-2 font-semibold text-cocoa">Day</th>
                <th className="px-3 py-2 text-right font-semibold text-cocoa">Paid orders</th>
                <th className="px-3 py-2 text-right font-semibold text-cocoa">Revenue</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {[...data].reverse().map((d) => (
                <tr key={d.day} className="border-t border-stone/40">
                  <td className="px-3 py-1.5">{fullDayLabel.format(asDate(d.day))}</td>
                  <td className="px-3 py-1.5 text-right">{d.orders}</td>
                  <td className="px-3 py-1.5 text-right">{formatMoney(d.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}

/** Stat tile: sentence-case label, sans semibold value, optional hint. */
export function KpiTile({
  label,
  value,
  hint,
  href,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  href?: string;
  tone?: "default" | "attention";
}) {
  const body = (
    <>
      <p className="text-xs font-medium text-cocoa">{label}</p>
      <p className="mt-2 text-[28px] leading-tight font-semibold tracking-tight text-espresso">{value}</p>
      {hint && <p className={cn("mt-1 text-xs", tone === "attention" ? "text-copper-dark" : "text-taupe")}>{hint}</p>}
    </>
  );
  const cls = "block rounded-2xl border border-stone/70 bg-cream p-5";
  return href ? (
    <Link href={href} className={cn(cls, "transition-colors hover:border-taupe")}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}
