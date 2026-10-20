type Cell = string | number | boolean | null | undefined | Date;

function cell(value: Cell) {
  if (value === null || value === undefined) return "";
  const s = value instanceof Date ? value.toISOString() : String(value);
  return /[",\r\n]/.test(s) || /^\s|\s$/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** RFC 4180 CSV: quoted where needed, CRLF line endings, no trailing blank line. */
export function toCsv(header: string[], rows: Cell[][], { bom = false }: { bom?: boolean } = {}) {
  const lines = [header, ...rows].map((r) => r.map(cell).join(","));
  return (bom ? "﻿" : "") + lines.join("\r\n");
}

export function csvResponse(filename: string, body: string, init?: { headers?: Record<string, string> }) {
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename.replace(/"/g, "")}"`,
      "Cache-Control": "no-store",
      ...init?.headers,
    },
  });
}

/** YYYY-MM-DD stamp for export filenames. */
export function fileStamp(d = new Date()) {
  return d.toISOString().slice(0, 10);
}
