import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { Logo } from "./logo";
import { FOOTER_COLUMNS } from "./nav-links";
import { NewsletterForm } from "./newsletter-form";

export async function Footer() {
  const settings = await getSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 bg-espresso text-cream/80">
      <div className="container-bp grid gap-12 py-16 lg:grid-cols-[1.2fr_2fr]">
        <div className="max-w-sm">
          <Logo variant="light" />
          <p className="mt-6 text-sm leading-relaxed text-cream/70">
            High-concentration cosmetic peptides, formulated in small batches and explained with honest, evidence-led
            education.
          </p>
          <p className="mt-8 mb-3 text-xs font-semibold tracking-[0.2em] text-cream uppercase">The Peptide Letter</p>
          <p className="mb-4 text-sm text-cream/60">New research, formulation notes and early access. Twice a month.</p>
          <NewsletterForm />
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-cream uppercase">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-cream/65 transition-colors hover:text-cream">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="container-bp py-8 text-xs leading-relaxed text-cream/45">
          <p className="max-w-4xl">
            Beauty Peps products are cosmetics for external, topical use only. They are not intended to diagnose,
            treat, cure or prevent any disease, and statements on this site have not been evaluated by the TGA.
            Information in our Peptide Library is educational and summarises published research — it is not medical
            advice. Patch test before use and consult a health professional if you are pregnant, breastfeeding or under
            medical care.
          </p>
          <div className="mt-6 flex flex-col justify-between gap-3 sm:flex-row">
            <p>
              © {year} {settings.storeName}
              {settings.abn ? ` · ABN ${settings.abn}` : ""} · {settings.businessAddress}
            </p>
            <div className="flex gap-5">
              {settings.instagram && (
                <a href={settings.instagram} target="_blank" rel="noreferrer" className="hover:text-cream">
                  Instagram
                </a>
              )}
              {settings.tiktok && (
                <a href={settings.tiktok} target="_blank" rel="noreferrer" className="hover:text-cream">
                  TikTok
                </a>
              )}
              <a href={`mailto:${settings.supportEmail}`} className="hover:text-cream">
                {settings.supportEmail}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
