'use server';

import {
    getOrCreateUserAdmin,
    saveFeedbackAdmin,
    saveCancellationFeedbackAdmin,
    getAdminApp,
    isUserMcpEntitledAdmin,
    provisionMcpKeyAdmin,
    revokeMcpKeysForUserAdmin,
    getMcpKeyMetaAdmin,
} from '@/lib/firebase-admin';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { createStripeCheckoutSession, createStripePortalSession } from '@/lib/stripe';
import { headers } from 'next/headers';
import { getAuth as getClientAuth, sendPasswordResetEmail } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { sendFeedbackAcknowledgmentEmail } from '@/lib/mailgun';
import { createMachineClient } from '@/lib/oauth/clients';
import { listMachineClientsForUser, revokeClient } from '@/lib/oauth/store';

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

export async function createCheckoutSession(idToken: string, gaClientId: string | null, gaSessionId: string | null = null): Promise<{ sessionId: string }> {
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

    const sessionMetadata: { ga_client_id?: string; ga_session_id?: string; plan?: string } = { plan: 'pro' };
    if (gaClientId) {
        sessionMetadata.ga_client_id = gaClientId;
    }
    if (gaSessionId) {
        sessionMetadata.ga_session_id = gaSessionId;
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

// --- MCP API key lifecycle (self-serve, show-once) -------------------------

async function requireEntitledUid(idToken: string): Promise<string> {
  if (!idToken) throw new Error('Authentication required.');
  const decoded = await getAdminAuth(getAdminApp()).verifyIdToken(idToken);
  const uid = decoded.uid;
  const user = await getOrCreateUserAdmin(uid);
  // Server-side entitlement — the real paid signal, NOT the client's isPro and
  // NOT the site-wide FREE_MODE flag. MCP access is the paid product.
  if (!isUserMcpEntitledAdmin(user)) {
    throw new Error('An active GammaRips subscription is required to generate an API key.');
  }
  return uid;
}

/**
 * Generate (or rotate) the caller's MCP API key. Returns the RAW key exactly
 * once — it is never stored or recoverable. Any prior active key is revoked.
 */
export async function generateMcpApiKey(
  idToken: string
): Promise<{ key: string; keyPrefix: string; createdAtISO: string }> {
  const uid = await requireEntitledUid(idToken);
  const { rawKey, keyPrefix, createdAtISO } = await provisionMcpKeyAdmin(uid);
  return { key: rawKey, keyPrefix, createdAtISO };
}

/** Non-secret status of the caller's key (prefix + created date), for /account. */
export async function getMcpApiKeyStatus(
  idToken: string
): Promise<{ hasActiveKey: boolean; keyPrefix: string | null; createdAtISO: string | null }> {
  if (!idToken) throw new Error('Authentication required.');
  const decoded = await getAdminAuth(getAdminApp()).verifyIdToken(idToken);
  return getMcpKeyMetaAdmin(decoded.uid);
}

/** Manually revoke the caller's key(s) (e.g. suspected leak). */
export async function revokeMcpApiKey(idToken: string): Promise<{ revoked: number }> {
  if (!idToken) throw new Error('Authentication required.');
  const decoded = await getAdminAuth(getAdminApp()).verifyIdToken(idToken);
  const revoked = await revokeMcpKeysForUserAdmin(decoded.uid, 'user_revoked');
  return { revoked };
}

// --- OAuth machine clients (client_credentials, for headless agents) ------
//
// A machine client is a confidential OAuth client bound to the caller's uid.
// A VM agent posts grant_type=client_credentials to /oauth/token and gets a
// short-lived access token whose tier is re-read from the subscription on
// every mint. The secret is shown once; only its hash is stored.

export async function createOAuthMachineClient(
  idToken: string,
  name: string
): Promise<{ clientId: string; clientSecret: string; clientName: string }> {
  const uid = await requireEntitledUid(idToken);
  const { client_id, client_secret, client_name } = await createMachineClient(uid, name);
  return { clientId: client_id, clientSecret: client_secret, clientName: client_name };
}

export async function listOAuthMachineClients(idToken: string): Promise<
  Array<{ clientId: string; clientName: string; status: string; createdAtISO: string | null; lastUsedAtISO: string | null }>
> {
  if (!idToken) throw new Error('Authentication required.');
  const decoded = await getAdminAuth(getAdminApp()).verifyIdToken(idToken);
  const rows = await listMachineClientsForUser(decoded.uid);
  return rows.map((r) => ({
    clientId: r.client_id,
    clientName: r.client_name,
    status: r.status,
    createdAtISO: r.createdAtISO,
    lastUsedAtISO: r.lastUsedAtISO,
  }));
}

export async function revokeOAuthMachineClient(idToken: string, clientId: string): Promise<{ revoked: boolean }> {
  if (!idToken) throw new Error('Authentication required.');
  const decoded = await getAdminAuth(getAdminApp()).verifyIdToken(idToken);
  const revoked = await revokeClient(clientId, decoded.uid, 'user_revoked');
  return { revoked };
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
