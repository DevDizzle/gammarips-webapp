'use server';

import { initializeApp as initializeAdminApp, getApps as getAdminApps, App as AdminApp, type ServiceAccount } from 'firebase-admin/app';
import admin from 'firebase-admin';
import { getFirestore as getAdminFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getStorage as getAdminStorage } from 'firebase-admin/storage';
import type { DbUser } from './firebase';
import { randomUUID } from 'crypto';
import { unstable_noStore as noStore } from 'next/cache';
import { config } from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { format, subDays } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

import {
  StockSchema, type Stock,
  TickerEventSchema, type TickerEvent,
  OptionCandidateSchema, type OptionCandidate,
  PerformanceSignalSchema, type PerformanceSignal,
  OptionsSignalSchema, type OptionsSignal,
  WinnerSchema, type Winner,
  type FeedbackSurveyData,
  WatchlistItemSchema, type WatchlistItem
} from './schemas';

// Re-export types
export type { Stock, TickerEvent, OptionCandidate, PerformanceSignal, OptionsSignal, Winner, FeedbackSurveyData, WatchlistItem };


// Load environment variables from .env file
config();

let adminApp: AdminApp;

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

const adminDb = getAdminFirestore(adminApp);
const adminStorage = getAdminStorage(adminApp);


export async function getAppStatusAdmin(): Promise<{ isUpdating: boolean }> {
  noStore();
  try {
    const docRef = adminDb.collection('app_config').doc('status');
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      return { isUpdating: docSnap.data()?.isUpdating === true };
    }
    // Default to not updating if the document doesn't exist
    return { isUpdating: false };
  } catch (error) {
    console.error('Error fetching app status:', error);
    // Default to not updating in case of error to prevent locking out users
    return { isUpdating: false };
  }
}

export interface PerformanceStats {
    roi: number;
    signalCount: number;
    winRate: number;
    winnerRoi: number;
    loserRoi: number;
    winnerCount: number;
    loserCount: number;
}

export async function getPerformanceTrackerStatsAdmin(): Promise <PerformanceStats> {
    noStore(); // Opt out of caching for this specific function
    const defaultStats = {
        roi: 0,
        signalCount: 0,
        winRate: 0,
        winnerRoi: 0,
        loserRoi: 0,
        winnerCount: 0,
        loserCount: 0,
    };

    try {
        const snapshot = await adminDb.collection('performance_tracker').get();

        if (snapshot.empty) {
            return defaultStats;
        }

        let totalInitialValue = 0;
        let totalCurrentValue = 0;
        let totalInitialValueWinners = 0;
        let totalCurrentValueWinners = 0;
        let totalInitialValueLosers = 0;
        let totalCurrentValueLosers = 0;
        
        let validSignalCount = 0;
        let winnerCount = 0;
        let loserCount = 0;

        snapshot.forEach(doc => {
            const data = doc.data();
            const initialPrice = data.initial_price;
            const currentPrice = data.current_price;

            if (typeof initialPrice === 'number' && isFinite(initialPrice) && initialPrice > 0 && typeof currentPrice === 'number' && isFinite(currentPrice)) {
                validSignalCount++;
                totalInitialValue += initialPrice;
                totalCurrentValue += currentPrice;

                if (currentPrice > initialPrice) {
                    winnerCount++;
                    totalInitialValueWinners += initialPrice;
                    totalCurrentValueWinners += currentPrice;
                } else {
                    loserCount++;
                    totalInitialValueLosers += initialPrice;
                    totalCurrentValueLosers += currentPrice;
                }
            }
        });
        
        if (validSignalCount === 0 || totalInitialValue === 0) {
            return defaultStats;
        }

        const roi = ((totalCurrentValue - totalInitialValue) / totalInitialValue) * 100;
        const winRate = (winnerCount / validSignalCount) * 100;
        
        const winnerRoi = totalInitialValueWinners > 0
            ? ((totalCurrentValueWinners - totalInitialValueWinners) / totalInitialValueWinners) * 100
            : 0;
            
        const loserRoi = totalInitialValueLosers > 0
            ? ((totalCurrentValueLosers - totalInitialValueLosers) / totalInitialValueLosers) * 100
            : 0;

        return {
            roi: isFinite(roi) ? roi : 0,
            signalCount: validSignalCount,
            winRate: isFinite(winRate) ? winRate : 0,
            winnerRoi: isFinite(winnerRoi) ? winnerRoi : 0,
            loserRoi: isFinite(loserRoi) ? loserRoi : 0,
            winnerCount,
            loserCount
        };

    } catch (error) {
        console.error('Error fetching performance tracker stats:', error);
        return defaultStats;
    }
}


