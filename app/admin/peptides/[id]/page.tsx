import { eq } from "drizzle-orm";
import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/catalog/confirm-button";
import { Notice } from "@/components/admin/catalog/notice";
import { PeptideForm } from "@/components/admin/catalog/peptide-form";
import { AdminPageHeader } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { deletePeptideAction } from "@/lib/actions/admin/peptides";
import { db } from "@/lib/db";
import { peptides } from "@/lib/db/schema";
import { formatDateTime } from "@/lib/format";
import { productsUsingPeptide } from "@/lib/queries/admin-catalog";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const peptide = await db.query.peptides.findFirst({ where: eq(peptides.id, id), columns: { name: true } });
  return { title: peptide ? `Edit ${peptide.name}` : "Peptide not found" };
}

export default async function EditPeptidePage({ params, searchParams }: Props) {
  const [{ id }, { saved }] = await Promise.all([params, searchParams]);
  const peptide = await db.query.peptides.findFirst({ where: eq(peptides.id, id) });
  if (!peptide) notFound();
  const usedBy = await productsUsingPeptide(peptide.slug);

  return (
    <>
      <AdminPageHeader
        back={{ href: "/admin/peptides", label: "Peptide library" }}
        title={
          <span className="flex flex-wrap items-center gap-3">
            {peptide.name}
            {peptide.published ? <Badge tone="sage">Published</Badge> : <Badge tone="amber">Hidden</Badge>}
          </span>
        }
        description={
          <>
            {peptide.inciName} · updated {formatDateTime(peptide.updatedAt)}
            {usedBy.length > 0 && (
              <>
                {" "}
                · in{" "}
                {usedBy.map((p, i) => (
                  <span key={p.id}>
                    {i > 0 && ", "}
                    <Link href={`/admin/products/${p.id}`} className="underline underline-offset-2 hover:text-espresso">
                      {p.name}
                    </Link>
                  </span>
                ))}
              </>
            )}
          </>
        }
        actions={
          <>
            {peptide.published && (
              <Link href={`/peptides/${peptide.slug}`} target="_blank" className={buttonClasses({ variant: "outline", size: "sm", className: "bg-surface-2 hover:bg-stone" })}>
                <ExternalLink className="size-3.5" /> View on site
              </Link>
            )}
            <ConfirmButton
              action={deletePeptideAction.bind(null, peptide.id)}
              confirm="Delete this monograph permanently?"
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
      <PeptideForm peptide={peptide} />
    </>
  );
}
