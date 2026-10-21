import type { Metadata } from "next";

export const SITE_NAME = "Beauty Peps";

/**
 * The site's own preview card (app/opengraph-image.tsx). A page that sets `openGraph` replaces its parents'
 * pictures, so pages without a card of their own name this one explicitly.
 */
export const SITE_CARD = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  type: "image/jpeg",
  alt: "The GHK-Cu copper peptide serum on a travertine tile, beside the words Peptide serums, graded",
};

/**
 * Metadata for an indexable page: its canonical URL, and the same title, description and picture for
 * link previews.
 */
export function pageMetadata({
  title,
  description,
  path,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type, url: path, siteName: SITE_NAME, locale: "en_AU", title, description, images: [SITE_CARD] },
    twitter: { card: "summary_large_image", title, description, images: [SITE_CARD] },
  };
}
