

'use server';

import { initializeApp as initializeAdminApp, getApps as getAdminApps, App as AdminApp, type ServiceAccount } from 'firebase-admin/app';
import admin from 'firebase-admin';
import { getFirestore as getAdminFirestore, FieldValue } from 'firebase-admin/firestore';
import { getStorage as getAdminStorage } from 'firebase-admin/storage';
import { z } from 'zod';
import type { DbUser } from './firebase';
import { randomUUID } from 'crypto';

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
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
} else {
  adminApp = getAdminApps()[0]!;
}

adminDb = getAdminFirestore(adminApp);
adminStorage = getAdminStorage(adminApp);


const StockSchema = z.object({
  id: z.string(), // Document ID is the ticker
  company_name: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  image_uri: z.string().optional(),
  bundle_gcs_path: z.string().optional(),
  recommendation_analysis: z.string().optional(),
  recommendation: z.string().optional(),
  pages_json: z.string().optional(),
  dashboard_json: z.string().optional(),
  weighted_score: z.number().optional(),
});
export type Stock = z.infer<typeof StockSchema>;

const TickerEventSchema = z.object({
    id: z.string(),
    event_name: z.string(),
    event_date: z.string(),
    event_type: z.string().optional(),
    ticker: z.string().nullable(),
});
export type TickerEvent = z.infer<typeof TickerEventSchema>;


const OptionCandidateSchema = z.object({
  id: z.string(),
  contract_symbol: z.string(),
  ticker: z.string(),
  option_type: z.enum(['call', 'put']),
  expiration_date: z.string(),
  strike: z.number(),
  last_price: z.number().nullable(),
  volume: z.number().nullable(),
  implied_volatility: z.number().nullable(),
  options_score: z.number(),
});
export type OptionCandidate = z.infer<typeof OptionCandidateSchema>;

const PerformanceSignalSchema = z.object({
    id: z.string(),
    ticker: z.string(),
    company_name: z.string(),
    image_uri: z.string().optional().nullable(),
    industry: z.string(),
    contract_symbol: z.string(),
    initial_price: z.number(),
    current_price: z.number(),
    percent_gain: z.number(),
    option_type: z.enum(['call', 'put']).optional(),
    status: z.string().optional(),
});
export type PerformanceSignal = z.infer<typeof PerformanceSignalSchema>;

const OptionsSignalSchema = z.object({
    id: z.string().optional(), // Adding ID for React keys
    contract_symbol: z.string(),
    expiration_date: z.string(),
    implied_volatility: z.number(),
    iv_signal: z.string().optional(),
    option_type: z.enum(['call', 'put']),
    run_date: z.string(),
    setup_quality_signal: z.string().optional(),
    stock_price_trend_signal: z.string().optional(),
    volatility_comparison_signal: z.string().optional(),
    strike_price: z.number(),
    summary: z.string(),
    ticker: z.string(),
    company_name: z.string(),
});
export type OptionsSignal = z.infer<typeof OptionsSignalSchema>;

const TickerOptionsDataSchema = z.object({
    calls: z.array(OptionsSignalSchema),
    puts: z.array(OptionsSignalSchema),
    company_name: z.string(),
    ticker: z.string(),
});
export type TickerOptionsData = z.infer<typeof TickerOptionsDataSchema>;

const WinnerSchema = z.object({
    id: z.string(),
    company_name: z.string(),
    image_uri: z.string().optional().nullable(),
    industry: z.string(),
    sector: z.string().optional().nullable(),
    last_close: z.number(),
    outlook_signal: z.string(),
    run_date: z.string(),
    thirty_day_change_pct: z.number(),
    ticker: z.string(),
    weighted_score: z.number().nullable(),
    option_type: z.enum(['call', 'put']),
    strike_price: z.number(),
    expiration_date: z.string(),
    options_score: z.number().optional().nullable(),
});
export type Winner = z.infer<typeof WinnerSchema>;

