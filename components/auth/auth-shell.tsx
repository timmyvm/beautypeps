import Image from "next/image";
import type { ReactNode } from "react";

/**
 * Frame for sign in / register / password pages: one heading, the form, one picture.
 * The picture is the house specimen — the GHK-Cu serum on its travertine plinth — on a stone tile,
 * named like an entry in the catalogue.
 */
export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="container-bp py-10 md:py-16">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col justify-center lg:py-10">
          <div className="w-full max-w-md">
            <h1 className="display-type text-head text-ink">{title}</h1>
            {description && <p className="mt-4 text-[17px] leading-relaxed text-ink">{description}</p>}
            <div className="mt-10">{children}</div>
            {footer && <div className="mt-12 text-[15px] text-ink">{footer}</div>}
          </div>
        </div>

        <figure className="relative h-80 bg-field-stone sm:h-[28rem] lg:h-auto lg:min-h-[40rem]">
          <Image
            src="/images/specimens/trim/ghk-cu-copper-peptide-serum.webp"
            alt="GHK-Cu Copper Peptide Serum, a sapphire-blue serum in a glass bottle with a copper collar, on a travertine plinth"
            fill
            priority
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-contain p-[14%]"
          />
          <figcaption className="absolute inset-x-0 bottom-0 flex items-baseline justify-between gap-4 p-5 text-[15px] text-ink sm:p-6">
            <span>GHK-Cu Copper Peptide Serum</span>
            <span className="tabular-nums">1% GHK-Cu</span>
          </figcaption>
        </figure>
      </div>
    </div>
  );
}
