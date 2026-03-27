import * as admin from "firebase-admin";
import { generate } from "@genkit-ai/ai";
import { configureGenkit } from "@genkit-ai/core";
import { googleAI, gemini15Flash } from "@genkit-ai/googleai";
import { z } from "zod";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const geminiApiKey = process.env.GEMINI_API_KEY;

// Bind Vertex AI to the physical Service Account JSON you provide
process.env.GOOGLE_APPLICATION_CREDENTIALS = path.resolve(__dirname, '../../service-account.json');

if (!projectId || !clientEmail || !privateKey) {
  console.error("Missing required environment variables in .env");
  process.exit(1);
}

// Initialize Firebase Admin with explicit credentials for local execution
admin.initializeApp({
  credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
});

const db = admin.firestore();

// Configure Genkit
configureGenkit({
  // @ts-ignore - Bypass interface mismatch
  plugins: [googleAI({ apiKey: geminiApiKey })],
  logLevel: "error", // Keep it quiet
  enableTracingAndMetrics: false,
});

const SeoMetadataSchema = z.object({
  seoTitle: z.string(),
  seoDescription: z.string(),
  keywords: z.array(z.string()),
});

async function backfillReports() {
  console.log("--- Starting Reports Backfill ---");
  const snapshot = await db.collection("daily_reports").get();
  let count = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (data.seoMetadata) {
      console.log(`Skipping report ${doc.id}: already has SEO metadata.`);
      continue;
    }

    if (!data.content) {
      console.log(`Skipping report ${doc.id}: no content.`);
      continue;
    }

    console.log(`Generating SEO metadata for report ${doc.id}...`);
    try {
      const llmResponse = await generate({
        model: 'googleai/gemini-3.1-flash',
        prompt: `You are an expert financial SEO copywriter. Read the following options flow report and generate optimized SEO metadata. Output JSON containing seoTitle (<60 chars), seoDescription (<160 chars), and keywords (array of 5 tickers/themes).\n\nReport Content:\n${data.content.substring(0, 5000)}`,
        output: { format: "json", schema: SeoMetadataSchema },
      });

      const seoData = llmResponse.output;
      if (seoData) {
        await doc.ref.update({ seoMetadata: seoData });
        console.log(`  ✓ Successfully updated report ${doc.id}`);
        count++;
      }
    } catch (error) {
      console.error(`  ✗ Failed to generate SEO for ${doc.id}:`, error);
    }
  }
  console.log(`--- Finished Reports Backfill. Updated ${count} reports. ---\n`);
}

async function backfillSignals() {
  console.log("--- Starting Signals Backfill ---");
  // Only fetching limit for demo speed or we can do all. Let's do all.
  const snapshot = await db.collection("overnight_signals").get();
  let count = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (data.seoMetadata) {
      // console.log(`Skipping signal ${doc.id}: already has SEO metadata.`);
      continue;
    }

    if (!data.thesis) {
      // console.log(`Skipping signal ${doc.id}: no thesis.`);
      continue;
    }

    console.log(`Generating SEO metadata for signal ${doc.id}...`);
    try {
      const llmResponse = await generate({
        model: 'googleai/gemini-3.1-flash',
        prompt: `You are an expert financial SEO copywriter. Read the following options flow thesis for ${data.ticker} and generate optimized SEO metadata for the signal page. Output JSON containing seoTitle (<60 chars), seoDescription (<160 chars), and keywords (array of 5 max).\n\nThesis:\n${data.thesis}`,
        output: { format: "json", schema: SeoMetadataSchema },
      });

      const seoData = llmResponse.output;
      if (seoData) {
        await doc.ref.update({ seoMetadata: seoData });
        console.log(`  ✓ Successfully updated signal ${doc.id}`);
        count++;
      }
    } catch (error) {
      console.error(`  ✗ Failed to generate SEO for ${doc.id}:`, error);
    }
  }
  console.log(`--- Finished Signals Backfill. Updated ${count} signals. ---`);
}

async function main() {
  try {
    await backfillReports();
    // We can also trigger signals
    await backfillSignals();
    console.log("All backfills completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Fatal Error:", err);
    process.exit(1);
  }
}

main();
