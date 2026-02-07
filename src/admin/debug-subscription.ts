
import { initializeApp as initializeAdminApp, getApps as getAdminApps, App as AdminApp, type ServiceAccount } from 'firebase-admin/app';
import admin from 'firebase-admin';
import { getFirestore as getAdminFirestore, FieldValue } from 'firebase-admin/firestore';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

const TARGET_EMAIL = 'eraphaelparra@gmail.com';

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

async function debugAndFixUser() {
    console.log(`Searching for user: ${TARGET_EMAIL}`);
    const usersRef = adminDb.collection('users');
    const q = await usersRef.where('email', '==', TARGET_EMAIL).limit(1).get();

    if (q.empty) {
        console.error('User not found.');
        return;
    }

    const doc = q.docs[0];
    const data = doc.data();

    console.log('--- Current User Data ---');
    console.log(`UID: ${doc.id}`);
    console.log(`isSubscribed: ${data.isSubscribed}`);
    console.log(`stripeCustomerId: ${data.stripeCustomerId}`);
    console.log(`proUntil: ${data.proUntil ? data.proUntil.toDate() : 'UNDEFINED'}`);
    console.log(`plan: ${data.plan}`);
    console.log('-------------------------');

    if (data.isSubscribed) {
        console.log('User is marked as SUBSCRIBED. Fixing...');
        
        await doc.ref.update({
            isSubscribed: false,
            proUntil: FieldValue.delete(), // Ensure this is removed if it exists
            plan: 'free' // Force plan to free if they have one
        });

        console.log('User updated: isSubscribed = false, proUntil deleted.');
    } else {
        console.log('User is ALREADY unsubscribed.');
    }
}

debugAndFixUser();
