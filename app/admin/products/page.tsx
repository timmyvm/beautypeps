import { AlertTriangle, Copy, Plus, Search, Star } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ConfirmButton } from "@/components/admin/catalog/confirm-button";
import { Notice } from "@/components/admin/catalog/notice";
import { AdminPageHeader, DataTable, FilterTabs, Pagination } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { ButtonLink, buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { duplicateProductAction, setProductStatusAction } from "@/lib/actions/admin/products";
import type { ProductStatus } from "@/lib/db/schema";
import { formatDate, formatMoney } from "@/lib/format";
import { listAdminProducts, listCategoryOptions, lowStockCount, productStatusCounts } from "@/lib/queries/admin-catalog";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Products" };

const STATUS_TONE: Record<ProductStatus, "sage" | "neutral" | "amber"> = {
  active: "sage",
  draft: "amber",
  archived: "neutral",
};

type SP = { q?: string; status?: string; category?: string; low?: string; page?: string; notice?: string };

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const [{ rows, total, page, pageCount }, counts, categories, lowCount] = await Promise.all([
    listAdminProducts({ ...sp, page: Number(sp.page) || 1 }),
    productStatusCounts(),
    listCategoryOptions(),
    lowStockCount(),
  ]);
  const filtersActive = !!(sp.q || sp.status || sp.category || sp.low);
  const { notice, ...persist } = sp;

  return (
    <>
      <AdminPageHeader
        title="Products"
        description={`${counts.all} products in the catalogue · ${counts.active} live in the store`}
        actions={
          <ButtonLink href="/admin/products/new" variant="dark" size="sm">
            <Plus className="size-4" /> New product
          </ButtonLink>
        }
      />
      <Notice value={notice} />

      {lowCount > 0 && !sp.low && (
        <Link
          href="/admin/products?low=1"
          className="mb-5 flex items-center gap-2 border border-surface-2 bg-white px-4 py-3 text-[14px] text-ink hover:bg-surface-2/40"
        >
          <AlertTriangle className="size-4" aria-hidden />
          {lowCount} active product{lowCount === 1 ? " is" : "s are"} at or below the low-stock threshold — review stock
        </Link>
      )}

      <FilterTabs
        basePath="/admin/products"
        param="status"
        current={sp.status}
        searchParams={persist}
        options={[
          { value: "", label: "All", count: counts.all },
          { value: "active", label: "Active", count: counts.active },
          { value: "draft", label: "Draft", count: counts.draft },
          { value: "archived", label: "Archived", count: counts.archived },
        ]}
      />

      <form method="get" className="mb-5 flex flex-wrap items-center gap-2">
        {sp.status && <input type="hidden" name="status" value={sp.status} />}
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <input
            name="q"
            defaultValue={sp.q}
            placeholder="Search name, SKU or slug"
            aria-label="Search products"
            className="h-10 w-full border border-stone bg-white pr-4 pl-10 text-sm placeholder:text-muted focus:border-ink focus:outline-none"
          />
        </div>
        <select
          name="category"
          defaultValue={sp.category ?? ""}
          aria-label="Category"
          className="select-chevron h-10 appearance-none border border-stone bg-white pr-10 pl-4 text-sm focus:border-ink focus:outline-none"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
          <option value="none">Uncategorised</option>
        </select>
        <label className="flex h-10 items-center gap-2 border border-stone bg-white px-4 text-sm text-muted">
          <input type="checkbox" name="low" value="1" defaultChecked={!!sp.low} className="accent-ink" />
          Low stock
        </label>
        <button type="submit" className={buttonClasses({ variant: "outline", size: "sm", className: "h-10 bg-surface-2 hover:bg-stone" })}>
          Filter
        </button>
        {filtersActive && (
          <Link href="/admin/products" className="px-2 text-[13px] text-muted underline underline-offset-4">
            Clear
          </Link>
        )}
      </form>

      {rows.length === 0 ? (
        <EmptyState
          title={filtersActive ? "No products match" : "No products yet"}
          description={filtersActive ? "Try a different search or filter." : "Create your first product to start selling."}
          action={!filtersActive ? <ButtonLink href="/admin/products/new" variant="dark" size="sm">New product</ButtonLink> : undefined}
        />
      ) : (
        <>
          <DataTable>
            <thead>
              <tr>
                <th className="w-16">
                  <span className="sr-only">Image</span>
                </th>
                <th>Product</th>
                <th>Category</th>
                <th className="text-right">Price</th>
                <th className="text-right">Stock</th>
                <th>Status</th>
                <th>Updated</th>
                <th className="text-right">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const low = p.stock <= p.lowStockThreshold;
                return (
                  <tr key={p.id}>
                    <td>
                      <Link href={`/admin/products/${p.id}`} className="relative block size-12 overflow-hidden rounded-lg bg-surface">
                        <Image src={p.image} alt="" fill sizes="48px" className="object-cover" unoptimized={!p.image.startsWith("/images/")} />
                      </Link>
                    </td>
                    <td className="max-w-72">
                      <Link href={`/admin/products/${p.id}`} className="flex items-center gap-1.5 font-medium text-ink hover:underline">
                        <span className="truncate">{p.name}</span>
                        {p.featured && <Star className="size-3.5 shrink-0 fill-ink text-ink" aria-label="Featured" />}
                      </Link>
                      <p className="text-[13px] text-muted">{p.sku}</p>
                    </td>
                    <td className="text-muted">{p.categoryName ?? <span className="text-muted">—</span>}</td>
                    <td className="text-right whitespace-nowrap">
                      {formatMoney(p.price)}
                      {p.compareAtPrice && p.compareAtPrice > p.price && (
                        <span className="block text-[13px] text-muted line-through">{formatMoney(p.compareAtPrice)}</span>
                      )}
                    </td>
                    <td className="text-right whitespace-nowrap">
                      <span
                        className={cn(
                          "tabular-nums",
                          p.stock <= 0 ? "font-medium text-danger" : low ? "font-medium text-amber" : "text-ink",
                        )}
                      >
                        {p.stock <= 0 ? "Sold out" : p.stock}
                      </span>
                      {low && p.stock > 0 && <span className="block text-[13px] text-amber">Low</span>}
                    </td>
                    <td>
                      {/* the routine state reads as text; only the exceptions carry a mark */}
                      {p.status === "active" ? (
                        <span className="text-muted">Active</span>
                      ) : (
                        <Badge tone={STATUS_TONE[p.status]} className="capitalize">
                          {p.status}
                        </Badge>
                      )}
                    </td>
                    <td className="whitespace-nowrap text-muted">{formatDate(p.updatedAt)}</td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/products/${p.id}`} className={buttonClasses({ variant: "ghost", size: "sm" })}>
                          Edit
                        </Link>
                        <form action={duplicateProductAction.bind(null, p.id)}>
                          <button type="submit" title="Duplicate" aria-label={`Duplicate ${p.name}`} className={buttonClasses({ variant: "ghost", size: "sm", className: "px-3" })}>
                            <Copy className="size-3.5" />
                          </button>
                        </form>
                        {p.status !== "archived" && (
                          <ConfirmButton
                            action={setProductStatusAction.bind(null, p.id, "archived")}
                            confirm="Archive?"
                            confirmLabel="Archive"
                            variant="ghost"
                          >
                            Archive
                          </ConfirmButton>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </DataTable>
          <p className="mt-3 text-[13px] text-muted">{total} result{total === 1 ? "" : "s"}</p>
          <Pagination page={page} pageCount={pageCount} basePath="/admin/products" searchParams={persist} />
        </>
      )}
    </>
  );
}
