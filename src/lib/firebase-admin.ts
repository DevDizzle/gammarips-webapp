
'use server';

import { initializeApp as initializeAdminApp, getApps as getAdminApps, App as AdminApp, type ServiceAccount } from 'firebase-admin/app';
import admin from 'firebase-admin';
import { getFirestore as getAdminFirestore, FieldValue } from 'firebase-admin/firestore';
import { getStorage as getAdminStorage } from 'firebase-admin/storage';
import { z } from 'zod';
import type { DbUser } from './firebase';

let adminApp: AdminApp;
let adminDb: ReturnType<typeof getAdminFirestore>;
let adminStorage: ReturnType<typeof getAdminStorage>;

// Updated logic to use individual environment variables from .env file
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
// Replace escaped newlines from environment variable, which is a common issue with .env files
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');


if (!projectId || !clientEmail || !privateKey) {
  throw new Error('Firebase server environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) are not set. Please add them to your .env file.');
}

const serviceAccount: ServiceAccount = {
  projectId,
  clientEmail,
  privateKey,
};

console.log('Attempting to initialize Firebase Admin SDK with:');
console.log(`Project ID: ${serviceAccount.projectId}`);
console.log(`Client Email: ${serviceAccount.clientEmail}`);


if (!getAdminApps().length) {
  adminApp = initializeAdminApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: `${serviceAccount.projectId}.appspot.com`,
  });
} else {
  adminApp = getAdminApps()[0]!;
}

adminDb = getAdminFirestore(adminApp);
adminStorage = getAdminStorage(adminApp);


const StockSchema = z.object({
  id: z.string(), // Document ID is the ticker
  company_name: z.string(),
  bundle_gcs_path: z.string(), // Mapped from 'profile'
  recommendation_analysis: z.string().optional(),
  recommendation: z.string().optional(),
});
export type Stock = z.infer<typeof StockSchema>;


// This function now uses the Admin SDK and should only be called from the server (e.g., in a Server Action)
export async function getStocksAdmin(): Promise<Stock[]> {
  try {
    const querySnapshot = await adminDb.collection("tickers").get();
    const stocks: Stock[] = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        // The 'profile' field from Firestore is mapped to 'bundle_gcs_path'
        const stock = {
            id: doc.id,
            company_name: data.company_name,
            bundle_gcs_path: data.profile,
            recommendation_analysis: data.recommendation_analysis,
            recommendation: data.recommendation,
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

export async function getRandomBuyStockAdmin(): Promise<Stock | null> {
    try {
        const q = adminDb.collection("tickers").where("recommendation", "==", "BUY");
        const querySnapshot = await q.get();
        if (querySnapshot.empty) {
            console.warn("No stocks with 'BUY' recommendation found.");
            return null;
        }

        const buyStocks: Stock[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const stock = {
                id: doc.id,
                company_name: data.company_name,
                bundle_gcs_path: data.profile,
                recommendation_analysis: data.recommendation_analysis,
                recommendation: data.recommendation,
            };
             const validation = StockSchema.safeParse(stock);
            if (validation.success) {
                buyStocks.push(validation.data);
            } else {
                console.error("Invalid 'BUY' stock data from Firestore:", validation.error.flatten());
            }
        });
        
        if (buyStocks.length === 0) {
            return null;
        }

        const randomIndex = Math.floor(Math.random() * buyStocks.length);
        return buyStocks[randomIndex];

    } catch (error) {
        console.error("Error fetching random 'BUY' stock:", error);
        throw error;
    }
}


/**
 * Extracts the bucket name and file path from a gs:// URI.
 * @param uri The GCS URI (e.g., gs://bucket-name/path/to/file.txt)
 * @returns An object with the bucket name and file path.
 */
function parseGcsUri(uri: string): { bucketName: string, filePath: string } {
    if (!uri.startsWith('gs://')) {
        throw new Error(`Invalid GCS URI: ${uri}`);
    }
    const path = uri.substring(5);
    const slashIndex = path.indexOf('/');
    if (slashIndex === -1) {
        throw new Error(`Invalid GCS URI format: ${uri}`);
    }
    const bucketName = path.substring(0, slashIndex);
    const filePath = path.substring(slashIndex + 1);
    return { bucketName, filePath };
}


export async function getGcsFileContentAdmin(uri: string): Promise<string> {
    try {
        const { bucketName, filePath } = parseGcsUri(uri);
        const bucket = adminStorage.bucket(bucketName);
        const file = bucket.file(filePath);
        const [contents] = await file.download();
        return contents.toString('utf8');
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
