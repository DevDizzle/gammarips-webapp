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
 * (pre-write) user and whether the event was applied — `applied: false` means
 * the event was for a stale subscription and NO state was written; callers must
 * not act on it (no key revocation, no emails).
 */
export async function syncSubscriptionToUser(
  sub: Stripe.Subscription,
  opts: { isNew?: boolean; planOverride?: 'pro' } = {}
): Promise<{ uid: string; user: DbUser; applied: boolean } | null> {
  const user = await resolveUserForSubscription(sub);
  if (!user) return null;

  const entitled = sub.status === 'active' || sub.status === 'trialing';

  // Downgrade guard: Stripe delivers events out of order and keeps firing for
  // old subscriptions (cancel-then-resubscribe leaves a dead sub that still
  // emits `deleted`/`updated`). A non-entitled event may only downgrade the
  // user if it is for their CURRENT subscription and the customer has no other
  // live one — otherwise a stale event nukes a paying user.
  if (!entitled) {
    if (user.stripeSubscriptionId && user.stripeSubscriptionId !== sub.id) {
      console.warn(
        `stripe-sync: ignoring non-entitled event for stale subscription ${sub.id}; ` +
          `user ${user.uid} is on ${user.stripeSubscriptionId}`
      );
      return { uid: user.uid, user, applied: false };
    }
    try {
      const live = await stripe.subscriptions.list({
        customer: sub.customer as string,
        limit: 10,
      });
      const other = live.data.find(
        (s) => s.id !== sub.id && (s.status === 'active' || s.status === 'trialing')
      );
      if (other) {
        console.warn(
          `stripe-sync: customer has live subscription ${other.id}; syncing it ` +
            `instead of downgrading from ${sub.id}`
        );
        return syncSubscriptionToUser(other, {});
      }
    } catch (err) {
      // Verification unavailable: fall through and apply the matching-sub
      // downgrade (the reconcile cron re-verifies against Stripe daily).
      console.error(
        `stripe-sync: could not verify other live subscriptions for ${sub.customer}`,
        err
      );
    }
  }

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
        // Backfill the mirror for users resolved via metadata, so every
        // customer-id-keyed path (whatsapp, trial email, canceledAt) works.
        ...(user.stripeCustomerId ? {} : { stripeCustomerId: sub.customer as string }),
        ...(entitled ? { plan } : {}),
        // subscribedAt marks the FIRST subscription; never re-stamp on
        // replays of the welcome landing or duplicate webhook events.
        ...(opts.isNew && !(user as any).subscribedAt
          ? { subscribedAt: FieldValue.serverTimestamp() }
          : {}),
      },
      { merge: true }
    );

  return { uid: user.uid, user, applied: true };
}

/**
 * Synchronous entitlement provisioning from the post-checkout landing page,
 * keyed on the Stripe-signed session_id in the success URL. Redundant with the
 * checkout.session.completed webhook ON PURPOSE: the paying user's first
 * landing must not depend on webhook registration or delivery. Idempotent with
 * the webhook (same writes); swallows every error — the page must render.
 */
export async function provisionFromCheckoutSession(sessionId: string): Promise<void> {
  // Cheap format gate — this runs on an unauthenticated page; garbage ids must
  // not burn Stripe API budget.
  if (!/^cs_(live|test)_[A-Za-z0-9]{10,200}$/.test(sessionId)) return;
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
