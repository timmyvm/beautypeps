import { cn } from "@/lib/utils";

/*
 * Simple schematic illustrations of the four cosmetic-peptide classes.
 * Drawn with Tailwind fill/stroke utilities so they follow the brand palette.
 */

function PeptideChain({ x, y, r = 6, n = 3, className }: { x: number; y: number; r?: number; n?: number; className?: string }) {
  const gap = r * 2.6;
  return (
    <g className={className}>
      {Array.from({ length: n - 1 }).map((_, i) => (
        <line
          key={`l${i}`}
          x1={x + i * gap}
          y1={y}
          x2={x + (i + 1) * gap}
          y2={y}
          className="stroke-copper"
          strokeWidth={2}
        />
      ))}
      {Array.from({ length: n }).map((_, i) => (
        <circle key={i} cx={x + i * gap} cy={y} r={r} className="fill-cream stroke-copper" strokeWidth={2.2} />
      ))}
    </g>
  );
}

function Signal() {
  return (
    <>
      {/* Fibroblast */}
      <ellipse cx={150} cy={95} rx={62} ry={40} className="fill-blush/70 stroke-cocoa/40" strokeWidth={1.5} />
      <ellipse cx={150} cy={95} rx={18} ry={14} className="fill-cocoa/25" />
      <text x={150} y={150} textAnchor="middle" className="fill-cocoa text-[10px]">
        Fibroblast
      </text>
      {/* Incoming peptide */}
      <PeptideChain x={22} y={40} />
      <path d="M64 46 Q 82 58 94 70" className="fill-none stroke-copper" strokeWidth={1.5} strokeDasharray="3 3" markerEnd="url(#arrow-copper)" />
      <text x={22} y={22} className="fill-copper-dark text-[10px] font-semibold">
        Signal peptide
      </text>
      {/* Collagen output */}
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M214 ${78 + i * 14} q 8 -6 16 0 t 16 0 t 16 0 t 16 0`}
          className="fill-none stroke-espresso/70"
          strokeWidth={2}
        />
      ))}
      <text x={246} y={136} textAnchor="middle" className="fill-cocoa text-[10px]">
        Collagen ↑
      </text>
    </>
  );
}

function Carrier() {
  return (
    <>
      {/* Skin layers */}
      <rect x={0} y={96} width={300} height={22} className="fill-sand" />
      <rect x={0} y={118} width={300} height={52} className="fill-blush/50" />
      <text x={292} y={111} textAnchor="end" className="fill-cocoa text-[9px]">
        Epidermis
      </text>
      <text x={292} y={160} textAnchor="end" className="fill-cocoa text-[9px]">
        Dermis
      </text>
      {/* Peptide carrying copper */}
      <PeptideChain x={40} y={52} />
      <circle cx={57} cy={30} r={11} className="fill-sapphire" />
      <text x={57} y={34} textAnchor="middle" className="fill-cream text-[10px] font-bold">
        Cu
      </text>
      <line x1={50} y1={40} x2={47} y2={47} className="stroke-sapphire" strokeWidth={1.5} />
      <line x1={64} y1={40} x2={67} y2={47} className="stroke-sapphire" strokeWidth={1.5} />
      <path d="M100 52 Q 150 60 170 128" className="fill-none stroke-sapphire" strokeWidth={1.5} strokeDasharray="3 3" markerEnd="url(#arrow-sapphire)" />
      {/* Released copper reaching enzyme */}
      <circle cx={190} cy={140} r={8} className="fill-sapphire" />
      <rect x={206} y={128} width={56} height={24} rx={12} className="fill-cream stroke-cocoa/40" />
      <text x={234} y={144} textAnchor="middle" className="fill-cocoa text-[9px]">
        enzymes
      </text>
      <text x={110} y={22} className="fill-sapphire text-[10px] font-semibold">
        Carrier peptide + copper
      </text>
    </>
  );
}

function Neuro() {
  return (
    <>
      {/* Nerve terminal */}
      <path d="M40 10 h 90 v 50 q -45 30 -90 0 z" className="fill-sand stroke-cocoa/40" strokeWidth={1.5} />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={62 + i * 22} cy={42} r={8} className="fill-cream stroke-cocoa/50" strokeWidth={1.2} />
      ))}
      <text x={85} y={24} textAnchor="middle" className="fill-cocoa text-[9px]">
        nerve ending
      </text>
      {/* Blocked release */}
      <PeptideChain x={66} y={82} r={5} />
      <line x1={58} y1={96} x2={112} y2={96} className="stroke-sage" strokeWidth={2} />
      <text x={146} y={86} className="fill-sage text-[10px] font-semibold">
        Peptide competes for the
      </text>
      <text x={146} y={99} className="fill-sage text-[10px] font-semibold">
        SNARE complex
      </text>
      <path d="M85 104 v 14" className="stroke-cocoa/40" strokeWidth={1.5} strokeDasharray="2 3" />
      {/* Muscle */}
      <rect x={20} y={124} width={260} height={30} rx={15} className="fill-blush/70 stroke-cocoa/30" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <line key={i} x1={44 + i * 34} y1={130} x2={44 + i * 34} y2={148} className="stroke-cocoa/20" strokeWidth={1.5} />
      ))}
      <text x={150} y={168} textAnchor="middle" className="fill-cocoa text-[9px]">
        Muscle contracts less intensely
      </text>
    </>
  );
}

function Enzyme() {
  return (
    <>
      {/* Collagen strand */}
      {[0, 1].map((i) => (
        <path
          key={i}
          d={`M10 ${118 + i * 10} q 12 -8 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0`}
          className="fill-none stroke-espresso/60"
          strokeWidth={2}
        />
      ))}
      <text x={20} y={152} className="fill-cocoa text-[9px]">
        Collagen
      </text>
      {/* Enzyme (MMP) */}
      <path d="M120 50 L149.4 67 A34 34 0 1 1 149.4 33 Z" className="fill-amber-light stroke-amber" strokeWidth={1.5} />
      <text x={112} y={100} textAnchor="middle" className="fill-amber text-[10px] font-semibold">
        MMP / tyrosinase
      </text>
      {/* Peptide plugging the active site */}
      <PeptideChain x={138} y={50} r={5} n={3} />
      <text x={186} y={42} className="fill-copper-dark text-[10px] font-semibold">
        Inhibiting peptide
      </text>
      <text x={186} y={56} className="fill-cocoa text-[9px]">
        blocks the active site
      </text>
    </>
  );
}

const DIAGRAMS = {
  signal: { title: "Signal peptide stimulating a fibroblast", Body: Signal },
  carrier: { title: "Carrier peptide delivering copper into the skin", Body: Carrier },
  "neurotransmitter-inhibitor": { title: "Neurotransmitter-inhibiting peptide at the nerve–muscle junction", Body: Neuro },
  "enzyme-inhibitor": { title: "Enzyme-inhibiting peptide blocking a collagen-degrading enzyme", Body: Enzyme },
} as const;

export function ClassDiagram({ type, className }: { type: string; className?: string }) {
  const d = DIAGRAMS[type as keyof typeof DIAGRAMS];
  if (!d) return null;
  return (
    <svg viewBox="0 0 300 175" role="img" aria-label={d.title} className={cn("h-auto w-full", className)}>
      <title>{d.title}</title>
      <defs>
        <marker id="arrow-copper" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" className="fill-copper" />
        </marker>
        <marker id="arrow-sapphire" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" className="fill-sapphire" />
        </marker>
      </defs>
      <d.Body />
    </svg>
  );
}
