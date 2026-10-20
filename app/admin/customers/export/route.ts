import type { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { csvResponse, fileStamp, toCsv } from "@/lib/csv";
import { customersForExport } from "@/lib/queries/admin-ops";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  if (user.role !== "admin") return new Response("Forbidden", { status: 403 });

  const sp = request.nextUrl.searchParams;
  const rows = await customersForExport({
    q: sp.get("q") ?? undefined,
    filter: sp.get("filter") ?? undefined,
    sort: sp.get("sort") ?? undefined,
  });

  const header = [
    "First name",
    "Last name",
    "Email",
    "Phone",
    "Role",
    "Status",
    "Marketing opt-in",
    "Orders",
    "Total spent (AUD)",
    "Last order",
    "Joined",
    "Last login",
  ];
  const body = rows.map((c) => [
    c.firstName,
    c.lastName,
    c.email,
    c.phone ?? "",
    c.role,
    c.disabled ? "Disabled" : "Active",
    c.marketingOptIn ? "Yes" : "No",
    c.orderCount,
    (c.spent / 100).toFixed(2),
    c.lastOrder?.toISOString() ?? "",
    c.createdAt.toISOString(),
    c.lastLoginAt?.toISOString() ?? "",
  ]);

  return csvResponse(`beautypeps-customers-${fileStamp()}.csv`, toCsv(header, body, { bom: true }));
}
