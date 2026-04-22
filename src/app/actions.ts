'use server';

import {
    getOrCreateUserAdmin,
    saveFeedbackAdmin,
    saveCancellationFeedbackAdmin,
    getAdminApp,
} from '@/lib/firebase-admin';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { createStripeCheckoutSession, createStripePortalSession } from '@/lib/stripe';
import { headers } from 'next/headers';
import { getAuth as getClientAuth, sendPasswordResetEmail } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { sendFeedbackAcknowledgmentEmail } from '@/lib/mailgun';

export async function handleFeedback(uid: string | null, message: string, replyToEmail: string): Promise<{success: boolean}> {
  let userData: { uid: string, email: string | null } | null = null;
  if (uid) {
    const user = await getOrCreateUserAdmin(uid);
    userData = { uid: user.uid, email: user.email ?? null };
  }
  const { trackingId } = await saveFeedbackAdmin(message, replyToEmail, userData);
  
  await sendFeedbackAcknowledgmentEmail({
    to: replyToEmail,
    trackingId,
  });

  return { success: true };
}

export async function createCheckoutSession(idToken: string, gaClientId: string | null): Promise<{ sessionId: string }> {
    if (!idToken) {
        throw new Error('Authentication required.');
    }
    const decoded = await getAdminAuth(getAdminApp()).verifyIdToken(idToken);
    const uid = decoded.uid;

    const user = await getOrCreateUserAdmin(uid);
    const headersList = await headers();
    const forwardedHost = headersList.get('x-forwarded-host') ?? headersList.get('host');
    const forwardedProto = headersList.get('x-forwarded-proto') ?? 'https';
    const origin = forwardedHost ? `${forwardedProto}://${forwardedHost}` : headersList.get('origin') ?? 'https://gammarips.com';

    const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID!;
    if (!priceId) {
        throw new Error('Stripe Price ID is not configured.');
    }

    const sessionMetadata: { ga_client_id?: string; plan?: string } = { plan: 'pro' };
    if (gaClientId) {
        sessionMetadata.ga_client_id = gaClientId;
    }

    const sessionId = await createStripeCheckoutSession(
        uid,
        user.email,
        priceId,
        `${origin}/about?welcome=1&session_id={CHECKOUT_SESSION_ID}`,
        `${origin}/pricing`,
        sessionMetadata,
        { trialPeriodDays: 7 }
    );

    return { sessionId };
}

export async function sendPasswordReset(email: string): Promise<void> {
  const auth = getClientAuth(app);
  await sendPasswordResetEmail(auth, email);
}

export async function handleCancellationIntent(uid: string, feedback: string): Promise<{ portalUrl: string }> {
    const user = await getOrCreateUserAdmin(uid);
    const stripeCustomerId = user.stripeCustomerId;

    if (!stripeCustomerId) {
        throw new Error('User does not have a Stripe Customer ID.');
    }

    await saveCancellationFeedbackAdmin(uid, feedback);

    const headersList = await headers();
    const origin = headersList.get('origin')!;
    const returnUrl = `${origin}/account`;
    const portalUrl = await createStripePortalSession(stripeCustomerId, returnUrl);

    return { portalUrl };
}
