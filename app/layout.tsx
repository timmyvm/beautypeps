import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { RevealObserver } from "@/components/site/reveal-observer";
import "./globals.css";

// Chillax (Indian Type Foundry, via Fontshare), self-hosted.
const chillax = localFont({
  src: [
    { path: "./fonts/Chillax-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Chillax-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/Chillax-Semibold.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-chillax",
  display: "swap",
  fallback: ["Helvetica Neue", "Arial", "sans-serif"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Beauty Peps — Beauty peptides, graded",
    template: "%s · Beauty Peps",
  },
  description:
    "GHK-Cu, SNAP-8 and glutathione by the vial, sent from Melbourne, with an open library grading the evidence for 13 cosmetic peptides.",
  applicationName: "Beauty Peps",
  // Preview pictures come from the opengraph-image routes (a site card here, one per product, peptide and article).
  openGraph: { type: "website", siteName: "Beauty Peps", locale: "en_AU" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

// Marks the document as script-enabled before first paint, so entrance states never hide content without JS.
const jsFlag = `document.documentElement.classList.add('js')`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-AU" className={chillax.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: jsFlag }} />
      </head>
      <body className="min-h-dvh">
        {children}
        <RevealObserver />
      </body>
    </html>
  );
}
