import { Copy, ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/catalog/confirm-button";
import { Notice } from "@/components/admin/catalog/notice";
import { ProductForm } from "@/components/admin/catalog/product-form";
import { AdminPageHeader } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { deleteProductAction, duplicateProductAction, setProductStatusAction } from "@/lib/actions/admin/products";
import { formatDateTime } from "@/lib/format";
import {
  getAdminProduct,
  listCategoryOptions,
  listPeptideOptions,
  productOrderCount,
} from "@/lib/queries/admin-catalog";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getAdminProduct(id);
  return { title: product ? `Edit ${product.name}` : "Product not found" };
}

export default async function EditProductPage({ params, searchParams }: Props) {
  const [{ id }, { saved }] = await Promise.all([params, searchParams]);
  const [product, categories, peptides, orderCount] = await Promise.all([
    getAdminProduct(id),
    listCategoryOptions(),
    listPeptideOptions(),
    productOrderCount(id),
  ]);
  if (!product) notFound();

  return (
    <>
      <AdminPageHeader
        back={{ href: "/admin/products", label: "Products" }}
        title={
          <span className="flex flex-wrap items-center gap-3">
            {product.name}
            <Badge tone={product.status === "active" ? "sage" : product.status === "draft" ? "amber" : "neutral"} className="capitalize">
              {product.status}
            </Badge>
          </span>
        }
        description={`SKU ${product.sku} · in ${orderCount} order${orderCount === 1 ? "" : "s"} · updated ${formatDateTime(product.updatedAt)}`}
        actions={
          <>
            {product.status === "active" && (
              <Link href={`/products/${product.slug}`} target="_blank" className={buttonClasses({ variant: "outline", size: "sm", className: "bg-surface-2 hover:bg-stone" })}>
                <ExternalLink className="size-3.5" /> View on store
              </Link>
            )}
            <form action={duplicateProductAction.bind(null, product.id)}>
              <button type="submit" className={buttonClasses({ variant: "outline", size: "sm", className: "bg-surface-2 hover:bg-stone" })}>
                <Copy className="size-3.5" /> Duplicate
              </button>
            </form>
            {orderCount > 0 ? (
              product.status !== "archived" && (
                <ConfirmButton
                  action={setProductStatusAction.bind(null, product.id, "archived")}
                  confirm="Archive? It will be hidden from the store; order history is kept."
                  confirmLabel="Archive"
                  variant="ghost"
                >
                  Archive
                </ConfirmButton>
              )
            ) : (
              <ConfirmButton
                action={deleteProductAction.bind(null, product.id)}
                confirm="Delete permanently?"
                confirmLabel="Delete"
                variant="ghost"
                className="text-danger hover:bg-danger-light"
              >
                Delete
              </ConfirmButton>
            )}
          </>
        }
      />
      <Notice value={saved} />
      {/* Remount when status changes outside the form (e.g. Archive button) so the select stays in sync. */}
      <ProductForm key={product.status} product={product} categories={categories} peptides={peptides} />
    </>
  );
}
