/** Simple in-memory rate limit (per serverless isolate). Good enough for abuse soft-block. */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;

export function chatRateLimitOk(key: string): boolean {
  const now = Date.now();
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (existing.count >= MAX_REQUESTS) return false;
  existing.count += 1;
  return true;
}