export async function getAllPerformanceSignalsAdmin(): Promise<PerformanceSignal[]> {
    noStore();
    try {
        const snapshot = await adminDb.collection('performance_tracker').get();
        if (snapshot.empty) {
            return [];
        }

        const signals: PerformanceSignal[] = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            const initialPrice = data.initial_price;
            const currentPrice = data.current_price;

            if (typeof initialPrice === 'number' && initialPrice > 0 && typeof currentPrice === 'number') {
                const calculatedGain = ((currentPrice - initialPrice) / initialPrice) * 100;
                
                const parsedData = {
                    id: doc.id,
                    run_date: data.run_date,
                    ticker: data.ticker,
                    company_name: data.company_name,
                    image_uri: data.image_uri,
                    industry: data.industry,
                    contract_symbol: data.contract_symbol,
                    initial_price: initialPrice,
                    current_price: currentPrice,
                    percent_gain: calculatedGain, // Use calculated gain
                    option_type: data.option_type,
                    status: data.status,
                    strike_price: data.strike_price,
                    expiration_date: data.expiration_date,
                };

                const validation = PerformanceSignalSchema.safeParse(parsedData);
                if (validation.success) {
                    signals.push(validation.data);
                } else {
                    console.warn(`Invalid performance signal data in Firestore for doc ${doc.id}:`, validation.error.flatten());
                }
            }
        });

        // Sort by run_date descending by default
        signals.sort((a, b) => new Date(b.run_date).getTime() - new Date(a.run_date).getTime());
        
        return signals;

    } catch (error) {
        console.error('Error fetching all performance signals:', error);
        return [];
    }
}

export async function getPerformanceSignalsByOptionType(
    optionType: 'call' | 'put',
    order: 'asc' | 'desc',
    limit: number
): Promise<PerformanceSignal[]> {
    noStore();
    try {
        const query = adminDb.collection('performance_tracker')
            .where('option_type', '==', optionType)
            .orderBy('percent_gain', order)
            .limit(limit * 3); // Fetch more to allow for in-code filtering

        const snapshot = await query.get();

        if (snapshot.empty) {
            return [];
        }

        let signals: PerformanceSignal[] = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            const signal = PerformanceSignalSchema.safeParse({ id: doc.id, ...data });
            if (signal.success) {
                signals.push(signal.data);
            } else {
                console.warn(`Invalid performance signal data for type ${optionType}:`, signal.error.flatten());
            }
        });
        
        // Filter for gainers in code and then take the limit
        if (order === 'desc') {
            signals = signals.filter(s => s.percent_gain >= 0);
        }

        return signals.slice(0, limit);

    } catch (error) {
        console.error(`Error fetching performance signals for type ${optionType}:`, error);
        return [];
    }
}

