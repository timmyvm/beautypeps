import { OG_SIZE, ogCard } from "@/lib/og";

export const alt = "A vial of GHK-Cu, blue copper peptide powder, beside the words Beauty peptides, graded";
export const size = OG_SIZE;
export const contentType = "image/jpeg";

export default function Image() {
  return ogCard({
    title: "Beauty peptides, graded",
    facts: ["by the vial", "an evidence grade for each", "sent from Melbourne"],
    image: "/images/specimens/trim/ghk-cu-50mg.webp",
    tone: "stone",
  });
}
