
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { getUserByStripeCustomerIdAdmin, revokeMcpKeysForUserAdmin } from '@/lib/firebase-admin';
import { syncSubscriptionToUser } from '@/lib/stripe-sync';
import { sendWelcomeEmail, sendTrialEndingEmail } from '@/lib/mailgun';
import { getFirestore, FieldValue } from 'firebase-admin/firestore'; // Import direct firestore access

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const gaApiSecret = process.env.GA_API_SECRET!;
const PRO_PRICE_ID =
  process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID ||
  process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;

const PRICE_TO_PLAN: Record<string, 'pro'> = PRO_PRICE_ID
  ? { [PRO_PRICE_ID]: 'pro' }
  : {};

// Terminal Stripe subscription statuses that revoke MCP key access. 'past_due'
// is intentionally excluded (dunning grace, mirrors the 2-day proUntil grace);
// 'active' and 'trialing' keep access.
const MCP_REVOKE_STATUSES = new Set<Stripe.Subscription.Status>([
  'canceled',
  'unpaid',
  'incomplete_expired',
]);

async function handleSubscriptionChange(
    subscription: Stripe.Subscription,
    isNew: boolean = false,
    planOverride?: 'pro'
) {
    // Entitlement + status-field writes live in stripe-sync (shared with the
    // post-checkout landing page and the reconcile cron). An unresolvable user
    // is already logged loudly there.
    const synced = await syncSubscriptionToUser(subscription, { isNew, planOverride });
    // applied=false means the event was for a stale subscription and nothing
    // was written — acting on it (revoke/email) is exactly the lockout bug.
    if (!synced || !synced.applied) return;
    const { uid, user } = synced;

    // Real-time MCP key revocation on lapse. Keyed on the ACTUAL terminal
    // Stripe status. 'past_due' is left active during dunning to match the
    // 2-day proUntil grace; the reconciliation cron is the safety net for any
    // missed webhook.
    if (MCP_REVOKE_STATUSES.has(subscription.status)) {
        try {
            const n = await revokeMcpKeysForUserAdmin(uid, `stripe_${subscription.status}`);
            if (n > 0) console.log(`Webhook: revoked ${n} MCP key(s) for ${uid} (${subscription.status})`);
        } catch (err) {
            console.error(`Webhook: failed to revoke MCP keys for ${uid}`, err);
        }
    }

    // Send the welcome email ONLY on a new entitled subscription (a free
    // trial IS entitled — it's a trial of the paid product). Dedup on a
    // dedicated welcomeEmailSentAt flag written ONLY here: subscribedAt is
    // also stamped by the /about landing provisioner (which sends no email),
    // so keying on it would suppress the only send. Set-then-send: a send
    // failure loses at most one email, never double-sends.
    const entitled = subscription.status === 'active' || subscription.status === 'trialing';
    if (entitled && isNew && user.email && !(user as any).welcomeEmailSentAt) {
        const db = getFirestore();
        await db.collection('users').doc(uid).set(
            { welcomeEmailSentAt: FieldValue.serverTimestamp() },
            { merge: true }
        );
        console.log(`Webhook: Sending welcome email to new subscriber ${user.email}`);
        await sendWelcomeEmail({
            to: user.email,
            name: user.displayName || user.email.split('@')[0],
        }).catch(err => {
            // Log error but don't fail the webhook processing
            console.error(`Webhook: Failed to send welcome email to new subscriber ${user.email}`, err);
        });
    }
}

