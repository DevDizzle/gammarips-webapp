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
  throw new Error('Firebase env vars missing.');
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

async function resetUsageStats() {
  console.log('Starting usage stats reset...');
  const usersRef = adminDb.collection('users');
  const snapshot = await usersRef.get();
  
  if (snapshot.empty) {
    console.log('No users found.');
    return;
  }
  
  let batch = adminDb.batch();
  let count = 0;
  const batchLimit = 400; 

  for (const doc of snapshot.docs) {
    batch.update(doc.ref, {
      usageCount: 0,
      daysActive: 0,
      lastActiveAt: admin.firestore.FieldValue.delete(), 
    });
    count++;

    if (count >= batchLimit) {
      await batch.commit();
      console.log(`Committed batch...`);
      batch = adminDb.batch();
      count = 0;
    }
  }

  if (count > 0) {
    await batch.commit();
  }
  
  console.log('Reset complete. All users usageCount=0, daysActive=0, lastActiveAt=deleted.');
}

resetUsageStats();
