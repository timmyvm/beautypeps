import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/lib/db/schema";

/** Three journal pieces as cover, title and category: the reading offered on task pages while someone waits. */
export function JournalShelf({
  id,
  title,
  intro,
  articles,
}: {
  id: string;
  title: string;
  intro?: string;
  articles: Pick<Article, "slug" | "title" | "category" | "readMinutes" | "coverImage">[];
}) {
  if (articles.length === 0) return null;
  return (
    <section className="mt-24 md:mt-32" aria-labelledby={id}>
      <div className="mb-10 grid gap-4 lg:grid-cols-12">
        <h2 id={id} className="display-type text-head lg:col-span-7" data-reveal="">
          {title}
        </h2>
        {intro && (
          <p className="text-body lg:col-span-4 lg:col-start-9 lg:self-end" data-reveal="" style={{ ["--reveal-i" as string]: 1 }}>
            {intro}
          </p>
        )}
      </div>
      <ul className="grid gap-x-3 gap-y-10 md:grid-cols-3">
        {articles.map((a, i) => (
          <li key={a.slug} data-reveal="" style={{ ["--reveal-i" as string]: i }}>
            <Link href={`/learn/${a.slug}`} className="group block">
              <div className="relative aspect-[3/2] overflow-hidden bg-surface">
                {a.coverImage && (
                  <Image
                    src={a.coverImage}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none"
                  />
                )}
              </div>
              <h3 className="mt-4 text-lead font-medium group-hover:underline group-hover:underline-offset-4">{a.title}</h3>
              <p className="mt-1 text-body text-muted">
                {a.category}, {a.readMinutes} minute read
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
