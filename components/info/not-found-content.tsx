import { Search } from "lucide-react";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";

const LINKS = [
  { href: "/shop", label: "Shop all products" },
  { href: "/peptides", label: "Peptide Library" },
  { href: "/learn", label: "The Journal" },
  { href: "/faq", label: "FAQ" },
  { href: "/track", label: "Track an order" },
  { href: "/contact", label: "Contact us" },
];

/** Branded 404 body shared by the root and storefront not-found pages. */
export function NotFoundContent() {
  return (
    <section className="container-bp flex flex-col items-center py-20 text-center md:py-28">
      <p className="font-display text-[7rem] leading-none text-copper-light md:text-[10rem]">404</p>
      <h1 className="mt-4 font-display text-3xl text-espresso md:text-5xl">This page has evaporated</h1>
      <p className="mt-4 max-w-md text-cocoa">
        The link may be old or mistyped. Try a search, or head somewhere useful below.
      </p>
      <form action="/search" className="mt-8 flex w-full max-w-md items-center rounded-full border border-stone bg-cream p-1 pl-5">
        <label htmlFor="nf-search" className="sr-only">
          Search
        </label>
        <input
          id="nf-search"
          name="q"
          type="search"
          placeholder="Search products, peptides, guides…"
          className="h-10 min-w-0 flex-1 bg-transparent text-sm text-espresso placeholder:text-taupe focus:outline-none"
        />
        <button type="submit" aria-label="Search" className="grid size-10 place-items-center rounded-full bg-espresso text-cream hover:bg-ink">
          <Search className="size-4" aria-hidden />
        </button>
      </form>
      <ul className="mt-10 flex max-w-xl flex-wrap justify-center gap-2">
        {LINKS.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="block rounded-full border border-stone bg-cream px-4 py-2 text-sm text-espresso hover:border-copper/50"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
      <ButtonLink href="/" className="mt-10">
        Back to home
      </ButtonLink>
    </section>
  );
}
