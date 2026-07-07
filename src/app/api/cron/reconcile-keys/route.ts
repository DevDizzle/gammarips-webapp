import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { stripe } from '@/lib/stripe';
import {
  listActiveMcpKeysAdmin,
  getUserAdmin,
  revokeMcpKeysForUserAdmin,
  setUserSubscriptionStatusAdmin,
} from '@/lib/firebase-admin';

// firebase-admin + stripe need the Node runtime; never cache this route.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Reconciliation cron — the automated safety net for key lifecycle.
 *
 * Real-time revocation happens in the Stripe webhook. This job catches anyone
 * the webhook MISSED (delivery failure, retry exhaustion, an out-of-band Stripe
 * change): it walks every ACTIVE mcp_api_key, verifies the owner still has a
 * live subscription against STRIPE (the source of truth, not our possibly-stale
 * mirror), and revokes + resyncs any mismatch.
 *
 * Trigger: Cloud Scheduler daily, POST with header `x-reconcile-secret:
 * $RECONCILE_CRON_SECRET`. Idempotent — safe to run any time.
 */

const ENTITLED_STRIPE_STATUSES = new Set(['active', 'trialing', 'past_due']);

function secretMatches(provided: string | null, expected: string): boolean {
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  // Length check first — timingSafeEqual throws on length mismatch.
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  const secret = process.env.RECONCILE_CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'RECONCILE_CRON_SECRET not configured' }, { status: 503 });
  }
  if (!secretMatches(req.headers.get('x-reconcile-secret'), secret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const summary = {
    activeKeys: 0,
    checkedUids: 0,
    revokedUids: 0,
    revokedKeys: 0,
    errors: [] as string[],
  };

  try {
    const activeKeys = await listActiveMcpKeysAdmin();
    summary.activeKeys = activeKeys.length;

    // One entitlement check per user, even if they hold multiple active keys.
    const uids = Array.from(new Set(activeKeys.map((k) => k.uid).filter(Boolean)));

    for (const uid of uids) {
      summary.checkedUids++;
      try {
        const user = await getUserAdmin(uid);

        // Tri-state: true=keep, false=revoke, null=UNKNOWN (Stripe unreachable
        // etc.) -> DO NOT touch. Revoking only on a DEFINITIVE not-entitled
        // signal means a Stripe outage can never mass-revoke paying customers.
        let entitled: boolean | null = false;
        if (user?.subscriptionStatus === 'founder_lifetime') {
          entitled = true;
        } else if (user?.stripeSubscriptionId) {
          try {
            const sub = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
            entitled = ENTITLED_STRIPE_STATUSES.has(sub.status);
          } catch (err: any) {
            // A canceled/expired sub still RETURNS (status='canceled') — the
            // only way retrieve throws is a genuinely-missing sub (404) or a
            // transient/API error. Revoke only on definitive 404; otherwise
            // leave state untouched.
            if (err?.statusCode === 404 || err?.code === 'resource_missing') {
              entitled = false;
            } else {
              entitled = null; // unknown — preserve existing access
              summary.errors.push(`${uid}: stripe ${err?.message || 'error'}`);
            }
          }
        } else {
          // Active key but no Stripe subscription on record and not a founder:
          // an anomaly, not entitled to a live key.
          entitled = false;
        }

        if (entitled === false) {
          const n = await revokeMcpKeysForUserAdmin(uid, 'reconcile_lapsed');
          // Resync the user's entitlement flags so the rest of the app agrees.
          await setUserSubscriptionStatusAdmin(uid, false);
          summary.revokedUids++;
          summary.revokedKeys += n;
          console.log(`Reconcile: revoked ${n} MCP key(s) for lapsed user ${uid}`);
        }
      } catch (err: any) {
        summary.errors.push(`${uid}: ${err?.message || 'error'}`);
      }
    }

    return NextResponse.json({ ok: true, ...summary });
  } catch (err: any) {
    console.error('Reconcile: fatal error', err);
    return NextResponse.json({ ok: false, error: err?.message || 'error', ...summary }, { status: 500 });
  }
}
