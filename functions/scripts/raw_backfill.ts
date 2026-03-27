import * as admin from "firebase-admin";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const geminiApiKey = process.env.GEMINI_API_KEY;

admin.initializeApp({
  credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
});

const db = admin.firestore();

async function generateSeo(promptText: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: promptText }] }],
      generationConfig: { responseMimeType: "application/json" }
    })
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return JSON.parse(data.candidates[0].content.parts[0].text);
}

async function run() {
  console.log("Starting raw REST API backfill...");
  const snapshot = await db.collection("daily_reports").limit(2).get(); // Just 2 for sample
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (data.seoMetadata) continue;
    
    console.log(`Generating SEO for ${doc.id}...`);
    try {
      const prompt = `You are an expert financial SEO copywriter. Read the following options flow report and generate optimized SEO metadata. Output strictly valid JSON containing seoTitle (<60 chars), seoDescription (<160 chars), and keywords (array of 5 tickers).\n\nReport:\n${data.content.substring(0, 3000)}`;
      const seoData = await generateSeo(prompt);
      await doc.ref.update({ seoMetadata: seoData });
      console.log(`✓ Updated ${doc.id}`);
    } catch (e) {
      console.error(`Failed ${doc.id}:`, e);
    }
  }
  console.log("Done.");
}

run().catch(console.error);
