import "server-only";

import { headers } from "next/headers";

/*
 * Tiny in-memory fixed-window rate limiter for auth endpoints.
 * Per server instance only — good enough to blunt credential stuffing on a
 * single node; swap for Redis/Upstash if you scale horizontally.
 */

type Bucket = { count: number; resetAt: number };

const globalForLimiter = globalThis as unknown as { bpRateLimit?: Map<string, Bucket> };
const buckets = globalForLimiter.bpRateLimit ?? new Map<string, Bucket>();
globalForLimiter.bpRateLimit = buckets;

export async function clientIp() {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

/**
 * Count one hit against `key`. Returns `{ ok: false, retryAfter }` once the
 * limit is exceeded within the window.
 */
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();

  // Opportunistic cleanup so the map can't grow forever.
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true as const, remaining: limit - 1 };
  }
  bucket.count++;
  if (bucket.count > limit) {
    return { ok: false as const, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  return { ok: true as const, remaining: limit - bucket.count };
}

/** Clear a key, e.g. after a successful login. */
export function resetRateLimit(key: string) {
  buckets.delete(key);
}
