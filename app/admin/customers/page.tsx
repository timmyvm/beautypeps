import { Download, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader, DataTable, FilterTabs, Pagination } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/form";
import { EmptyState } from "@/components/ui/misc";
import { formatDate, formatMoney } from "@/lib/format";
import { listCustomers, parsePage } from "@/lib/queries/admin-ops";

export const metadata: Metadata = { title: "Customers" };

type Params = { q?: string; filter?: string; sort?: string; page?: string };

export default async function AdminCustomersPage({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams;
  const page = parsePage(sp.page);
  const { rows, total, pageCount, counts } = await listCustomers({ ...sp, page });

  const qs = new URLSearchParams();
  for (const k of ["q", "filter", "sort"] as const) if (sp[k]) qs.set(k, sp[k]!);

  return (
    <>
      <AdminPageHeader
        title="Customers"
        description={`${total} ${total === 1 ? "account" : "accounts"}${sp.q ? ` matching “${sp.q}”` : ""}.`}
        actions={
          <a
            href={`/admin/customers/export${qs.size ? `?${qs}` : ""}`}
            className={buttonClasses({ variant: "outline", size: "sm" })}
          >
            <Download className="size-4" /> Export CSV
          </a>
        }
      />

      <FilterTabs
        basePath="/admin/customers"
        param="filter"
        current={sp.filter}
        searchParams={sp}
        options={[
          { value: "", label: "All", count: counts.all },
          { value: "customers", label: "Customers", count: counts.customers },
          { value: "admins", label: "Admins", count: counts.admins },
          { value: "disabled", label: "Disabled", count: counts.disabled },
        ]}
      />

      <form className="mb-5 flex flex-wrap items-end gap-3" role="search">
        {sp.filter && <input type="hidden" name="filter" value={sp.filter} />}
        <label className="relative min-w-60 flex-1">
          <span className="sr-only">Search customers</span>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-taupe" aria-hidden />
          <Input name="q" defaultValue={sp.q} placeholder="Name, email or phone…" className="pl-10" />
        </label>
        <label className="text-xs text-cocoa">
          <span className="sr-only">Sort</span>
          <Select name="sort" defaultValue={sp.sort ?? ""} className="w-44">
            <option value="">Newest first</option>
            <option value="spent">Top spenders</option>
            <option value="orders">Most orders</option>
          </Select>
        </label>
        <button type="submit" className={buttonClasses()}>
          Apply
        </button>
      </form>

      {rows.length === 0 ? (
        <EmptyState title="No customers found" description="Try a different search or filter." />
      ) : (
        <DataTable>
          <thead>
            <tr>
              <th>Customer</th>
              <th className="text-right">Orders</th>
              <th className="text-right">Total spent</th>
              <th>Last order</th>
              <th>Joined</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id}>
                <td className="max-w-72">
                  <Link href={`/admin/customers/${c.id}`} className="block truncate font-medium text-espresso hover:text-copper-dark">
                    {[c.firstName, c.lastName].filter(Boolean).join(" ") || "—"}
                  </Link>
                  <span className="block truncate text-xs text-taupe">{c.email}</span>
                </td>
                <td className="text-right tabular-nums">{c.orderCount}</td>
                <td className="text-right font-medium tabular-nums">{formatMoney(c.spent)}</td>
                <td className="whitespace-nowrap text-cocoa">{c.lastOrder ? formatDate(c.lastOrder) : "—"}</td>
                <td className="whitespace-nowrap text-cocoa">{formatDate(c.createdAt)}</td>
                <td>
                  <span className="flex flex-wrap gap-1">
                    {c.role === "admin" && <Badge tone="copper">Admin</Badge>}
                    {c.disabled ? <Badge tone="danger">Disabled</Badge> : <Badge tone="sage">Active</Badge>}
                    {c.marketingOptIn && <Badge tone="sapphire">Marketing</Badge>}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      )}

      <Pagination page={page} pageCount={pageCount} basePath="/admin/customers" searchParams={sp} />
    </>
  );
}
