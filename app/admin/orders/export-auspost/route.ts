import { inArray } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { AUSPOST_COLUMNS, AUSPOST_SENDER_COOKIE, PACKAGING_TYPES, auspostRow, type AuspostSender } from "@/lib/auspost";
import { AU_STATES } from "@/lib/constants";
import { csvResponse, fileStamp, toCsv } from "@/lib/csv";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  if (user.role !== "admin") return new Response("Forbidden", { status: 403 });

  const sp = request.nextUrl.searchParams;
  const back = (error: string) => {
    const url = new URL("/admin/orders/auspost", request.url);
    sp.forEach((v, k) => url.searchParams.append(k, v));
    url.searchParams.set("error", error);
    return NextResponse.redirect(url, 303);
  };

  const ids = sp.getAll("id").filter(Boolean);
  if (ids.length === 0) return back("Select at least one order.");

  const sender: AuspostSender = {
    name: sp.get("s_name")?.trim() ?? "",
    business: sp.get("s_business")?.trim() ?? "",
    line1: sp.get("s_line1")?.trim() ?? "",
    line2: sp.get("s_line2")?.trim() ?? "",
    suburb: sp.get("s_suburb")?.trim() ?? "",
    state: (sp.get("s_state") ?? "").trim().toUpperCase(),
    postcode: sp.get("s_postcode")?.trim() ?? "",
    phone: sp.get("s_phone")?.trim() ?? "",
    email: sp.get("s_email")?.trim() ?? "",
  };
  if (!sender.name || !sender.line1 || !sender.suburb) return back("Sender name, address line 1 and suburb are required.");
  if (!(AU_STATES as readonly string[]).includes(sender.state)) return back("Choose the sender state.");
  if (!/^\d{4}$/.test(sender.postcode)) return back("Sender postcode must be 4 digits.");

  const packaging = PACKAGING_TYPES.find((p) => p.code === sp.get("packaging"));
  if (!packaging) return back("Choose a packaging type.");
  const weightKg = Number(sp.get("weight") || packaging.defaultKg);
  if (!Number.isFinite(weightKg) || weightKg <= 0 || weightKg > packaging.maxKg) {
    return back(`Weight must be between 0 and ${packaging.maxKg} kg for ${packaging.code}.`);
  }
  const dims = ["length", "width", "height"].map((k) => Number(sp.get(k)));
  if (packaging.code === "OWN_PACKAGING" && dims.some((d) => !Number.isFinite(d) || d <= 0 || d >= 105)) {
    return back("Own packaging needs length, width and height (under 105 cm).");
  }

  const rows = await db.query.orders.findMany({
    where: inArray(orders.id, ids.slice(0, 500)),
    columns: { orderNumber: true, email: true, shippingAddress: true, shippingMethod: true, createdAt: true },
  });
  rows.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  const parcel = {
    packaging: packaging.code,
    weightKg,
    lengthCm: dims[0] || undefined,
    widthCm: dims[1] || undefined,
    heightCm: dims[2] || undefined,
    description: sp.get("description")?.trim() || "Skincare products",
    trackingNotifications: sp.get("notify") === "on",
    signature: sp.get("signature") === "on",
  };

  // No BOM and no trailing blank line — MyPost rejects both.
  const csv = toCsv([...AUSPOST_COLUMNS], rows.map((o) => auspostRow(o, sender, parcel)));
  const res = csvResponse(`auspost-mypost-${fileStamp()}.csv`, csv);
  res.headers.append(
    "Set-Cookie",
    `${AUSPOST_SENDER_COOKIE}=${encodeURIComponent(JSON.stringify(sender))}; Path=/admin; Max-Age=${60 * 60 * 24 * 365}; HttpOnly; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
  );
  return res;
}
