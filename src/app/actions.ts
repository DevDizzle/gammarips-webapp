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
    // Increment usage for everyone to track deep dives
    await incrementUserUsageAdmin(uid);
    return { success: true };
  } catch (error) {
    console.error(`Failed to increment dashboard view for user ${uid}`, error);
    // Don't throw, as this is a non-critical background task
    return { success: false };
  }
}

export async function getStocks(): Promise<Stock[]> {
    return getStocksAdmin();
}

export async function getTickerEvents(ticker: string): Promise<TickerEvent[]> {
    return getTickerEventsAdmin(ticker);
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

export async function getDashboardData(ticker: string): Promise<any | null> {
    noStore();
    const winnerContract = await getWinnerForTickerAdmin(ticker);

    let gcsPath = winnerContract?.dashboard_json;
    let analysisPath = winnerContract?.recommendation_analysis;
    let industry = winnerContract?.industry;
    let optionsHeader = null;

    // If it's a winner, construct the options header
    if (winnerContract) {
        optionsHeader = {
            companyName: winnerContract.company_name,
            ticker: winnerContract.ticker,
            runDate: winnerContract.run_date,
            optionType: winnerContract.option_type,
            contractSymbol: winnerContract.contract_symbol,
            expirationDate: winnerContract.expiration_date,
            strikePrice: winnerContract.strike_price,
            setupQuality: winnerContract.setup_quality_signal,
            trendSignal: winnerContract.outlook_signal,
            volatilitySignal: winnerContract.volatility_comparison_signal,
            topSignalSummary: winnerContract.summary,
            dte: Math.max(0, Math.ceil((new Date(winnerContract.expiration_date).getTime() - new Date(winnerContract.run_date).getTime()) / (1000 * 60 * 60 * 24))),
        };
    }

    // Fallback if not a winner or winner is missing paths
    if (!gcsPath || !analysisPath) {
        console.warn(`[getDashboardData] Winner contract for ${ticker} is incomplete. Falling back to tickers collection.`);
        const stockData = await getStockDataAdmin(ticker);
        if (!stockData) {
            console.error(`[getDashboardData] No data found in tickers collection for ${ticker} either.`);
            return null;
        }
        gcsPath = stockData.dashboard_json;
        analysisPath = stockData.recommendation_analysis;
        industry = stockData.industry ?? undefined;
    }

    // If we still don't have a path for the dashboard json, we can't proceed.
    if (!gcsPath) {
        console.error(`[getDashboardData] No dashboard_json path could be found for ${ticker}.`);
        return null;
    }

    try {
        let dashboardJson: any = {};
        let stockLevelAnalysis: string | null = null;

        // Fetch dashboard JSON
        dashboardJson = JSON.parse(await getGcsFileContentAdmin(gcsPath));
        
        // Fetch analysis markdown if path exists
        if (analysisPath) {
             try {
                stockLevelAnalysis = await getGcsFileContentAdmin(analysisPath);
            } catch (error) {
                console.warn(`[getDashboardData] Could not fetch recommendation_analysis for ${ticker} from ${analysisPath}. Proceeding without it.`);
            }
        }

        // Combine all data into the expected structure
        return {
            ...dashboardJson,
            industry,
            optionsHeader, // This will be null if not a winner, which is handled by the frontend
            stockLevelAnalysis,
            runDate: dashboardJson.runDate,
        };

    } catch (error) {
        console.error(`[getDashboardData] Final error fetching or parsing data for ${ticker}:`, error);
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