export async function getPerformanceSignals(
  order: 'asc' | 'desc',
  limit: number
): Promise<PerformanceSignal[]> {
  noStore();
  try {
    const snapshot = await adminDb.collection('performance_tracker').get();
    if (snapshot.empty) {
      return [];
    }

    const signals: PerformanceSignal[] = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      const initialPrice = data.initial_price;
      const currentPrice = data.current_price;

      if (typeof initialPrice === 'number' && initialPrice > 0 && typeof currentPrice === 'number') {
        const calculatedGain = ((currentPrice - initialPrice) / initialPrice) * 100;
        
        const signalData = {
            id: doc.id,
            run_date: data.run_date,
            ticker: data.ticker,
            company_name: data.company_name,
            image_uri: data.image_uri,
            industry: data.industry,
            contract_symbol: data.contract_symbol,
            initial_price: initialPrice,
            current_price: currentPrice,
            percent_gain: calculatedGain, // Use calculated gain here
            option_type: data.option_type,
            status: data.status,
            strike_price: data.strike_price,
            expiration_date: data.expiration_date,
        };
        const validation = PerformanceSignalSchema.safeParse(signalData);

        if (validation.success) {
            signals.push(validation.data);
        } else {
            console.warn(`Invalid performance signal data in Firestore for doc ${doc.id}:`, validation.error.flatten());
        }
      }
    });
    
    // Now sort the array with calculated gains
    signals.sort((a, b) => {
        return order === 'desc' ? b.percent_gain - a.percent_gain : a.percent_gain - b.percent_gain;
    });

    let filteredSignals = signals;
    if (order === 'desc') {
        // Filter for only positive gains for "Top Gainers"
        filteredSignals = signals.filter(s => s.percent_gain >= 0);
    } else {
        // Filter for only negative gains for "Top Losers"
        filteredSignals = signals.filter(s => s.percent_gain < 0);
    }

    return filteredSignals.slice(0, limit);

  } catch (error) {
    console.error('Error fetching performance signals:', error);
    return [];
  }
}

export async function getMidDayMoversAdmin(): Promise<PerformanceSignal[]> {
    noStore();
    try {
        const timeZone = 'America/New_York';
        const now = new Date();
        const nowInET = toZonedTime(now, timeZone);
        
        let lookbackDays = 1;
        const dayOfWeek = nowInET.getDay(); // 0 is Sunday, 1 is Monday, ...
        
        if (dayOfWeek === 1) { // Monday
            lookbackDays = 3; // Go back to Friday
        } else if (dayOfWeek === 0) { // Sunday
            lookbackDays = 2; // Go back to Friday
        }

        const targetDateInET = subDays(nowInET, lookbackDays);
        const targetDateStr = format(targetDateInET, 'yyyy-MM-dd');

        console.log(`[getMidDayMoversAdmin] Fetching signals for run_date: ${targetDateStr} (Lookback: ${lookbackDays} days)`);

        const querySnapshot = await adminDb.collection('performance_tracker')
            .where('run_date', '==', targetDateStr)
            .get();

        if (querySnapshot.empty) {
            console.log(`No performance signals found for run_date: ${targetDateStr}`);
            return [];
        }

        const signals: PerformanceSignal[] = [];
        querySnapshot.forEach(doc => {
            const data = doc.data();
            const initialPrice = data.initial_price;
            const currentPrice = data.current_price;

            if (typeof initialPrice === 'number' && initialPrice > 0 && typeof currentPrice === 'number') {
                const calculatedGain = ((currentPrice - initialPrice) / initialPrice) * 100;
                
                if (calculatedGain > 0) { // Only include positive gains
                    const signalData = {
                        id: doc.id,
                        run_date: data.run_date,
                        ticker: data.ticker,
                        company_name: data.company_name,
                        image_uri: data.image_uri,
                        industry: data.industry,
                        contract_symbol: data.contract_symbol,
                        initial_price: initialPrice,
                        current_price: currentPrice,
                        percent_gain: calculatedGain,
                        option_type: data.option_type,
                        status: data.status,
                        strike_price: data.strike_price,
                        expiration_date: data.expiration_date,
                    };
                    const validation = PerformanceSignalSchema.safeParse(signalData);
                    if (validation.success) {
                        signals.push(validation.data);
                    } else {
                        console.warn(`Invalid mid-day mover data in Firestore for doc ${doc.id}:`, validation.error.flatten());
                    }
                }
            }
        });

        // Sort by percent_gain descending and take the top 4
        signals.sort((a, b) => b.percent_gain - a.percent_gain);
        
        return signals.slice(0, 4);

    } catch (error) {
        console.error('Error fetching mid-day movers:', error);
        return [];
    }
}


