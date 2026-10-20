import { evidenceLevel } from "@/lib/content/evidence";
import { cn } from "@/lib/utils";

/** Five-dot evidence rating with an optional label. */
export function EvidenceMeter({
  level,
  showLabel = true,
  size = "sm",
  className,
}: {
  level: number;
  showLabel?: boolean;
  size?: "sm" | "lg";
  className?: string;
}) {
  const e = evidenceLevel(level);
  return (
    <span
      className={cn("inline-flex items-center gap-2", className)}
      title={`Evidence: ${e.label} — ${e.description}`}
      aria-label={`Evidence level ${e.level} of 5: ${e.label}`}
    >
      <span className="flex items-center gap-1" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={cn(
              "rounded-full",
              size === "lg" ? "size-2.5" : "size-1.5",
              i <= e.level ? "bg-copper" : "bg-stone",
            )}
          />
        ))}
      </span>
      {showLabel && (
        <span className={cn("text-cocoa", size === "lg" ? "text-sm font-medium" : "text-[11px]")}>{e.label}</span>
      )}
    </span>
  );
}
