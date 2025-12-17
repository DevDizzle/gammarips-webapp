import { initializeApp as initializeAdminApp, getApps as getAdminApps, App as AdminApp, type ServiceAccount } from 'firebase-admin/app';
import admin from 'firebase-admin';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';
import { config } from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
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
const TEST_EMAIL = 'admin@evanparra.ai';

async function testInsiderCampaign() {
  console.log(`Starting TEST campaign for ${TEST_EMAIL}...`);

  try {
    const usersCollection = adminDb.collection('users');
    // Query for the specific test user
    const snapshot = await usersCollection.where('email', '==', TEST_EMAIL).get();

    if (snapshot.empty) {
      console.error(`❌ User with email ${TEST_EMAIL} not found in the database.`);
      console.log("Please sign up with this email first or use an existing user email for testing.");
      return;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();
    console.log(`Found user: ${data.displayName || 'No Name'} (${doc.id})`);

    const token = uuidv4();
    const name = data.displayName || 'Trader';
    const baseUrl = 'https://gammarips.com';
    const link = `${baseUrl}/auth/activate-insider?token=${token}`;

    // 1. Update Database
    console.log(`Updating database with token...`);
    await doc.ref.update({ insiderActivationToken: token });

    // 2. Send Email
    console.log(`Sending test email...`);
    const result = await sendInsiderInvitationEmail({
        to: TEST_EMAIL,
        name: name,
        activationLink: link
    });

    if (result.ok) {
        console.log(`✅ Test email sent successfully to ${TEST_EMAIL}`);
        console.log(`Link generated: ${link}`);
    } else {
        console.error(`❌ Failed to send test email:`, result.details || result.status);
    }

  } catch (error) {
    console.error('An error occurred during the test:', error);
  } finally {
    console.log('Test finished.');
  }
}

testInsiderCampaign();