async function sendPurchaseEventToGA(session: Stripe.Checkout.Session) {
    const gaClientId = session.metadata?.ga_client_id;
    if (!gaClientId) {
        console.warn('Webhook: Missing ga_client_id in checkout session metadata. Cannot send purchase event to GA.');
        return;
    }
    if (!gaApiSecret) {
        console.error('Webhook: GA_API_SECRET is not set. Cannot send purchase event to GA.');
        return;
    }

    try {
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        const item = lineItems.data[0];

        // Trial checkouts have no payment_intent (no charge yet);
        // fall back to the session id so the event still sends.
        const transactionId = (session.payment_intent as string) || session.id;
        // Without session_id + engagement_time_msec, GA4 records the purchase
        // against a phantom (not set) session and source attribution is lost.
        const gaSessionId = session.metadata?.ga_session_id;
        const purchaseEvent = {
            client_id: gaClientId,
            events: [{
                name: 'purchase',
                params: {
                    transaction_id: transactionId,
                    value: (session.amount_total || 0) / 100,
                    currency: session.currency?.toUpperCase() || 'USD',
                    ...(gaSessionId ? { session_id: gaSessionId } : {}),
                    engagement_time_msec: 1,
                    items: [{
                        item_id: item.price?.product as string,
                        item_name: 'GammaRips Pro Subscription',
                        price: (item.price?.unit_amount || 0) / 100,
                        quantity: 1,
                    }]
                },
            }],
        };
        if (!gaSessionId) {
            console.warn('Webhook: Missing ga_session_id in checkout session metadata; purchase event will land unattributed (not set).');
        }
        
        console.log('Webhook: Sending purchase event to Google Analytics:', JSON.stringify(purchaseEvent, null, 2));

        const response = await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${gaMeasurementId}&api_secret=${gaApiSecret}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(purchaseEvent),
        });

        if (response.ok) {
            console.log('Successfully sent purchase event to Google Analytics for transaction:', transactionId);
        } else {
            const errorBody = await response.text();
            console.error('Failed to send purchase event to Google Analytics. Status:', response.status, 'Body:', errorBody);
        }
    } catch (error) {
        console.error('Error constructing or sending GA purchase event:', error);
    }
}


