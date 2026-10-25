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

      {/* The place: the studio window in Melbourne, then the bench and the packing table */}
      <section className="mt-24 grid grid-cols-1 gap-10 md:mt-32 lg:grid-cols-12 lg:gap-[var(--gutter)]" aria-labelledby="studio-heading">
        <figure className="lg:col-span-5">
          <div className="shutter relative aspect-[4/5] overflow-hidden bg-surface-2">
            <Image
              src="/images/editorial/melbourne-sill.webp"
              alt="Amber vials and a beaker on a bluestone window sill, the Melbourne skyline outside"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </div>
          <figcaption className="mt-3 text-body text-muted" data-reveal="">
            The studio window, in Melbourne. Messages are read a few steps from here.
          </figcaption>
        </figure>
        <div className="flex flex-col lg:col-span-6 lg:col-start-7">
          <h2 id="studio-heading" className="display-type text-head" data-reveal="">
            Where your message lands
          </h2>
          <p className="mt-6 max-w-[44ch] text-lead" data-reveal="" style={{ ["--reveal-i" as string]: 1 }}>
            The same small team that weighs the actives, mixes each batch and packs your parcel reads every message.
          </p>
          <ul className="mt-12 grid grid-cols-2 gap-3 lg:mt-auto lg:pt-12">
            {STUDIO.map((photo, i) => (
              <li key={photo.src}>
                <figure>
                  <div className="shutter relative aspect-[4/5] overflow-hidden bg-surface-2">
                    <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
                  </div>
                  <figcaption className="mt-3 text-body text-muted" data-reveal="" style={{ ["--reveal-i" as string]: i }}>
                    {photo.caption}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

const STUDIO = [
  {
    src: "/images/editorial/lab.webp",
    alt: "The formulation bench in the Beauty Peps studio",
    caption: "The bench where every batch is mixed.",
  },
  {
    src: "/images/editorial/unboxing.webp",
    alt: "A packed parcel of three serums in tissue paper",
    caption: "Packed by hand in Melbourne.",
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
