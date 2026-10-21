import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ variant = "dark", className }: { variant?: "dark" | "light"; className?: string }) {
  return (
    <Link href="/" aria-label="Beauty Peps — home" className={cn("inline-flex shrink-0", className)}>
      {/* Drawn 28–32px tall: an intrinsic size at that scale keeps the srcset to a small 1x/2x pair (128w/256w). */}
      <Image
        src={variant === "light" ? "/images/brand/logo-wordmark-light.png" : "/images/brand/logo-wordmark.png"}
        alt="Beauty Peps"
        width={114}
        height={28}
        loading="eager"
        className="h-7 w-auto md:h-8"
      />
    </Link>
  );
}