export async function POST(req: NextRequest) {
  // Live for paid MCP access (Phase 3). Handles subscription lifecycle:
  // provisions entitlement on activate, revokes MCP keys on lapse.
  const buf = await req.text();
  const headersList = await headers();
  const sig = headersList.get('Stripe-Signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event. The try/catch exists to LOG failures with the event
  // identity — the 500 is deliberate so Stripe retries (its backoff is the
  // recovery path for transient Firestore/Stripe errors).
  try {
  switch (event.type) {
    case 'customer.subscription.created':
        const subscriptionCreated = event.data.object as Stripe.Subscription;
        // We rely on checkout.session.completed for plan info usually,
        // but this handles purely backend subscription creations if any.
        await handleSubscriptionChange(subscriptionCreated, true);
        break;
    case 'customer.subscription.updated':
        const subscriptionUpdated = event.data.object as Stripe.Subscription;
        // 'trialing' counts as subscribed (it's a trial OF pro) so proUntil is
        // set to the trial end and the user isn't locked out mid-trial by an
        // update event. Only genuinely non-entitled statuses flip isSubscribed
        // off (which, via MCP_REVOKE_STATUSES, also revokes the key).
        await handleSubscriptionChange(subscriptionUpdated, false);
        break;
    case 'invoice.paid':
    case 'invoice.payment_succeeded': {
        // Renewal path. Without this, proUntil is only refreshed if
        // customer.subscription.updated happens to be registered and delivered;
        // a paying customer's proUntil freezing at its first value was the
        // observed failure. Re-retrieve the subscription for a fresh
        // current_period_end and resync.
        const invoice = event.data.object as Stripe.Invoice;
        const invSub = (invoice as any).subscription
            ?? (invoice as any).parent?.subscription_details?.subscription;
        const invSubId = typeof invSub === 'string' ? invSub : invSub?.id;
        if (invSubId) {
            const renewedSub = await stripe.subscriptions.retrieve(invSubId);
            await handleSubscriptionChange(renewedSub, false);
        }
        break;
    }
    case 'customer.subscription.deleted':
        const subscriptionDeleted = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscriptionDeleted, false);

        // Explicitly handle cancellation timestamp — but ONLY if the deleted
        // sub is the user's current one; a stale delete for an old sub must
        // not stamp a resubscribed user as canceled.
        const customerId = subscriptionDeleted.customer as string;
        const user = await getUserByStripeCustomerIdAdmin(customerId);
        if (user && user.stripeSubscriptionId === subscriptionDeleted.id) {
             const db = getFirestore();
             await db.collection('users').doc(user.uid).set({
                 subscriptionStatus: 'canceled',
                 canceledAt: FieldValue.serverTimestamp()
             }, { merge: true });
        }
        break;
    case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'subscription' && session.subscription) {
            const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

            // Try to get plan from metadata, fallback to price mapping
            let plan = session.metadata?.plan as 'pro' | undefined;
            if (!plan) {
                 const priceId = subscription.items.data[0].price.id;
                 plan = PRICE_TO_PLAN[priceId];
            }

            await handleSubscriptionChange(subscription, true, plan);
            await sendPurchaseEventToGA(session);

            // Provision WhatsApp access: write a Firestore doc the OpenClaw
            // paywall plugin will check before letting the chat agent reply.
            const provisionCustomerId = subscription.customer as string;
            const provisionUser = await getUserByStripeCustomerIdAdmin(provisionCustomerId);
            if (provisionUser?.email) {
                const db = getFirestore();
                await db.collection('whatsapp_allowlist').doc(provisionUser.uid).set({
                    uid: provisionUser.uid,
                    email: provisionUser.email,
                    displayName: provisionUser.displayName || null,
                    plan: plan || 'pro',
                    stripeCustomerId: provisionCustomerId,
                    stripeSubscriptionId: subscription.id,
                    senderId: null, // populated when user joins the WhatsApp group (manual or via group-join hook)
                    status: 'provisioned',
                    provisionedAt: FieldValue.serverTimestamp(),
                }, { merge: true });
                console.log(`Webhook: Provisioned whatsapp_allowlist for ${provisionUser.email}`);
            } else {
                console.warn('Webhook: Could not provision whatsapp_allowlist — user missing or no email');
            }
        }
        break;
    case 'customer.subscription.trial_will_end':
        // Stripe fires this event 3 days before trial_end. Send a courtesy
        // reminder so subscribers know the card is about to be charged, with
        // a one-click cancel path via /account. Prevents "surprise-charge"
        // chargebacks and builds goodwill even with users who cancel.
        const trialEndingSub = event.data.object as Stripe.Subscription;
        const trialEndingCustomerId = trialEndingSub.customer as string;
        const trialEndingUser = await getUserByStripeCustomerIdAdmin(trialEndingCustomerId);
        if (trialEndingUser?.email && trialEndingSub.trial_end) {
            const item = trialEndingSub.items.data[0];
            const unitAmount = item?.price?.unit_amount ?? 3900;
            const currency = (item?.price?.currency ?? 'usd').toUpperCase();
            const amountDisplay = `${currency === 'USD' ? '$' : currency + ' '}${(unitAmount / 100).toFixed(2)}`;
            const chargeDateISO = new Date(trialEndingSub.trial_end * 1000).toISOString();
            try {
                await sendTrialEndingEmail({
                    to: trialEndingUser.email,
                    name: trialEndingUser.displayName || trialEndingUser.email.split('@')[0],
                    chargeDateISO,
                    amountDisplay,
                });
                console.log(`Webhook: trial_will_end reminder sent to ${trialEndingUser.email}`);
            } catch (err) {
                console.error(`Webhook: failed to send trial_will_end reminder to ${trialEndingUser.email}`, err);
            }
        } else {
            console.warn('Webhook: trial_will_end — missing user or trial_end on subscription');
        }
        break;
    default:
      // console.log(`Unhandled event type ${event.type}`);
  }
  } catch (err) {
    console.error(`Webhook: handler failed for ${event.type} (${event.id})`, err);
    return NextResponse.json({ error: 'handler failure' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
