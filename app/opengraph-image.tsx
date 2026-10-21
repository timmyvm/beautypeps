import { OG_SIZE, ogCard } from "@/lib/og";

export const alt = "The GHK-Cu copper peptide serum on a travertine tile, beside the words Peptide serums, graded";
export const size = OG_SIZE;
export const contentType = "image/jpeg";

export default function Image() {
  return ogCard({
    title: "Peptide serums, graded",
    facts: ["13 cosmetic peptides", "an evidence grade for each", "made in Melbourne"],
    image: "/images/specimens/trim/ghk-cu-copper-peptide-serum.webp",
    tone: "stone",
  });
}
