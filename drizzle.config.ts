import { defineConfig } from "drizzle-kit";

// The "turso" dialect uses @libsql/client, which handles both local files (file:local.db) and remote Turso URLs.
export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "file:local.db",
    authToken: process.env.DATABASE_AUTH_TOKEN,
  },
});
