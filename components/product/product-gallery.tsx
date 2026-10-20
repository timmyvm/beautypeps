"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, name, badge }: { images: string[]; name: string; badge?: string | null }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div className="flex flex-col gap-4 lg:sticky lg:top-28">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-ivory">
        <Image
          key={current}
          src={current}
          alt={name}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="animate-fade-up object-cover"
        />
        {badge && (
          <span className="absolute top-4 left-4 rounded-full bg-cream/90 px-3 py-1 text-[10px] font-semibold tracking-wider text-espresso uppercase backdrop-blur">
            {badge}
          </span>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-3" role="tablist" aria-label="Product images">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Show image ${i + 1}`}
              onClick={() => setActive(i)}
              className={cn(
                "relative aspect-[4/5] w-20 overflow-hidden rounded-xl bg-ivory ring-offset-2 ring-offset-cream transition",
                i === active ? "ring-2 ring-copper" : "opacity-70 hover:opacity-100",
              )}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
