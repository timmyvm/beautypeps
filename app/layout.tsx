import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-bodoni",
  display: "swap",
  style: ["normal", "italic"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Beauty Peps — Clinical Beauty Peptides",
    template: "%s · Beauty Peps",
  },
  description:
    "Beauty Peps formulates high-concentration cosmetic peptides — GHK-Cu, Matrixyl, Argireline, SNAP-8 and more — with a free peptide library and evidence-led guides.",
  openGraph: {
    type: "website",
    siteName: "Beauty Peps",
    images: ["/images/editorial/hero.webp"],
  },
};

export const viewport: Viewport = {
  themeColor: "#f6f1ea",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-AU" className={`${inter.variable} ${bodoni.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
