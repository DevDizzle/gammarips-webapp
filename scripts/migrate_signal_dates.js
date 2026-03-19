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

async function migrateSignals() {
  console.log("Starting migration...");
  const collectionRef = db.collection('overnight_signals');
  
  // We want docs with scan_date == '2026-03-06'
  const snapshot = await collectionRef.where('scan_date', '==', '2026-03-06').get();
  console.log(`Found ${snapshot.size} signals for 2026-03-06`);
  
  let batch = db.batch();
  let batchCount = 0;
  let totalMigrated = 0;
  
  // cutoff date for enriched_at
  const cutoff = new Date('2026-03-09T00:00:00Z');
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    
    // Some docs might not have enriched_at, or it might be a string/timestamp
    let enrichedAtDate = null;
    if (data.enriched_at) {
        if (data.enriched_at.toDate) {
            enrichedAtDate = data.enriched_at.toDate();
        } else {
            enrichedAtDate = new Date(data.enriched_at);
        }
    }
    
    if (enrichedAtDate && enrichedAtDate >= cutoff) {
      const ticker = data.ticker;
      if (!ticker) continue;
      
      const newId = `2026-03-09_${ticker}`;
      const newDocRef = collectionRef.doc(newId);
      
      const newData = { ...data };
      newData.scan_date = '2026-03-09';
      newData.underlying_scan_date = '2026-03-06';
      
      batch.set(newDocRef, newData);
      batch.delete(doc.ref);
      
      batchCount += 2; // one set, one delete
      totalMigrated += 1;
      
      if (batchCount >= 400) {
        console.log(`Committing batch of ${batchCount} operations...`);
        await batch.commit();
        batch = db.batch();
        batchCount = 0;
      }
    }
  }
  
  if (batchCount > 0) {
    console.log(`Committing final batch of ${batchCount} operations...`);
    await batch.commit();
  }
  
  console.log(`Migration complete. Total signals migrated: ${totalMigrated}`);
}

migrateSignals().catch(console.error);