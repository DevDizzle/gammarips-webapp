import Stripe from 'stripe';
import { getOrCreateUserAdmin } from './firebase-admin';

// Secret Manager values end in a newline. A newline in the key makes every
// Stripe call fail with StripeConnectionError, so trim it.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!.trim(), {
  apiVersion: '2024-04-10',
  typescript: true,
});

export async function createStripeCheckoutSession(
    uid: string,
    email: string | null | undefined,
    priceId: string,
    successUrl: string,
    cancelUrl: string,
    metadata?: { [key: string]: string },
    opts?: { trialPeriodDays?: number }
  ) {
    const user = await getOrCreateUserAdmin(uid);
    let customerId = user.stripeCustomerId;

    const createAndPersistCustomer = async () => {
      const customer = await stripe.customers.create({
        email: email ?? undefined,
        metadata: {
          firebaseUID: uid,
        },
      });
      await getOrCreateUserAdmin(
        uid,
        user.isAnonymous,
        (user.displayName || undefined) as string | undefined,
        (user.email || undefined) as string | undefined,
        customer.id
      );
      return customer.id;
    };

    // Create a new Stripe customer if one doesn't exist or isn't a valid cus_ ID
    if (!customerId || !customerId.startsWith('cus_')) {
      customerId = await createAndPersistCustomer();
    }

    // firebaseUID on both the session and the subscription lets the webhook
    // and the post-checkout landing page resolve the user even if the
    // users.stripeCustomerId mirror is missing or stale.
    const fullMetadata: { [key: string]: string } = { ...(metadata ?? {}), firebaseUID: uid };

    const buildSessionParams = (cid: string): Stripe.Checkout.SessionCreateParams => ({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer: cid,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: fullMetadata,
      subscription_data: opts?.trialPeriodDays
        ? { trial_period_days: opts.trialPeriodDays, metadata: fullMetadata }
        : { metadata: fullMetadata },
      allow_promotion_codes: true,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    let session: Stripe.Checkout.Session;
    try {
      session = await stripe.checkout.sessions.create(buildSessionParams(customerId));
    } catch (err: any) {
      // Recover automatically if the stored customer ID was deleted or from test mode
      if (err?.code === 'resource_missing' && err?.param === 'customer') {
        customerId = await createAndPersistCustomer();
        session = await stripe.checkout.sessions.create(buildSessionParams(customerId));
      } else {
        throw err;
      }
    }

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
