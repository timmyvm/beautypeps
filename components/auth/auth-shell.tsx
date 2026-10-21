import { Check } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

const PERKS = [
  "Track orders and payment status in real time",
  "Save addresses for a faster checkout",
  "Keep a wishlist of the peptides you love",
  "Review products and see your order history",
];

/** Split-screen frame for sign in / register / password pages. */
export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="container-bp py-8 md:py-14">
      <div className="grid overflow-hidden rounded-2xl border border-stone/70 bg-cream lg:min-h-[680px] lg:grid-cols-2">
        <div className="flex flex-col justify-center px-5 py-10 sm:px-12 lg:px-16">
          <div className="mx-auto w-full max-w-md animate-fade-up">
            <p className="eyebrow mb-3">{eyebrow}</p>
            <h1 className="text-2xl font-semibold leading-tight text-espresso">{title}</h1>
            {description && <p className="mt-3 text-sm leading-relaxed text-muted">{description}</p>}
            <div className="mt-8">{children}</div>
            {footer && <div className="mt-8 border-t border-stone/60 pt-6 text-sm text-muted">{footer}</div>}
          </div>
        </div>

        <div className="relative hidden lg:block">
          <Image
            src="/images/editorial/ritual.webp"
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 0px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-ink/80 via-ink/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-10 xl:p-14">
            <p className="text-[0.7rem] font-semibold text-copper-light">
              Your Beauty Peps account
            </p>
            <p className="mt-3 max-w-sm text-2xl font-semibold leading-tight text-cream">
              Peptide care, tracked and tailored to you.
            </p>
            <ul className="mt-6 space-y-2.5">
              {PERKS.map((perk) => (
                <li key={perk} className="flex items-start gap-2.5 text-sm text-cream/85">
                  <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-copper/90">
                    <Check className="size-2.5 text-cream" aria-hidden />
                  </span>
                  {perk}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