export async function getPerformanceTrackerStatsAdmin(): Promise<{ averageGain: number; signalCount: number; winRate: number; averageWinnerGain: number; averageLoserGain: number; }> {
    const defaultStats = {
        averageGain: 0,
        signalCount: 0,
        winRate: 0,
        averageWinnerGain: 0,
        averageLoserGain: 0,
    };

    try {
        // Get today's date in YYYY-MM-DD format, corrected for timezone.
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;

        const snapshot = await adminDb.collection('performance_tracker').get();

        if (snapshot.empty) {
            return defaultStats;
        }

        let totalPercentGain = 0;
        let winnersSum = 0;
        let losersSum = 0;
        let winnerCount = 0;
        let loserCount = 0;
        
        let validSignalCount = 0;

        snapshot.forEach(doc => {
            const data = doc.data();
            
            // Only include documents where run_date is not today
            if (data.run_date && data.run_date !== todayStr) {
                const gain = data.percent_gain;
                
                if (typeof gain === 'number') {
                    totalPercentGain += gain;
                    validSignalCount++;

                    if (gain > 0) {
                        winnersSum += gain;
                        winnerCount++;
                    } else if (gain < 0) {
                        losersSum += gain;
                        loserCount++;
                    }
                }
            }
        });
        
        if (validSignalCount === 0) {
            return defaultStats;
        }

        return {
            averageGain: totalPercentGain / validSignalCount,
            signalCount: validSignalCount,
            winRate: (winnerCount / validSignalCount) * 100,
            averageWinnerGain: winnerCount > 0 ? winnersSum / winnerCount : 0,
            averageLoserGain: loserCount > 0 ? losersSum / loserCount : 0,
        };

    } catch (error) {
        console.error('Error fetching performance tracker stats:', error);
        return defaultStats;
    }
}


export async function getPerformanceSignals(
  order: 'asc' | 'desc',
  limit: number
): Promise<PerformanceSignal[]> {
  try {
    const snapshot = await adminDb
      .collection('performance_tracker')
      .orderBy('percent_gain', order)
      .limit(limit)
      .get();

    if (snapshot.empty) {
      return [];
    }

    const signals: PerformanceSignal[] = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      const signal = {
        id: doc.id,
        ticker: data.ticker,
        company_name: data.company_name,
        image_uri: data.image_uri,
        industry: data.industry,
        contract_symbol: data.contract_symbol,
        initial_price: data.initial_price,
        current_price: data.current_price,
        percent_gain: data.percent_gain,
        option_type: data.option_type,
      };
      const validation = PerformanceSignalSchema.safeParse(signal);
      if (validation.success) {
        signals.push(validation.data);
      } else {
        console.warn(`Invalid performance signal data in Firestore for doc ${doc.id}:`, validation.error.flatten());
      }
    });

    return signals;
  } catch (error) {
    console.error('Error fetching performance signals:', error);
    return [];
  }
}

export async function getPerformanceSignalsByTickerAdmin(ticker: string): Promise<PerformanceSignal[]> {
    try {
        const snapshot = await adminDb.collection('performance_tracker').where('ticker', '==', ticker).get();

        if (snapshot.empty) {
            return [];
        }

        const signals: PerformanceSignal[] = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            const signal = {
                id: doc.id,
                ticker: data.ticker,
                company_name: data.company_name,
                image_uri: data.image_uri,
                industry: data.industry,
                contract_symbol: data.contract_symbol,
                initial_price: data.initial_price,
                current_price: data.current_price,
                percent_gain: data.percent_gain,
                option_type: data.option_type,
                status: data.status,
            };
            const validation = PerformanceSignalSchema.safeParse(signal);
            if (validation.success) {
                signals.push(validation.data);
            } else {
                console.warn(`Invalid performance signal data for ticker ${ticker}:`, validation.error.flatten());
            }
        });

        // Sort by percent_gain descending
        signals.sort((a, b) => b.percent_gain - a.percent_gain);

        return signals;
    } catch (error) {
        console.error(`Error fetching performance signals for ticker ${ticker}:`, error);
        return [];
    }
}

