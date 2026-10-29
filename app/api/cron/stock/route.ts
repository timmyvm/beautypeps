import { expireUnpaidOrders, retryPendingTakes, syncAplStock } from "@/lib/stock-sync";

/*
 * Scheduled upkeep (vercel.json): cancel orders left unpaid past the payment window, retry any paid order that
 * could not be taken off AuPeptideLabs' shelf, then read the shelf so the shop shows what is really there.
 * Vercel calls it with `Authorization: Bearer $CRON_SECRET`.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return Response.json({ error: "CRON_SECRET is not set" }, { status: 503 });
  if (request.headers.get("authorization") !== `Bearer ${secret}`) return Response.json({ error: "Unauthorised" }, { status: 401 });

  const expired = await expireUnpaidOrders();
  const retried = await retryPendingTakes();
  const sync = await syncAplStock({ force: true });
  return Response.json({ expired, retried, sync });
}
