
import { initializeApp as initializeAdminApp, getApps as getAdminApps, App as AdminApp, type ServiceAccount } from 'firebase-admin/app';
import admin from 'firebase-admin';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

let adminApp: AdminApp;

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!projectId || !clientEmail || !privateKey) {
  throw new Error('Firebase server environment variables are not set.');
}

const serviceAccount: ServiceAccount = {
  projectId,
  clientEmail,
  privateKey,
};

if (!getAdminApps().length) {
  adminApp = initializeAdminApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
} else {
  adminApp = getAdminApps()[0]!;
}

const adminDb = getAdminFirestore(adminApp);

async function fixWinnersDashboard() {
  console.log('Scanning winners_dashboard...');
  try {
    const winnersRef = adminDb.collection('winners_dashboard');
    const snapshot = await winnersRef.get();
    
    let fixedCount = 0;
    
    for (const doc of snapshot.docs) {
        const data = doc.data();
        if (!data.dashboard_json && data.ticker) {
            // Attempt to find it in tickers
            const tickerRef = adminDb.collection('tickers').doc(data.ticker);
            const tickerSnap = await tickerRef.get();
            if (tickerSnap.exists) {
                const tickerData = tickerSnap.data();
                if (tickerData?.dashboard_json) {
                    await doc.ref.update({ dashboard_json: tickerData.dashboard_json });
                    console.log(`Fixed winners_dashboard/${doc.id} with dashboard_json from ticker ${data.ticker}`);
                    fixedCount++;
                }
            }
        }
    }
    console.log(`Fixed ${fixedCount} winners_dashboard documents.`);
  } catch (error) {
      console.error("Error fixing winners_dashboard:", error);
  }
}

async function fixOptionsCandidates() {
    console.log('Scanning options_candidates...');
    try {
        const candidatesRef = adminDb.collection('options_candidates');
        const snapshot = await candidatesRef.get(); 
        
        let fixedCount = 0;
        const batchSize = 400; // Safe batch size
        let batch = adminDb.batch();
        let batchCount = 0;

        for (const doc of snapshot.docs) {
            const data = doc.data();
            let needsUpdate = false;
            const updates: any = {};

            // Fix strike: Ensure it exists and is a number
            if (data.strike === undefined && data.strike_price !== undefined) {
                 const val = typeof data.strike_price === 'string' ? parseFloat(data.strike_price) : data.strike_price;
                 if (!isNaN(val)) {
                     updates.strike = val;
                     needsUpdate = true;
                 }
            } else if (typeof data.strike === 'string') {
                const val = parseFloat(data.strike);
                if (!isNaN(val)) {
                    updates.strike = val;
                    needsUpdate = true;
                }
            }

            // Fix stock_outlook_signal
            if (!data.stock_outlook_signal && data.outlook_signal) {
                updates.stock_outlook_signal = data.outlook_signal;
                needsUpdate = true;
            }

            if (needsUpdate) {
                batch.update(doc.ref, updates);
                batchCount++;
                fixedCount++;
                
                if (batchCount >= batchSize) {
                    await batch.commit();
                    batch = adminDb.batch();
                    batchCount = 0;
                    console.log(`Committed batch of ${batchSize} updates...`);
                }
            }
        }
        
        if (batchCount > 0) {
            await batch.commit();
        }
        
        console.log(`Fixed ${fixedCount} options_candidates documents.`);
    } catch (error) {
        console.error("Error fixing options_candidates:", error);
    }
}

async function run() {
    await fixWinnersDashboard();
    await fixOptionsCandidates();
    process.exit(0);
}

run().catch(console.error);
