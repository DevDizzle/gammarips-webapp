import * as functions from "firebase-functions";
import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

admin.initializeApp();

// Native REST fallback to guarantee execution regardless of package version mismatch
async function generateSeoMetadata(promptText: string) {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    throw new Error("Missing GEMINI_API_KEY in cloud environment.");
  }
  
  // Natively hitting the requested model endpoint
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: promptText }] }],
      generationConfig: {
        responseMimeType: "application/json",
      }
    })
  });
  
  const data = await response.json();
  if (data.error) {
    throw new Error(`Google AI API Error: ${data.error.message}`);
  }
  
  const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawJson) throw new Error("Empty response from Gemini.");
  
  return JSON.parse(rawJson);
}

/**
 * Cloud Function triggered when a new report is added to Firestore.
 */
export const generateReportSeo = functions.firestore
  .document("daily_reports/{date}")
  .onCreate(async (snap, context) => {
    const reportData = snap.data();
    if (!reportData || !reportData.content) return null;

    try {
      console.log(`Generating SEO metadata for report ${context.params.date}`);
      const prompt = `You are an expert financial SEO copywriter. Read the following daily options flow report and generate highly optimized SEO metadata for it. Focus on the most important ticker movements and institutional positioning. Output strictly valid JSON containing seoTitle (<60 chars), seoDescription (<160 chars), and keywords (array of 5 tickers/themes).\n\nReport Content:\n${reportData.content.substring(0, 5000)}`;
      
      const seoData = await generateSeoMetadata(prompt);
      await snap.ref.update({ seoMetadata: seoData });
      return seoData;
    } catch (error) {
      console.error("Error generating SEO metadata:", error);
      return null;
    }
  });

/**
 * Cloud Function triggered when a new signal is added to Firestore.
 */
export const generateSignalSeo = functions.firestore
  .document("overnight_signals/{signalId}")
  .onCreate(async (snap, context) => {
    const signalData = snap.data();
    const coreContext = signalData?.thesis || signalData?.news_summary || signalData?.flow_intent_reasoning;
    if (!signalData || !coreContext) return null;

    try {
      console.log(`Generating SEO metadata for signal ${context.params.signalId}`);
      const prompt = `You are an expert financial SEO copywriter. Read the following institutional options flow analysis for ${signalData.ticker} and generate highly optimized SEO metadata for the ticker's signal page. Keep it professional and focused on the options flow context. Output strictly valid JSON containing seoTitle (<60 chars), seoDescription (<160 chars), and keywords (array of 5 max).\n\nContext:\n${coreContext}`;
      
      const seoData = await generateSeoMetadata(prompt);
      await snap.ref.update({ seoMetadata: seoData });
      return seoData;
    } catch (error) {
      console.error("Error generating signal SEO metadata:", error);
      return null;
    }
  });

/**
 * HTTP Callable Cloud Function to manually trigger the backfill of historical data.
 */
export const manualSeoBackfill = onRequest(
  { timeoutSeconds: 540, memory: "1GiB" },
  async (req, res) => {
    try {
      console.log("Starting cloud-native manual backfill...");
      const firestore = admin.firestore();
      
      // 1. Backfill Reports
      const reportsSnapshot = await firestore.collection("daily_reports").get();
      let reportsUpdated = 0;
      for (const doc of reportsSnapshot.docs) {
        const data = doc.data();
        if (data.seoMetadata || !data.content) continue;
        
        try {
          const prompt = `You are an expert financial SEO copywriter. Read the following daily options flow report and generate highly optimized SEO metadata for it. Focus on the most important ticker movements and institutional positioning. Output strictly valid JSON containing seoTitle (<60 chars), seoDescription (<160 chars), and keywords (array of 5 tickers/themes).\n\nReport Content:\n${data.content.substring(0, 5000)}`;
          const seoData = await generateSeoMetadata(prompt);
          await doc.ref.update({ seoMetadata: seoData });
          reportsUpdated++;
        } catch (e) {}
      }

      // 2. Backfill Signals (Limit 50 to avoid timeouts)
      const signalsSnapshot = await firestore.collection("overnight_signals").limit(50).get();
      let signalsUpdated = 0;
      for (const doc of signalsSnapshot.docs) {
        const data = doc.data();
        const coreContext = data.thesis || data.news_summary || data.flow_intent_reasoning;
        if (data.seoMetadata || !coreContext) continue;

        try {
          const prompt = `You are an expert financial SEO copywriter. Read the following institutional options flow analysis for ${data.ticker || doc.id} and generate highly optimized SEO metadata for the ticker's signal page. Keep it professional and focused on the options flow analysis. Output strictly valid JSON containing seoTitle (<60 chars), seoDescription (<160 chars), and keywords (array of 5 max).\n\nAnalysis:\n${coreContext}`;
          const seoData = await generateSeoMetadata(prompt);
          await doc.ref.update({ seoMetadata: seoData });
          signalsUpdated++;
        } catch (e) {}
      }

      res.json({
        success: true,
        message: "Native REST Backfill execution complete.",
        metrics: { reportsUpdated, signalsUpdated }
      });
    } catch (error) {
      console.error("Backfill execution failed:", error);
      res.status(500).json({ success: false, error: String(error) });
    }
  }
);
