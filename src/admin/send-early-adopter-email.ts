'use server';

import { initializeApp as initializeAdminApp, getApps as getAdminApps, App as AdminApp, type ServiceAccount } from 'firebase-admin/app';
import admin from 'firebase-admin';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';
import { config } from 'dotenv';
import { sendInsiderInvitationEmail } from '@/lib/mailgun';
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

async function sendEarlyAdopterEmails() {
  console.log('Starting Early Adopter Email Blast...');
  
  // Confirmation step before running (can be skipped if run non-interactively, but good for safety)
  // For this CLI context, we assume the user has already approved via chat.
  
  try {
    const usersCollection = adminDb.collection('users');
    const snapshot = await usersCollection.get();

    if (snapshot.empty) {
      console.log('No users found in the collection.');
      return;
    }

    console.log(`Found ${snapshot.size} total users. Processing...`);
    
    let successCount = 0;
    let failCount = 0;
    let skipCount = 0;

    const usersToProcess: DbUser[] = [];
    
    snapshot.forEach(doc => {
        usersToProcess.push(doc.data() as DbUser);
    });

    for (const user of usersToProcess) {
        if (!user.email) {
            console.log(`[SKIP] User ${user.uid} has no email.`);
            skipCount++;
            continue;
        }

        // Optional: Exclude users who are definitely internal/test if needed. 
        // For now, we blast everyone as requested.

        const name = user.displayName || user.email.split('@')[0];
        const dashboardLink = 'https://gammarips.com/dashboard';

        try {
            console.log(`[SENDING] To: ${user.email}...`);
            const result = await sendInsiderInvitationEmail({
                to: user.email,
                name,
                activationLink: dashboardLink
            });

            if (result.ok) {
                console.log(`[SUCCESS] Email sent to ${user.email}`);
                successCount++;
            } else {
                console.error(`[FAILED] Could not send to ${user.email}. Status: ${result.status}`);
                failCount++;
            }
        } catch (err) {
             console.error(`[ERROR] Exception for ${user.email}:`, err);
             failCount++;
        }

        // Polite delay to avoid hitting Mailgun rate limits instantly
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log('\n--- Summary ---');
    console.log(`Total Processed: ${usersToProcess.length}`);
    console.log(`Sent Successfully: ${successCount}`);
    console.log(`Failed: ${failCount}`);
    console.log(`Skipped (No Email): ${skipCount}`);
    console.log('----------------');

  } catch (error) {
    console.error('An error occurred during the email blast:', error);
  } finally {
    console.log('Process finished.');
    process.exit(0);
  }
}

sendEarlyAdopterEmails();
