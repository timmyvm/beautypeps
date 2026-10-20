import type { Metadata } from "next";
import { DiscountForm } from "@/components/admin/ops/discount-form";
import { Toaster } from "@/components/admin/ops/toast";
import { AdminPageHeader } from "@/components/admin/ui";

export const metadata: Metadata = { title: "New discount" };

export default function NewDiscountPage() {
  return (
    <>
      <Toaster />
      <AdminPageHeader title="New discount" back={{ href: "/admin/discounts", label: "Discounts" }} />
      <DiscountForm />
    </>
  );
}
