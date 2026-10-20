import type { categories } from "../db/schema";

export type SeedCategory = Omit<typeof categories.$inferInsert, "id">;

export const seedCategories: SeedCategory[] = [
  {
    slug: "serums",
    name: "Peptide Serums",
    tagline: "High-concentration, single-mission serums.",
    description:
      "Lightweight water-based serums built around one hero peptide (or a deliberately paired complex) at the concentrations used in the published research. Fragrance-free, layer-friendly and made in small batches.",
    image: "/images/products/ghk-cu-copper-peptide-serum.webp",
    sortOrder: 1,
  },
  {
    slug: "treatments",
    name: "Targeted Treatments",
    tagline: "Peptides for the eye area, lips, scalp and overnight repair.",
    description:
      "Textures designed for specific zones — a cooling eye gel, a plumping lip balm, a scalp serum and a barrier-supporting night cream — each pairing peptides with the supporting ingredients that area needs.",
    image: "/images/products/peptide-night-cream.webp",
    sortOrder: 2,
  },
  {
    slug: "pure-actives",
    name: "Pure Actives",
    tagline: "Cosmetic-grade lyophilised peptides for formulators.",
    description:
      "The same peptide raw materials we formulate with, supplied as freeze-dried powders in amber glass for DIY and professional cosmetic formulators. Each comes with solubility, use-level and pH guidance. For cosmetic formulation and external use only.",
    image: "/images/editorial/actives.webp",
    sortOrder: 3,
  },
  {
    slug: "kits",
    name: "Kits & Sets",
    tagline: "Complete routines, better value.",
    description:
      "Curated combinations of our serums and treatments that are designed to be used together — with a saving over buying them individually.",
    image: "/images/products/copper-ritual-kit.webp",
    sortOrder: 4,
  },
];