export async function getPerformanceSignalsByTicker(ticker: string): Promise<PerformanceSignal[]> {
    noStore();
    try {
        const snapshot = await adminDb.collection('performance_tracker')
            .where('ticker', '==', ticker.toUpperCase())
            .get();

        if (snapshot.empty) {
            return [];
        }

        const signals: PerformanceSignal[] = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            const initialPrice = data.initial_price;
            const currentPrice = data.current_price;

            if (typeof initialPrice === 'number' && initialPrice > 0 && typeof currentPrice === 'number') {
                const calculatedGain = ((currentPrice - initialPrice) / initialPrice) * 100;
                
                const signalData = {
                    id: doc.id,
                    contract_symbol: data.contract_symbol,
                    ticker: data.ticker,
                    initial_price: initialPrice,
                    current_price: currentPrice,
                    percent_gain: calculatedGain,
                    run_date: data.run_date,
                    expiration_date: data.expiration_date,
                    strike_price: data.strike_price,
                    option_type: data.option_type,
                    status: data.status,
                };
                
                const validation = PerformanceSignalSchema.safeParse(signalData);
                if (validation.success) {
                    signals.push(validation.data);
                } else {
                    console.warn(`Invalid performance signal data for ticker ${ticker} (doc ${doc.id}):`, validation.error.flatten());
                }
            }
        });
        
        signals.sort((a, b) => new Date(b.run_date).getTime() - new Date(a.run_date).getTime());
        
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
): Promise<{ trackingId: string }> {
  try {
    const trackingId = `PS-${uuidv4().split('-')[0].toUpperCase()}`;
    await adminDb.collection("feedback").add({
      message,
      replyToEmail,
      user,
      trackingId,
      status: 'new',
      createdAt: FieldValue.serverTimestamp(),
    });
    return { trackingId };
  } catch (error) {
    console.error("Error writing feedback to Firestore with Admin SDK: ", error);
    throw new Error("Could not save feedback to the database.");
  }
}

export async function saveFeedbackSurveyAdmin(uid: string, data: FeedbackSurveyData): Promise<void> {
    try {
        await adminDb.collection("feedback_surveys").add({
            ...data,
            uid,
            submittedAt: FieldValue.serverTimestamp(),
        });
    } catch (error) {
        console.error("Error writing feedback survey to Firestore with Admin SDK: ", error);
        throw new Error("Could not save survey to the database.");
    }
}

export async function saveCancellationFeedbackAdmin(uid: string, feedback: string): Promise<void> {
    try {
        await adminDb.collection("cancellation_feedback").add({
            uid,
            feedback,
            submittedAt: FieldValue.serverTimestamp(),
        });
    } catch (error) {
        console.error("Error writing cancellation feedback to Firestore with Admin SDK: ", error);
        throw new Error("Could not save cancellation feedback.");
    }
}

