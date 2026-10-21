import Link from "next/link";
import { SpecimenTile, toneFor } from "@/components/product/product-card";
import { formatMoney } from "@/lib/format";
import { getActiveProducts } from "@/lib/queries/content";
import { PictureLink, reveal } from "./page-header";

const LINKS = [
  { href: "/shop", label: "Shop all formulas" },
  { href: "/peptides", label: "Peptide library" },
  { href: "/learn", label: "Journal" },
  { href: "/faq", label: "FAQ" },
  { href: "/track", label: "Track an order" },
  { href: "/contact", label: "Contact us" },
];

/** The 404 body shared by the root and storefront not-found pages: a search, the main doors, four formulas. */
export async function NotFoundContent() {
  const products = await getActiveProducts();
  const picks = [...products.filter((p) => p.featured && p.stock > 0), ...products.filter((p) => !p.featured && p.stock > 0)].slice(0, 4);

  return (
    <>
      <section aria-labelledby="nf-title" className="container-bp pt-12 lg:pt-20">
        <h1 id="nf-title" className="display-type max-w-5xl text-[10.5vw] text-ink sm:text-[clamp(2.75rem,5.9vw,5.75rem)]">
          Nothing at this address
        </h1>
        <p className="mt-8 max-w-[44ch] text-lead" {...reveal(1)}>
          The link may be old or mistyped. Search for what you were after, or start from one of these.
        </p>
        <form action="/search" className="mt-10 flex w-full max-w-xl" {...reveal(2)}>
          <label htmlFor="nf-search" className="sr-only">
            Search products, peptides and guides
          </label>
          <input
            id="nf-search"
            name="q"
            type="search"
            placeholder="Search products, peptides, guides"
            className="h-12 min-w-0 flex-1 rounded-none bg-surface px-4 text-body text-ink placeholder:text-muted focus:outline-none focus-visible:outline-2 focus-visible:outline-accent"
          />
          <button
            type="submit"
            className="press h-12 shrink-0 bg-accent px-6 text-body font-medium text-accent-ink hover:bg-accent-strong"
          >
            Search
          </button>
        </form>
        <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-body">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="underline underline-offset-4">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {picks.length > 0 && (
        <section aria-labelledby="nf-picks" className="container-bp mt-24 lg:mt-36">
          <h2 id="nf-picks" className="display-type text-head" {...reveal(0)}>
            Or start with these
          </h2>
          <p className="mt-6 max-w-[52ch] text-body" {...reveal(1)}>
            Four formulas people come back for, each with its lead peptide and its percentage printed on the label.
          </p>
          <div className="mt-12 grid grid-cols-2 gap-x-[var(--gutter)] gap-y-10 lg:grid-cols-4">
            {picks.map((p, i) => (
              <Link key={p.id} href={`/products/${p.slug}`} className="group block" {...reveal(i + 1)}>
                <SpecimenTile product={p} tone={toneFor(p.slug, i)} className="aspect-[4/5]" />
                <p className="mt-3 text-body font-medium group-hover:underline group-hover:underline-offset-4">{p.name}</p>
                <p className="text-body">{formatMoney(p.price)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="nf-read" className="container-bp mt-24 lg:mt-36">
        <h2 id="nf-read" className="display-type text-head" {...reveal(0)}>
          Or read first
        </h2>
        <p className="mt-6 max-w-[52ch] text-body" {...reveal(1)}>
          Everything we make is explained somewhere on this site. These three pages are the best places to begin.
        </p>
        <div className="mt-12 grid gap-x-[var(--gutter)] gap-y-12 md:grid-cols-3">
          <PictureLink
            href="/peptides"
            src="/images/editorial/actives.webp"
            alt="A row of amber vials of freeze-dried peptide powder on a travertine bench"
            title="The peptide library"
            text="Every peptide we formulate with, graded for how sure the science is."
            index={1}
          />
          <PictureLink
            href="/learn"
            src="/images/articles/what-are-peptides.webp"
            alt="A chain of copper and glass beads curving across a cream ground"
            title="The journal"
            text="Guides to layering, routines and reading the research."
            index={2}
          />
          <PictureLink
            href="/routine-builder"
            src="/images/articles/beginner-peptide-routine.webp"
            alt="Three serums and a vase on a travertine tray in a bathroom"
            title="Build a routine"
            text="Four questions about your skin, and the formulas that answer them."
            index={3}
          />
        </div>
      </section>
    </>
  );
}
