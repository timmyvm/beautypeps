import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { EvidenceDots } from "@/components/admin/catalog/evidence";
import { Notice } from "@/components/admin/catalog/notice";
import { AdminPageHeader, DataTable } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { PEPTIDE_CLASSES } from "@/lib/constants";
import { listPeptidesWithUsage } from "@/lib/queries/admin-catalog";

export const metadata: Metadata = { title: "Peptide library" };

export default async function AdminPeptidesPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  const [{ notice }, rows] = await Promise.all([searchParams, listPeptidesWithUsage()]);
  const published = rows.filter((r) => r.published).length;

  return (
    <>
      <AdminPageHeader
        title="Peptide library"
        description={`${rows.length} monographs · ${published} published at /peptides`}
        actions={
          <ButtonLink href="/admin/peptides/new" variant="dark" size="sm">
            <Plus className="size-4" /> New peptide
          </ButtonLink>
        }
      />
      <Notice value={notice} />

      {rows.length === 0 ? (
        <EmptyState
          title="No peptides yet"
          description="Monographs power the public Peptide Library and the “peptides in this formula” section on products."
          action={<ButtonLink href="/admin/peptides/new" variant="dark" size="sm">New peptide</ButtonLink>}
        />
      ) : (
        <DataTable>
          <thead>
            <tr>
              <th>Peptide</th>
              <th>Class</th>
              <th>Evidence</th>
              <th className="text-right">Products</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                <td>
                  <Link href={`/admin/peptides/${p.id}`} className="font-medium text-espresso hover:text-copper-dark">
                    {p.name}
                  </Link>
                  <p className="text-[13px] text-taupe">{p.inciName}</p>
                </td>
                <td className="text-muted">{PEPTIDE_CLASSES[p.peptideClass]?.label ?? p.peptideClass}</td>
                <td>
                  <EvidenceDots level={p.evidenceLevel} />
                </td>
                <td className="text-right tabular-nums">
                  {p.productCount > 0 ? p.productCount : <span className="text-taupe">0</span>}
                </td>
                <td>{p.published ? <Badge tone="sage">Published</Badge> : <Badge tone="amber">Hidden</Badge>}</td>
                <td className="text-right">
                  <Link href={`/admin/peptides/${p.id}`} className="text-[13px] font-medium text-copper-dark hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      )}
    </>
  );
}
