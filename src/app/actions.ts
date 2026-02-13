'use server';

import { 
  getStocksAdmin, 
  handleWinSubmission as handleWinSubmissionAdmin,
  incrementUserUsageAdmin,
  getTickerEventsAdmin,
  getPerformanceSignals,
  getOrCreateUserAdmin
} from "@/lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { createStripeCheckoutSession, createStripePortalSession } from "@/lib/stripe";

export async function getStocks() {
  return await getStocksAdmin();
}

export async function handleWinSubmission(formData: FormData) {
   // We need the UID, which usually comes from auth context. 
   // In a server action, we might need to verify the token or pass the UID.
   // For now, let's assume the UID is passed in the form data or we can get it if we had session management.
   // But wait, the original handleWinSubmission took (uid, formData).
   
   // Let's assume the client passes the UID in formData for now, or we'll need a different approach.
   const uid = formData.get('uid') as string;
   if (!uid) return { success: false, error: "User ID missing" };
   
   return await handleWinSubmissionAdmin(uid, formData);
}

export async function incrementDashboardViewCount(uid: string) {
    await incrementUserUsageAdmin(uid);
}

export async function getEconomicEvents() {
    return await getTickerEventsAdmin(undefined, 'economic');
}

export async function getPerformanceSignalsAction(order: 'asc' | 'desc', limit: number) {
    return await getPerformanceSignals(order, limit);
}

// Placeholder for deprecated actions to prevent build errors
export async function sendPasswordReset(email: string) {
    console.warn("sendPasswordReset is deprecated/not implemented");
    return { success: false, error: "Not implemented" };
}

export async function handleCancellationIntent(uid: string, feedback: string) {
    const user = await getOrCreateUserAdmin(uid);
    if (!user.stripeCustomerId) {
        // Fallback or error
         console.warn("User has no stripe customer ID for portal");
         return { success: false, portalUrl: null }; 
    }
    const portalUrl = await createStripePortalSession(user.stripeCustomerId, 'https://gammarips.com/account');
    return { success: true, portalUrl };
}

export async function createCheckoutSession(uid: string, gaClientId?: string | null) {
     const user = await getOrCreateUserAdmin(uid);
     // Default to Edge plan if called via this legacy method
     const priceId = process.env.NEXT_PUBLIC_STRIPE_OVERNIGHT_EDGE_PRICE_ID; 
     
     if (!priceId) throw new Error("Price ID missing");

     const sessionId = await createStripeCheckoutSession(
        uid,
        user.email, 
        priceId,
        `https://gammarips.com/signals?success=true`, 
        `https://gammarips.com/signals?canceled=true`,
        { ga_client_id: gaClientId || '' }
     );
     return { sessionId };
}
