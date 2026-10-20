import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ variant = "dark", className }: { variant?: "dark" | "light"; className?: string }) {
  return (
    <Link href="/" aria-label="Beauty Peps — home" className={cn("inline-flex shrink-0", className)}>
      <Image
        src={variant === "light" ? "/images/brand/logo-wordmark-light.png" : "/images/brand/logo-wordmark.png"}
        alt="Beauty Peps"
        width={1229}
        height={301}
        priority
        className="h-7 w-auto md:h-8"
      />
    </Link>
  );
}
