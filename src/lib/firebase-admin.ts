

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

if (!getAdminApps().length) {
  // The storageBucket property is removed to allow the SDK to dynamically
  // access the bucket specified in the GCS URI.
  adminApp = initializeAdminApp({
    credential: admin.credential.cert(serviceAccount),
  });
} else {
  adminApp = getAdminApps()[0]!;
}

adminDb = getAdminFirestore(adminApp);
adminStorage = getAdminStorage(adminApp);


const StockSchema = z.object({
  id: z.string(), // Document ID is the ticker
  company_name: z.string(),
  image_uri: z.string().optional(),
  bundle_gcs_path: z.string(), // Mapped from 'profile'
  recommendation_analysis: z.string().optional(),
  recommendation: z.string().optional(),
  pages_json: z.string().optional(),
  dashboard_json: z.string().optional(),
  weighted_score: z.number().optional(),
});
export type Stock = z.infer<typeof StockSchema>;

const EconomicEventSchema = z.object({
    id: z.string(),
    event_name: z.string(),
    date: z.string(),
    country: z.string().optional(),
    impact: z.string().optional(),
    ticker: z.string().optional(),
});
export type EconomicEvent = z.infer<typeof EconomicEventSchema>;


const OptionCandidateSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  options_score: z.number(),
  type: z.enum(['CALL', 'PUT']),
  stock_price: z.number(),
  strike_price: z.number(),
  expiry_date: z.string(),
  premium: z.number(),
  delta: z.number(),
});
export type OptionCandidate = z.infer<typeof OptionCandidateSchema>;

const WinnerSchema = z.object({
  id: z.string(),
  company_name: z.string(),
  image_uri: z.string().optional(),
  industry: z.string(),
  last_close: z.number(),
  outlook_signal: z.string(),
  run_date: z.string(),
  thirty_day_change_pct: z.number(),
  ticker: z.string(),
  weighted_score: z.number().optional(),
});
export type Winner = z.infer<typeof WinnerSchema>;

export async function getWinnersDashboardAdmin(): Promise<Winner[]> {
    try {
        const querySnapshot = await adminDb.collection("winners_dashboard").get();
        const winners = querySnapshot.docs.map(doc => {
             const data = doc.data();
             return {
                id: doc.id,
                company_name: data.company_name,
                image_uri: data.image_uri,
                industry: data.industry,
                last_close: data.last_close,
                outlook_signal: data.outlook_signal,
                run_date: data.run_date,
                thirty_day_change_pct: data.thirty_day_change_pct,
                ticker: data.ticker,
                weighted_score: data.weighted_score,
            };
        }).filter(winner => {
            const validation = WinnerSchema.safeParse(winner);
            if (!validation.success) {
                 console.error("Invalid winner data from Firestore:", validation.error.flatten());
            }
            return validation.success;
        }) as Winner[];
        
        // Sort by outlook_signal: Bullish > Neutral/Other > Bearish
        winners.sort((a, b) => {
            const aSignal = a.outlook_signal.toLowerCase();
            const bSignal = b.outlook_signal.toLowerCase();

            const score = (signal: string) => {
                if (signal.includes('bullish')) return 2;
                if (signal.includes('bearish')) return 0;
                return 1;
            };

            return score(bSignal) - score(aSignal);
        });

        return winners;

    } catch (error) {
        console.error('Error fetching winners dashboard:', error);
        return [];
    }
}


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
            pages_json: data.pages_json,
            image_uri: data.image_uri,
            dashboard_json: data.dashboard_json,
            weighted_score: data.weighted_score,
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

export async function getEconomicEventsAdmin(): Promise<EconomicEvent[]> {
    try {
        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(now.getDate() + 30);
        
        const nowStr = now.toISOString().split('T')[0];
        const thirtyDaysFromNowStr = thirtyDaysFromNow.toISOString().split('T')[0];

        const eventsQuerySnapshot = await adminDb.collectionGroup('events')
            .where('date', '>=', nowStr)
            .where('date', '<=', thirtyDaysFromNowStr)
            .orderBy('date', 'asc')
            .get();

        const events: EconomicEvent[] = [];
        const priorityKeywords = ['earnings', 'inflation', 'interest rate', 'fed', 'cpi', 'ppi'];
        
        eventsQuerySnapshot.forEach(doc => {
            const data = doc.data();
            const parentPath = doc.ref.parent.parent?.path; // Gives 'calendar_events/TICKER'
            const ticker = parentPath ? parentPath.split('/')[1] : undefined;

            const event = {
                id: doc.id,
                event_name: data.name,
                date: data.date,
                country: data.country,
                impact: data.impact,
                ticker: ticker,
            };
            
            const validation = EconomicEventSchema.safeParse(event);
            if (validation.success) {
                events.push(validation.data);
            } else {
                 console.error("Invalid event data from Firestore:", validation.error.flatten());
            }
        });

        // Prioritize events with keywords
        events.sort((a, b) => {
            const aIsPriority = priorityKeywords.some(keyword => a.event_name.toLowerCase().includes(keyword));
            const bIsPriority = priorityKeywords.some(keyword => b.event_name.toLowerCase().includes(keyword));
            if (aIsPriority && !bIsPriority) return -1;
            if (!aIsPriority && bIsPriority) return 1;
            return 0; // Keep original sort order (by date) otherwise
        });

        return events;

    } catch (error) {
        console.error('Error fetching economic events:', error);
        return [];
    }
}


