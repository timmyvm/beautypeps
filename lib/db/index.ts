import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

/*
 * Local dev: a SQLite file (DATABASE_URL=file:local.db).
 * Production: Turso / libSQL (DATABASE_URL=libsql://..., DATABASE_AUTH_TOKEN=...).
 */
const globalForDb = globalThis as unknown as { libsqlClient?: Client };

const client =
  globalForDb.libsqlClient ??
  createClient({
    url: process.env.DATABASE_URL ?? "file:local.db",
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

if (process.env.NODE_ENV !== "production") globalForDb.libsqlClient = client;

export const db = drizzle(client, { schema });
export { schema };
