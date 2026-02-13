'use server';

import { 
    getOrCreateUserAdmin,
    incrementUserUsageAdmin,
    saveFeedbackAdmin,
    getAppStatusAdmin,
    saveFeedbackSurveyAdmin,
    saveCancellationFeedbackAdmin,
} from '@/lib/firebase-admin';
import type { FeedbackSurveyData } from '@/lib/schemas';
import { createStripeCheckoutSession, createStripePortalSession } from '@/lib/stripe';
import { headers } from 'next/headers';
import { getAuth as getClientAuth, sendPasswordResetEmail } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { sendWelcomeEmail as sendWelcomeEmailAdmin, sendFeedbackAcknowledgmentEmail } from '@/lib/mailgun';

export async function getAppStatus(): Promise<{ isUpdating: boolean }> {
    return getAppStatusAdmin();
}

export async function incrementDashboardViewCount(uid: string): Promise<{success: boolean}> {
  try {
    await incrementUserUsageAdmin(uid);
    return { success: true };
  } catch {
    console.error(`Failed to increment dashboard view for user ${uid}`);
    return { success: false };
  }
}

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

export async function handleWelcomeEmail(email: string, name: string): Promise<{success: boolean}> {
    if (!email) return { success: false };
    try {
        await sendWelcomeEmailAdmin({ to: email, name: name || email.split('@')[0] });
        return { success: true };
    } catch (error) {
        console.error(`Failed to send welcome email to ${email}:`, error);
        return { success: false };
    }
}

export async function createCheckoutSession(uid: string, gaClientId: string | null): Promise<{ sessionId: string }> {
    const user = await getOrCreateUserAdmin(uid);
    const headersList = await headers();
    const origin = headersList.get('origin')!;

    const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID!;
    if (!priceId) {
        throw new Error('Stripe Price ID is not configured.');
    }

    const sessionMetadata: { ga_client_id?: string } = {};
    if (gaClientId) {
        sessionMetadata.ga_client_id = gaClientId;
    }

    const sessionId = await createStripeCheckoutSession(
        uid,
        user.email,
        priceId,
        `${origin}/`,
        `${origin}/`,
        sessionMetadata
    );

    return { sessionId };
}

export async function createStripePortalLink(uid: string): Promise<{ portalUrl: string }> {
  const user = await getOrCreateUserAdmin(uid);
  const stripeCustomerId = user.stripeCustomerId;

  if (!stripeCustomerId) {
    throw new Error('User does not have a Stripe Customer ID.');
  }

  const headersList = await headers();
  const origin = headersList.get('origin')!;
  const returnUrl = `${origin}/account`;

  const portalUrl = await createStripePortalSession(stripeCustomerId, returnUrl);

  return { portalUrl };
}

export async function sendPasswordReset(email: string): Promise<void> {
  const auth = getClientAuth(app);
  await sendPasswordResetEmail(auth, email);
}

export async function handleFeedbackSurvey(uid: string, data: FeedbackSurveyData): Promise<{success: boolean}> {
    try {
        await saveFeedbackSurveyAdmin(uid, data);
        return { success: true };
    } catch (error: any) {
        console.error(`Failed to save feedback survey for user ${uid}`, error);
        throw new Error(error.message || "Could not save survey.");
    }
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
