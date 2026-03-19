
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { setUserSubscriptionStatusAdmin, getUserByStripeCustomerIdAdmin } from '@/lib/firebase-admin';
import { sendWelcomeEmail } from '@/lib/mailgun';
import { getFirestore, FieldValue } from 'firebase-admin/firestore'; // Import direct firestore access

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const gaApiSecret = process.env.GA_API_SECRET!;

const PRICE_TO_PLAN: Record<string, 'edge' | 'warroom'> = {
  'price_1Rrp8HCibMPRXbgJh7zlSME1': 'edge',
  'price_1Rrp8kCibMPRXbgJjdKBhyqo': 'warroom',
};

async function updateSubscriptionStatus(
    customerId: string, 
    status: string, 
    plan?: 'edge' | 'warroom' | 'free',
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
    planOverride?: 'edge' | 'warroom'
) {
    const customerId = subscription.customer as string;
    const user = await getUserByStripeCustomerIdAdmin(customerId);

    if (user) {
        // Determine plan from price ID
        const priceId = subscription.items.data[0].price.id;
        const mappedPlan = PRICE_TO_PLAN[priceId];
        const finalPlan = planOverride || mappedPlan || 'edge'; // Default to edge if unknown

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
                        item_name: 'Overnight Edge Subscription',
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
  // Webhook disabled/dormant — GammaRips is free
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
        // Extract price ID to update plan if changed
        // subscriptionUpdated.items.data[0].price.id
        await handleSubscriptionChange(
            subscriptionUpdated, 
            subscriptionUpdated.status === 'active', 
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
            let plan = session.metadata?.plan as 'edge' | 'warroom' | undefined;
            if (!plan) {
                 const priceId = subscription.items.data[0].price.id;
                 plan = PRICE_TO_PLAN[priceId];
            }

            await handleSubscriptionChange(subscription, true, true, plan); 
            await sendPurchaseEventToGA(session); 
            
            // If user not found (e.g. diff email), handle pending logic?
            // The existing logic inside handleSubscriptionChange checks for user by stripe ID.
            // If checkout just happened, we might need to link by email if stripe ID wasn't already on user.
            // createStripeCheckoutSession in lib/stripe.ts ALREADY links user to stripe ID before creating session.
            // So getUserByStripeCustomerIdAdmin should work.
        }
        break;
    default:
      // console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
