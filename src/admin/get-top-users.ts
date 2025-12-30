
'use server';

import { initializeApp as initializeAdminApp, getApps as getAdminApps, App as AdminApp, type ServiceAccount } from 'firebase-admin/app';
import admin from 'firebase-admin';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';
import { config } from 'dotenv';
import type { DbUser } from '@/lib/firebase';

// Load environment variables from .env file
config();

let adminApp: AdminApp;

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
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
  adminApp = initializeAdminApp({
    credential: admin.credential.cert(serviceAccount),
  });
} else {
  adminApp = getAdminApps()[0]!;
}

const adminDb = getAdminFirestore(adminApp);

async function getTopUsersByUsage() {
  console.log('Fetching top 20 users by usage count...');

  try {
    const usersCollection = adminDb.collection('users');
    const snapshot = await usersCollection
      .orderBy('usageCount', 'desc')
      .limit(20)
      .get();

    if (snapshot.empty) {
      console.log('No users found in the collection.');
      return;
    }

    console.log('--- Top 20 Users by Usage Count ---');
    let rank = 1;
    snapshot.forEach(doc => {
      const user = doc.data() as DbUser;
      console.log(
        `${rank}.`.padEnd(4) +
        `Email: ${user.email || 'N/A'}`.padEnd(40) +
        `| Name: ${user.displayName || 'N/A'}`.padEnd(30) +
        `| Usage Count: ${user.usageCount}`
      );
      rank++;
    });
    console.log('------------------------------------');

  } catch (error: any) {
    if (error.code === 9) { // Firestore 'FAILED_PRECONDITION' error
        console.error('\n[Firestore Error] Missing Index: The query requires an index.');
        console.error('Please create a composite index in your Firestore database for the "users" collection on the "usageCount" field (descending).');
        console.error('You can create this by visiting the Firestore index creation link in the Firebase Console.\n');
    } else {
        console.error('An error occurred while fetching users:', error);
    }
  } finally {
    console.log('Process finished.');
  }
}

getTopUsersByUsage();
