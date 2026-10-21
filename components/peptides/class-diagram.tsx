import type { ReactElement } from "react";
import { cn } from "@/lib/utils";

/*
 * Schematic drawings of the four cosmetic-peptide classes. The peptide is always the chain of blue beads;
 * the words live in the HTML caption beside each drawing, never inside the SVG.
 */

function Chain({ x, y, r = 6, n = 3, hollow = false }: { x: number; y: number; r?: number; n?: number; hollow?: boolean }) {
  const gap = r * 2.6;
  return (
    <g>
      {Array.from({ length: n - 1 }).map((_, i) => (
        <line key={`l${i}`} x1={x + i * gap} y1={y} x2={x + (i + 1) * gap} y2={y} className="stroke-accent" strokeWidth={2.4} />
      ))}
      {Array.from({ length: n }).map((_, i) => (
        <circle
          key={i}
          cx={x + i * gap}
          cy={y}
          r={r}
          className={hollow ? "fill-white stroke-accent" : "fill-accent stroke-accent"}
          strokeWidth={2.2}
        />
      ))}
    </g>
  );
}

function Signal({ arrow }: { arrow: string }) {
  return (
    <>
      <ellipse cx={140} cy={104} rx={70} ry={46} className="fill-field-frost" />
      <ellipse cx={140} cy={104} rx={20} ry={15} className="fill-field-stone" />
      <Chain x={22} y={34} />
      <path d="M62 42 Q 84 54 96 72" className="fill-none stroke-ink" strokeWidth={1.6} strokeDasharray="3 4" markerEnd={`url(#${arrow})`} />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M222 ${86 + i * 16} q 8 -7 16 0 t 16 0 t 16 0 t 16 0`} className="fill-none stroke-ink" strokeWidth={2.2} />
      ))}
    </>
  );
}

function Carrier({ arrow }: { arrow: string }) {
  return (
    <>
      <rect x={0} y={100} width={300} height={24} className="fill-field-stone" />
      <rect x={0} y={124} width={300} height={56} className="fill-field-frost" />
      <Chain x={40} y={56} hollow />
      <circle cx={53} cy={30} r={11} className="fill-accent" />
      <line x1={47} y1={40} x2={44} y2={50} className="stroke-accent" strokeWidth={2} />
      <line x1={59} y1={40} x2={62} y2={50} className="stroke-accent" strokeWidth={2} />
      <path d="M100 56 Q 150 64 168 134" className="fill-none stroke-ink" strokeWidth={1.6} strokeDasharray="3 4" markerEnd={`url(#${arrow})`} />
      <circle cx={204} cy={152} r={8} className="fill-accent" />
      <path d="M244 152 L226.4 142 A20 20 0 1 1 226.4 162 Z" className="fill-white" />
    </>
  );
}

function Neuro({ arrow }: { arrow: string }) {
  return (
    <>
      <path d="M105 10 h 90 v 52 q -45 30 -90 0 z" className="fill-field-stone" />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={127 + i * 23} cy={42} r={8} className="fill-white" />
      ))}
      <Chain x={137} y={90} r={5} />
      <line x1={122} y1={104} x2={178} y2={104} className="stroke-ink" strokeWidth={3} />
      <path d="M150 108 v 14" className="fill-none stroke-ink" strokeWidth={1.6} strokeDasharray="2 4" markerEnd={`url(#${arrow})`} />
      <rect x={20} y={132} width={260} height={32} className="fill-field-frost" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <line key={i} x1={44 + i * 35} y1={138} x2={44 + i * 35} y2={158} className="stroke-white" strokeWidth={2} />
      ))}
    </>
  );
}

function Enzyme() {
  return (
    <>
      {[0, 1].map((i) => (
        <path
          key={i}
          d={`M10 ${132 + i * 12} q 12 -8 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0`}
          className="fill-none stroke-ink"
          strokeWidth={2.2}
        />
      ))}
      <path d="M130 62 L161 80 A36 36 0 1 1 161 44 Z" className="fill-field-stone" />
      <Chain x={146} y={62} r={5} />
    </>
  );
}

const DIAGRAMS: Record<string, { title: string; Body: (props: { arrow: string }) => ReactElement }> = {
  signal: {
    title: "A signal peptide reaching a fibroblast, which answers with more collagen",
    Body: Signal,
  },
  carrier: {
    title: "A carrier peptide taking copper through the skin to the enzymes that need it",
    Body: Carrier,
  },
  "neurotransmitter-inhibitor": {
    title: "A peptide damping the signal from a nerve ending to the muscle beneath it",
    Body: Neuro,
  },
  "enzyme-inhibitor": {
    title: "A peptide sitting in the active site of an enzyme that breaks collagen down",
    Body: Enzyme,
  },
};

export function classDiagramTitle(type: string) {
  return DIAGRAMS[type]?.title;
}

export function ClassDiagram({ type, className }: { type: string; className?: string }) {
  const d = DIAGRAMS[type];
  if (!d) return null;
  const arrow = `arrow-${type}`;
  return (
    <svg viewBox="0 0 300 180" role="img" aria-label={d.title} className={cn("h-auto w-full", className)}>
      <defs>
        <marker id={arrow} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" className="fill-ink" />
        </marker>
      </defs>
      <d.Body arrow={arrow} />
    </svg>
  );
}
