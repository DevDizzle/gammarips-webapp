
import { initializeApp as initializeAdminApp, getApps as getAdminApps, App as AdminApp, type ServiceAccount } from 'firebase-admin/app';
import admin from 'firebase-admin';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { config } from 'dotenv';

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
const adminAuth = getAdminAuth(adminApp);

async function cleanupNullEmailUsers() {
  console.log('Starting user cleanup process...');

  try {
    const usersCollection = adminDb.collection('users');
    const snapshot = await usersCollection.where('email', '==', null).get();

    if (snapshot.empty) {
      console.log('No users with null emails found. Cleanup not needed.');
      return;
    }

    const userUidsToDelete: string[] = [];
    snapshot.forEach(doc => {
      userUidsToDelete.push(doc.id);
    });

    console.log(`Found ${userUidsToDelete.length} users with null emails to delete.`);

    // Batch delete from Firebase Authentication
    const deleteAuthResult = await adminAuth.deleteUsers(userUidsToDelete);
    
    console.log(`Successfully deleted ${deleteAuthResult.successCount} users from Firebase Authentication.`);
    if (deleteAuthResult.failureCount > 0) {
        console.error(`Failed to delete ${deleteAuthResult.failureCount} users from Firebase Authentication.`);
        deleteAuthResult.errors.forEach(error => {
            console.error(`Error deleting user ${error.uid}: ${error.error.message}`);
        });
    }

    // Batch delete from Firestore
    const batch = adminDb.batch();
    userUidsToDelete.forEach(uid => {
      const userRef = usersCollection.doc(uid);
      batch.delete(userRef);
    });
    await batch.commit();

    console.log(`Successfully deleted ${userUidsToDelete.length} user records from Firestore.`);

  } catch (error) {
    console.error('An error occurred during the cleanup process:', error);
  } finally {
    console.log('User cleanup process finished.');
  }
}

// Run the cleanup function
cleanupNullEmailUsers();
