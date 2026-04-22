import { initializeApp as initializeAdminApp, getApps as getAdminApps, App as AdminApp, type ServiceAccount } from 'firebase-admin/app';
import admin from 'firebase-admin';
import { getFirestore as getAdminFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getStorage as getAdminStorage } from 'firebase-admin/storage';
import type { DbUser } from './firebase';
import { unstable_noStore as noStore } from 'next/cache';
import { config } from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  author: string;
  tags: string[];
  featured: boolean;
  ogImage: string | null;
}

// Load environment variables from .env file (for local dev)
config();

// Lazy initialization - only initialize when actually needed at runtime
let adminApp: AdminApp | null = null;
let adminDb: ReturnType<typeof getAdminFirestore> | null = null;

export function getAdminApp(): AdminApp {
  if (adminApp) return adminApp;

  // Check if apps are already initialized (e.g. by another instance of the module)
  if (getAdminApps().length) {
    adminApp = getAdminApps()[0]!;
    return adminApp;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  try {
    // If we are strictly NOT in production, use the manually provided private key.
    // This utterly bypasses the PEM decoding crash during the App Hosting 'next build' phase.
    if (process.env.NODE_ENV !== 'production' && projectId && clientEmail && privateKey) {
      // Local development or explicit service account
      adminApp = initializeAdminApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    } else {
      // Production / Firebase App Hosting: Use Application Default Credentials (ADC)
      // Call with zero arguments so the Google Cloud Metadata server auto-injects the Quota Project
      // and eliminates the CONSUMER_INVALID permission errors.
      adminApp = initializeAdminApp();
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    throw error;
  }
  
  return adminApp;
}

function getDb() {
  if (!adminDb) {
    adminDb = getAdminFirestore(getAdminApp());
  }
  return adminDb;
}

// Helper to ensure storage is ready
function getStorage() {
    getAdminApp(); // Ensure app is initialized
    return getAdminStorage(getAdminApp());
}

export async function addEmailSubscriber(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const subscribersRef = getDb().collection('email_subscribers');
    
    // Check for duplicate
    const existing = await subscribersRef.where('email', '==', email.toLowerCase()).limit(1).get();
    if (!existing.empty) {
      return { success: true }; // Don't reveal if already subscribed
    }

    await subscribersRef.add({
      email: email.toLowerCase(),
      source: 'website',
      status: 'active',
      subscribedAt: FieldValue.serverTimestamp(),
      welcomeSent: false,
      drip1Sent: false,
      drip2Sent: false,
      drip3Sent: false,
    });

    return { success: true };
  } catch (error) {
    console.error('Error subscribing email:', error);
    return { success: false, error: 'Failed to subscribe. Please try again.' };
  }
}

export async function unsubscribeEmailAdmin(email: string): Promise<{ success: boolean }> {
  try {
    const subscribersRef = getDb().collection('email_subscribers');
    const snapshot = await subscribersRef.where('email', '==', email.toLowerCase()).limit(1).get();
    
    if (!snapshot.empty) {
      await snapshot.docs[0].ref.update({
        status: 'unsubscribed',
        unsubscribedAt: FieldValue.serverTimestamp(),
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error unsubscribing:', error);
    return { success: true };
  }
}

// --- Overnight Edge Data Functions ---

export interface Stock {
  id: string;
  company_name: string;
}

export interface Winner {
  ticker: string;
  option_type: string;
  weighted_score?: number;
  strike_price: number;
  expiration_date: string | Date;
  outlook_signal: string;
}

export interface PerformanceSignal {
  ticker: string;
  option_type?: string;
  strike_price: number;
  percent_gain: number;
}

/**
 * @deprecated functionality removed
 */
export async function getWinnersDashboardAdmin(): Promise<Winner[]> {
  return [];
}

/**
 * @deprecated functionality removed
 */
export async function getPerformanceSignals(sort: 'asc' | 'desc', limit: number): Promise<PerformanceSignal[]> {
  return [];
}

export interface OvernightSignal {
  id: string;
  ticker: string;
  scan_date: string;
  direction: string; // "BULLISH" | "BEARISH" (stored uppercase in Firestore)
  // Scores
  overnight_score: number;
  contract_score?: number;
  // Price & Flow
  underlying_price?: number;
  price_change_pct?: number;
  call_dollar_volume?: number;
  put_dollar_volume?: number;
  call_uoa_depth?: number;
  put_uoa_depth?: number;
  call_active_strikes?: number;
  put_active_strikes?: number;
  // Contract
  recommended_contract?: string;
  recommended_strike?: number;
  recommended_expiration?: string;
  recommended_mid_price?: number;
  recommended_delta?: number;
  // Enrichment
  thesis?: string;
  news_summary?: string;
  catalyst_score?: number;
  catalyst_type?: string;
  key_headline?: string;
  flow_intent?: string;
  flow_intent_reasoning?: string;
  // Technicals
  support?: number;
  resistance?: number;
  high_52w?: number;
  low_52w?: number;
  sma_50?: number;
  sma_200?: number;
  rsi_14?: number;
  risk_reward_ratio?: number;
  // Premium Signals
  is_premium_signal?: boolean;
  premium_score?: number;
  premium_hedge?: boolean;
  premium_high_rr?: boolean;
  premium_bull_flow?: boolean;
  premium_high_atr?: boolean;
  premium_bear_flow?: boolean;
  // Meta
  enriched_at?: any;
  updated_at?: any;
  seoMetadata?: {
    seoTitle?: string;
    seoDescription?: string;
    keywords?: string[];
  };
}

export interface OvernightSummary {
  scan_date: string;
  total_signals: number;
  bullish_count: number;
  bearish_count: number;
  top_bullish: string[];
  top_bearish: string[];
  top_themes: string[];
  headline: string;
  market_narrative: string;
  generated_at: any;
  title?: string; // Added title optional field
  report_date?: string; // Date of the Daily Report publication
}

export interface DailyReport {
  scan_date: string;
  title: string;
  content: string;
  total_signals: number;
  bullish_count: number;
  bearish_count: number;
  underlying_scan_date?: string;
  seoMetadata?: {
    seoTitle?: string;
    seoDescription?: string;
    keywords?: string[];
  };
}

/** Canonical source of truth for "what did GammaRips pick today," written
 *  atomically by signal-notifier at ~09:00 ET in Firestore todays_pick/{scan_date}.
 *  Readers MUST NOT re-apply filters — this doc IS the answer. See
 *  docs/TRADING-STRATEGY.md "Publication timing" and
 *  docs/EXEC-PLANS/2026-04-20-v5-3-surface-and-monetization.md Phase 1.0. */
export interface TodaysPick {
  scan_date: string;
  decided_at: any; // Firestore Timestamp
  effective_at: string | null; // ISO8601 at 10:00 ET day+1 when pick is present
  has_pick: boolean;
  skip_reason:
    | 'no_candidates_passed_gates'
    | 'regime_fail_closed'
    | 'vix_backwardation'
    | null;
  ticker?: string;
  direction?: 'BULLISH' | 'BEARISH';
  recommended_contract?: string;
  recommended_strike?: number;
  recommended_expiration?: string;
  recommended_mid_price?: number;
  recommended_dte?: number;
  overnight_score?: number;
  vol_oi_ratio?: number;
  moneyness_pct?: number;
  call_dollar_volume?: number;
  put_dollar_volume?: number;
  vix3m_at_enrich?: number;
  vix_now_at_decision?: number;
  policy_version: string;
}

export async function getTodaysPick(scanDate: string): Promise<TodaysPick | null> {
  noStore();
  try {
    const docRef = getDb().collection('todays_pick').doc(scanDate);
    const docSnap = await docRef.get();
    if (!docSnap.exists) return null;
    return docSnap.data() as TodaysPick;
  } catch (error) {
    console.error(`Error fetching todays_pick for ${scanDate}:`, error);
    return null;
  }
}

export async function getLatestTodaysPick(): Promise<TodaysPick | null> {
  noStore();
  try {
    const snapshot = await getDb()
      .collection('todays_pick')
      .orderBy('scan_date', 'desc')
      .limit(1)
      .get();
    if (snapshot.empty) return null;
    return snapshot.docs[0].data() as TodaysPick;
  } catch (error) {
    console.error('Error fetching latest todays_pick:', error);
    return null;
  }
}

export async function getDailyReport(date: string): Promise<DailyReport | null> {
  noStore();
  try {
    const docRef = getDb().collection('daily_reports').doc(date);
    const docSnap = await docRef.get();
    if (!docSnap.exists) return null;
    return docSnap.data() as DailyReport;
  } catch (error) {
    console.error(`Error fetching daily report for ${date}:`, error);
    return null;
  }
}

export async function getAllDailyReports(limit: number = 30): Promise<DailyReport[]> {
  noStore();
  try {
    const snapshot = await getDb().collection('daily_reports')
      .orderBy('scan_date', 'desc')
      .limit(limit)
      .get();
    
    return snapshot.docs.map(doc => doc.data() as DailyReport);
  } catch (error) {
    console.error('Error fetching daily reports:', error);
    return [];
  }
}

export async function getAllOvernightSummaries(limit: number = 30): Promise<OvernightSummary[]> {
  noStore();
  try {
    const snapshot = await getDb().collection('daily_reports')
      .orderBy('scan_date', 'desc')
      .limit(limit)
      .get();
      
    const summaries = await Promise.all(snapshot.docs.map(async doc => {
        const reportData = doc.data() as DailyReport & { underlying_scan_date?: string };
        const summaryScanDate = reportData.scan_date;
        
        try {
            const summaryDoc = await getDb().collection('overnight_summaries').doc(summaryScanDate).get();
            if (summaryDoc.exists) {
                const data = summaryDoc.data() as OvernightSummary;
                data.headline = reportData.title;
                data.title = reportData.title;
                data.report_date = reportData.scan_date;
                return data; 
            }
        } catch (e) {
            console.error(`Error fetching summary for ${summaryScanDate}:`, e);
        }
        
        return null;
    }));
    
    return summaries.filter((s): s is OvernightSummary => s !== null);
  } catch (error) {
    console.error('Error fetching overnight summaries:', error);
    return [];
  }
}

export async function getOvernightSummary(scanDate: string): Promise<OvernightSummary | null> {
  noStore();
  try {
    const docRef = getDb().collection('overnight_summaries').doc(scanDate);
    const docSnap = await docRef.get();
    if (!docSnap.exists) return null;
    return docSnap.data() as OvernightSummary;
  } catch (error) {
    console.error(`Error fetching summary for ${scanDate}:`, error);
    return null;
  }
}

export async function getLatestOvernightSummary(): Promise<OvernightSummary | null> {
  noStore();
  try {
    const reportSnapshot = await getDb().collection('daily_reports')
      .orderBy('scan_date', 'desc')
      .limit(5)
      .get();
      
    if (reportSnapshot.empty) return null;

    for (const doc of reportSnapshot.docs) {
      const reportData = doc.data() as DailyReport & { underlying_scan_date?: string };
      const summaryScanDate = reportData.scan_date;
      
      try {
        const summaryDoc = await getDb().collection('overnight_summaries').doc(summaryScanDate).get();
        if (summaryDoc.exists) {
          const data = summaryDoc.data() as OvernightSummary;
          data.headline = reportData.title;
          data.title = reportData.title;
          data.report_date = reportData.scan_date;
          return data;
        }
      } catch (e) {
        console.error(`Error fetching summary for ${summaryScanDate}:`, e);
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching overnight summary:', error);
    return null;
  }
}

export async function getOvernightSignals(
  scanDate: string,
  direction: 'bull' | 'bear',
  offset: number = 0,
  limit: number = 20
): Promise<OvernightSignal[]> {
  noStore();
  try {
    const dirValue = direction === 'bull' ? 'BULLISH' : 'BEARISH';
    const snapshot = await getDb().collection('overnight_signals')
      .where('scan_date', '==', scanDate)
      .where('direction', '==', dirValue)
      .orderBy('overnight_score', 'desc')
      .offset(offset)
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data,
        enriched_at: data.enriched_at?.toDate?.().toISOString() || data.enriched_at || null,
        updated_at: data.updated_at?.toDate?.().toISOString() || data.updated_at || null,
      } as OvernightSignal;
    });
  } catch (error) {
    console.error('Error fetching overnight signals:', error);
    return [];
  }
}

export async function getSignalByTicker(scanDate: string, ticker: string): Promise<OvernightSignal | null> {
  noStore();
  try {
    const docRef = getDb().collection('overnight_signals').doc(`${scanDate}_${ticker}`);
    const docSnap = await docRef.get();
    if (!docSnap.exists) return null;
    
    const data = docSnap.data() as any;
    return {
      id: docSnap.id,
      ...data,
      enriched_at: data.enriched_at?.toDate?.().toISOString() || data.enriched_at || null,
      updated_at: data.updated_at?.toDate?.().toISOString() || data.updated_at || null,
    } as OvernightSignal;
  } catch (error) {
    console.error(`Error fetching signal for ${ticker}:`, error);
    return null;
  }
}

export async function getAppStatusAdmin(): Promise<{ isUpdating: boolean }> {
  noStore();
  try {
    const docRef = getDb().collection('app_config').doc('status');
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

export async function saveFeedbackAdmin(
  message: string,
  replyToEmail: string,
  user: { uid: string; email: string | null } | null
): Promise<{ trackingId: string }> {
  try {
    const trackingId = `PS-${uuidv4().split('-')[0].toUpperCase()}`;
    await getDb().collection("feedback").add({
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

export async function saveCancellationFeedbackAdmin(uid: string, feedback: string): Promise<void> {
    try {
        await getDb().collection("cancellation_feedback").add({
            uid,
            feedback,
            submittedAt: FieldValue.serverTimestamp(),
        });
    } catch (error) {
        console.error("Error writing cancellation feedback to Firestore with Admin SDK: ", error);
        throw new Error("Could not save cancellation feedback.");
    }
}

// Admin version of user management functions
export async function getOrCreateUserAdmin(
  uid: string,
  isAnonymous: boolean = false,
  displayName?: string,
  email?: string,
  stripeCustomerId?: string
): Promise<DbUser> {
  const userRef = getDb().collection('users').doc(uid);
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
    isSubscribed: true,
    usageCount: 0,
    createdAt: FieldValue.serverTimestamp(),
    stripeCustomerId: stripeCustomerId ?? null,
  };

  await userRef.set(newUser);
  return newUser;
}

export async function getEligibleEmailRecipientsAdmin(): Promise<DbUser[]> {
    const allUsers: DbUser[] = [];
    try {
        const snapshot = await getDb().collection('users').get();
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
        const snapshot = await getDb().collection('users').where('isSubscribed', '==', true).get();
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
  const userRef = getDb().collection('users').doc(uid);
  
  try {
    await getDb().runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
        return;
      }

      const userData = userDoc.data() as DbUser;
      
      const updates: any = {
          usageCount: FieldValue.increment(1),
          lastActiveAt: FieldValue.serverTimestamp(),
      };

      transaction.update(userRef, updates);
    });
  } catch (error) {
    console.error(`Failed to increment usage for user ${uid}:`, error);
  }
}

export async function setUserSubscriptionStatusAdmin(
  uid: string,
  isSubscribed: boolean,
  currentPeriodEnd?: number,
  plan?: 'free' | 'pro'
) {
  const userRef = getDb().collection('users').doc(uid);
  
  let updates: any = { isSubscribed };

  if (plan) {
      updates.plan = plan;
  }

  if (isSubscribed && currentPeriodEnd) {
      // Add a grace period of 2 days to avoid race conditions with renewals
      const proUntilDate = new Date((currentPeriodEnd * 1000) + (2 * 24 * 60 * 60 * 1000));
      updates.proUntil = Timestamp.fromDate(proUntilDate);
  } else if (!isSubscribed) {
      // If subscription is not active (cancelled, unpaid, deleted), revoke access immediately
      // by removing the proUntil field.
      updates.proUntil = FieldValue.delete();
      updates.plan = 'free'; // Downgrade to free
  }

  await userRef.set(updates, { merge: true });
}

export async function getUserByStripeCustomerIdAdmin(stripeCustomerId: string): Promise<DbUser | null> {
    const usersRef = getDb().collection('users');
    const q = await usersRef.where('stripeCustomerId', '==', stripeCustomerId).limit(1).get();
    
    if (!q.empty) {
        return q.docs[0].data() as DbUser;
    }
    return null;
}

export async function getBlogPostsAdmin(): Promise<BlogPost[]> {
  try {
    const snapshot = await getDb().collection('blogPosts')
      .orderBy('publishedAt', 'desc')
      .get();
    
    const posts: BlogPost[] = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      // Handle timestamp conversion
      let publishedAt = new Date().toISOString();
      if (data.publishedAt) {
          if (data.publishedAt instanceof Timestamp) {
              publishedAt = data.publishedAt.toDate().toISOString();
          } else if (typeof data.publishedAt === 'string') {
              publishedAt = data.publishedAt;
          }
      }

      posts.push({
        slug: doc.id,
        title: data.title || 'Untitled',
        excerpt: data.excerpt || '',
        content: data.content || '',
        publishedAt,
        author: data.author || 'GammaRips Team',
        tags: data.tags || [],
        featured: data.featured || false,
        ogImage: data.ogImage || null,
      });
    });
    return posts;
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return [];
  }
}

export async function getBlogPostAdmin(slug: string): Promise<BlogPost | null> {
  try {
    const docSnap = await getDb().collection('blogPosts').doc(slug).get();
    if (!docSnap.exists) {
      return null;
    }
    const data = docSnap.data();
     if (!data) return null;

     // Handle timestamp conversion
      let publishedAt = new Date().toISOString();
      if (data.publishedAt) {
          if (data.publishedAt instanceof Timestamp) {
              publishedAt = data.publishedAt.toDate().toISOString();
          } else if (typeof data.publishedAt === 'string') {
              publishedAt = data.publishedAt;
          }
      }

// ... existing code ...

    return {
      slug: docSnap.id,
      title: data.title || 'Untitled',
      excerpt: data.excerpt || '',
      content: data.content || '',
      publishedAt,
      author: data.author || 'GammaRips Team',
      tags: data.tags || [],
      featured: data.featured || false,
      ogImage: data.ogImage || null,
    };
  } catch (error) {
    console.error(`Error fetching blog post ${slug}:`, error);
    return null;
  }
}

// --- Arena Debate Interfaces & Functions ---

export interface AgentPick {
  ticker: string;
  direction: string;   // bull / bear
  conviction: number;  // 1-10
  contract: string;
  reasoning: string;
  flow_intent?: string; // e.g. "hedging" or "directional"
}

export interface AgentAttack {
  target_agent: string;
  target_ticker: string;
  action: "attack" | "support";
  argument: string;
}

export interface AgentDefense {
  ticker: string;
  action: "hold" | "revise" | "drop";
  original_conviction: number;
  new_conviction: number;
  defense: string;
}

export interface ConsensusVote {
  agent: string;
  contract: string;
  conviction: number;
  reasoning: string;
}

export interface ConsensusObject {
  avg_conviction: number;
  consensus_level: string; // "majority", "unanimous", etc.
  direction: string;
  ticker: string;
  contract?: string; // Optional field for the specific contract
  total_agents: number;
  vote_count: number;
  votes: ConsensusVote[];
}

export interface ArenaDebate {
  scan_date: string;
  debate_id: string;
  started_at: string;
  completed_at: string; // Note: completed_at instead of finished_at
  signal_count: number; // Note: signal_count instead of signals_count
  agents: string[]; // Just IDs: ["grok", "gemini", "claude"]
  
  // Consensus is an array of objects in the schema
  consensus: ConsensusObject[];

  // Rounds are nested in a 'rounds' map
  rounds: {
    round1_picks: Record<string, AgentPick[]>;
    round2_attacks: Record<string, AgentAttack[]>;
    round3_defenses: Record<string, AgentDefense[]>; // Note: defenses plural
    round4_final: Record<string, AgentPick[]>;
  };
}

export async function getLatestArenaDebate(): Promise<ArenaDebate | null> {
  noStore();
  try {
    const snapshot = await getDb().collection("arena_debates")
      .orderBy("scan_date", "desc")
      .limit(1)
      .get();
    
    if (snapshot.empty) return null;
    return snapshot.docs[0].data() as ArenaDebate;
  } catch (error) {
    console.error('Error fetching latest arena debate:', error);
    return null;
  }
}

export async function getArenaDebateByDate(date: string): Promise<ArenaDebate | null> {
  noStore();
  try {
    const doc = await getDb().collection("arena_debates").doc(date).get();
    if (!doc.exists) return null;
    return doc.data() as ArenaDebate;
  } catch (error) {
    console.error(`Error fetching arena debate for ${date}:`, error);
    return null;
  }
}