export async function logChatInteractionAdmin(
  uid: string | null,
  message: string,
  response: string,
  source?: string
) {
  try {
    await adminDb.collection("chat_logs").add({
      uid: uid || 'anonymous',
      message,
      response,
      source: source || null,
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error("Failed to log chat interaction:", error);
  }
}

export async function getWinnerForTickerAdmin(ticker: string): Promise<Winner | null> {
    noStore();
    try {
        const snapshot = await adminDb.collection('winners_dashboard')
            .where('ticker', '==', ticker.toUpperCase())
            .limit(1)
            .get();

        if (snapshot.empty) {
            console.warn(`No winner found for ticker: ${ticker}`);
            return null;
        }
        
        const doc = snapshot.docs[0];
        const data = doc.data();

        const winnerData = { id: doc.id, ...data };
        const validation = WinnerSchema.safeParse(winnerData);

        if (!validation.success) {
            console.error(`Invalid winner data for ${ticker}:`, validation.error.flatten());
            return null;
        }

        return validation.data;

    } catch (error) {
        console.error(`Error fetching winner for ticker ${ticker}:`, error);
        return null;
    }
}


export async function getWinnersDashboardAdmin(): Promise<Winner[]> {
    noStore();
    try {
        const querySnapshot = await adminDb.collection("winners_dashboard").get();
        const winners: Winner[] = [];
        querySnapshot.docs.forEach(doc => {
             const data = doc.data();
             const winnerData: any = { // Use any to bypass strict checking before validation
                id: doc.id,
                ...data
            };
            const validation = WinnerSchema.safeParse(winnerData);
            if (validation.success) {
                winners.push(validation.data);
            } else {
                // Improved logging
                console.error(`Invalid winner data in Firestore for doc ${doc.id}:`, JSON.stringify(validation.error.flatten(), null, 2));
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
            news: data.news,
            financials: data.financials,
            earnings_transcript: data.earnings_transcript,
            mda: data.mda,
            technicals: data.technicals,
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

export async function getStockDataAdmin(ticker: string): Promise<Stock | null> {
    noStore();
    try {
        const docRef = adminDb.collection('tickers').doc(ticker.toUpperCase());
        const docSnap = await docRef.get();
        if (!docSnap.exists) {
            console.warn(`[getStockDataAdmin] No stock found for ticker: ${ticker}`);
            return null;
        }

        const data = docSnap.data() as any;
         const stock = {
            id: docSnap.id,
            company_name: data.company_name,
            industry: data.industry,
            bundle_gcs_path: data.profile,
            recommendation_analysis: data.recommendation_analysis,
            recommendation: data.recommendation,
            pages_json: data.pages_json,
            image_uri: data.image_uri,
            dashboard_json: data.dashboard_json,
            weighted_score: data.weighted_score,
            news: data.news,
            financials: data.financials,
            earnings_transcript: data.earnings_transcript,
            mda: data.mda,
            technicals: data.technicals,
        };
        const validation = StockSchema.safeParse(stock);
        if (validation.success) {
            return validation.data;
        } else {
            console.error(`[getStockDataAdmin] Invalid stock data for ${ticker}:`, validation.error.flatten());
            return null;
        }

    } catch (error) {
        console.error(`[getStockDataAdmin] Error fetching stock data for ${ticker}:`, error);
        return null;
    }
}

export async function getTickerEventsAdmin(ticker?: string, type: 'all' | 'ticker' | 'economic' = 'all'): Promise<TickerEvent[]> {
    try {
        const eventsCollectionRef = adminDb.collection('calendar_events');
        const allEvents: TickerEvent[] = [];

        // 1. Fetch Ticker-Specific Events if needed
        if ((type === 'all' || type === 'ticker') && ticker) {
            const tickerQuery = eventsCollectionRef.where('entity', '==', ticker.toUpperCase());
            const tickerSnapshot = await tickerQuery.get();
            tickerSnapshot.forEach(doc => {
                const data = doc.data();
                const event = TickerEventSchema.safeParse({ id: doc.id, ticker: data.entity, ...data });
                if (event.success) {
                    allEvents.push(event.data);
                } else {
                    console.warn(`Invalid ticker-specific event data for ${ticker}:`, event.error.flatten());
                }
            });
        }

        // 2. Fetch General Economic Events if needed
        if (type === 'all' || type === 'economic') {
            const economicQuery = eventsCollectionRef.where('entity', '==', null);
            const economicSnapshot = await economicQuery.get();
            economicSnapshot.forEach(doc => {
                const data = doc.data();
                const event = TickerEventSchema.safeParse({ id: doc.id, ticker: data.entity, ...data });
                if (event.success) {
                    allEvents.push(event.data);
                } else {
                    console.warn(`Invalid economic event data:`, event.error.flatten());
                }
            });
        }

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
            // If no ticker, fetch all. You may want to add a limit for performance.
            query = candidatesCollection.orderBy('options_score', 'desc').limit(50);
        }
        
        const querySnapshot = await query.get();

        const candidates: OptionCandidate[] = [];
        querySnapshot.forEach(doc => {
            const data = doc.data();
            const candidateData = {
                id: doc.id,
                contract_symbol: data.contract_symbol,
                ticker: data.ticker,
                company_name: data.company_name,
                industry: data.industry,
                image_uri: data.image_uri,
                option_type: data.option_type,
                expiration_date: data.expiration_date,
                strike: data.strike ?? data.strike_price ?? 0, // Robust mapping for strike vs strike_price
                last_price: data.last_price,
                volume: data.volume,
                implied_volatility: data.implied_volatility,
                options_score: data.options_score,
                stock_outlook_signal: data.stock_outlook_signal,
            };
            const validation = OptionCandidateSchema.safeParse(candidateData);
            if (validation.success) {
                candidates.push(validation.data);
            } else {
                console.error(`Invalid options candidate data for doc ${doc.id}:`, validation.error.flatten());
            }
        });
        
        // If fetching all, sort by score. If by ticker, maybe another sort order?
        if (!ticker) {
            candidates.sort((a, b) => b.options_score - a.options_score);
        }
        
        return candidates;

    } catch (error) {
        console.error(`Error fetching options candidates:`, error);
        return [];
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

export async function getUsersForFeedbackEmailAdmin(): Promise<DbUser[]> {
    const eligibleUsers: DbUser[] = [];
    const daysIntervals = [7, 14, 30, 90, 180];
    const now = new Date();
    const thirtyDaysInMillis = 30 * 24 * 60 * 60 * 1000;

    try {
        const snapshot = await adminDb.collection('users').get();

        if (snapshot.empty) {
            return [];
        }

        snapshot.forEach(doc => {
            const user = doc.data() as DbUser;

            // Basic validation
            if (!user.email || !user.createdAt || !(user.createdAt instanceof Timestamp)) {
                return;
            }
            
            const createdAtDate = user.createdAt.toDate();
            const diffTime = now.getTime() - createdAtDate.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            // Check if the user's signup date falls into one of the intervals
            const isAtInterval = daysIntervals.includes(diffDays);

            if (isAtInterval) {
                 // Check if the user is either a paid subscriber OR in their free trial
                const isInTrial = diffTime <= thirtyDaysInMillis;
                if (user.isSubscribed || isInTrial) {
                    eligibleUsers.push(user);
                }
            }
        });

    } catch (error) {
        console.error('Error fetching users for feedback email:', error);
    }
    return eligibleUsers;
}


export async function getEligibleEmailRecipientsAdmin(): Promise<DbUser[]> {
    const allUsers: DbUser[] = [];
    try {
        const snapshot = await adminDb.collection('users').get();
        if (snapshot.empty) {
            return [];
        }

        snapshot.forEach(doc => {
            const user = doc.data() as DbUser;
            if (user.email) { // Only include users with an email
                allUsers.push(user);
            }
        });

    } catch (error) {
        console.error('Error fetching all email recipients:', error);
    }
    return allUsers;
}


export async function getSubscribedUsersAdmin(): Promise<DbUser[]> {
    const subscribedUsers: DbUser[] = [];
    try {
        const snapshot = await adminDb.collection('users').where('isSubscribed', '==', true).get();
        if (snapshot.empty) {
            console.log('No subscribed users found.');
            return [];
        }
        snapshot.forEach(doc => {
            const userData = doc.data() as DbUser;
            if (userData.email) { // Only include users with an email
                subscribedUsers.push(userData);
            }
        });
    } catch (error) {
        console.error('Error fetching subscribed users:', error);
        // Return empty array in case of error to avoid stopping the process
        return [];
    }
    return subscribedUsers;
}

export async function incrementUserUsageAdmin(uid: string) {
  const userRef = adminDb.collection('users').doc(uid);
  
  try {
    await adminDb.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
        return;
      }

      const userData = userDoc.data() as DbUser;
      const now = new Date();
      const timeZone = 'America/New_York';
      
      let incrementDays = 0;
      
      // Check if we need to increment daysActive
      if (!userData.lastActiveAt) {
          incrementDays = 1;
      } else {
          // Compare dates in ET
          const lastActiveDate = toZonedTime(userData.lastActiveAt.toDate(), timeZone);
          const currentDate = toZonedTime(now, timeZone);
          
          const lastActiveDay = format(lastActiveDate, 'yyyy-MM-dd');
          const currentDay = format(currentDate, 'yyyy-MM-dd');

          if (lastActiveDay !== currentDay) {
              incrementDays = 1;
          }
      }

      const updates: any = {
          usageCount: FieldValue.increment(1),
          lastActiveAt: FieldValue.serverTimestamp(),
      };

      if (incrementDays > 0) {
          updates.daysActive = FieldValue.increment(incrementDays);
      }

      transaction.update(userRef, updates);
    });
  } catch (error) {
    console.error(`Failed to increment usage for user ${uid}:`, error);
  }
}

export async function setUserSubscriptionStatusAdmin(
  uid: string,
  isSubscribed: boolean,
  currentPeriodEnd?: number
) {
  const userRef = adminDb.collection('users').doc(uid);
  
  let updates: any = { isSubscribed };

  if (isSubscribed && currentPeriodEnd) {
      // Add a grace period of 2 days to avoid race conditions with renewals
      const proUntilDate = new Date((currentPeriodEnd * 1000) + (2 * 24 * 60 * 60 * 1000));
      updates.proUntil = Timestamp.fromDate(proUntilDate);
  }

  await userRef.set(updates, { merge: true });
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
    

    
export async function getFairQualityOptionsAdmin(ticker: string): Promise<OptionsSignal[]> {
    try {
        const docRef = adminDb.collection("options_signals").doc(ticker.toUpperCase());
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return [];
        }

        const data = docSnap.data();
        const allSignals = [...(data?.calls || []), ...(data?.puts || [])];
        
        const fairSignals = allSignals
            .filter(signal => signal.setup_quality_signal === 'Fair')
            .slice(0, 3); // Take a maximum of 3

        const validatedSignals: OptionsSignal[] = [];
        for (const signal of fairSignals) {
            const validation = OptionsSignalSchema.safeParse(signal);
            if (validation.success) {
                validatedSignals.push(validation.data);
            } else {
                console.warn(`Invalid "Fair" options signal data for ${ticker}:`, validation.error.flatten());
            }
        }
        
        return validatedSignals;
    } catch (error) {
        console.error(`Error fetching fair quality options for ${ticker}:`, error);
        return [];
    }
}

export async function activateInsiderUser(token: string): Promise<{ success: boolean; error?: string; uid?: string }> {
  try {
    const usersRef = adminDb.collection('users');
    const snapshot = await usersRef.where('insiderActivationToken', '==', token).limit(1).get();

    if (snapshot.empty) {
      return { success: false, error: 'Invalid or expired activation token.' };
    }

    const userDoc = snapshot.docs[0];
    const uid = userDoc.id;

    // Update the user: set isSubscribed to true and remove the token
    await userDoc.ref.update({
      isSubscribed: true,
      insiderActivationToken: FieldValue.delete(),
      subscriptionStatus: 'insider_active', // Optional: track that they are an insider
    });

    return { success: true, uid };
  } catch (error) {
    console.error('Error activating insider user:', error);
    return { success: false, error: 'Internal server error during activation.' };
  }
}

export async function getTopPickAdmin(): Promise<Stock | null> {
    noStore();
    try {
        const winnerSnapshot = await adminDb.collection('winners_dashboard')
            .orderBy('weighted_score', 'desc')
            .limit(1)
            .get();

        if (winnerSnapshot.empty) {
            console.warn('No stocks found in winners_dashboard to determine a top pick.');
            return null;
        }
        const topWinner = winnerSnapshot.docs[0].data();
        const topTicker = topWinner.ticker;

        if (!topTicker) {
            console.warn('Top winner document is missing a ticker.');
            return null;
        }

        const stockDoc = await adminDb.collection('tickers').doc(topTicker).get();

        if (!stockDoc.exists) {
            console.warn(`Could not find a matching stock in 'tickers' collection for top winner: ${topTicker}`);
            return null;
        }
        const stockData = stockDoc.data()!;
        
        const stock: Stock = {
            id: stockDoc.id,
            company_name: stockData.company_name,
            industry: stockData.industry,
            image_uri: stockData.image_uri,
            recommendation_analysis: stockData.recommendation_analysis,
            dashboard_json: stockData.dashboard_json,
            weighted_score: stockData.weighted_score,
            bundle_gcs_path: stockData.profile,
            recommendation: stockData.recommendation,
            pages_json: stockData.pages_json,
        };
        
        // Final check to ensure the analysis path exists, as this is critical for the email.
        if (!stock.recommendation_analysis) {
            console.warn(`Top pick stock ${topTicker} is missing a recommendation_analysis path in the 'tickers' collection.`);
            return null;
        }
        
        const validation = StockSchema.safeParse(stock);
        if (validation.success) {
            return validation.data;
        } else {
            console.error(`Invalid top pick stock data for ${topTicker}:`, validation.error.flatten());
            return null;
        }

    } catch (error) {
        console.error('Error fetching top pick from admin:', error);
        return null;
    }
}
    

export async function addToWatchlistAdmin(uid: string, item: Omit<WatchlistItem, 'id' | 'addedAt'>): Promise<WatchlistItem | null> {
    try {
        const watchlistRef = adminDb.collection('users').doc(uid).collection('watchlist');
        
        // Check if already exists to prevent duplicates
        const q = item.contract_symbol 
            ? watchlistRef.where('contract_symbol', '==', item.contract_symbol)
            : watchlistRef.where('ticker', '==', item.ticker).where('type', '==', 'stock');
            
        const snapshot = await q.get();
        if (!snapshot.empty) {
            return null; // Already exists
        }

        const newItem = {
            ...item,
            addedAt: new Date().toISOString(),
        };

        const docRef = await watchlistRef.add(newItem);
        return { id: docRef.id, ...newItem };
    } catch (error) {
        console.error('Error adding to watchlist:', error);
        return null;
    }
}

export async function removeFromWatchlistAdmin(uid: string, itemId: string): Promise<boolean> {
    try {
        await adminDb.collection('users').doc(uid).collection('watchlist').doc(itemId).delete();
        return true;
    } catch (error) {
        console.error('Error removing from watchlist:', error);
        return false;
    }
}

export async function getUserWatchlistAdmin(uid: string): Promise<WatchlistItem[]> {
    try {
        const snapshot = await adminDb.collection('users').doc(uid).collection('watchlist').orderBy('addedAt', 'desc').get();
        const items: WatchlistItem[] = [];
        
        snapshot.forEach(doc => {
            const data = doc.data();
            const item = { id: doc.id, ...data };
            const validation = WatchlistItemSchema.safeParse(item);
            if (validation.success) {
                items.push(validation.data);
            }
        });
        
        return items;
    } catch (error) {
        console.error('Error fetching watchlist:', error);
        return [];
    }
}