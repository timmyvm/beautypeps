"use client";

import { useId, useMemo, useState } from "react";
import { KIND_LABEL, parseSequence, type ResidueKind } from "@/lib/content/sequence";
import { cn } from "@/lib/utils";

/*
 * A peptide drawn from its own sequence: one bead per amino acid on a gently waved backbone, coloured by
 * what its side chain does, with the caps, end groups and copper ion the written sequence names. The
 * Beauty Peps mark (three linked circles) is this drawing of GHK: glycine, histidine, lysine.
 */

const R = 26; // bead radius
const GAP = 72; // centre to centre
const WAVE = 11; // backbone zig-zag
const PAD = 8;

const FILL: Record<ResidueKind, { light: [string, string]; dark: [string, string] }> = {
  nonpolar: { light: ["var(--color-field-stone)", "var(--color-ink)"], dark: ["var(--color-field-stone)", "var(--color-ink)"] },
  polar: { light: ["var(--color-field-frost)", "var(--color-ink)"], dark: ["var(--color-field-frost)", "var(--color-ink)"] },
  positive: { light: ["var(--color-field-sapphire)", "#ffffff"], dark: ["var(--color-field-sapphire)", "#ffffff"] },
  negative: { light: ["var(--color-ink)", "#ffffff"], dark: ["#f4f4f4", "var(--color-ink)"] },
};

type Part = { key: string; label: string; title: string; note: string };

