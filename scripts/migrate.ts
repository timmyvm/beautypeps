import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

async function main() {
  const url = process.env.DATABASE_URL ?? "file:local.db";
  const client = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN });
  await migrate(drizzle(client), { migrationsFolder: "./drizzle" });
  console.log(`✓ Migrations applied to ${url.startsWith("file:") ? url : url.replace(/\/\/.*@/, "//***@")}`);
  client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
