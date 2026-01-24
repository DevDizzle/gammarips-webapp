
'use server';

import {
  getInitialRecommendation,
  type InitialRecommendationInput,
  type InitialRecommendationOutput
} from '@/ai/flows/initial-recommendation';
import {
  answerFollowUpQuestion,
  type FollowUpQuestionInput,
  type FollowUpQuestionOutput,
} from '@/ai/flows/follow-up-questions';
import { 
    getStocksAdmin, 
    getOrCreateUserAdmin,
    incrementUserUsageAdmin,
    getGcsFileContentAdmin,
    getRandomBuyStockAdmin,
    getRandomSellStockAdmin,
    getTopStocksAdmin,
    getTopOptionsAdmin,
    getWinnersDashboardAdmin,
    getOptionsCandidatesAdmin,
    getTickerEventsAdmin,
    saveFeedbackAdmin,
    getPerformanceSignals as getPerformanceSignalsAdmin,
    getAllPerformanceSignalsAdmin,
    getPerformanceSignalsByTicker as getPerformanceSignalsByTickerAdmin,
    getAppStatusAdmin,
    saveFeedbackSurveyAdmin,
    getWinnerForTickerAdmin,
    getStockDataAdmin,
    saveCancellationFeedbackAdmin,
    handleWinSubmission as handleWinSubmissionAdmin,
} from '@/lib/firebase-admin';
import type { Stock, OptionCandidate, Winner, TickerEvent, PerformanceSignal, FeedbackSurveyData } from '@/lib/firebase-admin';
import { createStripeCheckoutSession, createStripePortalSession } from '@/lib/stripe';
import { headers } from 'next/headers';
import { randomUUID } from 'crypto';
import { getAuth as getClientAuth, sendPasswordResetEmail } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { sendWelcomeEmail as sendWelcomeEmailAdmin, sendFeedbackAcknowledgmentEmail } from '@/lib/mailgun';
import { unstable_noStore as noStore } from 'next/cache';
import { FREE_MODE } from '@/lib/config';


export async function getAppStatus(): Promise<{ isUpdating: boolean }> {
    return getAppStatusAdmin();
}

export async function getOptionsSignals(ticker: string): Promise<OptionCandidate[]> {
    return getOptionsCandidatesAdmin(ticker);
}

export async function getPerformanceSignals(order: 'asc' | 'desc', limit: number): Promise<PerformanceSignal[]> {
    return getPerformanceSignalsAdmin(order, limit);
}

export async function getAllPerformanceSignals(): Promise<PerformanceSignal[]> {
    return getAllPerformanceSignalsAdmin();
}

export async function getPerformanceSignalsByTicker(ticker: string): Promise<PerformanceSignal[]> {
    return getPerformanceSignalsByTickerAdmin(ticker);
}

export async function getWinnersDashboard(): Promise<Winner[]> {
    return getWinnersDashboardAdmin();
}

export async function incrementDashboardViewCount(uid: string): Promise<{success: boolean}> {
  try {
    // Increment usage for everyone (tracking)
    await incrementUserUsageAdmin(uid);
    return { success: true };
  } catch {
    console.error(`Failed to increment dashboard view for user ${uid}`);
    // Don't throw, as this is a non-critical background task
    return { success: false };
  }
}

export async function getStocks(): Promise<Stock[]> {
    return getStocksAdmin();
}

export async function getTickerEvents(ticker: string, type: 'ticker' | 'economic'): Promise<TickerEvent[]> {
    return getTickerEventsAdmin(ticker, type);
}

export async function getEconomicEvents(): Promise<TickerEvent[]> {
    return getTickerEventsAdmin(undefined, 'economic');
}

export async function getTopStocks(type: 'BUY' | 'SELL', limit: number): Promise<Stock[]> {
    return getTopStocksAdmin(type, limit);
}

export async function getTopOptions(type: 'CALL' | 'PUT', limit: number): Promise<OptionCandidate[]> {
    return getTopOptionsAdmin(type, limit);
}

export async function getOptionsCandidates(ticker?: string): Promise<OptionCandidate[]> {
    return getOptionsCandidatesAdmin(ticker);
}

import type { DashboardDataV2 } from '@/lib/types/dashboard-v2';

