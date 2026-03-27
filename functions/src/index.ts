import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { generate } from "@genkit-ai/ai";
import { configureGenkit } from "@genkit-ai/core";
import { vertexAI } from "@genkit-ai/vertexai";
import { z } from "zod";

admin.initializeApp();

// Configure Genkit with the Vertex AI plugin for Enterprise features
configureGenkit({
  // @ts-ignore - Bypass interface mismatch between GenkitPlugin and PluginProvider in 0.5.17
  plugins: [vertexAI({ location: 'global' })],
  logLevel: "info",
  enableTracingAndMetrics: true,
});

// We will explicitly pass 'vertexai/gemini-3.1-flash' or use the exported gemini31Flash

// Define the structured output schema for the SEO metadata
const SeoMetadataSchema = z.object({
  seoTitle: z.string().describe("A highly clickable title, max 60 characters. Do not use clickbait."),
  seoDescription: z.string().describe("Targeted summary of the report or thesis, max 160 characters."),
  keywords: z.array(z.string()).describe("Top 5 most important tickers or financial themes mentioned."),
});

/**
 * Cloud Function triggered when a new report is added to Firestore.
 */
export const generateReportSeo = functions.firestore
  .document("reports/{date}")
  .onCreate(async (snap, context) => {
    const reportData = snap.data();
    if (!reportData || !reportData.content) {
      console.log("No content found in the report.");
      return null;
    }

    try {
      console.log(`Generating SEO metadata for report ${context.params.date}`);
      
      const llmResponse = await generate({
        model: 'vertexai/gemini-3.1-flash',
        prompt: `You are an expert financial SEO copywriter. Read the following daily options flow report and generate highly optimized SEO metadata for it. Focus on the most important ticker movements and institutional positioning.\n\nReport Content:\n${reportData.content.substring(0, 5000)}`,
        output: {
          format: "json",
          schema: SeoMetadataSchema,
        },
      });

      const seoData = llmResponse.output;
      
      if (!seoData) {
         throw new Error("Failed to generate structured SEO data.");
      }

      // Save the generated SEO metadata back to the report document
      await snap.ref.update({
        seoMetadata: seoData,
      });

      console.log(`Successfully generated and saved SEO metadata for ${context.params.date}`);
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
  .document("signals/{ticker}")
  .onCreate(async (snap, context) => {
    const signalData = snap.data();
    if (!signalData || !signalData.thesis) {
      console.log("No thesis found in the signal.");
      return null;
    }

    try {
      console.log(`Generating SEO metadata for signal ${context.params.ticker}`);
      
      const llmResponse = await generate({
        model: 'vertexai/gemini-3.1-flash',
        prompt: `You are an expert financial SEO copywriter. Read the following institutional options flow thesis for ${context.params.ticker} and generate highly optimized SEO metadata for the ticker's signal page. Keep it professional and focused on the options flow analysis.\n\nThesis:\n${signalData.thesis}`,
        output: {
          format: "json",
          schema: SeoMetadataSchema,
        },
      });

      const seoData = llmResponse.output;
      
      if (!seoData) {
         throw new Error("Failed to generate structured SEO data.");
      }

      await snap.ref.update({
        seoMetadata: seoData,
      });

      console.log(`Successfully generated and saved SEO metadata for signal ${context.params.ticker}`);
      return seoData;
    } catch (error) {
      console.error("Error generating signal SEO metadata:", error);
      return null;
    }
  });
