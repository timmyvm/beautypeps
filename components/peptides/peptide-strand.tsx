import { ViewTransition, type CSSProperties } from "react";
import { parseSequence, type Sequence } from "@/lib/content/sequence";
import { cn } from "@/lib/utils";
import { SequenceStrand } from "./sequence-strand";

/*
 * The sequence drawing at a chosen scale, so every strand on a page shares one bead size (a long
 * chain is drawn longer, never squeezed to match a short one). The measurements mirror the
 * drawing's own layout in sequence-strand.tsx. With `morph`, the drawing carries a view-transition
 * name, so the small strand in a list grows into the large one at the head of its monograph.
 */

const R = 26;
const GAP = 72;
const WAVE = 11;
const PAD = 8;

/** The drawing's natural size in px (scale 1), as sequence-strand.tsx lays it out. */
export function strandSize(seq: Sequence, codes: boolean) {
  const tail = seq.cap ? (seq.cap.kind === "fatty" ? 15 * 13 + 10 : R * 2 + 18) : 0;
  const end = seq.end ? (seq.end.ring ? 84 : 64) : 0;
  const x0 = PAD + tail + R;
  const lastX = x0 + Math.max(0, seq.residues.length - 1) * GAP;
  const top = seq.ion ? 96 : 0;
  const mirror = codes && seq.residues.some((r) => r.mirror) ? 14 : 0;
  return { width: Math.round(lastX + R + end + PAD), height: PAD + top + mirror + 2 * (R + WAVE) + PAD };
}

const COUNT = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];

/** "Five amino acids behind a palmitoyl tail", in words, from the written sequence. */
export function describeSequence(sequence: string) {
  const seq = parseSequence(sequence);
  const n = seq.residues.length;
  let text = `${COUNT[n] ?? n} amino acid${n === 1 ? "" : "s"}`;
  if (seq.cap?.kind === "fatty") text += " behind a palmitoyl tail";
  if (seq.ion) text += " holding one copper ion";
  const mirrored = seq.residues.filter((r) => r.mirror).length;
  if (mirrored) text += `, ${mirrored === 1 ? "one" : COUNT[mirrored]} of them in mirror-image form`;
  const extras: string[] = [];
  if (seq.cap?.kind === "small") extras.push("an acetyl cap");
  if (seq.cap?.kind === "vitamin") extras.push("biotin on the first end");
  if (seq.end?.code === "NH₂") extras.push("an amide end");
  if (seq.end?.ring) extras.push("a benzylamide ring on the last end");
  if (extras.length) text += `${mirrored ? "," : ""} with ${extras.join(" and ")}`;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function PeptideStrand({
  sequence,
  slug,
  name,
  size = "sm",
  scale = 0.4,
  morph = false,
  interactive = false,
  caption,
  draw = "none",
  tone,
  decorative = false,
  className,
}: {
  sequence: string;
  slug: string;
  name: string;
  size?: "sm" | "md";
  /** Bead size: 1 draws beads 52px across. */
  scale?: number;
  morph?: boolean;
  interactive?: boolean;
  caption?: string;
  draw?: "reveal" | "none" | "scene";
  tone?: "light" | "dark";
  /** Inside a link that already names the peptide: hidden from assistive technology. */
  decorative?: boolean;
  className?: string;
}) {
  const { width } = strandSize(parseSequence(sequence), size !== "sm");
  const drawing = (
    <div
      aria-hidden={decorative || undefined}
      className={cn("[&_svg]:h-auto [&_svg]:w-[var(--strand-w)] [&_svg]:max-w-full", className)}
      style={{ "--strand-w": `${Math.round(width * scale)}px` } as CSSProperties}
    >
      <SequenceStrand
        sequence={sequence}
        size={size}
        label={name}
        interactive={interactive}
        caption={caption}
        draw={draw}
        tone={tone}
      />
    </div>
  );
  return morph ? (
    <ViewTransition name={`strand-${slug}`} share="morph" default="none">
      {drawing}
    </ViewTransition>
  ) : (
    drawing
  );
}
