// test_seo.js
require('dotenv').config();
const admin = require('firebase-admin');

// Authenticate to Firebase Admin to grab a valid report URL dynamically
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  })
});

async function run() {
  console.log('Fetching latest report path from Firestore...');
  const snap = await admin.firestore().collection('daily_reports').orderBy('scan_date', 'desc').limit(1).get();
  if(snap.empty) return console.log('No reports found.');
  
  const date = snap.docs[0].id;
  const url = 'https://gammarips-webapp--profitscout-fida8.us-central1.hosted.app/reports/' + date;
  
  console.log('\n=======================================');
  console.log('VERIFYING PRODUCTION URL:', url);
  console.log('=======================================\n');
  
  const html = await fetch(url).then(r => r.text());
  
  const titleMatch = html.match(/<title>(.*?)<\/title>/);
  console.log('--- HTML HEAD TAGS ---');
  console.log('Title:', titleMatch ? titleMatch[1] : 'Not Found');
  
  const descMatch = html.match(/<meta name="description" content="(.*?)"/);
  console.log('Desc:', descMatch ? descMatch[1] : 'Not Found');
  
  console.log('\n--- APPLICATION/LD+JSON SCHEMAS ---');
  const ldJsonRegex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  let match;
  let count = 0;
  
  while ((match = ldJsonRegex.exec(html)) !== null) {
      count++;
      try {
          const parsed = JSON.parse(match[1]);
          // We print the @type so the user can see we found Dataset, Article, FAQPage etc.
          console.log(`\nSchema #${count} [@type: ${parsed['@type']}]:`);
          console.log(JSON.stringify(parsed, null, 2));
      } catch(e) {
          console.log(`Schema #${count} Failed to Parse JSON`);
      }
  }
  
  if (count === 0) {
      console.log('No JSON-LD schemas found on this page!');
  }
}
run().catch(console.error);
