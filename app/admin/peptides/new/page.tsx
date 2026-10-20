import type { Metadata } from "next";
import { PeptideForm } from "@/components/admin/catalog/peptide-form";
import { AdminPageHeader } from "@/components/admin/ui";

export const metadata: Metadata = { title: "New peptide" };

export default function NewPeptidePage() {
  return (
    <>
      <AdminPageHeader
        title="New peptide"
        description="Write a monograph for the public Peptide Library. Keep claims to what published research supports."
        back={{ href: "/admin/peptides", label: "Peptide library" }}
      />
      <PeptideForm peptide={null} />
    </>
  );
}
