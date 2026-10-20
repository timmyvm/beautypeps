import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

/*
 * Local dev: a SQLite file (DATABASE_URL=file:local.db).
 * Production: Turso / libSQL (DATABASE_URL=libsql://..., DATABASE_AUTH_TOKEN=...).
 */
const globalForDb = globalThis as unknown as { libsqlClient?: Client };

const url = process.env.DATABASE_URL ?? "file:local.db";

function makeClient() {
  const c = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN });
  if (url.startsWith("file:")) {
    // Local SQLite: WAL lets readers and a writer coexist; busy_timeout waits instead of throwing SQLITE_BUSY.
    void c.execute("PRAGMA journal_mode = WAL").catch(() => {});
    void c.execute("PRAGMA busy_timeout = 5000").catch(() => {});
  }
  return c;
}

const client = globalForDb.libsqlClient ?? makeClient();

if (process.env.NODE_ENV !== "production") globalForDb.libsqlClient = client;

export const db = drizzle(client, { schema });
export { schema };
