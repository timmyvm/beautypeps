import { ChevronDown, Mail, Package } from "lucide-react";
import type { Metadata } from "next";
import { JsonLd } from "@/components/info/json-ld";
import { PageHero } from "@/components/info/page-hero";
import { Markdown } from "@/components/markdown";
import { ButtonLink } from "@/components/ui/button";
import { faqPlainText, getFaqGroups } from "@/lib/content/faq";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers about cosmetic peptides, using and layering our products, pure actives, payment by bank transfer or PayID, Australia Post shipping, returns and your account.",
};

export default async function FaqPage() {
  const settings = await getSettings();
  const groups = getFaqGroups(settings);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: groups.flatMap((g) =>
            g.items.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: { "@type": "Answer", text: faqPlainText(item.a) },
            })),
          ),
        }}
      />
      <PageHero
        eyebrow="Help centre"
        title="Frequently asked questions"
        description="Everything from how peptides work to when your parcel will arrive. Can't find your answer? Our team replies within one business day."
      />

      <div className="container-bp grid grid-cols-1 gap-12 py-14 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-16">
        <nav aria-label="FAQ topics" className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow mb-4">Topics</p>
          <ul className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:block lg:space-y-1 lg:px-0">
            {groups.map((g) => (
              <li key={g.id} className="shrink-0">
                <a
                  href={`#${g.id}`}
                  className="block rounded-full border border-stone bg-cream px-3.5 py-1.5 text-xs text-cocoa hover:text-espresso lg:rounded-lg lg:border-0 lg:bg-transparent lg:px-3 lg:py-2 lg:text-sm lg:hover:bg-ivory"
                >
                  {g.title}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-8 hidden rounded-2xl bg-ivory p-5 lg:block">
            <Mail className="size-5 text-copper" aria-hidden />
            <p className="mt-3 text-sm font-medium text-espresso">Still need help?</p>
            <p className="mt-1 text-xs text-cocoa">{settings.supportEmail}</p>
            <ButtonLink href="/contact" size="sm" variant="outline" className="mt-4">
              Contact us
            </ButtonLink>
          </div>
        </nav>

        <div className="min-w-0 space-y-14">
          {groups.map((g) => (
            <section key={g.id} id={g.id} className="scroll-mt-28">
              <h2 className="mb-5 font-display text-3xl text-espresso">{g.title}</h2>
              <div className="divide-y divide-stone/70 rounded-2xl border border-stone/70 bg-cream">
                {g.items.map((item) => (
                  <details key={item.q} className="group px-5 open:bg-ivory/40 md:px-6">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left font-medium text-espresso marker:hidden [&::-webkit-details-marker]:hidden">
                      {item.q}
                      <ChevronDown
                        className="size-4 shrink-0 text-copper transition-transform group-open:rotate-180"
                        aria-hidden
                      />
                    </summary>
                    <Markdown className="pb-5 text-[15px] [&_p]:my-0">{item.a}</Markdown>
                  </details>
                ))}
              </div>
            </section>
          ))}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-stone/70 bg-ivory p-6">
              <Package className="size-5 text-copper" aria-hidden />
              <p className="mt-3 font-display text-xl text-espresso">Where&apos;s my order?</p>
              <p className="mt-1 text-sm text-cocoa">Check status and tracking with your order number and email.</p>
              <ButtonLink href="/track" size="sm" className="mt-5">
                Track an order
              </ButtonLink>
            </div>
            <div className="rounded-2xl border border-stone/70 bg-ivory p-6">
              <Mail className="size-5 text-copper" aria-hidden />
              <p className="mt-3 font-display text-xl text-espresso">Talk to a human</p>
              <p className="mt-1 text-sm text-cocoa">Questions about products, routines or an order — we reply within one business day.</p>
              <ButtonLink href="/contact" size="sm" variant="outline" className="mt-5">
                Contact us
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
