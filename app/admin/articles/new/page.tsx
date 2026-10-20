import type { Metadata } from "next";
import { ArticleForm } from "@/components/admin/catalog/article-form";
import { AdminPageHeader } from "@/components/admin/ui";

export const metadata: Metadata = { title: "New article" };

export default function NewArticlePage() {
  return (
    <>
      <AdminPageHeader
        title="New article"
        description="Articles are saved as drafts until you switch on Published."
        back={{ href: "/admin/articles", label: "Journal" }}
      />
      <ArticleForm article={null} />
    </>
  );
}
