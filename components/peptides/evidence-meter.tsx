import { evidenceLevel } from "@/lib/content/evidence";
import { cn } from "@/lib/utils";

/*
 * The evidence grade, the site's one recurring mark: five square segments, the filled ones in the accent,
 * always paired with the grade in words.
 */
export function EvidenceMeter({
  level,
  showLabel = true,
  size = "sm",
  tone = "light",
  className,
}: {
  level: number;
  showLabel?: boolean;
  size?: "sm" | "lg";
  tone?: "light" | "dark";
  className?: string;
}) {
  const e = evidenceLevel(level);
  return (
    <span role="img" className={cn("inline-flex items-center gap-3", className)} aria-label={`Evidence grade ${e.level} of 5: ${e.label}`}>
      <span className="flex items-center gap-1" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={cn(
              size === "lg" ? "h-3 w-7" : "h-2 w-4",
              i <= e.level ? (tone === "dark" ? "bg-white" : "bg-accent") : tone === "dark" ? "bg-white/25" : "bg-surface-2",
            )}
          />
        ))}
      </span>
      {showLabel && (
        <span className="text-small" aria-hidden>
          Grade {e.level} of 5, {e.label.toLowerCase()}
        </span>
      )}
    </span>
  );
}
