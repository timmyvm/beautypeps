import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/info/json-ld";
import { Figure, PageHeader, reveal } from "@/components/info/page-header";
import { Markdown } from "@/components/markdown";
import { ButtonLink } from "@/components/ui/button";
import { faqPlainText, getFaqGroups } from "@/lib/content/faq";
import { getSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers about cosmetic peptides, using and layering our products, pure actives, payment by bank transfer or PayID, Australia Post shipping, returns and your account.",
};

const CARD_FIELDS = ["bg-field-stone", "bg-field-frost", "bg-surface-2"];

/* A photograph beside some topics, of the thing the questions are about. */
const GROUP_PICTURES: Record<string, { src: string; alt: string }> = {
  "about-peptides": {
    src: "/images/articles/what-are-peptides.webp",
    alt: "A chain of copper and glass beads curving across a cream ground",
  },
  "using-products": {
    src: "/images/editorial/ritual.webp",
    alt: "A woman pressing serum from a glass dropper onto her cheekbone",
  },
  "pure-actives": {
    src: "/images/editorial/actives.webp",
    alt: "A row of amber vials of freeze-dried peptide powder on a travertine bench beside a scale",
  },
  shipping: {
    src: "/images/editorial/unboxing.webp",
    alt: "An opened box holding three serums in tissue paper",
  },
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
      <PageHeader
        crumbs={[{ href: "/", label: "Home" }, { label: "FAQ" }]}
        title="Questions, answered"
        lead="Everything from how peptides work to when your parcel arrives. Can't find yours? We reply within one business day."
        figure={
          <Figure ratio="aspect-[4/3]">
            <Image
              src="/images/editorial/hero.webp"
              alt="Three peptide serums on a travertine plinth in soft afternoon light"
              fill
              priority
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </Figure>
        }
      >
        <nav aria-label="FAQ topics" className="flex flex-wrap gap-2">
          {groups.map((g) => (
            <a key={g.id} href={`#${g.id}`} className="press inline-flex h-11 items-center bg-surface px-4 text-body hover:bg-surface-2">
              {g.title.replace(" & ", " and ")}
            </a>
          ))}
        </nav>
      </PageHeader>

      <div className="container-bp">
        {groups.map((g, gi) => {
          const pic = GROUP_PICTURES[g.id];
          return (
            <section
              key={g.id}
              id={g.id}
              aria-labelledby={`${g.id}-title`}
              className="mt-24 grid scroll-mt-8 gap-8 lg:mt-36 lg:grid-cols-12 lg:gap-[var(--gutter)]"
            >
              <div className="lg:col-span-4">
                <h2 id={`${g.id}-title`} className="display-type text-head" {...reveal(0)}>
                  {g.title.replace(" & ", " and ")}
                </h2>
                {pic && (
                  <Figure ratio="aspect-[4/3]" className="mt-10 hidden max-w-[440px] lg:block">
                    <Image src={pic.src} alt={pic.alt} fill sizes="30vw" className="object-cover" />
                  </Figure>
                )}
              </div>
              <div className="index-cards lg:col-span-8 lg:col-start-5">
                {g.items.map((item, i) => (
                  <details
                    key={item.q}
                    name={`faq-${g.id}`}
                    open={gi === 0 && i === 0}
                    className={cn("index-card group relative", CARD_FIELDS[(i + gi) % CARD_FIELDS.length])}
                    style={{ ["--tab-x" as string]: `${i % 6}`, zIndex: i + 1 }}
                  >
                    <summary className="flex min-h-[96px] cursor-pointer list-none flex-col justify-center px-6 pt-[56px] pb-[46px] [&::-webkit-details-marker]:hidden">
                      <span className="index-tab absolute top-0 flex h-10 items-center px-5 text-small font-medium">
                        {item.tab}
                      </span>
                      <span className="flex items-center justify-between gap-6 text-lead font-medium">
                        {item.q}
                        <span aria-hidden className="text-lead leading-none transition-transform duration-300 group-open:rotate-45">
                          +
                        </span>
                      </span>
                    </summary>
                    <Markdown className="-mt-6 max-w-[56ch] px-6 pb-16 [&_p]:my-0">{item.a}</Markdown>
                  </details>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <section aria-labelledby="help-title" className="container-bp mt-28 lg:mt-44">
        <h2 id="help-title" className="display-type text-head" {...reveal(0)}>
          Still need a hand?
        </h2>
        <div className="mt-12 grid gap-2 md:grid-cols-2">
          <div className="bg-field-frost p-6 sm:p-10" {...reveal(1)}>
            <h3 className="text-lead font-medium">Where is my order?</h3>
            <p className="mt-2 max-w-[40ch] text-body">Check its status and tracking with your order number and email.</p>
            <ButtonLink href="/track" className="mt-8">
              Track an order
            </ButtonLink>
          </div>
          <div className="bg-field-stone p-6 sm:p-10" {...reveal(2)}>
            <h3 className="text-lead font-medium">Talk to a person</h3>
            <p className="mt-2 max-w-[40ch] text-body">
              About products, routines or an order. Write to{" "}
              <a href={`mailto:${settings.supportEmail}`} className="underline underline-offset-4">
                {settings.supportEmail}
              </a>{" "}
              or use the form.
            </p>
            <Link href="/contact" className="mt-8 inline-block text-body underline underline-offset-4">
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