export async function getDashboardData(ticker: string): Promise<DashboardDataV2 | null> {
    noStore();
    const winnerContract = await getWinnerForTickerAdmin(ticker);

    let gcsPath = winnerContract?.dashboard_json;
    // We still check analysisPath for legacy fallback
    let analysisPath = winnerContract?.recommendation_analysis; 
    let optionsHeader = null;
    let stockData: Stock | null = null;

    // If it's a winner, construct the options header (Legacy Logic)
    if (winnerContract) {
        const runDate = winnerContract.run_date || new Date().toISOString();
        const expirationDate = winnerContract.expiration_date; // Assuming expiration_date is required string in schema, checked: it is z.string()
        
        optionsHeader = {
            companyName: winnerContract.company_name,
            ticker: winnerContract.ticker,
            runDate: runDate,
            optionType: winnerContract.option_type,
            contractSymbol: winnerContract.contract_symbol,
            expirationDate: expirationDate,
            strikePrice: winnerContract.strike_price,
            setupQuality: winnerContract.setup_quality_signal,
            trendSignal: winnerContract.outlook_signal || 'Neutral',
            volatilitySignal: winnerContract.volatility_comparison_signal,
            topSignalSummary: winnerContract.summary,
            dte: Math.max(0, Math.ceil((new Date(expirationDate).getTime() - new Date(runDate).getTime()) / (1000 * 60 * 60 * 24))),
        };
    }

    // Fallback if not a winner or winner is missing paths
    if (!gcsPath) {
        console.warn(`[getDashboardData] Winner contract for ${ticker} is incomplete. Falling back to tickers collection.`);
        stockData = await getStockDataAdmin(ticker);
        if (!stockData) {
            console.error(`[getDashboardData] No data found in tickers collection for ${ticker} either.`);
            return null;
        }
        gcsPath = stockData.dashboard_json;
        analysisPath = stockData.recommendation_analysis;
    }

    if (!gcsPath) {
        console.error(`[getDashboardData] No dashboard_json path could be found for ${ticker}.`);
        return null;
    }

    try {
        // Fetch dashboard JSON (Could be V1 or V2)
        const dashboardJson = JSON.parse(await getGcsFileContentAdmin(gcsPath));
        
        // Construct the suggestedOption object from optionsHeader (Winner Data)
        const suggestedOption = optionsHeader ? {
            type: optionsHeader.optionType,
            strike: optionsHeader.strikePrice,
            expirationDate: optionsHeader.expirationDate,
            contractSymbol: optionsHeader.contractSymbol,
            dte: optionsHeader.dte,
            setupQuality: optionsHeader.setupQuality,
            summary: optionsHeader.topSignalSummary
        } : undefined;

        // --- CASE A: Flattened Data (New Backend) ---
        // Check if root properties exist
        if (dashboardJson.tradeSetup || dashboardJson.fundamentalThesis || dashboardJson.fullAnalysis) {
             if (suggestedOption) {
                dashboardJson.tradeSetup = {
                    ...dashboardJson.tradeSetup,
                    suggestedOption
                };
            }
            
            // Construct robust titleInfo using GCS data with Firestore fallbacks
            const defaultTitleInfo = {
                companyName: winnerContract?.company_name || stockData?.company_name || ticker,
                ticker: ticker.toUpperCase(),
                asOfDate: winnerContract?.run_date || new Date().toISOString().split('T')[0],
                image_uri: winnerContract?.image_uri || stockData?.image_uri,
            };

            const titleInfo = {
                ...defaultTitleInfo,
                ...(dashboardJson.titleInfo || {})
            };

            // Ensure runDate is present
            const runDate = dashboardJson.runDate || winnerContract?.run_date || new Date().toISOString().split('T')[0];

            // Ensure industry is present if available
            const industry = dashboardJson.industry || winnerContract?.industry || stockData?.industry;

            return {
                ...dashboardJson,
                ticker: ticker.toUpperCase(),
                titleInfo,
                runDate,
                industry,
            } as DashboardDataV2;
        }

        // --- CASE B: Nested Data (Previous V2) ---
        if (dashboardJson.analysis) {
            // Flatten logic
            const { analysis, ...rest } = dashboardJson;
            
            // Inject suggestedOption into the extracted tradeSetup
            const tradeSetup = suggestedOption ? {
                ...analysis.tradeSetup,
                suggestedOption
            } : analysis.tradeSetup;

            // Ensure titleInfo has image_uri
            const titleInfo = {
                ...rest.titleInfo,
                image_uri: winnerContract?.image_uri || stockData?.image_uri
            };

            return {
                ...rest,
                titleInfo,
                ticker: ticker.toUpperCase(),
                summary: analysis.summary,
                fundamentalThesis: analysis.fundamentalThesis,
                optionsBrief: analysis.optionsBrief,
                tradeSetup: tradeSetup,
                fullAnalysis: analysis.fullAnalysis,
                marketStructure: dashboardJson.marketStructure,
            } as DashboardDataV2;
        }

        // --- CASE C: LEGACY ADAPTER (V1 -> V2) ---
        
        let stockLevelAnalysis: string | null = null;
        if (analysisPath) {
             try {
                stockLevelAnalysis = await getGcsFileContentAdmin(analysisPath);
            } catch {
                console.warn(`[getDashboardData] Legacy: Could not fetch .md for ${ticker}.`);
            }
        }

        const v2Data: DashboardDataV2 = {
            ticker: ticker.toUpperCase(),
            runDate: dashboardJson.runDate || new Date().toISOString().split('T')[0],
            titleInfo: dashboardJson.titleInfo || {
                companyName: optionsHeader?.companyName || ticker,
                ticker: ticker,
                asOfDate: dashboardJson.runDate,
                image_uri: winnerContract?.image_uri || stockData?.image_uri
            },
            kpis: dashboardJson.kpis,
            priceChartData: dashboardJson.priceChartData,
            
            // Flattened Analysis Construction
            summary: {
                signal: optionsHeader?.trendSignal || "Neutral",
                score: 50,
                confidence: "Medium"
            },
            fundamentalThesis: stockLevelAnalysis ? {
                headline: "Market Analysis",
                content: stockLevelAnalysis,
                catalysts: []
            } : undefined,
            tradeSetup: optionsHeader ? {
                signal: optionsHeader.trendSignal || "Neutral",
                confidence: "Medium",
                strategy: optionsHeader.optionType === 'call' ? 'Long Call' : 'Long Put',
                suggestedOption // Injected here
            } : undefined,

            seo: {
                title: `${ticker} Analysis`,
                metaDescription: `AI Analysis for ${ticker}`,
                keywords: [ticker, "Stocks"],
                h1: `${ticker} Dashboard`
            }
        };

        return v2Data;

    } catch (error) {
        console.error(`[getDashboardData] Final error fetching data for ${ticker}:`, error);
        return null;
    }
}


