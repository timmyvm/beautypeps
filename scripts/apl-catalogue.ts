/*
 * Put the AuPeptideLabs catalogue on an existing Beauty Peps database (production included):
 *
 *   npm run catalogue:apl                     # add missing APL products, link existing ones, draft the demo formulas
 *   npm run catalogue:apl -- --update-content # also overwrite copy, prices and images of the APL products
 *
 * Safe to run again. Stock is read from APL at the end when APL_* is set (otherwise the next sync fills it in).
 */
import { createClient } from "@libsql/client";
import { eq, inArray, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../lib/db/schema";
import { aplCategories, aplProducts, DEMO_PRODUCT_SLUGS } from "../lib/seed-data/apl-catalogue";

const { categories, products } = schema;
const updateContent = process.argv.includes("--update-content");

async function main() {
  const url = process.env.DATABASE_URL ?? "file:local.db";
  const client = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN });
  const db = drizzle(client, { schema });
  console.log(`APL catalogue → ${url.startsWith("file:") ? url : "remote database"}`);

  // 1. Categories
  const categoryId = new Map<string, string>();
  for (const c of aplCategories) {
    const existing = await db.query.categories.findFirst({ where: eq(categories.slug, c.slug) });
    if (existing) {
      await db.update(categories).set(c).where(eq(categories.id, existing.id));
      categoryId.set(c.slug, existing.id);
    } else {
      const [row] = await db.insert(categories).values(c).returning({ id: categories.id });
      categoryId.set(c.slug, row.id);
    }
  }

  // 2. The launch formulas become drafts (kept, with their order history, until they are real)
  const drafted = await db
    .update(products)
    .set({ status: "draft", featured: false })
    .where(inArray(products.slug, DEMO_PRODUCT_SLUGS))
    .returning({ id: products.id });
  console.log(`  • demo formulas drafted: ${drafted.length}`);

  // 3. APL products
  let added = 0;
  let updated = 0;
  for (const { categorySlug, stock: _stock, ...p } of aplProducts) {
    void _stock;
    const values = { ...p, categoryId: categoryId.get(categorySlug) ?? null };
    const existing = await db.query.products.findFirst({ where: eq(products.slug, p.slug) });
    if (!existing) {
      await db.insert(products).values({ ...values, stock: 0 });
      added++;
    } else if (updateContent) {
      await db.update(products).set(values).where(eq(products.id, existing.id));
      updated++;
    } else {
      await db
        .update(products)
        .set({ aplVariantId: p.aplVariantId, categoryId: values.categoryId, status: "active" })
        .where(eq(products.id, existing.id));
      updated++;
    }
  }
  console.log(`  • APL products: ${added} added, ${updated} ${updateContent ? "rewritten" : "linked"}`);

  // 4. First read of APL's shelf
  const aplUrl = process.env.APL_SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.APL_SUPABASE_PUBLISHABLE_KEY;
  const token = process.env.APL_STOCK_TOKEN;
  if (aplUrl && key && token) {
    const res = await fetch(`${aplUrl}/rest/v1/rpc/beautypeps_stock`, {
      method: "POST",
      headers: { apikey: key, "Content-Type": "application/json" },
      body: JSON.stringify({ p_token: token }),
    });
    if (!res.ok) throw new Error(`APL stock read failed (${res.status}): ${await res.text()}`);
    const shelf = (await res.json()) as { variant_id: string; stock: number; sellable: boolean }[];
    // Units held by this site's orders that have not been taken off APL's shelf yet
    const held = await client.execute(
      `select oi.product_id as id, sum(oi.quantity) as held
       from order_items oi join orders o on o.id = oi.order_id join products p on p.id = oi.product_id
       where p.apl_variant_id is not null and o.status not in ('cancelled', 'refunded')
         and not exists (select 1 from order_events e where e.order_id = o.id and e.type = 'apl_take')
       group by oi.product_id`,
    );
    const heldBy = new Map(held.rows.map((r) => [String(r.id), Number(r.held)]));
    const linked = await db
      .select({ id: products.id, variant: products.aplVariantId, name: products.name })
      .from(products)
      .where(sql`${products.aplVariantId} is not null`);
    for (const p of linked) {
      const v = shelf.find((s) => s.variant_id === p.variant);
      const available = v && v.sellable ? Math.max(0, v.stock - (heldBy.get(p.id) ?? 0)) : 0;
      await db.update(products).set({ stock: available }).where(eq(products.id, p.id));
      console.log(`    ${p.name.padEnd(22)} ${String(available).padStart(4)}${v ? "" : "  (not shared by APL)"}`);
    }
  } else {
    console.log("  • APL_* not set: stock left at 0 until the first sync");
  }

  client.close();
  console.log("✓ Done. Restart or redeploy so cached pages pick up the new catalogue.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