export async function getTopStocksAdmin(type: 'BUY' | 'SELL', limit: number): Promise<Stock[]> {
    try {
        const order = type === 'BUY' ? 'desc' : 'asc';
        const querySnapshot = await adminDb.collection('tickers')
            .orderBy('weighted_score', order)
            .limit(limit)
            .get();
        
        const stocks: Stock[] = [];
        querySnapshot.forEach(doc => {
             const data = doc.data();
             const stock = {
                id: doc.id,
                company_name: data.company_name,
                bundle_gcs_path: data.profile,
                recommendation_analysis: data.recommendation_analysis,
                recommendation: data.recommendation,
                pages_json: data.pages_json,
                image_uri: data.image_uri,
                dashboard_json: data.dashboard_json,
                weighted_score: data.weighted_score,
            };
            const validation = StockSchema.safeParse(stock);
            if (validation.success) {
                stocks.push(validation.data);
            } else {
                console.error(`Invalid top ${type} stock data from Firestore:`, validation.error.flatten());
            }
        });

        return stocks;
    } catch (error) {
        console.error(`Error fetching top ${type} stocks:`, error);
        return [];
    }
}


export async function getTopOptionsAdmin(type: 'CALL' | 'PUT', limit: number): Promise<OptionCandidate[]> {
    try {
        const querySnapshot = await adminDb.collection('options_candidates')
            .where('type', '==', type)
            .orderBy('options_score', 'desc')
            .limit(limit)
            .get();

        const options: OptionCandidate[] = [];
        querySnapshot.forEach(doc => {
            const data = doc.data();
             const option = {
                id: doc.id,
                symbol: data.symbol,
                options_score: data.options_score,
                type: data.type,
                stock_price: data.stock_price,
                strike_price: data.strike_price,
                expiry_date: data.expiry_date,
                premium: data.premium,
                delta: data.delta,
            };
            const validation = OptionCandidateSchema.safeParse(option);
            if (validation.success) {
                options.push(validation.data);
            } else {
                console.error(`Invalid top ${type} option data from Firestore:`, validation.error.flatten());
            }
        });
        
        return options;
    } catch (error) {
        console.error(`Error fetching top ${type} options:`, error);
        return [];
    }
}


export async function getDashboardDataAdmin(ticker: string): Promise<any | null> {
    try {
        const docRef = adminDb.collection("tickers").doc(ticker.toUpperCase());
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            console.warn(`No stock found for ticker: ${ticker}`);
            return null;
        }

        const stockData = docSnap.data();
        const gcsPath = stockData?.dashboard_json;

        if (typeof gcsPath === 'string' && gcsPath.startsWith('gs://')) {
            const content = await getGcsFileContentAdmin(gcsPath);
            return JSON.parse(content);
        } else {
            console.warn(`No valid dashboard_json GCS path for ticker: ${ticker}`);
            return null;
        }
    } catch (error) {
        console.error(`Error fetching dashboard data for ${ticker}:`, error);
        return null;
    }
}

export async function getSeoPageGcsPathAdmin(ticker: string): Promise<string | null> {
    try {
        const docRef = adminDb.collection("tickers").doc(ticker.toUpperCase());
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            console.warn(`No stock found for ticker: ${ticker}`);
            return null;
        }

        const stockData = docSnap.data();
        const gcsPath = stockData?.pages_json;

        if (typeof gcsPath === 'string' && gcsPath.startsWith('gs://')) {
            return gcsPath;
        } else {
            console.warn(`No valid pages_json GCS path for ticker: ${ticker}`);
            return null;
        }
    } catch (error) {
        console.error(`Error fetching SEO page GCS path for ${ticker}:`, error);
        throw error;
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
                pages_json: data.pages_json,
                image_uri: data.image_uri,
                dashboard_json: data.dashboard_json,
                weighted_score: data.weighted_score,
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

export async function getRandomSellStockAdmin(): Promise<Stock | null> {
    try {
        const q = adminDb.collection("tickers").where("recommendation", "==", "SELL");
        const querySnapshot = await q.get();
        if (querySnapshot.empty) {
            console.warn("No stocks with 'SELL' recommendation found.");
            return null;
        }

        const sellStocks: Stock[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const stock = {
                id: doc.id,
                company_name: data.company_name,
                bundle_gcs_path: data.profile,
                recommendation_analysis: data.recommendation_analysis,
                recommendation: data.recommendation,
                pages_json: data.pages_json,
                image_uri: data.image_uri,
                dashboard_json: data.dashboard_json,
                weighted_score: data.weighted_score,
            };
             const validation = StockSchema.safeParse(stock);
            if (validation.success) {
                sellStocks.push(validation.data);
            } else {
                console.error("Invalid 'SELL' stock data from Firestore:", validation.error.flatten());
            }
        });
        
        if (sellStocks.length === 0) {
            return null;
        }

        const randomIndex = Math.floor(Math.random() * sellStocks.length);
        return sellStocks[randomIndex];

    } catch (error) {
        console.error("Error fetching random 'SELL' stock:", error);
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
        console.error(`Failed to fetch GCS file at URI: ${uri}. Code: ${error.code}. Message: ${error.message}`);
        // Re-throw the error to be handled by the calling function.
        // The error.code can be useful for debugging permissions (403) vs. not found (404).
        throw new Error(`Could not read file from GCS at ${uri}. Reason: ${error.message}`);
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

    