export async function handleGetRecommendation(uid: string, input: InitialRecommendationInput): Promise<InitialRecommendationOutput | { error: string; required?: 'subscription' | 'auth' } | { markdown: string, ticker?: string }> {
  const traceId = randomUUID();
  console.log(JSON.stringify({
    traceId,
    action: 'handleGetRecommendation.start',
    uid,
    input
  }));
  
  try {
    const user = await getOrCreateUserAdmin(uid);
    
    if (!FREE_MODE && user.usageCount >= 5 && !user.isSubscribed) {
      return { error: 'Usage limit reached', required: 'subscription' };
    }
    
    // Increment usage for everyone (tracking)
    await incrementUserUsageAdmin(uid);
    
    // AI TOP PICK FLOW: Get a random "BUY" or "SELL" stock
    if (input.uris.length === 0 && !input.ticker) {
        const stock = input.recommendationType === 'SELL' 
            ? await getRandomSellStockAdmin() 
            : await getRandomBuyStockAdmin();

        if (stock && stock.recommendation_analysis) {
            const markdownContent = await getGcsFileContentAdmin(stock.recommendation_analysis);
            return { markdown: markdownContent, ticker: stock.id };
        } else if (stock) {
             throw new Error(`AI Top Pick stock ${stock.id} is missing recommendation_analysis path.`);
        } else {
            throw new Error(`No stocks with recommendation "${input.recommendationType}" found in the database.`);
        }
    }


    // SINGLE STOCK FLOW: Stream markdown from recommendation_analysis
    if (input.uris.length === 1 && input.ticker) {
      const allStocks = await getStocksAdmin();
      const stock = allStocks.find(s => s.id === input.ticker);

      if (stock && stock.recommendation_analysis) {
        const markdownContent = await getGcsFileContentAdmin(stock.recommendation_analysis);
        return { markdown: markdownContent, ticker: stock.id };
      }
    }

    // Fallback to original Genkit flow for other cases (multi-stock, etc.)
    const flowInput = { ...input, traceId };
    const result: InitialRecommendationOutput = await getInitialRecommendation(flowInput);
    
    return result;

  } catch(error: any) {
    console.error(JSON.stringify({
        traceId,
        action: 'handleGetRecommendation.error',
        error: {
            message: error.message,
            stack: error.stack,
        }
    }));
    // Re-throw the error to be caught by the client
    throw error;
  }
}


