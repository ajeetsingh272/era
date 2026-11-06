import "server-only";
import { headers } from "next/headers";

/**
 * In-memory fixed-window limiter. Good enough for a single Node process;
 * swap for Redis if the site is ever scaled horizontally.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function hit(key: string, limit: number, windowMs: number): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > 10_000) for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
    return { allowed: true, retryAfterMs: 0 };
  }
  b.count++;
  return { allowed: b.count <= limit, retryAfterMs: b.resetAt - now };
}

export function clear(key: string) {
  buckets.delete(key);
}

export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}
