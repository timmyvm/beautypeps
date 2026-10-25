import Image from "next/image";
import Link from "next/link";
import { reveal } from "@/components/info/page-header";
import { SequenceStrand, StrandKey } from "@/components/peptides/sequence-strand";
import { LoopVideo } from "@/components/site/loop-video";
import type { Peptide } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import type { Field, Interlude } from "./article-extras";

/*
 * The things set between an article's chapters: a line from the text enlarged on a field of colour, a
 * picture of what the chapter describes, or the peptides it names drawn from their sequences.
 */

const FIELD: Record<Field, string> = {
  frost: "bg-field-frost text-ink",
  stone: "bg-field-stone text-ink",
  sapphire: "bg-field-sapphire text-field-sapphire-ink",
  ink: "bg-field-ink text-field-ink-ink",
};

export type PeptideFacts = Pick<Peptide, "slug" | "name" | "inciName" | "sequence" | "evidenceLevel">;

export function InterludeView({ item, peptides }: { item: Interlude; peptides: Map<string, PeptideFacts> }) {
  if (item.kind === "quote") {
    return (
      <figure className={cn("mt-24 py-20 lg:mt-36 lg:py-32", FIELD[item.field])}>
        <div className="container-bp grid lg:grid-cols-12 lg:gap-[var(--gutter)]">
          <blockquote
            className="display-type text-lead sm:text-[calc(var(--text-body)*1.75)] sm:leading-[1.15] lg:col-span-8 lg:col-start-3"
            {...reveal(0)}
          >
            <p className="max-w-[30ch] text-balance">{item.text}</p>
          </blockquote>
        </div>
      </figure>
    );
  }

  if (item.kind === "figure") {
    const tall = item.shape !== "wide";
    return (
      <figure className="container-bp mt-24 grid gap-4 lg:mt-36 lg:grid-cols-12 lg:items-end lg:gap-[var(--gutter)]">
        <div
          className={cn(
            "relative w-full overflow-hidden bg-surface lg:row-start-1",
            item.shape === "wide" ? "aspect-[3/2] lg:col-span-7 lg:col-start-6" : "lg:col-span-5 lg:col-start-6",
            item.shape === "tall" && "aspect-[4/5]",
            item.shape === "square" && "aspect-square",
          )}
          {...reveal(0)}
        >
          {item.video ? (
            <LoopVideo src={item.video} poster={item.src} label={item.alt} className="absolute inset-0" />
          ) : (
            <Image
              src={item.src}
              alt={item.alt}
              fill
              sizes={tall ? "(min-width: 1024px) 40vw, 100vw" : "(min-width: 1024px) 58vw, 100vw"}
              className="object-cover"
            />
          )}
        </div>
        <figcaption className="max-w-[36ch] text-body lg:col-span-4 lg:row-start-1" {...reveal(1)}>
          {item.caption}
        </figcaption>
      </figure>
    );
  }

  const drawn = item.items.flatMap((x) => {
    const p = peptides.get(x.slug);
    return p?.sequence ? [{ ...x, p, sequence: p.sequence }] : [];
  });
  if (drawn.length === 0) return null;
  return (
    <figure className="mt-24 bg-surface py-20 lg:mt-36 lg:py-28">
      <div className="container-bp grid gap-12 lg:grid-cols-12 lg:gap-[var(--gutter)]">
        <figcaption className="lg:col-span-4">
          <p className="display-type max-w-[16ch] text-lead sm:text-[calc(var(--text-body)*1.75)]" {...reveal(0)}>
            {item.title}
          </p>
          <StrandKey className="mt-6 max-w-[28ch]" />
        </figcaption>
        <ul className="grid gap-x-[var(--gutter)] gap-y-12 sm:grid-cols-2 lg:col-span-7 lg:col-start-6">
          {drawn.map((x, i) => (
            <li key={x.slug} {...reveal(i % 2)}>
              <Link href={`/peptides/${x.slug}`} className="group block">
                {/* One scale for the whole family, sat on a shared baseline, so their lengths compare */}
                <div className="flex items-end sm:h-[7.5rem]">
                  <SequenceStrand sequence={x.sequence} size="md" label={x.p.name} className="min-w-0 [zoom:0.75]" />
                </div>
                <span className="mt-4 block text-body font-medium group-hover:underline group-hover:underline-offset-4">
                  {x.p.name}
                </span>
                <span className="block text-body">{x.note}</span>
                <span className="block text-small text-muted">
                  {x.p.inciName} · evidence grade {x.p.evidenceLevel} of 5
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </figure>
  );
}

/** The peptides an article is about, drawn large beside its standfirst. */
export function ArticleSpecimens({ peptides }: { peptides: PeptideFacts[] }) {
  const drawn = peptides.filter((p) => p.sequence);
  if (drawn.length === 0) return null;
  return (
    <div className="mt-10 space-y-10">
      {drawn.map((p) => (
        <div key={p.slug} className="bg-surface p-6">
          <SequenceStrand
            sequence={p.sequence!}
            size="md"
            interactive
            label={p.name}
            caption={`${p.name}, drawn from its sequence. Choose a bead to name it.`}
            className="[&_figcaption]:text-small [&_svg]:max-h-36 [&_svg]:w-auto"
          />
          <p className="mt-2 text-body font-medium">{p.name}</p>
          <p className="text-small text-muted">
            {p.inciName} · evidence grade {p.evidenceLevel} of 5
          </p>
          <Link href={`/peptides/${p.slug}`} className="mt-3 inline-block text-body underline underline-offset-4">
            Read the monograph
          </Link>
        </div>
      ))}
    </div>
  );
}