export async function saveFeedbackAdmin(
  message: string, 
  replyToEmail: string, 
  user: { uid: string; email: string | null } | null
): Promise<void> {
  try {
    await adminDb.collection("feedback").add({
      message,
      replyToEmail,
      user,
      status: 'new',
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error("Error writing feedback to Firestore with Admin SDK: ", error);
    throw new Error("Could not save feedback to the database.");
  }
}

export async function getOptionsHeaderSignalAdmin(ticker: string): Promise<OptionsSignal | null> {
    try {
        const docRef = adminDb.collection("options_signals").doc(ticker.toUpperCase());
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            console.warn(`No options signals found for ticker: ${ticker}`);
            return null;
        }

        const data = docSnap.data();
        
        // Find the first 'call' signal to use for the header
        const headerSignal = data?.calls?.[0] ?? null;
        if (!headerSignal) {
             console.warn(`No 'call' option signals found for ticker: ${ticker} to create header.`);
             return null;
        }

        const validation = OptionsSignalSchema.safeParse(headerSignal);

        if (!validation.success) {
            console.error(`Invalid options header signal data for ${ticker}:`, validation.error.flatten());
            return null;
        }
        
        return validation.data;
    } catch (error) {
        console.error(`Error fetching options header signal for ${ticker}:`, error);
        return null;
    }
}


export async function getNoteworthyOptionsAdmin(ticker: string): Promise<OptionsSignal[]> {
    try {
        const docRef = adminDb.collection("options_signals").doc(ticker.toUpperCase());
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            console.warn(`No options_signals document found for ticker: ${ticker}`);
            return [];
        }

        const data = docSnap.data() as TickerOptionsData;
        const allSignals = [...(data.calls || []), ...(data.puts || [])];

        const strongSetups = allSignals.filter(
            (signal) => signal.setup_quality_signal === "Strong"
        );
        
        strongSetups.forEach(s => s.id = s.contract_symbol);
        
        return strongSetups;

    } catch (error) {
        console.error(`Error fetching noteworthy options from options_signals for ${ticker}:`, error);
        return [];
    }
}


