import Stripe from 'stripe';
import { stripe } from './stripe';
import {
  getUserByStripeCustomerIdAdmin,
  getUserAdmin,
  setUserSubscriptionStatusAdmin,
} from './firebase-admin';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import type { DbUser } from './firebase';

/**
 * Billing-period end (unix seconds) across Stripe API shapes: top-level
 * `current_period_end` on 2024-and-earlier API versions, per-item period end on
 * 2025-03-31+, trial_end as the last resort. The webhook endpoint's
 * dashboard-pinned API version decides which shape events arrive in,
 * independent of the SDK's own pin, so all three are tried.
 */
export function subscriptionPeriodEnd(sub: Stripe.Subscription): number | undefined {
  return (
    sub.current_period_end ??
    (sub.items?.data?.[0] as any)?.current_period_end ??
    sub.trial_end ??
    undefined
  );
}

/**
 * Resolve the Firestore user a subscription belongs to. Order: our own
 * `users.stripeCustomerId` mirror, then the `firebaseUID` stamped on the
 * subscription's metadata at checkout, then the same stamp on the Stripe
 * customer (set at customer creation since day one). A miss on every path is
 * loud — a paying customer we cannot resolve must never fail silently.
 */
export async function resolveUserForSubscription(
  sub: Stripe.Subscription
): Promise<DbUser | null> {
  const customerId = sub.customer as string;

  const byCustomer = await getUserByStripeCustomerIdAdmin(customerId);
  if (byCustomer) return byCustomer;

  const metaUid = sub.metadata?.firebaseUID;
  if (metaUid) {
    const byMeta = await getUserAdmin(metaUid);
    if (byMeta) return byMeta;
  }

  try {
    const customer = await stripe.customers.retrieve(customerId);
    const custUid = customer.deleted
      ? undefined
      : (customer.metadata?.firebaseUID as string | undefined);
    if (custUid) {
      const byCust = await getUserAdmin(custUid);
      if (byCust) return byCust;
    }
  } catch (err) {
    console.error(`stripe-sync: failed to retrieve customer ${customerId}`, err);
  }

  console.error(
    `stripe-sync: could not resolve a user for subscription ${sub.id} ` +
      `(customer ${customerId}); entitlement NOT written`
  );
  return null;
}

/**
 * Write a subscription's entitlement state onto the owning user doc. Shared by
 * the Stripe webhook, the post-checkout landing page, and the reconcile cron so
 * all three agree on what "synced" means. Idempotent. Returns the resolved
 * user, or null if no user could be resolved.
 */
export async function syncSubscriptionToUser(
  sub: Stripe.Subscription,
  opts: { isNew?: boolean; planOverride?: 'pro' } = {}
): Promise<{ uid: string; user: DbUser } | null> {
  const user = await resolveUserForSubscription(sub);
  if (!user) return null;

  const entitled = sub.status === 'active' || sub.status === 'trialing';
  const plan = opts.planOverride || 'pro';
  const periodEnd = subscriptionPeriodEnd(sub);
  if (entitled && !periodEnd) {
    console.error(
      `stripe-sync: subscription ${sub.id} has no resolvable period end; proUntil not refreshed`
    );
  }

  await setUserSubscriptionStatusAdmin(
    user.uid,
    entitled,
    periodEnd,
    entitled ? plan : undefined
  );

  const db = getFirestore();
  await db
    .collection('users')
    .doc(user.uid)
    .set(
      {
        subscriptionStatus: sub.status,
        stripeSubscriptionId: sub.id,
        ...(entitled ? { plan } : {}),
        ...(opts.isNew ? { subscribedAt: FieldValue.serverTimestamp() } : {}),
      },
      { merge: true }
    );

  return { uid: user.uid, user };
}

/**
 * Synchronous entitlement provisioning from the post-checkout landing page,
 * keyed on the Stripe-signed session_id in the success URL. Redundant with the
 * checkout.session.completed webhook ON PURPOSE: the paying user's first
 * landing must not depend on webhook registration or delivery. Idempotent with
 * the webhook (same writes); swallows every error — the page must render.
 */
export async function provisionFromCheckoutSession(sessionId: string): Promise<void> {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.mode !== 'subscription' || !session.subscription) return;
    const subId =
      typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription.id;
    const sub = await stripe.subscriptions.retrieve(subId);
    await syncSubscriptionToUser(sub, {
      isNew: true,
      planOverride: session.metadata?.plan === 'pro' ? 'pro' : undefined,
    });
  } catch (err) {
    console.error(
      `stripe-sync: post-checkout provisioning failed for session ${sessionId}`,
      err
    );
  }
}
