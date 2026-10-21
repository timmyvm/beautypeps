import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { getActiveProducts } from "@/lib/queries/content";
import { reveal } from "./page-header";

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
        <p className="mt-8 max-w-[44ch] text-lead">
          The link may be old or mistyped. Search for what you were after, or start from one of these.
        </p>
        <form action="/search" className="mt-10 flex w-full max-w-xl">
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
          <div className="mt-12 grid grid-cols-2 gap-x-[var(--gutter)] gap-y-10 lg:grid-cols-4">
            {picks.map((p, i) => (
              <div key={p.id} {...reveal(i + 1)}>
                <ProductCard product={p} index={i} />
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
