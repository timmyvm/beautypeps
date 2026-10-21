import type { ReactNode } from "react";
import { reveal } from "./page-header";

/*
 * One part of a long page: the heading (and any figure) in the left four columns, the reading column on
 * the right. Used by the monographs and the science guide.
 */
export function Chapter({
  id,
  title,
  aside,
  children,
}: {
  id: string;
  title: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="mt-24 grid scroll-mt-24 gap-8 lg:mt-36 lg:grid-cols-12 lg:gap-[var(--gutter)]"
    >
      <div className="lg:col-span-5">
        <h2 id={`${id}-title`} className="display-type text-head" {...reveal(0)}>
          {title}
        </h2>
        {aside}
      </div>
      <div className="min-w-0 lg:col-span-7 lg:col-start-6">{children}</div>
    </section>
  );
}

/** A short aside inside the reading column, on a filled ground rather than in a box. */
export function Note({ title, children }: { title: string; children: ReactNode }) {
  return (
    <aside className="not-prose my-10 bg-accent-soft p-6 sm:p-8">
      <h3 className="text-lead font-medium text-ink">{title}</h3>
      <p className="mt-2 max-w-[60ch] text-body text-ink">{children}</p>
    </aside>
  );
}
