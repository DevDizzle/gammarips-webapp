/**
 * In-memory token buckets for the unauthenticated OAuth endpoints. The App
 * Hosting backend runs `maxInstances: 1` (apphosting.yaml), so one process
 * sees all traffic; if that ever changes the limits become per-instance,
 * which is still a bound. Protects Firestore (DCR writes) and the signing
 * path from abuse; precision is not the goal.
 */

interface Bucket {
  tokens: number;
  updated: number;
}

const _buckets = new Map<string, Bucket>();
const MAX_KEYS = 20_000;

export function allow(key: string, perMinute: number, burst = perMinute): boolean {
  const now = Date.now();
  let b = _buckets.get(key);
  if (!b) {
    if (_buckets.size >= MAX_KEYS) _buckets.clear();
    b = { tokens: burst, updated: now };
    _buckets.set(key, b);
  }
  const elapsedMin = (now - b.updated) / 60_000;
  b.tokens = Math.min(burst, b.tokens + elapsedMin * perMinute);
  b.updated = now;
  if (b.tokens < 1) return false;
  b.tokens -= 1;
  return true;
}

export function clientIp(headers: Headers): string {
  const xff = headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return headers.get('x-real-ip') || 'unknown';
}
