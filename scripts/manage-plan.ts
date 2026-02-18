
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Load environment variables
dotenv.config({ path: join(process.cwd(), '.env') });

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

async function setPlan(email: string, plan: string) {
  if (!email || !plan) {
    console.error('Usage: npx tsx scripts/manage-plan.ts <email> <plan>');
    console.error('Plan must be one of: free, edge, warroom');
    process.exit(1);
  }

  const validPlans = ['free', 'edge', 'warroom'];
  if (!validPlans.includes(plan)) {
    console.error(`Invalid plan: ${plan}. Must be one of: ${validPlans.join(', ')}`);
    process.exit(1);
  }

  try {
    console.log(`Searching for user with email: ${email}...`);
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();

    if (snapshot.empty) {
      console.error('No user found with that email.');
      process.exit(1);
    }

    const userDoc = snapshot.docs[0];
    const uid = userDoc.id;
    console.log(`Found user: ${uid}`);

    let updates: any = {};

    if (plan === 'warroom') {
      updates = {
        plan: 'warroom',
        isSubscribed: true,
        subscriptionStatus: 'active',
        stripeCustomerId: 'manual_override', // Placeholder to prevent errors if code expects it
      };
    } else if (plan === 'edge') {
      updates = {
        plan: 'edge',
        isSubscribed: true,
        subscriptionStatus: 'active',
        stripeCustomerId: 'manual_override',
      };
    } else {
      updates = {
        plan: 'free',
        isSubscribed: false,
        subscriptionStatus: 'canceled',
      };
    }

    await userDoc.ref.update(updates);
    console.log(`Successfully updated user ${email} to plan: ${plan}`);
    console.log('Updates applied:', updates);

  } catch (error) {
    console.error('Error updating user plan:', error);
    process.exit(1);
  }
}

const args = process.argv.slice(2);
const email = args[0];
const plan = args[1];

setPlan(email, plan);
