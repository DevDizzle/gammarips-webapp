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
exports.manualSeoBackfill = exports.generateSignalSeo = exports.generateReportSeo = void 0;
const functions = __importStar(require("firebase-functions"));
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
// Hard fallback to native REST to guarantee 100% stable execution
// independently of @genkit-ai version restrictions.
async function generateSeoMetadata(promptText) {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
        throw new Error("Missing GEMINI_API_KEY in cloud environment.");
    }
    // Natively hitting the stable and active 2.5 model endpoint
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
    if (!rawJson)
        throw new Error("Empty response from Gemini.");
    return JSON.parse(rawJson);
}
/**
 * Cloud Function triggered when a new report is added to Firestore.
 */
exports.generateReportSeo = functions.firestore
    .document("reports/{date}")
    .onCreate(async (snap, context) => {
    const reportData = snap.data();
    if (!reportData || !reportData.content)
        return null;
    try {
        console.log(`Generating SEO metadata for report ${context.params.date}`);
        const prompt = `You are an expert financial SEO copywriter. Read the following daily options flow report and generate highly optimized SEO metadata for it. Focus on the most important ticker movements and institutional positioning. Output strictly valid JSON containing seoTitle (<60 chars), seoDescription (<160 chars), and keywords (array of 5 tickers/themes).\n\nReport Content:\n${reportData.content.substring(0, 5000)}`;
        const seoData = await generateSeoMetadata(prompt);
        await snap.ref.update({ seoMetadata: seoData });
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
    if (!signalData || !signalData.thesis)
        return null;
    try {
        console.log(`Generating SEO metadata for signal ${context.params.ticker}`);
        const prompt = `You are an expert financial SEO copywriter. Read the following institutional options flow thesis for ${context.params.ticker} and generate highly optimized SEO metadata for the ticker's signal page. Keep it professional and focused on the options flow analysis. Output strictly valid JSON containing seoTitle (<60 chars), seoDescription (<160 chars), and keywords (array of 5 max).\n\nThesis:\n${signalData.thesis}`;
        const seoData = await generateSeoMetadata(prompt);
        await snap.ref.update({ seoMetadata: seoData });
        console.log(`Successfully generated and saved SEO metadata for signal ${context.params.ticker}`);
        return seoData;
    }
    catch (error) {
        console.error("Error generating signal SEO metadata:", error);
        return null;
    }
});
/**
 * HTTP Callable Cloud Function to manually trigger the backfill of historical data.
 */
exports.manualSeoBackfill = (0, https_1.onRequest)({ timeoutSeconds: 540, memory: "1GiB" }, async (req, res) => {
    try {
        console.log("Starting cloud-native native fetch manual backfill...");
        const firestore = admin.firestore();
        // 1. Backfill Reports
        const reportsSnapshot = await firestore.collection("daily_reports").get();
        let reportsUpdated = 0;
        for (const doc of reportsSnapshot.docs) {
            const data = doc.data();
            if (data.seoMetadata || !data.content)
                continue;
            console.log(`Backfilling report: ${doc.id}`);
            try {
                const prompt = `You are an expert financial SEO copywriter. Read the following daily options flow report and generate highly optimized SEO metadata for it. Focus on the most important ticker movements and institutional positioning. Output strictly valid JSON containing seoTitle (<60 chars), seoDescription (<160 chars), and keywords (array of 5 tickers/themes).\n\nReport Content:\n${data.content.substring(0, 5000)}`;
                const seoData = await generateSeoMetadata(prompt);
                await doc.ref.update({ seoMetadata: seoData });
                reportsUpdated++;
            }
            catch (e) {
                console.error(`Failed ${doc.id}:`, e);
            }
        }
        // 2. Backfill Signals (Limit 50 to avoid timeouts)
        const signalsSnapshot = await firestore.collection("overnight_signals").limit(50).get();
        let signalsUpdated = 0;
        for (const doc of signalsSnapshot.docs) {
            const data = doc.data();
            if (data.seoMetadata || !data.thesis)
                continue;
            console.log(`Backfilling signal: ${doc.id}`);
            try {
                const prompt = `You are an expert financial SEO copywriter. Read the following institutional options flow thesis for ${data.ticker || doc.id} and generate highly optimized SEO metadata for the ticker's signal page. Keep it professional and focused on the options flow analysis. Output strictly valid JSON containing seoTitle (<60 chars), seoDescription (<160 chars), and keywords (array of 5 max).\n\nThesis:\n${data.thesis}`;
                const seoData = await generateSeoMetadata(prompt);
                await doc.ref.update({ seoMetadata: seoData });
                signalsUpdated++;
            }
            catch (e) {
                console.error(`Failed signal ${doc.id}:`, e);
            }
        }
        res.json({
            success: true,
            message: "Native REST Backfill execution complete.",
            metrics: { reportsUpdated, signalsUpdated }
        });
    }
    catch (error) {
        console.error("Backfill execution failed:", error);
        res.status(500).json({ success: false, error: String(error) });
    }
});
//# sourceMappingURL=index.js.map