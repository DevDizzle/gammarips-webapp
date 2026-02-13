
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { setUserSubscriptionStatusAdmin, getUserByStripeCustomerIdAdmin } from '@/lib/firebase-admin';
import { sendWelcomeEmail } from '@/lib/mailgun';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const gaApiSecret = process.env.GA_API_SECRET!;


async function handleSubscriptionChange(
    subscription: Stripe.Subscription, 
    isSubscribed: boolean, 
    isNew: boolean = false,
    plan?: 'free' | 'edge' | 'warroom'
) {
    const customerId = subscription.customer as string;
    const user = await getUserByStripeCustomerIdAdmin(customerId);

    if (user) {
        await setUserSubscriptionStatusAdmin(user.uid, isSubscribed, subscription.current_period_end, plan);
        
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
        if (subscriptionUpdated.status === 'active') {
             await handleSubscriptionChange(subscriptionUpdated, true, false);
        } else {
             await handleSubscriptionChange(subscriptionUpdated, false, false);
        }
        break;
    case 'customer.subscription.deleted':
        const subscriptionDeleted = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscriptionDeleted, false, false);
        break;
    case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'subscription' && session.subscription) {
            const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
            const plan = session.metadata?.plan as 'edge' | 'warroom' | undefined;
            await handleSubscriptionChange(subscription, true, true, plan); 
            await sendPurchaseEventToGA(session); 
        }
        break;
    default:
      // console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
