import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ContactForm } from "@/components/shop/contact-form";
import { getCurrentUser } from "@/lib/auth/session";
import { getSettings } from "@/lib/settings";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact Beauty Peps",
  description:
    "Questions about an order, a product or formulating with our pure peptides? The Beauty Peps team replies within one business day.",
  path: "/contact",
});

export default async function ContactPage() {
  const settings = await getSettings();

  return (
    <div className="container-bp pt-10 pb-24 md:pt-16">
      <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-8">
        <div className="space-y-12 lg:col-span-5">
          <header>
            <h1 className="display-type text-[clamp(2.75rem,1rem+5vw,5.75rem)]" data-reveal="">
              Contact us
            </h1>
            <p className="mt-5 max-w-[40ch] text-lead" data-reveal="" style={{ ["--reveal-i" as string]: 1 }}>
              Order questions, product advice or help formulating with our pure actives. A real person in our
              Melbourne studio replies within one business day.
            </p>
          </header>

          <section aria-labelledby="reach-heading" data-reveal="" style={{ ["--reveal-i" as string]: 2 }}>
            <h2 id="reach-heading" className="text-lead font-medium">
              Other ways to reach us
            </h2>
            <dl className="mt-4 grid gap-x-6 gap-y-3 text-body sm:grid-cols-[auto_1fr]">
              <dt className="text-muted">Email</dt>
              <dd>
                <a href={`mailto:${settings.supportEmail}`} className="underline underline-offset-4">
                  {settings.supportEmail}
                </a>
              </dd>
              {settings.supportPhone && (
                <>
                  <dt className="text-muted">Phone</dt>
                  <dd>
                    <a href={`tel:${settings.supportPhone.replace(/\s/g, "")}`} className="underline underline-offset-4">
                      {settings.supportPhone}
                    </a>
                  </dd>
                </>
              )}
              <dt className="text-muted">Studio</dt>
              <dd>{settings.businessAddress}</dd>
              <dt className="text-muted">Hours</dt>
              <dd>Monday to Friday, 9am to 5pm AEST</dd>
            </dl>
          </section>

          <section aria-labelledby="self-heading" data-reveal="" style={{ ["--reveal-i" as string]: 3 }}>
            <h2 id="self-heading" className="text-lead font-medium">
              Answers you can find now
            </h2>
            <ul className="mt-4 space-y-2 text-body">
              <li>
                <Link href="/track" className="underline underline-offset-4">
                  Track an order
                </Link>
                <span className="text-muted"> for status, payment and the parcel number.</span>
              </li>
              <li>
                <Link href="/faq" className="underline underline-offset-4">
                  Read the questions people ask
                </Link>
                <span className="text-muted"> about shipping, payment and using peptides.</span>
              </li>
            </ul>
          </section>
        </div>

        <section
          className="bg-surface p-5 md:p-10 lg:col-span-7"
          aria-labelledby="contact-form-heading"
          data-reveal=""
          style={{ ["--reveal-i" as string]: 1 }}
        >
          <h2 id="contact-form-heading" className="display-type mb-8 text-head">
            Send a message
          </h2>
          <Suspense fallback={<ContactForm />}>
            <SignedInContactForm />
          </Suspense>
        </section>
      </div>

      <section className="mt-24 md:mt-32" aria-labelledby="studio-heading">
        <div className="mb-10 grid grid-cols-1 gap-4 lg:grid-cols-12">
          <h2 id="studio-heading" className="display-type text-head lg:col-span-7" data-reveal="">
            Where your message lands
          </h2>
          <p className="text-body lg:col-span-4 lg:col-start-9 lg:self-end" data-reveal="" style={{ ["--reveal-i" as string]: 1 }}>
            The same small team that weighs the actives, mixes each batch and packs your parcel reads every message.
          </p>
        </div>
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-12">
          {STUDIO.map((photo, i) => (
            <li key={photo.src} className={photo.span}>
              <figure>
                <div className={`shutter relative overflow-hidden bg-surface-2 ${photo.aspect}`}>
                  <Image src={photo.src} alt={photo.alt} fill sizes={photo.sizes} className="object-cover" />
                </div>
                <figcaption className="mt-3 text-body text-muted" data-reveal="" style={{ ["--reveal-i" as string]: i }}>
                  {photo.caption}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

const STUDIO = [
  {
    src: "/images/editorial/lab.webp",
    alt: "The formulation bench in the Beauty Peps studio",
    caption: "The bench where every batch is mixed.",
    span: "col-span-2 md:col-span-6",
    aspect: "aspect-[3/2]",
    sizes: "(min-width: 768px) 50vw, 100vw",
  },
  {
    src: "/images/editorial/actives.webp",
    alt: "Vials of pure peptide powder lined up beside a scale",
    caption: "Pure actives, weighed to the milligram.",
    span: "md:col-span-3",
    aspect: "aspect-[4/5]",
    sizes: "(min-width: 768px) 25vw, 50vw",
  },
  {
    src: "/images/editorial/unboxing.webp",
    alt: "A packed parcel of three serums in tissue paper",
    caption: "Packed by hand in Melbourne.",
    span: "md:col-span-3",
    aspect: "aspect-[4/5]",
    sizes: "(min-width: 768px) 25vw, 50vw",
  },
];

/** Signed-in customers get their name and email filled in; the form itself is in the static page. */
async function SignedInContactForm() {
  const user = await getCurrentUser();
  return (
    <ContactForm
      defaultEmail={user?.email}
      defaultName={user ? `${user.firstName} ${user.lastName}`.trim() : undefined}
    />
  );
}
