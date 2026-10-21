import { cacheLife } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { MelbourneTime } from "./melbourne-time";
import { FOOTER_LINKS } from "./nav-links";
import { NewsletterForm } from "./newsletter-form";

// The board's tiles arrive in reading order as the footer enters.
const tile = (i: number) => ({ "data-reveal": "", style: { ["--reveal-i" as string]: i } });

/** The copyright year, kept in the cache so the footer stays part of the static shell. */
async function copyrightYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

/** The footer is the last two rows of the board: filled tiles, every cell used. */
export async function Footer() {
  const [settings, year] = await Promise.all([getSettings(), copyrightYear()]);

  return (
    <footer className="container-bp mt-32 pb-[var(--margin)] md:mt-40">
      <h2 className="sr-only">About Beauty Peps</h2>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-12">
        {/* Statement + newsletter + legal */}
        <div className="col-span-2 flex flex-col justify-between gap-8 bg-field-stone p-6 md:col-span-6 md:min-h-[300px] lg:col-span-4" {...tile(0)}>
          <div>
            <p className="max-w-[26ch] text-lead font-medium">
              Cosmetic peptides, dosed in full and graded honestly. Made in Melbourne.
            </p>
            <p className="mt-6 mb-3 text-body">The Peptide Letter: new research, twice a month.</p>
            <NewsletterForm />
          </div>
          <p className="text-body">
            Cosmetics for external use only. Not intended to diagnose, treat, cure or prevent any disease; statements
            have not been evaluated by the TGA. The Peptide Library summarises published research and is not medical
            advice. © {year} {settings.storeName}
            {settings.abn ? `, ABN ${settings.abn}` : ""}.
          </p>
        </div>

        {/* Navigation */}
        <nav aria-label="Footer" className="col-span-2 bg-field-frost p-6 md:col-span-6 lg:col-span-4" {...tile(1)}>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-body">
            {FOOTER_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="link-quiet">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Local time */}
        <div className="col-span-2 flex flex-col justify-between gap-6 bg-surface-2 p-6 md:col-span-6 lg:col-span-2" {...tile(2)}>
          <p className="text-body">Melbourne</p>
          <p className="text-lead font-medium">
            <MelbourneTime />
          </p>
          <p className="text-small">{settings.dispatchTime}</p>
        </div>

        {/* Email */}
        <div className="col-span-2 flex flex-col justify-between gap-6 bg-field-stone p-6 md:col-span-6 lg:col-span-2" {...tile(3)}>
          <p className="text-body">Questions about a formula or an order</p>
          <a href={`mailto:${settings.supportEmail}`} className="link-quiet text-body font-medium">
            {settings.supportEmail.split("@")[0]}@
            <wbr />
            {settings.supportEmail.split("@")[1]}
          </a>
        </div>

        {/* The name returns */}
        <div className="col-span-2 flex min-h-[180px] items-center justify-center bg-field-ink p-8 md:col-span-8 md:min-h-[320px]" {...tile(0)}>
          <Image
            src="/images/brand/logo-wordmark-light.png"
            alt="Beauty Peps"
            width={1229}
            height={301}
            sizes="(min-width: 1024px) 52rem, 90vw"
            className="h-auto w-full max-w-[52rem]"
          />
        </div>

        {/* Invitation */}
        <Link
          href="/routine-builder"
          {...tile(1)}
          className="press group col-span-2 flex min-h-[200px] flex-col justify-between bg-accent p-6 text-accent-ink hover:bg-accent-strong md:col-span-4 md:min-h-[320px]"
        >
          <span className="max-w-[12ch] text-lead font-medium">Build your routine</span>
          <svg
            aria-hidden
            viewBox="0 0 64 64"
            className="ml-auto size-16 transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
          >
            <path d="M8 32h46M36 14l18 18-18 18" />
          </svg>
        </Link>
      </div>
    </footer>
  );
}
