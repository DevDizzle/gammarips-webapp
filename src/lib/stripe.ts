import Stripe from 'stripe';
import { getOrCreateUserAdmin } from './firebase-admin';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
});

export async function createStripeCheckoutSession(
    uid: string,
    email: string | null | undefined,
    priceId: string,
    successUrl: string,
    cancelUrl: string,
    metadata?: { [key: string]: string }
  ) {
    let user = await getOrCreateUserAdmin(uid);
    let customerId = user.stripeCustomerId;

    // Create a new Stripe customer if one doesn't exist
    if (!customerId) {
        const customer = await stripe.customers.create({
            email: email ?? undefined,
            metadata: {
                firebaseUID: uid,
            },
        });
        customerId = customer.id;
        // Update user in Firebase with the new Stripe Customer ID
        await getOrCreateUserAdmin(uid, user.isAnonymous, user.displayName, user.email, customerId);
    }
  
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
  
    if (!session.id) {
        throw new Error('Could not create Stripe Checkout Session.');
    }
    
    return session.id;
}

export async function createStripePortalSession(stripeCustomerId: string, returnUrl: string) {
    const portalConfigurationId = process.env.NEXT_PUBLIC_STRIPE_BILLING_PORTAL_CONFIG_ID;
    if (!portalConfigurationId) {
        throw new Error('Stripe Billing Portal Configuration ID is not set in environment variables.');
    }
    
    const portalSession = await stripe.billingPortal.sessions.create({
        customer: stripeCustomerId,
        return_url: returnUrl,
        configuration: portalConfigurationId,
    });

    if (!portalSession.url) {
        throw new Error('Could not create Stripe Portal Session.');
    }

    return portalSession.url;
}
