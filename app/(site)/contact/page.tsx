import { Clock, HelpCircle, Mail, MapPin, PackageSearch, Phone } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ContactForm } from "@/components/shop/contact-form";
import { getCurrentUser } from "@/lib/auth/session";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Contact us",
  description:
    "Questions about an order, a product or formulating with our pure peptides? The Beauty Peps team replies within one business day.",
};

export default async function ContactPage() {
  const [settings, user] = await Promise.all([getSettings(), getCurrentUser()]);

  return (
    <div className="container-bp py-12 md:py-16">
      <div className="max-w-2xl">
        <p className="eyebrow mb-3">Contact</p>
        <h1 className="font-display text-4xl leading-tight text-espresso md:text-5xl">We&apos;re here to help</h1>
        <p className="mt-4 text-cocoa">
          Order questions, product advice or formulation help with our pure actives — a real person from our Melbourne
          studio will reply within one business day.
        </p>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[380px_1fr] lg:gap-14">
        <aside className="space-y-6">
          <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-ivory">
            <Image src="/images/editorial/lab.webp" alt="The Beauty Peps formulation studio" fill sizes="(min-width: 1024px) 380px, 100vw" className="object-cover" />
          </div>
          <ul className="space-y-4 rounded-2xl border border-stone/70 bg-cream p-6 text-sm">
            <li className="flex gap-3">
              <Mail className="mt-0.5 size-4 shrink-0 text-copper" aria-hidden />
              <a href={`mailto:${settings.supportEmail}`} className="text-espresso underline-offset-4 hover:underline">
                {settings.supportEmail}
              </a>
            </li>
            {settings.supportPhone && (
              <li className="flex gap-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-copper" aria-hidden />
                <a href={`tel:${settings.supportPhone.replace(/\s/g, "")}`} className="text-espresso">
                  {settings.supportPhone}
                </a>
              </li>
            )}
            <li className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-copper" aria-hidden />
              <span className="text-cocoa">{settings.businessAddress}</span>
            </li>
            <li className="flex gap-3">
              <Clock className="mt-0.5 size-4 shrink-0 text-copper" aria-hidden />
              <span className="text-cocoa">Monday–Friday, 9am–5pm AEST. Replies within 1 business day.</span>
            </li>
          </ul>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <Link href="/track" className="flex items-center gap-3 rounded-2xl bg-ivory p-5 hover:bg-sand">
              <PackageSearch className="size-5 text-copper" aria-hidden />
              <span>
                <span className="block text-sm font-medium text-espresso">Track an order</span>
                <span className="block text-xs text-cocoa">Status, payment and tracking</span>
              </span>
            </Link>
            <Link href="/faq" className="flex items-center gap-3 rounded-2xl bg-ivory p-5 hover:bg-sand">
              <HelpCircle className="size-5 text-copper" aria-hidden />
              <span>
                <span className="block text-sm font-medium text-espresso">Read the FAQ</span>
                <span className="block text-xs text-cocoa">Shipping, payment, usage and more</span>
              </span>
            </Link>
          </div>
        </aside>

        <section className="rounded-2xl border border-stone/70 bg-cream p-6 md:p-10" aria-labelledby="contact-form-heading">
          <h2 id="contact-form-heading" className="mb-6 font-display text-2xl text-espresso">
            Send us a message
          </h2>
          <ContactForm
            defaultEmail={user?.email}
            defaultName={user ? `${user.firstName} ${user.lastName}`.trim() : undefined}
          />
        </section>
      </div>
    </div>
  );
}
