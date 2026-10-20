const aud = new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" });

/** 4995 -> "$49.95" */
export function formatMoney(cents: number) {
  return aud.format(cents / 100);
}

/** "49.95" -> 4995. Returns NaN for unparseable input. */
export function parseMoney(input: string | number | null | undefined): number {
  if (input === null || input === undefined || input === "") return NaN;
  const n = typeof input === "number" ? input : Number(String(input).replace(/[$,\s]/g, ""));
  return Math.round(n * 100);
}

export function formatDate(d: Date | number | null | undefined, opts?: Intl.DateTimeFormatOptions) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("en-AU", opts ?? { day: "numeric", month: "short", year: "numeric" }).format(d);
}

export function formatDateTime(d: Date | number | null | undefined) {
  return formatDate(d, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
}

export function pluralize(n: number, word: string, plural = `${word}s`) {
  return `${n} ${n === 1 ? word : plural}`;
}
