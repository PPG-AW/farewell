// Simple in-memory rate limiter (per serverless instance)
// 5 attempts / minute per key, lockout after 10 consecutive failures (5 minutes)

type Bucket = { count: number; resetAt: number; fails: number; lockedUntil: number };
const store = new Map<string, Bucket>();

export function rateLimitCheck(key: string): { ok: boolean; retryAfter?: number } {
  const now = Date.now();
  const b = store.get(key);
  if (!b) return { ok: true };
  if (b.lockedUntil > now) return { ok: false, retryAfter: Math.ceil((b.lockedUntil - now) / 1000) };
  if (b.resetAt < now) {
    store.delete(key);
    return { ok: true };
  }
  if (b.count >= 5) return { ok: false, retryAfter: Math.ceil((b.resetAt - now) / 1000) };
  return { ok: true };
}

export function rateLimitHit(key: string, failed: boolean) {
  const now = Date.now();
  let b = store.get(key);
  if (!b || b.resetAt < now) {
    b = { count: 0, resetAt: now + 60_000, fails: 0, lockedUntil: 0 };
    store.set(key, b);
  }
  b.count += 1;
  if (failed) {
    b.fails += 1;
    if (b.fails >= 10) b.lockedUntil = now + 5 * 60_000;
  } else {
    b.fails = 0;
  }
}
