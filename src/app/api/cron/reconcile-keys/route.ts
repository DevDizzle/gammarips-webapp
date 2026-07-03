import { NextRequest, NextResponse } from 'next/server';
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

export async function POST(req: NextRequest) {
  const secret = process.env.RECONCILE_CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'RECONCILE_CRON_SECRET not configured' }, { status: 503 });
  }
  if (req.headers.get('x-reconcile-secret') !== secret) {
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

        let entitled = false;
        if (user?.subscriptionStatus === 'founder_lifetime') {
          entitled = true;
        } else if (user?.stripeSubscriptionId) {
          // Stripe is the source of truth — catches a missed lapse webhook.
          const sub = await stripe.subscriptions
            .retrieve(user.stripeSubscriptionId)
            .catch(() => null);
          entitled = !!sub && ENTITLED_STRIPE_STATUSES.has(sub.status);
        } else {
          // No Stripe subscription on record → not entitled to a live key.
          entitled = false;
        }

        if (!entitled) {
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
