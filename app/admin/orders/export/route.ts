import type { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { ORDER_STATUSES, PAYMENT_METHODS, SHIPPING_METHOD_LABELS } from "@/lib/constants";
import { csvResponse, fileStamp, toCsv } from "@/lib/csv";
import { orderWhere, ordersForExport } from "@/lib/queries/admin-ops";

const dollars = (cents: number) => (cents / 100).toFixed(2);

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  if (user.role !== "admin") return new Response("Forbidden", { status: 403 });

  const sp = request.nextUrl.searchParams;
  const filters = {
    status: sp.get("status") ?? undefined,
    q: sp.get("q") ?? undefined,
    from: sp.get("from") ?? undefined,
    to: sp.get("to") ?? undefined,
  };
  const rows = await ordersForExport(orderWhere(filters));

  const header = [
    "Order number",
    "Date",
    "Status",
    "Payment status",
    "Payment method",
    "Paid at",
    "Email",
    "First name",
    "Last name",
    "Phone",
    "Company",
    "Address line 1",
    "Address line 2",
    "Suburb",
    "State",
    "Postcode",
    "Country",
    "Items",
    "Units",
    "Subtotal",
    "Discount code",
    "Discount",
    "Shipping method",
    "Shipping",
    "GST included",
    "Total",
    "Tracking carrier",
    "Tracking number",
    "Shipped at",
    "Customer note",
    "Account",
  ];

  const body = rows.map((o) => {
    const a = o.shippingAddress;
    return [
      o.orderNumber,
      o.createdAt.toISOString(),
      ORDER_STATUSES[o.status].label,
      o.paymentStatus,
      PAYMENT_METHODS[o.paymentMethod].label,
      o.paidAt?.toISOString() ?? "",
      o.email,
      a.firstName,
      a.lastName,
      a.phone ?? "",
      a.company ?? "",
      a.line1,
      a.line2 ?? "",
      a.suburb,
      a.state,
      a.postcode,
      a.country,
      o.items.map((i) => `${i.quantity} × ${i.name} (${i.sku})`).join("; "),
      o.items.reduce((s, i) => s + i.quantity, 0),
      dollars(o.subtotal),
      o.discountCode ?? "",
      dollars(o.discountTotal),
      SHIPPING_METHOD_LABELS[o.shippingMethod],
      dollars(o.shippingTotal),
      dollars(o.gstTotal),
      dollars(o.total),
      o.trackingCarrier ?? "",
      o.trackingNumber ?? "",
      o.shippedAt?.toISOString() ?? "",
      o.customerNote ?? "",
      o.userId ? "Registered" : "Guest",
    ];
  });

  return csvResponse(`beautypeps-orders-${fileStamp()}.csv`, toCsv(header, body, { bom: true }));
}
