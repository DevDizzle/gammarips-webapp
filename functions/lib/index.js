"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSignalSeo = exports.generateReportSeo = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const ai_1 = require("@genkit-ai/ai");
const core_1 = require("@genkit-ai/core");
const vertexai_1 = require("@genkit-ai/vertexai");
const zod_1 = require("zod");
admin.initializeApp();
// Configure Genkit with the Vertex AI plugin for Enterprise features
(0, core_1.configureGenkit)({
    // @ts-ignore - Bypass interface mismatch between GenkitPlugin and PluginProvider in 0.5.17
    plugins: [(0, vertexai_1.vertexAI)({ location: 'global' })],
    logLevel: "info",
    enableTracingAndMetrics: true,
});
// We will explicitly pass 'vertexai/gemini-3.1-flash' or use the exported gemini31Flash
// Define the structured output schema for the SEO metadata
const SeoMetadataSchema = zod_1.z.object({
    seoTitle: zod_1.z.string().describe("A highly clickable title, max 60 characters. Do not use clickbait."),
    seoDescription: zod_1.z.string().describe("Targeted summary of the report or thesis, max 160 characters."),
    keywords: zod_1.z.array(zod_1.z.string()).describe("Top 5 most important tickers or financial themes mentioned."),
});
/**
 * Cloud Function triggered when a new report is added to Firestore.
 */
exports.generateReportSeo = functions.firestore
    .document("reports/{date}")
    .onCreate(async (snap, context) => {
    const reportData = snap.data();
    if (!reportData || !reportData.content) {
        console.log("No content found in the report.");
        return null;
    }
    try {
        console.log(`Generating SEO metadata for report ${context.params.date}`);
        const llmResponse = await (0, ai_1.generate)({
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
    }
    catch (error) {
        console.error("Error generating SEO metadata:", error);
        return null;
    }
});
/**
 * Cloud Function triggered when a new signal is added to Firestore.
 */
exports.generateSignalSeo = functions.firestore
    .document("signals/{ticker}")
    .onCreate(async (snap, context) => {
    const signalData = snap.data();
    if (!signalData || !signalData.thesis) {
        console.log("No thesis found in the signal.");
        return null;
    }
    try {
        console.log(`Generating SEO metadata for signal ${context.params.ticker}`);
        const llmResponse = await (0, ai_1.generate)({
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
    }
    catch (error) {
        console.error("Error generating signal SEO metadata:", error);
        return null;
    }
});
//# sourceMappingURL=index.js.map