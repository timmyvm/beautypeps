import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Editorial page header used across the educational pages. */
export function PageHero({
  eyebrow,
  title,
  description,
  children,
  className,
  align = "left",
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
  align?: "left" | "center";
}) {
  return (
    <section className={cn("border-b border-stone/60 bg-ivory", className)}>
      <div
        className={cn(
          "container-bp py-14 md:py-20",
          align === "center" && "flex flex-col items-center text-center",
        )}
      >
        {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
        <h1 className="max-w-3xl font-display text-4xl leading-[1.05] text-espresso md:text-6xl">{title}</h1>
        {description && (
          <p className={cn("mt-6 max-w-2xl text-base leading-relaxed text-cocoa md:text-lg", align === "center" && "mx-auto")}>
            {description}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}
