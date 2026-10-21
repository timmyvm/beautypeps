/*
 * Cache tags for data shown on the public site. Public pages prerender with this data baked in;
 * admin edits expire a tag (updateTag) so the next visit sees the change, and orders refresh the
 * catalogue's stock in the background (revalidateTag … "max").
 */
export const TAGS = {
  /** Products, categories, approved reviews and ratings. */
  catalog: "catalog",
  /** Peptide Library monographs and Journal articles. */
  content: "content",
  /** Store settings (announcement, shipping, payment details, contact). */
  settings: "settings",
} as const;
