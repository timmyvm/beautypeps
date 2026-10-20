import { asc, inArray } from "drizzle-orm";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AuspostForm, type AuspostOrderRow } from "@/components/admin/ops/auspost-form";
import { AdminPageHeader } from "@/components/admin/ui";
import { AUSPOST_SENDER_COOKIE, type AuspostSender } from "@/lib/auspost";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { formatDate } from "@/lib/format";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Australia Post export" };

export default async function AuspostExportPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; marked?: string }>;
}) {
  const sp = await searchParams;
  const [rows, settings, jar] = await Promise.all([
    db.query.orders.findMany({
      where: inArray(orders.status, ["paid", "processing"]),
      orderBy: asc(orders.createdAt),
      with: { items: { columns: { quantity: true } } },
    }),
    getSettings(),
    cookies(),
  ]);

  let sender: AuspostSender = {
    name: settings.storeName,
    business: settings.storeName,
    line1: "",
    line2: "",
    suburb: "",
    state: "",
    postcode: "",
    phone: settings.supportPhone,
    email: settings.supportEmail,
  };
  try {
    const saved = jar.get(AUSPOST_SENDER_COOKIE)?.value;
    if (saved) sender = { ...sender, ...(JSON.parse(saved) as Partial<AuspostSender>) };
  } catch {
    // ignore malformed cookie
  }

  const data: AuspostOrderRow[] = rows.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    name: `${o.shippingAddress.firstName} ${o.shippingAddress.lastName}`,
    suburb: o.shippingAddress.suburb,
    state: o.shippingAddress.state,
    postcode: o.shippingAddress.postcode,
    method: o.shippingMethod,
    status: o.status as "paid" | "processing",
    units: o.items.reduce((s, i) => s + i.quantity, 0),
    placed: formatDate(o.createdAt),
  }));

  return (
    <>
      <AdminPageHeader
        title="Australia Post export"
        description="Build a MyPost Business bulk-import CSV for paid and packing orders."
        back={{ href: "/admin/orders", label: "Orders" }}
      />
      {sp.error && (
        <div role="alert" className="mb-6 rounded-xl bg-danger-light px-4 py-3 text-sm text-danger">
          {sp.error}
        </div>
      )}
      {sp.marked && (
        <div role="status" className="mb-6 rounded-xl bg-sage-light px-4 py-3 text-sm text-sage">
          {sp.marked === "0" ? "No paid orders were selected." : `${sp.marked} order(s) moved to Packing.`}
        </div>
      )}
      <AuspostForm orders={data} sender={sender} />
    </>
  );
}
