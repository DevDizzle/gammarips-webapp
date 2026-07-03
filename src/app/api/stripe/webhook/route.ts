
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { setUserSubscriptionStatusAdmin, getUserByStripeCustomerIdAdmin, revokeMcpKeysForUserAdmin } from '@/lib/firebase-admin';
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

async function updateSubscriptionStatus(
    customerId: string, 
    status: string, 
    plan?: 'pro' | 'free',
    subscriptionId?: string
) {
    const user = await getUserByStripeCustomerIdAdmin(customerId);
    if (!user) {
        console.warn(`Webhook Error: No user found with Stripe Customer ID: ${customerId}`);
        // Optionally create pending record here if needed
        return;
    }

    const db = getFirestore();
    const userRef = db.collection('users').doc(user.uid);
    
    const updates: any = {
        subscriptionStatus: status,
    };

    if (plan) {
        updates.plan = plan;
    }
    
    if (subscriptionId) {
        updates.stripeSubscriptionId = subscriptionId;
    }

    if (status === 'active') {
        updates.isSubscribed = true;
        // Only set subscribedAt if it's not already set? Or update it on renewal/upgrade?
        // Prompt says "subscribedAt: serverTimestamp()" on checkout.session.completed
    } else if (status === 'canceled' || status === 'unpaid') {
        updates.isSubscribed = false;
        if (status === 'canceled') {
            updates.canceledAt = FieldValue.serverTimestamp();
        }
    }

    await userRef.set(updates, { merge: true });
    
    // Also call the old helper for compatibility if needed, but we are doing direct updates now for more control
    // setUserSubscriptionStatusAdmin sets isSubscribed and proUntil. 
    // We might want to keep using it or replicate its logic.
    // Let's rely on this specific update function for the new logic and also ensure proUntil is handled if active.
    
    if (status === 'active') {
         // We need subscription object to get period end... passed in?
         // For now, let's assume the calling function handles the period_end update via setUserSubscriptionStatusAdmin if needed,
         // OR we just set isSubscribed here.
         // Actually, let's look at how handleSubscriptionChange did it.
         // It calls setUserSubscriptionStatusAdmin.
    }
}


async function handleSubscriptionChange(
    subscription: Stripe.Subscription,
    isSubscribed: boolean,
    isNew: boolean = false,
    planOverride?: 'pro'
) {
    const customerId = subscription.customer as string;
    const user = await getUserByStripeCustomerIdAdmin(customerId);

    if (user) {
        // Determine plan from price ID
        const priceId = subscription.items.data[0].price.id;
        const mappedPlan = PRICE_TO_PLAN[priceId];
        const finalPlan = planOverride || mappedPlan || 'pro';

        await setUserSubscriptionStatusAdmin(
            user.uid,
            isSubscribed,
            subscription.current_period_end,
            finalPlan
        );

        // Update detailed status fields
        const db = getFirestore();
        await db.collection('users').doc(user.uid).set({
            subscriptionStatus: subscription.status,
            stripeSubscriptionId: subscription.id,
            plan: finalPlan, // Ensure plan is set
            ...(isNew ? { subscribedAt: FieldValue.serverTimestamp() } : {})
        }, { merge: true });

        // Real-time MCP key revocation on lapse. Keyed on the ACTUAL terminal
        // Stripe status (NOT `isSubscribed`, which treats 'trialing' as false
        // and would wrongly revoke a trial user's key). 'past_due' is left
        // active during dunning to match the 2-day proUntil grace; the
        // reconciliation cron is the safety net for any missed webhook.
        if (MCP_REVOKE_STATUSES.has(subscription.status)) {
            try {
                const n = await revokeMcpKeysForUserAdmin(user.uid, `stripe_${subscription.status}`);
                if (n > 0) console.log(`Webhook: revoked ${n} MCP key(s) for ${user.uid} (${subscription.status})`);
            } catch (err) {
                console.error(`Webhook: failed to revoke MCP keys for ${user.uid}`, err);
            }
        }

        // Send the powerful new welcome email ONLY on a new active subscription.
        if (isSubscribed && isNew && user.email) {
            console.log(`Webhook: Sending welcome email to new subscriber ${user.email}`);
            await sendWelcomeEmail({
                to: user.email,
                name: user.displayName || user.email.split('@')[0],
            }).catch(err => {
                // Log error but don't fail the webhook processing
                console.error(`Webhook: Failed to send welcome email to new subscriber ${user.email}`, err);
            });
        }

    } else {
        console.warn(`Webhook Error: No user found with Stripe Customer ID: ${customerId}`);
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

        const purchaseEvent = {
            client_id: gaClientId,
            events: [{
                name: 'purchase',
                params: {
                    transaction_id: session.payment_intent as string,
                    value: (session.amount_total || 0) / 100,
                    currency: session.currency?.toUpperCase() || 'USD',
                    items: [{
                        item_id: item.price?.product as string,
                        item_name: 'GammaRips Pro Subscription',
                        price: (item.price?.unit_amount || 0) / 100,
                        quantity: 1,
                    }]
                },
            }],
        };
        
        console.log('Webhook: Sending purchase event to Google Analytics:', JSON.stringify(purchaseEvent, null, 2));

        const response = await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${gaMeasurementId}&api_secret=${gaApiSecret}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(purchaseEvent),
        });

        if (response.ok) {
            console.log('Successfully sent purchase event to Google Analytics for transaction:', session.payment_intent);
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

  // Handle the event
  switch (event.type) {
    case 'customer.subscription.created':
        const subscriptionCreated = event.data.object as Stripe.Subscription;
        // We rely on checkout.session.completed for plan info usually, 
        // but this handles purely backend subscription creations if any.
        await handleSubscriptionChange(subscriptionCreated, true, true);
        break;
    case 'customer.subscription.updated':
        const subscriptionUpdated = event.data.object as Stripe.Subscription;
        // 'trialing' counts as subscribed (it's a trial OF pro) so proUntil is
        // set to the trial end and the user isn't locked out mid-trial by an
        // update event. Only genuinely non-entitled statuses flip isSubscribed
        // off (which, via MCP_REVOKE_STATUSES, also revokes the key).
        await handleSubscriptionChange(
            subscriptionUpdated,
            subscriptionUpdated.status === 'active' || subscriptionUpdated.status === 'trialing',
            false
        );
        break;
    case 'customer.subscription.deleted':
        const subscriptionDeleted = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscriptionDeleted, false, false);
        
        // Explicitly handle cancellation timestamp
        const customerId = subscriptionDeleted.customer as string;
        const user = await getUserByStripeCustomerIdAdmin(customerId);
        if (user) {
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

            await handleSubscriptionChange(subscription, true, true, plan);
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

  return NextResponse.json({ received: true });
}
