require('dotenv').config();
const admin = require('firebase-admin');
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}
const db = admin.firestore();

async function check() {
  const s6 = await db.collection('overnight_signals').where('scan_date', '==', '2026-03-06').limit(10).get();
  console.log("2026-03-06 signals:", s6.size);
  s6.forEach(doc => console.log(doc.id, doc.data().enriched_at?.toDate()));

  const s7 = await db.collection('overnight_signals').where('scan_date', '==', '2026-03-07').limit(10).get();
  console.log("2026-03-07 signals:", s7.size);
  s7.forEach(doc => console.log(doc.id, doc.data().enriched_at?.toDate()));
}
check().catch(console.error);