export async function getWinnersDashboardAdmin(): Promise<Winner[]> {
    try {
        const querySnapshot = await adminDb.collection("winners_dashboard").get();
        const winners: Winner[] = [];
        querySnapshot.docs.forEach(doc => {
             const data = doc.data();
             const winnerData: any = { // Use any to bypass strict checking before validation
                id: doc.id,
                company_name: data.company_name,
                image_uri: data.image_uri,
                industry: data.industry,
                sector: data.sector,
                last_close: data.last_close,
                outlook_signal: data.outlook_signal,
                run_date: data.run_date,
                thirty_day_change_pct: data.thirty_day_change_pct,
                ticker: data.ticker,
                weighted_score: isNaN(data.weighted_score) ? null : data.weighted_score,
                option_type: data.option_type,
                strike_price: data.strike_price,
                expiration_date: data.expiration_date,
                options_score: data.options_score,
            };
            const validation = WinnerSchema.safeParse(winnerData);
            if (validation.success) {
                winners.push(validation.data);
            } else {
                console.error("Invalid winner data from Firestore:", validation.error.flatten());
            }
        });
        
        winners.sort((a, b) => {
            const scoreA = a.weighted_score ?? -1;
            const scoreB = b.weighted_score ?? -1;
            return scoreB - scoreA; // Sort in descending order
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
            industry: data.industry,
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

export async function getTickerEventsAdmin(ticker: string): Promise<TickerEvent[]> {
    try {
        const eventsCollectionRef = adminDb.collection('calendar_events');
        const allEvents: TickerEvent[] = [];

        // 1. Get all ticker-specific events
        const tickerQuery = eventsCollectionRef.where('entity', '==', ticker.toUpperCase());
        const tickerSnapshot = await tickerQuery.get();
        tickerSnapshot.forEach(doc => {
            const data = doc.data();
            const event = {
                id: doc.id,
                event_name: data.event_name,
                event_date: data.event_date,
                event_type: data.event_type,
                ticker: data.entity,
            };
            const validation = TickerEventSchema.safeParse(event);
            if (validation.success) {
                allEvents.push(validation.data);
            } else {
                console.warn(`Invalid ticker-specific event data for ${ticker}:`, validation.error.flatten());
            }
        });

        // 2. Get all general economic events (entity is null)
        const economicQuery = eventsCollectionRef.where('entity', '==', null);
        const economicSnapshot = await economicQuery.get();
        economicSnapshot.forEach(doc => {
            const data = doc.data();
            const event = {
                id: doc.id,
                event_name: data.event_name,
                event_date: data.event_date,
                event_type: data.event_type,
                ticker: data.entity,
            };
             const validation = TickerEventSchema.safeParse(event);
            if (validation.success) {
                allEvents.push(validation.data);
            } else {
                console.warn(`Invalid economic event data:`, validation.error.flatten());
            }
        });

        // Remove duplicates and filter out specific events
        const filteredEvents = allEvents.filter(event => !event.event_name.includes('CPI s.a'));
        const uniqueEvents = Array.from(new Map(filteredEvents.map(e => [`${e.event_name}|${e.event_date}`, e])).values());


        // Sort all merged events by date
        uniqueEvents.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
        
        return uniqueEvents;

    } catch (error) {
        console.error(`Error fetching events for ticker ${ticker}:`, error);
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
                ticker: data.ticker,
                volume: data.volume,
                implied_volatility: data.implied_volatility,
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

export async function getOptionsCandidatesAdmin(ticker?: string): Promise<OptionCandidate[]> {
    try {
        const candidatesCollection = adminDb.collection('options_candidates');
        let query;

        if (ticker) {
            query = candidatesCollection.where('ticker', '==', ticker.toUpperCase());
        } else {
            query = candidatesCollection;
        }
        
        const querySnapshot = await query.get();

        const candidates: OptionCandidate[] = [];
        querySnapshot.forEach(doc => {
            const data = doc.data();
            const candidateData = {
                id: doc.id,
                contract_symbol: data.contract_symbol,
                ticker: data.ticker,
                option_type: data.option_type,
                expiration_date: data.expiration_date,
                strike: data.strike,
                last_price: data.last_price,
                volume: data.volume,
                implied_volatility: data.implied_volatility,
                options_score: data.options_score,
            };
            const validation = OptionCandidateSchema.safeParse(candidateData);
            if (validation.success) {
                candidates.push(validation.data);
            } else {
                console.error(`Invalid options candidate data for doc ${doc.id}:`, validation.error.flatten());
            }
        });
        
        candidates.sort((a, b) => b.options_score - a.options_score);
        
        console.log(`Successfully fetched and validated ${candidates.length} options candidates for ticker: ${ticker}`);
        return candidates;

    } catch (error) {
        console.error(`Error fetching options candidates:`, error);
        return [];
    }
}



export async function getDashboardDataAdmin(ticker: string): Promise<any | null> {
    try {
        const docRef = adminDb.collection("tickers").doc(ticker.toUpperCase());
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            console.warn(`[getDashboardDataAdmin] No document found for ticker: ${ticker}`);
            return null;
        }
        
        const stockData = docSnap.data();
        const gcsPath = stockData?.dashboard_json;

        if (typeof gcsPath !== 'string' || !gcsPath.startsWith('gs://')) {
             console.warn(`[getDashboardDataAdmin] No valid dashboard_json GCS path for ticker: ${ticker}. Path found: ${gcsPath}`);
            return null;
        }

        console.log(`[getDashboardDataAdmin] Found GCS path for ${ticker}: ${gcsPath}`);
        const content = await getGcsFileContentAdmin(gcsPath);
        const dashboardData = JSON.parse(content);
        
        // Find the outlook signal from the winners_dashboard collection
        const winnersSnapshot = await adminDb.collection('winners_dashboard').where('ticker', '==', ticker.toUpperCase()).limit(1).get();
        if (!winnersSnapshot.empty) {
            const winnerData = winnersSnapshot.docs[0].data();
            dashboardData.outlookSignal = winnerData.outlook_signal;
        }

        return dashboardData;

    } catch (error: any) {
        console.error(`[getDashboardDataAdmin] Error fetching dashboard data for ${ticker}:`, error);
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

export async function handleWinSubmission(uid: string, formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const screenshot = formData.get('screenshot') as File;
    const tickers = formData.get('tickers') as string;
    const percentGain = parseFloat(formData.get('percentGain') as string);
    const user = await getOrCreateUserAdmin(uid);

    if (!screenshot || !tickers || isNaN(percentGain)) {
        return { success: false, error: 'Missing required fields.' };
    }

    // Upload image to GCS
    const bucket = adminStorage.bucket();
    const fileName = `user-wins/${uid}/${randomUUID()}-${screenshot.name}`;
    const file = bucket.file(fileName);
    const stream = file.createWriteStream({
      metadata: { contentType: screenshot.type },
    });
    
    const buffer = Buffer.from(await screenshot.arrayBuffer());
    stream.end(buffer);
    
    await new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
    });

    const imageUrl = `gs://${bucket.name}/${fileName}`;

    // Save metadata to Firestore
    await adminDb.collection('user_wins').add({
      uid,
      userDisplayName: user.displayName,
      userEmail: user.email,
      tickers,
      percentGain,
      screenshotUrl: imageUrl,
      status: 'pending', // for manual approval
      submittedAt: FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error handling win submission:', error);
    return { success: false, error: 'Failed to process your submission.' };
  }
}
    

    










    







