import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DiscountForm } from "@/components/admin/ops/discount-form";
import { Toaster } from "@/components/admin/ops/toast";
import { AdminPageHeader } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { discounts } from "@/lib/db/schema";

type Props = { params: Promise<{ id: string }> };

async function load(id: string) {
  return db.query.discounts.findFirst({ where: eq(discounts.id, id) });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const d = await load((await params).id);
  return { title: d ? `Discount ${d.code}` : "Discount not found" };
}

export default async function EditDiscountPage({ params }: Props) {
  const discount = await load((await params).id);
  if (!discount) notFound();
  return (
    <>
      <Toaster />
      <AdminPageHeader
        title={discount.code}
        description={`Used ${discount.usedCount} ${discount.usedCount === 1 ? "time" : "times"}.`}
        back={{ href: "/admin/discounts", label: "Discounts" }}
      />
      <DiscountForm discount={discount} />
    </>
  );
}
