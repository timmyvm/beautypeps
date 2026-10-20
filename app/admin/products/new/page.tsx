import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/catalog/product-form";
import { AdminPageHeader } from "@/components/admin/ui";
import { listCategoryOptions, listPeptideOptions } from "@/lib/queries/admin-catalog";

export const metadata: Metadata = { title: "New product" };

export default async function NewProductPage() {
  const [categories, peptides] = await Promise.all([listCategoryOptions(), listPeptideOptions()]);
  return (
    <>
      <AdminPageHeader
        title="New product"
        description="New products start as drafts — set the status to Active when you're ready to sell."
        back={{ href: "/admin/products", label: "Products" }}
      />
      <ProductForm product={null} categories={categories} peptides={peptides} />
    </>
  );
}
