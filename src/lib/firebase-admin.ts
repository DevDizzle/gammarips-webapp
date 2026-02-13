'use server';

import { initializeApp as initializeAdminApp, getApps as getAdminApps, App as AdminApp, type ServiceAccount } from 'firebase-admin/app';
import admin from 'firebase-admin';
import { getFirestore as getAdminFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getStorage as getAdminStorage } from 'firebase-admin/storage';
import type { DbUser } from './firebase';
import { unstable_noStore as noStore } from 'next/cache';
import { config } from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

import type { FeedbackSurveyData } from './schemas';

// Re-export types
export type { FeedbackSurveyData };

config();

let adminApp: AdminApp | null = null;
let adminDb: ReturnType<typeof getAdminFirestore> | null = null;
let adminStorage: ReturnType<typeof getAdminStorage> | null = null;

function getAdminApp(): AdminApp {
  if (adminApp) return adminApp;
  
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Firebase server environment variables are not set.');
  }

  const serviceAccount: ServiceAccount = { projectId, clientEmail, privateKey };

  if (!getAdminApps().length) {
    adminApp = initializeAdminApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  } else {
    adminApp = getAdminApps()[0]!;
  }
  
  return adminApp;
}

function getDb() {
  if (!adminDb) adminDb = getAdminFirestore(getAdminApp());
  return adminDb;
}

function getStorage() {
  if (!adminStorage) adminStorage = getAdminStorage(getAdminApp());
  return adminStorage;
}

// ─── App Status ───

export async function getAppStatusAdmin(): Promise<{ isUpdating: boolean }> {
  noStore();
  try {
    const docRef = getDb().collection('app_config').doc('status');
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      return { isUpdating: docSnap.data()?.isUpdating === true };
    }
    return { isUpdating: false };
  } catch (error) {
    console.error('Error fetching app status:', error);
    return { isUpdating: false };
  }
}

// ─── User Management ───

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
    isSubscribed: false,
    usageCount: 0,
    createdAt: FieldValue.serverTimestamp(),
    stripeCustomerId: stripeCustomerId ?? null,
  };

  await userRef.set(newUser);
  return newUser;
}

export async function incrementUserUsageAdmin(uid: string) {
  const userRef = getDb().collection('users').doc(uid);
  
  try {
    await getDb().runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) return;

      const userData = userDoc.data() as DbUser;
      const now = new Date();
      const timeZone = 'America/New_York';
      
      let incrementDays = 0;
      
      if (!userData.lastActiveAt) {
        incrementDays = 1;
      } else {
        const lastActiveDate = toZonedTime(userData.lastActiveAt.toDate(), timeZone);
        const currentDate = toZonedTime(now, timeZone);
        if (format(lastActiveDate, 'yyyy-MM-dd') !== format(currentDate, 'yyyy-MM-dd')) {
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
  const userRef = getDb().collection('users').doc(uid);
  
  let updates: any = { isSubscribed };

  if (isSubscribed && currentPeriodEnd) {
    const proUntilDate = new Date((currentPeriodEnd * 1000) + (2 * 24 * 60 * 60 * 1000));
    updates.proUntil = Timestamp.fromDate(proUntilDate);
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

// ─── Feedback ───

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
    console.error("Error writing feedback to Firestore:", error);
    throw new Error("Could not save feedback to the database.");
  }
}

export async function saveFeedbackSurveyAdmin(uid: string, data: FeedbackSurveyData): Promise<void> {
  try {
    await getDb().collection("feedback_surveys").add({
      ...data,
      uid,
      submittedAt: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error("Error writing feedback survey:", error);
    throw new Error("Could not save survey to the database.");
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
    console.error("Error writing cancellation feedback:", error);
    throw new Error("Could not save cancellation feedback.");
  }
}

// ─── Email Recipients ───

export async function getEligibleEmailRecipientsAdmin(): Promise<DbUser[]> {
  const allUsers: DbUser[] = [];
  try {
    const snapshot = await getDb().collection('users').get();
    if (snapshot.empty) return [];
    snapshot.forEach(doc => {
      const user = doc.data() as DbUser;
      if (user.email) allUsers.push(user);
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
    if (snapshot.empty) return [];
    snapshot.forEach(doc => {
      const userData = doc.data() as DbUser;
      if (userData.email) subscribedUsers.push(userData);
    });
  } catch (error) {
    console.error('Error fetching subscribed users:', error);
    return [];
  }
  return subscribedUsers;
}

// ─── Overnight Edge (new product) ───

export async function getLatestOvernightSummary() {
  noStore();
  try {
    const snapshot = await getDb().collection('overnight_summaries')
      .orderBy('created_at', 'desc')
      .limit(1)
      .get();
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  } catch (error) {
    console.error('Error fetching overnight summary:', error);
    return null;
  }
}

export async function getOvernightSignals(limit: number = 20) {
  noStore();
  try {
    const snapshot = await getDb().collection('overnight_signals')
      .orderBy('score', 'desc')
      .limit(limit)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching overnight signals:', error);
    return [];
  }
}

// ─── Email Subscribers ───

export async function addEmailSubscriber(email: string) {
  try {
    await getDb().collection('email_subscribers').doc(email).set({
      email,
      subscribedAt: FieldValue.serverTimestamp(),
      active: true,
    }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('Error adding email subscriber:', error);
    return { success: false };
  }
}

export async function unsubscribeEmailAdmin(email: string) {
  try {
    await getDb().collection('email_subscribers').doc(email).set({
      active: false,
      unsubscribedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('Error unsubscribing email:', error);
    return { success: false };
  }
}

// Re-export overnight edge types
export type { OvernightSignal, OvernightSummary } from "./types/overnight-edge";


export async function getAllOvernightSummaries() {
  noStore();
  try {
    const snapshot = await getDb().collection('overnight_summaries')
      .orderBy('created_at', 'desc')
      .limit(30)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching all overnight summaries:', error);
    return [];
  }
}

export async function getOvernightSummary(date: string) {
  noStore();
  try {
    const snapshot = await getDb().collection('overnight_summaries')
      .where('scan_date', '==', date)
      .limit(1)
      .get();
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  } catch (error) {
    console.error('Error fetching overnight summary:', error);
    return null;
  }
}

export async function getSignalByTicker(ticker: string) {
  noStore();
  try {
    const snapshot = await getDb().collection('overnight_signals')
      .where('ticker', '==', ticker.toUpperCase())
      .orderBy('enriched_at', 'desc')
      .limit(1)
      .get();
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  } catch (error) {
    console.error('Error fetching signal by ticker:', error);
    return null;
  }
}
