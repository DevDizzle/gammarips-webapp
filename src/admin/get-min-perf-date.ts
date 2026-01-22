'use server';

import { initializeApp as initializeAdminApp, getApps as getAdminApps, App as AdminApp, type ServiceAccount } from 'firebase-admin/app';
import admin from 'firebase-admin';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';
import { config } from 'dotenv';

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

async function getMinRunDate() {
  console.log('Querying performance_tracker collection to find the minimum run_date...');

  try {
    const snapshot = await adminDb.collection('performance_tracker')
      .orderBy('run_date', 'asc')
      .limit(1)
      .get();

    if (snapshot.empty) {
      console.log('No signals found in performance_tracker collection.');
      return;
    }

    const firstDoc = snapshot.docs[0];
    const minDate = firstDoc.data().run_date;

    console.log(`\n✅ Minimum run_date found: ${minDate}`);
    console.log(`   (From document with ID: ${firstDoc.id})`);

  } catch (error: any) {
    if (error.code === 9) { // Firestore 'FAILED_PRECONDITION' error for missing index
        console.error('\n[Firestore Error] Missing Index: The query requires an index.');
        console.error('Please create a single-field index in your Firestore database for the "performance_tracker" collection on the "run_date" field (Ascending).');
        console.error('You can do this in the Firebase Console under Firestore Database > Indexes.');
    } else {
        console.error('An error occurred while fetching performance data:', error);
    }
  } finally {
    console.log('\nProcess finished.');
    // The script should exit, otherwise tsx might hang
    process.exit(0);
  }
}

getMinRunDate();
