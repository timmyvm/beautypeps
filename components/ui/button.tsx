import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "copper" | "dark" | "outline" | "ghost" | "danger" | "light";
type Size = "sm" | "md" | "lg";

// One button shape on the whole site: a flat, square-cornered rectangle. No outlines, no shadows.
const variants: Record<Variant, string> = {
  primary: "bg-accent text-accent-ink hover:bg-accent-strong",
  copper: "bg-accent text-accent-ink hover:bg-accent-strong",
  dark: "bg-ink text-white hover:bg-black",
  outline: "bg-surface text-ink hover:bg-surface-2",
  ghost: "text-ink hover:bg-surface",
  danger: "bg-danger text-white hover:bg-danger/90",
  light: "bg-white text-ink hover:bg-surface",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-4 text-small",
  md: "h-12 px-6 text-body",
  lg: "h-14 px-8 text-body",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: { variant?: Variant; size?: Size; className?: string } = {}) {
  return cn(
    "press inline-flex items-center justify-center gap-2 rounded-none font-medium whitespace-nowrap",
    "disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );
}

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button type={type} className={buttonClasses({ variant, size, className })} {...props} />;
}

export function ButtonLink({
  variant,
  size,
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={buttonClasses({ variant, size, className })} {...props} />;
}
