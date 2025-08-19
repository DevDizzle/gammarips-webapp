// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, getDoc, serverTimestamp, increment, addDoc, Timestamp } from "firebase/firestore";
import { getAuth } from 'firebase/auth';
import { z } from 'zod';


// Client-side Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCc1VeqTakW7osF-l4pB3sRw76QsYNWwI0",
  authDomain: "profitscout-fida8.firebaseapp.com",
  projectId: "profitscout-fida8",
  storageBucket: "profitscout-fida8.appspot.com",
  messagingSenderId: "406581297632",
  appId: "1:406581297632:web:c24bda744fd33784b96b85"
};


// Initialize Firebase for the client
export const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
export const auth = getAuth(app);


const StockSchema = z.object({
  id: z.string(), // Document ID is the ticker
  company_name: z.string(),
  bundle_gcs_path: z.string(),
});
export type Stock = z.infer<typeof StockSchema>;


export async function saveFeedback(originalFeedback: string, summary: string): Promise<void> {
  try {
    await addDoc(collection(db, "feedback"), {
      originalFeedback,
      summary,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error writing feedback to Firestore: ", error);
    throw new Error("Could not save feedback to the database. Please check your Firestore security rules.");
  }
}

// User Management
const UserSchema = z.object({
  uid: z.string(),
  email: z.string().email().optional().nullable(),
  displayName: z.string().optional().nullable(),
  isAnonymous: z.boolean(),
  isSubscribed: z.boolean(),
  usageCount: z.number().int().nonnegative(),
  createdAt: z.any().optional(), // Can be Timestamp or FieldValue
  stripeCustomerId: z.string().optional().nullable(),
});
export type DbUser = z.infer<typeof UserSchema>;

export async function getOrCreateUser(
  uid: string,
  isAnonymous: boolean = false,
  displayName?: string,
  email?: string,
  stripeCustomerId?: string
): Promise<DbUser> {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const userData = userSnap.data() as DbUser;
    // If user exists but is missing stripeId, update them.
    if (!userData.stripeCustomerId && stripeCustomerId) {
      await setDoc(userRef, { stripeCustomerId }, { merge: true });
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
    createdAt: serverTimestamp(),
    stripeCustomerId: stripeCustomerId ?? null,
  };

  await setDoc(userRef, newUser);
  // After creation, re-fetch to get a consistent object with a server timestamp
  const newUserSnap = await getDoc(userRef);
  return newUserSnap.data() as DbUser;
}

export async function incrementUserUsage(uid: string) {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, { usageCount: increment(1) }, { merge: true });
}

export async function setUserSubscriptionStatus(
  uid: string,
  isSubscribed: boolean
) {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, { isSubscribed }, { merge: true });
}

export async function getUserByStripeCustomerId(stripeCustomerId: string): Promise<DbUser | null> {
  const usersRef = collection(db, 'users');
  const q = (await getDocs(usersRef)).docs.find(doc => doc.data().stripeCustomerId === stripeCustomerId);
  
  if (q) {
    return q.data() as DbUser;
  }
  return null;
}