export function SequenceStrand({
  sequence,
  size = "md",
  tone = "light",
  interactive = false,
  draw = "reveal",
  caption,
  className,
  label,
}: {
  sequence: string;
  /** sm: beads only, for lists · md: coded beads · lg: coded beads at full width */
  size?: "sm" | "md" | "lg";
  tone?: "light" | "dark";
  /** Beads can be focused or hovered to name them in the caption line. */
  interactive?: boolean;
  /** reveal: beads arrive as it scrolls in · none: drawn at rest · scene: a scroll scene animates it */
  draw?: "reveal" | "none" | "scene";
  /** The line under the drawing when nothing is chosen (interactive only). */
  caption?: string;
  className?: string;
  /** Accessible name, e.g. "GHK-Cu". */
  label?: string;
}) {
  const seq = useMemo(() => parseSequence(sequence), [sequence]);
  const [active, setActive] = useState<number | null>(null);
  const id = useId();
  const showCodes = size !== "sm";
  const bond = tone === "dark" ? "#f4f4f4" : "var(--color-ink)";
  const soft = tone === "dark" ? "#a3a3a3" : "var(--color-muted)";

  // Horizontal layout: [cap] beads [end]
  const tailW = seq.cap ? (seq.cap.kind === "fatty" ? 15 * 13 + 10 : R * 2 + 18) : 0;
  const endW = seq.end ? (seq.end.ring ? 84 : 64) : 0;
  const top = seq.ion ? 96 : 0;
  const x0 = PAD + tailW + R;
  const cy = PAD + top + R + WAVE + (seq.residues.some((r) => r.mirror) && showCodes ? 14 : 0);
  const beads = seq.residues.map((r, i) => ({ ...r, x: x0 + i * GAP, y: cy + (i % 2 ? WAVE : -WAVE) }));
  const last = beads[beads.length - 1];
  const width = Math.round((last ? last.x : x0) + R + endW + PAD);
  const height = Math.round(cy + R + WAVE + PAD);

  // Everything the caption can name, in reading order.
  const parts: Part[] = [
    ...(seq.cap ? [{ key: "cap", label: seq.cap.label, title: seq.cap.name, note: seq.cap.note }] : []),
    ...beads.map((b, i) => ({
      key: `r${i}`,
      label: `${b.mirror ? "D-" : ""}${b.code}`,
      title: b.name,
      note: `${KIND_LABEL[b.kind]}. ${b.note}`,
    })),
    ...(seq.end ? [{ key: "end", label: seq.end.label, title: seq.end.name, note: seq.end.note }] : []),
    ...(seq.ion ? [{ key: "ion", label: "Cu²⁺", title: seq.ion.name, note: seq.ion.note }] : []),
  ];
  const nameOf = (p: Part) => `${p.label}, ${p.title}`;
  const accessible = `${label ? `${label}: ` : ""}${parts.map((p) => p.title).join(", ")}`;

  const focusProps = (index: number) =>
    interactive
      ? {
          tabIndex: 0,
          role: "img" as const,
          "aria-label": nameOf(parts[index]),
          onFocus: () => setActive(index),
          onBlur: () => setActive(null),
          onMouseEnter: () => setActive(index),
          onMouseLeave: () => setActive(null),
          onClick: () => setActive(index),
          className: "strand-part cursor-pointer outline-none",
        }
      : {};
  const dim = (index: number) => (active !== null && active !== index ? 0.35 : 1);
  let partIndex = 0;
  const capIndex = seq.cap ? partIndex++ : -1;
  const beadStart = partIndex;
  partIndex += beads.length;
  const endIndex = seq.end ? partIndex++ : -1;
  const ionIndex = seq.ion ? partIndex++ : -1;

  const current = active !== null ? parts[active] : null;

  return (
    <figure
      className={cn("strand", className)}
      data-draw={draw}
      data-reveal={draw === "reveal" ? "" : undefined}
      data-strand-size={size}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        className={cn("block h-auto max-w-full", size === "sm" && "h-7 w-auto", size === "lg" && "w-full")}
        role={interactive ? "group" : "img"}
        aria-label={accessible}
        aria-describedby={interactive ? `${id}-cap` : undefined}
      >
        {/* Backbone */}
        {beads.length > 1 && (
          <polyline
            data-bond=""
            points={beads.map((b) => `${b.x},${b.y}`).join(" ")}
            fill="none"
            stroke={bond}
            strokeWidth={6}
            strokeLinejoin="round"
            pathLength={1}
          />
        )}

        {/* First-end cap */}
        {seq.cap && beads[0] && (
          <g data-bead="" style={{ ["--i" as string]: 0 }} {...focusProps(capIndex)}>
            <g className="strand-dim" style={{ opacity: dim(capIndex) }}>
              {seq.cap.kind === "fatty" ? (
                <>
                  <polyline
                    data-bond=""
                    pathLength={1}
                    points={
                      [...Array(16)]
                        .map((_, k) => `${beads[0].x - R - (15 - k) * 13},${beads[0].y + (k % 2 ? -9 : 9)}`)
                        .join(" ") + ` ${beads[0].x},${beads[0].y}`
                    }
                    fill="none"
                    stroke={soft}
                    strokeWidth={5}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  {showCodes && (
                    <text x={PAD + 2} y={beads[0].y + R + 22} fontSize={16} fill={soft} className="font-sans">
                      C16
                    </text>
                  )}
                </>
              ) : (
                <>
                  <line x1={PAD + R * 0.7} y1={beads[0].y} x2={beads[0].x} y2={beads[0].y} stroke={bond} strokeWidth={6} />
                  <circle
                    cx={PAD + R * 0.7}
                    cy={beads[0].y}
                    r={R * 0.7}
                    fill={seq.cap.kind === "vitamin" ? "var(--color-accent-soft)" : "var(--color-surface-2)"}
                  />
                  {showCodes && (
                    <text
                      x={PAD + R * 0.7}
                      y={beads[0].y + 5}
                      textAnchor="middle"
                      fontSize={seq.cap.kind === "vitamin" ? 13 : 15}
                      fontWeight={500}
                      fill="var(--color-ink)"
                      className="font-sans"
                    >
                      {seq.cap.kind === "vitamin" ? "B7" : "Ac"}
                    </text>
                  )}
                </>
              )}
            </g>
          </g>
        )}

        {/* Copper ion, held by the first two residues */}
        {seq.ion && beads.length > 1 && (
          <g data-bead="" style={{ ["--i" as string]: beads.length + 1 }} {...focusProps(ionIndex)}>
            <g className="strand-dim" style={{ opacity: dim(ionIndex) }}>
              <line
                x1={beads[0].x}
                y1={beads[0].y}
                x2={(beads[0].x + beads[1].x) / 2}
                y2={PAD + R}
                stroke="var(--color-cu)"
                strokeWidth={4}
                strokeDasharray="7 7"
              />
              <line
                x1={beads[1].x}
                y1={beads[1].y}
                x2={(beads[0].x + beads[1].x) / 2}
                y2={PAD + R}
                stroke="var(--color-cu)"
                strokeWidth={4}
                strokeDasharray="7 7"
              />
              <circle cx={(beads[0].x + beads[1].x) / 2} cy={PAD + R} r={R} fill="var(--color-cu)" />
              {showCodes && (
                <text
                  x={(beads[0].x + beads[1].x) / 2}
                  y={PAD + R + 6}
                  textAnchor="middle"
                  fontSize={17}
                  fontWeight={500}
                  fill="#ffffff"
                  className="font-sans"
                >
                  Cu
                </text>
              )}
            </g>
          </g>
        )}

        {/* Residues */}
        {beads.map((b, i) => {
          const [fill, ink] = FILL[b.kind][tone];
          const code = b.code === "Met(O₂)" ? "MetO₂" : b.code === "β-Ala" ? "βAla" : b.code;
          return (
            <g key={i} data-bead="" style={{ ["--i" as string]: i + 1 }} {...focusProps(beadStart + i)}>
              <g className="strand-dim" style={{ opacity: dim(beadStart + i) }}>
                <circle cx={b.x} cy={b.y} r={R} fill={fill} />
                {showCodes && (
                  <text
                    x={b.x}
                    y={b.y + 6}
                    textAnchor="middle"
                    fontSize={code.length > 3 ? 14 : 17}
                    fontWeight={500}
                    fill={ink}
                    className="font-sans"
                  >
                    {code}
                  </text>
                )}
                {b.mirror && showCodes && (
                  <text
                    x={b.x}
                    y={b.y - R - 8}
                    textAnchor="middle"
                    fontSize={14}
                    fontWeight={500}
                    fill={soft}
                    className="font-sans"
                  >
                    D
                  </text>
                )}
              </g>
            </g>
          );
        })}

        {/* Last-end group */}
        {seq.end && last && (
          <g data-bead="" style={{ ["--i" as string]: beads.length }} {...focusProps(endIndex)}>
            <g className="strand-dim" style={{ opacity: dim(endIndex) }}>
              {seq.end.ring ? (
                <>
                  <line x1={last.x + R} y1={last.y} x2={last.x + R + 18} y2={last.y} stroke={bond} strokeWidth={6} />
                  <polygon
                    points={[...Array(6)]
                      .map((_, k) => {
                        const a = (Math.PI / 3) * k;
                        // Rounded, so the server's and the browser's trigonometry print the same attribute
                        return `${(last.x + R + 18 + 26 + Math.cos(a) * 24).toFixed(2)},${(last.y + Math.sin(a) * 24).toFixed(2)}`;
                      })
                      .join(" ")}
                    fill="none"
                    stroke={bond}
                    strokeWidth={5}
                    strokeLinejoin="round"
                  />
                </>
              ) : (
                <>
                  <line x1={last.x + R} y1={last.y} x2={last.x + R + 14} y2={last.y} stroke={bond} strokeWidth={6} />
                  {showCodes && (
                    <text x={last.x + R + 18} y={last.y + 6} fontSize={17} fontWeight={500} fill={bond} className="font-sans">
                      {seq.end.label}
                    </text>
                  )}
                </>
              )}
            </g>
          </g>
        )}
      </svg>

      {interactive && (
        <figcaption id={`${id}-cap`} className="mt-4 min-h-[3em] max-w-[52ch] text-body" aria-live="polite">
          {current ? (
            <>
              <span className="font-medium">
                {current.label} · {current.title}.
              </span>{" "}
              {current.note}
            </>
          ) : (
            caption
          )}
        </figcaption>
      )}
    </figure>
  );
}

/** The four colours of the drawing, named once on a page. */
export function StrandKey({ className, tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  return (
    <ul className={cn("flex flex-wrap gap-x-6 gap-y-2 text-small", className)}>
      {(Object.keys(KIND_LABEL) as ResidueKind[]).map((k) => (
        <li key={k} className="flex items-center gap-2">
          <span aria-hidden className="inline-block size-4 rounded-full" style={{ background: FILL[k][tone][0] }} />
          {KIND_LABEL[k]}
        </li>
      ))}
      <li className="flex items-center gap-2">
        <span aria-hidden className="inline-block size-4 rounded-full" style={{ background: "var(--color-cu)" }} />
        Copper ion
      </li>
    </ul>
  );
}
