
import { initializeApp as initializeAdminApp, getApps as getAdminApps, App as AdminApp, type ServiceAccount } from 'firebase-admin/app';
import admin from 'firebase-admin';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';
import { config } from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import { sendInsiderInvitationEmail } from '../lib/mailgun';

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

async function generateInsiderTokens() {
  console.log('Starting insider token generation and email dispatch...');

  try {
    const usersCollection = adminDb.collection('users');
    const snapshot = await usersCollection.get();

    if (snapshot.empty) {
      console.log('No users found.');
      return;
    }

    const updates: Promise<any>[] = [];
    const csvRows: string[] = ['Email,Name,Activation Link,Email Status'];
    const baseUrl = 'https://gammarips.com'; // Updated to production URL

    let count = 0;
    let emailSuccessCount = 0;
    let emailFailCount = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const usageCount = data.usageCount || 0;
      const isSubscribed = data.isSubscribed || false;

      // Filter: not subscribed and has email
      if (!isSubscribed && data.email) {
        const token = uuidv4();
        const name = data.displayName || 'Trader';
        const link = `${baseUrl}/auth/activate-insider?token=${token}`;
        
        // 1. Queue Database Update
        updates.push(doc.ref.update({ insiderActivationToken: token }));

        // 2. Send Email
        console.log(`Sending invitation to ${data.email}...`);
        try {
            const result = await sendInsiderInvitationEmail({
                to: data.email,
                name: name,
                activationLink: link
            });
            
            if (result.ok) {
                console.log(`✅ Email sent to ${data.email}`);
                csvRows.push(`${data.email},"${name}",${link},Sent`);
                emailSuccessCount++;
            } else {
                console.error(`❌ Failed to send to ${data.email}:`, result.details || result.status);
                csvRows.push(`${data.email},"${name}",${link},Failed`);
                emailFailCount++;
            }
        } catch (emailError) {
            console.error(`❌ Error sending to ${data.email}:`, emailError);
            csvRows.push(`${data.email},"${name}",${link},Error`);
            emailFailCount++;
        }

        count++;
        // 3. Rate Limit Delay
        await new Promise(r => setTimeout(r, 200));
      }
    }

    if (count === 0) {
        console.log("No eligible users found (usageCount < 2 and not subscribed).");
        return;
    }

    console.log(`Finished processing ${count} users.`);
    console.log(`Updating database records...`);

    await Promise.all(updates);

    // Write CSV
    fs.writeFileSync('insider_tokens.csv', csvRows.join('\n'));

    console.log(`Database updated.`);
    console.log(`Emails Sent: ${emailSuccessCount}`);
    console.log(`Emails Failed: ${emailFailCount}`);
    console.log(`CSV report created at: ${process.cwd()}/insider_tokens.csv`);

  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    console.log('Process finished.');
  }
}

generateInsiderTokens();

