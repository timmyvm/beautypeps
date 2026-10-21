import { eq } from "drizzle-orm";
import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryForm } from "@/components/admin/catalog/category-form";
import { ConfirmButton } from "@/components/admin/catalog/confirm-button";
import { Notice } from "@/components/admin/catalog/notice";
import { AdminPageHeader, Panel } from "@/components/admin/ui";
import { buttonClasses } from "@/components/ui/button";
import { deleteCategoryAction } from "@/lib/actions/admin/categories";
import { db } from "@/lib/db";
import { categories, products } from "@/lib/db/schema";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const category = await db.query.categories.findFirst({ where: eq(categories.id, id), columns: { name: true } });
  return { title: category ? `Edit ${category.name}` : "Category not found" };
}

export default async function EditCategoryPage({ params, searchParams }: Props) {
  const [{ id }, { saved }] = await Promise.all([params, searchParams]);
  const category = await db.query.categories.findFirst({ where: eq(categories.id, id) });
  if (!category) notFound();
  const inCategory = await db
    .select({ id: products.id, name: products.name, status: products.status })
    .from(products)
    .where(eq(products.categoryId, id));

  return (
    <>
      <AdminPageHeader
        back={{ href: "/admin/categories", label: "Categories" }}
        title={category.name}
        description={`${inCategory.length} product${inCategory.length === 1 ? "" : "s"} in this category`}
        actions={
          <>
            <Link href={`/shop?category=${category.slug}`} target="_blank" className={buttonClasses({ variant: "outline", size: "sm", className: "bg-surface-2 hover:bg-stone" })}>
              <ExternalLink className="size-3.5" /> View in shop
            </Link>
            <ConfirmButton
              action={deleteCategoryAction.bind(null, category.id)}
              confirm={
                inCategory.length
                  ? `Delete? ${inCategory.length} product${inCategory.length === 1 ? "" : "s"} will become uncategorised.`
                  : "Delete this category?"
              }
              confirmLabel="Delete"
              variant="ghost"
              className="text-danger hover:bg-danger-light"
            >
              Delete
            </ConfirmButton>
          </>
        }
      />
      <Notice value={saved} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Panel title="Details">
          <CategoryForm category={category} />
        </Panel>
        <Panel title="Products" className="h-fit">
          {inCategory.length === 0 ? (
            <p className="text-sm text-taupe">No products yet.</p>
          ) : (
            <ul className="space-y-2">
              {inCategory.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2 text-sm">
                  <Link href={`/admin/products/${p.id}`} className="truncate text-espresso hover:text-copper-dark">
                    {p.name}
                  </Link>
                  {p.status !== "active" && <span className="text-[13px] text-taupe capitalize">{p.status}</span>}
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
