'use server';

import { initializeApp as initializeAdminApp, getApps as getAdminApps } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore, FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';
import type { DbUser } from './firebase';

// Restore to the simplest initialization. The hosting environment provides the credentials.
if (getAdminApps().length === 0) {
  initializeApp();
}

const adminDb = getAdminFirestore();

const StockSchema = z.object({
  id: z.string(), // Document ID is the ticker
  company_name: z.string(),
  bundle_gcs_path: z.string(), // Mapped from 'profile'
  recommendation_analysis: z.string().optional(),
});
export type Stock = z.infer<typeof StockSchema>;


// This function now uses the Admin SDK and should only be called from the server (e.g., in a Server Action)
export async function getStocksAdmin(): Promise<Stock[]> {
  try {
    const querySnapshot = await adminDb.collection("tickers").get();
    const stocks: Stock[] = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const stock = {
            id: doc.id,
            company_name: data.company_name,
            bundle_gcs_path: data.profile, // Map profile to bundle_gcs_path
            recommendation_analysis: data.recommendation_analysis,
        };
        const validation = StockSchema.safeParse(stock);
        if (validation.success) {
            stocks.push(validation.data);
        } else {
            console.error("Invalid stock data from Firestore:", validation.error.flatten());
        }
    });
    return stocks;
  } catch (error) {
    console.error("Error fetching stocks from Firestore:", error);
    // Return an empty array to allow the page to load instead of hanging.
    return [];
  }
}

/** Convert a gs:// URI into its bucket and object path parts. */
function parseGcsUri(uri: string): { bucket: string; objectPath: string } {
  if (!uri.startsWith('gs://')) {
    throw new Error(`Invalid GCS URI: ${uri}`);
  }
  const [bucket, ...objectPathParts] = uri.substring(5).split('/');
  return { bucket, objectPath: objectPathParts.join('/') };
}

export async function getGcsFileContentAdmin(uri: string): Promise<string> {
    try {
        // Dynamically import to ensure it's only loaded on the server
        const { Storage } = await import('@google-cloud/storage');
        // Initialize the client without a hardcoded project ID, so it uses the default credentials.
        const storage = new Storage();
        const { bucket, objectPath } = parseGcsUri(uri);
        const [contents] = await storage.bucket(bucket).file(objectPath).download();
        return contents.toString();
    } catch (error: any) {
        console.error(`Failed to fetch GCS file at URI: ${uri}`, {
            errorMessage: error.message,
            errorStack: error.stack,
        });
        // Re-throw the error to be handled by the calling function
        throw new Error(`Could not read file from GCS: ${error.message}`);
    }
}

export async function getStockDataBundleAdmin(uri: string): Promise<any> {
    const contents = await getGcsFileContentAdmin(uri);
    return JSON.parse(contents);
}


export async function getRandomStocks(count: number): Promise<Stock[]> {
    const allStocks = await getStocksAdmin();
    
    // Shuffle the array
    for (let i = allStocks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allStocks[i], allStocks[j]] = [allStocks[j], allStocks[i]];
    }

    return allStocks.slice(0, count);
}

// Admin version of user management functions
export async function getOrCreateUserAdmin(
  uid: string,
  isAnonymous: boolean = false,
  displayName?: string,
  email?: string,
  stripeCustomerId?: string
): Promise<DbUser> {
  const userRef = adminDb.collection('users').doc(uid);
  const userSnap = await userRef.get();

  if (userSnap.exists) {
    const userData = userSnap.data() as DbUser;
    if (!userData.stripeCustomerId && stripeCustomerId) {
      await userRef.set({ stripeCustomerId }, { merge: true });
      return { ...userData, stripeCustomerId };
    }
    return userData;
  }

  const newUser: DbUser = {
    uid,
    email: email ?? null,
    displayName: displayName ?? null,
    isAnonymous,
    isSubscribed: false,
    usageCount: 0,
    createdAt: FieldValue.serverTimestamp(),
    stripeCustomerId: stripeCustomerId ?? null,
  };

  await userRef.set(newUser);
  return newUser;
}

export async function incrementUserUsageAdmin(uid: string) {
  const userRef = adminDb.collection('users').doc(uid);
  await userRef.update({ usageCount: FieldValue.increment(1) });
}

export async function setUserSubscriptionStatusAdmin(
  uid: string,
  isSubscribed: boolean
) {
  const userRef = adminDb.collection('users').doc(uid);
  await userRef.set({ isSubscribed }, { merge: true });
}

export async function getUserByStripeCustomerIdAdmin(stripeCustomerId: string): Promise<DbUser | null> {
    const usersRef = adminDb.collection('users');
    const q = await usersRef.where('stripeCustomerId', '==', stripeCustomerId).limit(1).get();
    
    if (!q.empty) {
        return q.docs[0].data() as DbUser;
    }
    return null;
}
