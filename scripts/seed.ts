/*
 * Seed the Beauty Peps database.
 *
 *   npm run db:seed              # catalogue + content + demo customers/orders/reviews
 *   npm run db:seed -- --no-demo # catalogue + content + admin only
 *
 * Idempotent: every table except `settings` is wiped and re-filled.
 */
import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../lib/db/schema";
import { aplCategories, aplProducts } from "../lib/seed-data/apl-catalogue";
import { seedArticles } from "../lib/seed-data/articles";
import { seedCategories } from "../lib/seed-data/categories";
import { buildDemoData, DEMO_CUSTOMER, DEMO_DISCOUNT_CODES } from "../lib/seed-data/demo";
import { seedPeptides } from "../lib/seed-data/peptides";
import { seedProducts } from "../lib/seed-data/products";

const {
  addresses,
  articles,
  categories,
  contactMessages,
  discounts,
  emailLog,
  orderEvents,
  orderItems,
  orders,
  passwordResets,
  peptides,
  products,
  reviews,
  subscribers,
  users,
  wishlistItems,
} = schema;

const withDemo = !process.argv.includes("--no-demo");

async function insertChunked<T>(label: string, rows: T[], insert: (chunk: T[]) => Promise<unknown>, size = 40) {
  for (let i = 0; i < rows.length; i += size) await insert(rows.slice(i, i + size));
  if (rows.length) console.log(`  • ${label}: ${rows.length}`);
}

async function main() {
  const url = process.env.DATABASE_URL ?? "file:local.db";
  const client = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN });
  const db = drizzle(client, { schema });

  const adminEmail = (process.env.ADMIN_EMAIL || "admin@beautypeps.com.au").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMe-Peps-2026!";

  console.log(`Seeding ${url.startsWith("file:") ? url : "remote database"}${withDemo ? " (with demo data)" : ""}…`);

  // 1. Wipe (FK-safe order). Settings are left untouched.
  for (const table of [
    orderEvents,
    orderItems,
    orders,
    reviews,
    wishlistItems,
    addresses,
    passwordResets,
    discounts,
    contactMessages,
    subscribers,
    emailLog,
    products,
    categories,
    peptides,
    articles,
    users,
  ]) {
    await db.delete(table);
  }

  // 2. Admin
  const [admin] = await db
    .insert(users)
    .values({
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      firstName: "Tim",
      lastName: "",
      role: "admin",
      marketingOptIn: false,
    })
    .returning();
  console.log(`  • admin: ${admin.email}`);

  // 3. Catalogue
  // The live catalogue is AuPeptideLabs' shelf (apl-catalogue.ts); the launch formulas stay as drafts.
  const allCategories = [
    ...aplCategories,
    ...seedCategories.filter((c) => !aplCategories.some((a) => a.slug === c.slug)),
  ];
  const insertedCategories = await db.insert(categories).values(allCategories).returning();
  console.log(`  • categories: ${insertedCategories.length}`);
  const categoryId = new Map(insertedCategories.map((c) => [c.slug, c.id]));

  const catalogue = [...aplProducts, ...seedProducts.map((p) => ({ ...p, status: "draft" as const, featured: false }))];
  const productRows = catalogue.map(({ categorySlug, ...p }) => {
    const id = categoryId.get(categorySlug);
    if (!id) throw new Error(`Unknown category "${categorySlug}" for product ${p.slug}`);
    return { ...p, categoryId: id };
  });
  const insertedProducts: (typeof products.$inferSelect)[] = [];
  await insertChunked("products", productRows, async (chunk) => {
    insertedProducts.push(...(await db.insert(products).values(chunk).returning()));
  }, 10);

  await insertChunked("peptides", seedPeptides, (chunk) => db.insert(peptides).values(chunk), 10);
  await insertChunked("articles", seedArticles, (chunk) => db.insert(articles).values(chunk), 10);

  // 4. Discounts
  const insertedDiscounts = await db.insert(discounts).values(DEMO_DISCOUNT_CODES).returning();
  console.log(`  • discounts: ${insertedDiscounts.length}`);

  // 5. Demo data
  if (withDemo) {
    const demo = buildDemoData({
      // Demo orders use the draft formulas only, so they never hold stock on the shared APL shelf.
      products: insertedProducts.filter((p) => !p.aplVariantId).map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        sku: p.sku,
        image: p.image,
        size: p.size,
        price: p.price,
      })),
      discounts: insertedDiscounts.map((d) => ({
        id: d.id,
        code: d.code,
        type: d.type,
        value: d.value,
        minSubtotal: d.minSubtotal,
      })),
      passwordHash: await bcrypt.hash(`demo-${crypto.randomUUID()}`, 10),
      demoPasswordHash: await bcrypt.hash(DEMO_CUSTOMER.password, 10),
      adminEmail,
    });

    await insertChunked("customers", demo.users, (chunk) => db.insert(users).values(chunk));
    await insertChunked("addresses", demo.addresses, (chunk) => db.insert(addresses).values(chunk));
    await insertChunked("orders", demo.orders, (chunk) => db.insert(orders).values(chunk), 20);
    await insertChunked("order items", demo.orderItems, (chunk) => db.insert(orderItems).values(chunk));
    await insertChunked("order events", demo.orderEvents, (chunk) => db.insert(orderEvents).values(chunk));
    await insertChunked("reviews", demo.reviews, (chunk) => db.insert(reviews).values(chunk));
    await insertChunked("wishlist items", demo.wishlist, (chunk) => db.insert(wishlistItems).values(chunk));
    await insertChunked("subscribers", demo.subscribers, (chunk) => db.insert(subscribers).values(chunk));
    await insertChunked("contact messages", demo.messages, (chunk) => db.insert(contactMessages).values(chunk));

    for (const [code, n] of Object.entries(demo.discountUsage)) {
      await db
        .update(discounts)
        .set({ usedCount: sql`${discounts.usedCount} + ${n}` })
        .where(eq(discounts.code, code));
    }
  }

  console.log("\n✓ Seed complete\n");
  console.log("  Admin login     ", adminEmail, "/", adminPassword);
  if (withDemo) console.log("  Demo customer   ", DEMO_CUSTOMER.email, "/", DEMO_CUSTOMER.password);
  console.log("  Discount codes  ", DEMO_DISCOUNT_CODES.map((d) => d.code).join(", "));
  client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
