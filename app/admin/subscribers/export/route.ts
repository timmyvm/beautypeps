import { desc, like } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { csvResponse, fileStamp, toCsv } from "@/lib/csv";
import { db } from "@/lib/db";
import { subscribers } from "@/lib/db/schema";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  if (user.role !== "admin") return new Response("Forbidden", { status: 403 });

  const q = request.nextUrl.searchParams.get("q")?.trim();
  const rows = await db
    .select()
    .from(subscribers)
    .where(q ? like(subscribers.email, `%${q.replace(/[%_]/g, "")}%`) : undefined)
    .orderBy(desc(subscribers.createdAt));

  return csvResponse(
    `beautypeps-subscribers-${fileStamp()}.csv`,
    toCsv(
      ["Email", "Source", "Subscribed at"],
      rows.map((s) => [s.email, s.source, s.createdAt.toISOString()]),
      { bom: true },
    ),
  );
}
