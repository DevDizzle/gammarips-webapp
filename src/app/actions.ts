

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
  summarizeFeedback,
  type SummarizeFeedbackInput,
} from '@/ai/flows/feedback-summarization';
import { 
    getStocksAdmin, 
    getOrCreateUserAdmin,
    incrementUserUsageAdmin,
    getGcsFileContentAdmin,
    getRandomBuyStockAdmin,
    getRandomSellStockAdmin,
    getTopStocksAdmin,
    getTopOptionsAdmin,
    getDashboardDataAdmin,
    getWinnersDashboardAdmin,
    getOptionsCandidatesAdmin,
    getOptionsHeaderSignalAdmin,
    getTickerEventsAdmin,
    saveFeedbackAdmin,
    getPerformanceSignals as getPerformanceSignalsAdmin,
    getPerformanceSignalsByTickerAdmin,
    getAppStatusAdmin,
} from '@/lib/firebase-admin';
import type { Stock, EconomicEvent, OptionCandidate, Winner, TickerOptionsData, OptionsSignal, TickerEvent, PerformanceSignal } from '@/lib/firebase-admin';
import { createStripeCheckoutSession, createStripePortalSession } from '@/lib/stripe';
import { headers } from 'next/headers';
import { randomUUID } from 'crypto';
import { getAuth } from 'firebase-admin/auth';
import { getAuth as getClientAuth, sendPasswordResetEmail } from 'firebase/auth';
import { app } from '@/lib/firebase';


export async function getAppStatus(): Promise<{ isUpdating: boolean }> {
    return getAppStatusAdmin();
}

export async function getOptionsSignals(ticker: string): Promise<OptionCandidate[]> {
    return getOptionsCandidatesAdmin(ticker);
}

export async function getPerformanceSignals(order: 'asc' | 'desc', limit: number): Promise<PerformanceSignal[]> {
    return getPerformanceSignalsAdmin(order, limit);
}

export async function getPerformanceSignalsByTicker(ticker: string): Promise<PerformanceSignal[]> {
    return getPerformanceSignalsByTickerAdmin(ticker);
}

export async function getWinnersDashboard(): Promise<Winner[]> {
    return getWinnersDashboardAdmin();
}

export async function incrementDashboardViewCount(uid: string): Promise<{success: boolean}> {
  try {
    const user = await getOrCreateUserAdmin(uid);
    // Only increment for non-subscribed users
    if (!user.isSubscribed) {
        await incrementUserUsageAdmin(uid);
    }
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
    const rawData = await getDashboardDataAdmin(ticker);
    if (!rawData) return null;

    // --- Options Header Selection & Transformation ---
    const topSignal = await getOptionsHeaderSignalAdmin(ticker);

    const optionsHeader = (() => {
        if (!topSignal) return null;

        const dte = Math.ceil((new Date(topSignal.expiration_date).getTime() - new Date(topSignal.run_date).getTime()) / (1000 * 60 * 60 * 24));

        const header: any = {
            companyName: topSignal.company_name,
            ticker: topSignal.ticker,
            runDate: topSignal.run_date,
            optionType: topSignal.option_type,
            contractSymbol: topSignal.contract_symbol,
            expirationDate: topSignal.expiration_date,
            strikePrice: topSignal.strike_price,
            ivValue: topSignal.implied_volatility,
            volatilitySignal: topSignal.volatility_comparison_signal,
            dte: dte,
        };
        
        if (topSignal.setup_quality_signal) {
            header.setupQuality = topSignal.setup_quality_signal;
        }
        if (topSignal.stock_price_trend_signal) {
            header.trendSignal = topSignal.stock_price_trend_signal;
        }

        return header;
    })();
    
    // --- Fetch separate markdown for AI analysis & industry for header ---
    const allStocks = await getStocksAdmin();
    const stock = allStocks.find(s => s.id === ticker.toUpperCase());
    let stockLevelAnalysis = rawData.stockLevelAnalysis; // Use original as fallback
    let industry = null;

    if (stock) {
        if (stock.recommendation_analysis) {
            try {
                stockLevelAnalysis = await getGcsFileContentAdmin(stock.recommendation_analysis);
            } catch (error) {
                console.error(`Failed to fetch separate AI analysis for ${ticker}, using fallback.`, error);
            }
        }
        if (stock.industry) {
            industry = stock.industry;
        }
    }


    return {
        ...rawData,
        industry,
        optionsHeader, // This will be null if no top signal is found
        topSignalSummary: topSignal?.summary, // Pass summary separately
        stockLevelAnalysis, // Overwrite with new content
    };
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
    console.log(JSON.stringify({ traceId, msg: 'Attempting to get or create user using Admin SDK.' }));
    const user = await getOrCreateUserAdmin(uid);
    console.log(JSON.stringify({ traceId, msg: 'Successfully got or created user.', isSubscribed: user.isSubscribed, usageCount: user.usageCount }));
    
    if (user.usageCount >= 5 && !user.isSubscribed) {
      console.warn(JSON.stringify({ traceId, warning: 'Usage limit reached', required: 'subscription' }));
      return { error: 'Usage limit reached', required: 'subscription' };
    }
    
    // Don't increment usage for subscribed users
    if (!user.isSubscribed) {
      console.log(JSON.stringify({ traceId, msg: 'Attempting to increment user usage with Admin SDK.' }));
      await incrementUserUsageAdmin(uid);
      console.log(JSON.stringify({ traceId, msg: 'Successfully incremented user usage.' }));
    }
    
    // AI TOP PICK FLOW: Get a random "BUY" or "SELL" stock
    if (input.uris.length === 0 && !input.ticker) {
        console.log(JSON.stringify({ traceId, msg: `AI Top Pick flow: fetching random ${input.recommendationType} stock.` }));
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
        console.log(JSON.stringify({ traceId, msg: 'Single stock flow: fetching markdown content.' }));
        const markdownContent = await getGcsFileContentAdmin(stock.recommendation_analysis);
        return { markdown: markdownContent, ticker: stock.id };
      }
    }

    // Fallback to original Genkit flow for other cases (multi-stock, etc.)
    const flowInput = { ...input, traceId };
    console.log(JSON.stringify({ traceId, msg: 'Calling getInitialRecommendation flow.' }));
    const result: InitialRecommendationOutput = await getInitialRecommendation(flowInput);
    console.log(JSON.stringify({ traceId, msg: 'Successfully received result from getInitialRecommendation flow.' }));
    
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
    userData = { uid: user.uid, email: user.email };
  }
  await saveFeedbackAdmin(message, replyToEmail, userData);
  return { success: true };
}

export async function createCheckoutSession(uid: string, gaClientId: string | null): Promise<{ sessionId: string }> {
  const user = await getOrCreateUserAdmin(uid);
  const origin = headers().get('origin')!;
  
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

  const origin = headers().get('origin')!;
  const returnUrl = `${origin}/account`;

  const portalUrl = await createStripePortalSession(stripeCustomerId, returnUrl);

  return { portalUrl };
}

export async function sendPasswordReset(email: string): Promise<void> {
  const auth = getClientAuth(app);
  await sendPasswordResetEmail(auth, email);
}

export async function handleWinSubmission(uid: string, formData: FormData): Promise<{ success: boolean, error?: string }> {
    return handleWinSubmission(uid, formData);
}
    

    


    









