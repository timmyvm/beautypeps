import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CategoryForm } from "@/components/admin/catalog/category-form";
import { Notice } from "@/components/admin/catalog/notice";
import { AdminPageHeader, DataTable, Panel } from "@/components/admin/ui";
import { EmptyState } from "@/components/ui/misc";
import { listCategoriesWithCounts } from "@/lib/queries/admin-catalog";

export const metadata: Metadata = { title: "Categories" };

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; moved?: string }>;
}) {
  const [sp, rows] = await Promise.all([searchParams, listCategoriesWithCounts()]);

  return (
    <>
      <AdminPageHeader title="Categories" description="Group products in the shop navigation and filters." />
      <Notice value={sp.notice} />
      {sp.moved && (
        <p className="-mt-3 mb-6 text-xs text-cocoa">
          {sp.moved} product{sp.moved === "1" ? " is" : "s are"} now uncategorised —{" "}
          <Link href="/admin/products?category=none" className="underline underline-offset-4">
            review them
          </Link>
          .
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div>
          {rows.length === 0 ? (
            <EmptyState title="No categories yet" description="Create your first category with the form." />
          ) : (
            <DataTable>
              <thead>
                <tr>
                  <th className="w-20">
                    <span className="sr-only">Image</span>
                  </th>
                  <th>Category</th>
                  <th className="text-right">Products</th>
                  <th className="text-right">Order</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="relative h-10 w-14 overflow-hidden rounded-lg bg-ivory">
                        {c.image && <Image src={c.image} alt="" fill sizes="56px" className="object-cover" unoptimized={!c.image.startsWith("/images/")} />}
                      </div>
                    </td>
                    <td>
                      <Link href={`/admin/categories/${c.id}`} className="font-medium text-espresso hover:text-copper-dark">
                        {c.name}
                      </Link>
                      <p className="text-xs text-taupe">
                        /{c.slug}
                        {c.tagline ? ` · ${c.tagline}` : ""}
                      </p>
                    </td>
                    <td className="text-right">
                      <Link href={`/admin/products?category=${c.id}`} className="tabular-nums hover:underline">
                        {c.productCount}
                      </Link>
                    </td>
                    <td className="text-right text-cocoa tabular-nums">{c.sortOrder}</td>
                    <td className="text-right">
                      <Link href={`/admin/categories/${c.id}`} className="text-xs font-medium text-copper-dark hover:underline">
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          )}
        </div>
        <Panel title="New category" className="h-fit">
          <CategoryForm category={null} />
        </Panel>
      </div>
    </>
  );
}