export async function handleFollowUp(data: {
  question: string;
  tickers: string[];
  initialRecommendation: string;
  chatHistory: { role: 'user' | 'assistant'; content: string }[];
}): Promise<FollowUpQuestionOutput> {
  const input: FollowUpQuestionInput = {
    question: data.question,
    ticker1: data.tickers[0],
    ticker2: data.tickers[1] || undefined,
    initialRecommendation: data.initialRecommendation,
    chatHistory: data.chatHistory,
  };
  return await answerFollowUpQuestion(input);
}

export async function handleFeedback(uid: string | null, message: string, replyToEmail: string): Promise<{success: boolean}> {
  let userData: { uid: string, email: string | null } | null = null;
  if (uid) {
    const user = await getOrCreateUserAdmin(uid);
    userData = { uid: user.uid, email: user.email ?? null };
  }
  const { trackingId } = await saveFeedbackAdmin(message, replyToEmail, userData);
  
  // Send acknowledgment email
  await sendFeedbackAcknowledgmentEmail({
    to: replyToEmail,
    trackingId,
  });

  return { success: true };
}

export async function handleWelcomeEmail(email: string, name: string): Promise<{success: boolean}> {
    if (!email) {
        console.error('handleWelcomeEmail: No email provided.');
        return { success: false };
    }
    try {
        await sendWelcomeEmailAdmin({ to: email, name: name || email.split('@')[0] });
        console.log(`Welcome email sent to new user: ${email}`);
        return { success: true };
    } catch (error) {
        console.error(`Failed to send welcome email to ${email}:`, error);
        // Do not block the sign-up flow if the email fails.
        return { success: false };
    }
}

export async function createCheckoutSession(uid: string, gaClientId: string | null): Promise<{ sessionId: string }> {
    const user = await getOrCreateUserAdmin(uid);
    const headersList = await headers();
    const origin = headersList.get('origin')!;

    const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID!;
    if (!priceId) {
        throw new Error('Stripe Price ID is not configured.');
    }

    const sessionMetadata: { ga_client_id?: string } = {};
    if (gaClientId) {
        sessionMetadata.ga_client_id = gaClientId;
    }

    const sessionId = await createStripeCheckoutSession(
        uid,
        user.email,
        priceId,
        `${origin}/dashboard`,
        `${origin}/dashboard`,
        sessionMetadata
    );

    return { sessionId };
}

export async function createStripePortalLink(uid: string): Promise<{ portalUrl: string }> {
  const user = await getOrCreateUserAdmin(uid);
  const stripeCustomerId = user.stripeCustomerId;

  if (!stripeCustomerId) {
    throw new Error('User does not have a Stripe Customer ID.');
  }

  const headersList = await headers();
  const origin = headersList.get('origin')!;
  const returnUrl = `${origin}/account`;

  const portalUrl = await createStripePortalSession(stripeCustomerId, returnUrl);

  return { portalUrl };
}

export async function sendPasswordReset(email: string): Promise<void> {
  const auth = getClientAuth(app);
  await sendPasswordResetEmail(auth, email);
}

export async function handleWinSubmission(uid: string, formData: FormData): Promise<{ success: boolean, error?: string }> {
    return handleWinSubmissionAdmin(uid, formData);
}

export async function handleFeedbackSurvey(uid: string, data: FeedbackSurveyData): Promise<{success: boolean}> {
    try {
        await saveFeedbackSurveyAdmin(uid, data);
        return { success: true };
    } catch (error: any) {
        console.error(`Failed to save feedback survey for user ${uid}`, error);
        throw new Error(error.message || "Could not save survey.");
    }
}

export async function handleCancellationIntent(uid: string, feedback: string): Promise<{ portalUrl: string }> {
    const user = await getOrCreateUserAdmin(uid);
    const stripeCustomerId = user.stripeCustomerId;

    if (!stripeCustomerId) {
        throw new Error('User does not have a Stripe Customer ID.');
    }

    // Save the feedback
    await saveCancellationFeedbackAdmin(uid, feedback);

    // Generate and return the portal URL
    const headersList = await headers();
    const origin = headersList.get('origin')!;
    const returnUrl = `${origin}/account`;
    const portalUrl = await createStripePortalSession(stripeCustomerId, returnUrl);

    return { portalUrl };
}
