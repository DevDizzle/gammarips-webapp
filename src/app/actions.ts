

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
import { saveFeedback } from '@/lib/firebase';
import { 
    getStocksAdmin, 
    getOrCreateUserAdmin,
    incrementUserUsageAdmin,
    getGcsFileContentAdmin,
    getRandomBuyStockAdmin,
    getRandomSellStockAdmin,
    getEconomicEventsAdmin,
    getTopStocksAdmin,
    getTopOptionsAdmin,
    getDashboardDataAdmin,
    getWinnersDashboardAdmin,
    getOptionsSignalsAdmin
} from '@/lib/firebase-admin';
import type { Stock, EconomicEvent, OptionCandidate, Winner, TickerOptionsData } from '@/lib/firebase-admin';
import { createStripeCheckoutSession } from '@/lib/stripe';
import { headers } from 'next/headers';
import { randomUUID } from 'crypto';


export async function getOptionsSignals(ticker: string): Promise<TickerOptionsData | null> {
    return getOptionsSignalsAdmin(ticker);
}

export async function getWinnersDashboard(): Promise<Winner[]> {
    return getWinnersDashboardAdmin();
}

export async function getStocks(): Promise<Stock[]> {
    return getStocksAdmin();
}

export async function getEconomicEvents(): Promise<EconomicEvent[]> {
    return getEconomicEventsAdmin();
}

export async function getTopStocks(type: 'BUY' | 'SELL', limit: number): Promise<Stock[]> {
    return getTopStocksAdmin(type, limit);
}

export async function getTopOptions(type: 'CALL' | 'PUT', limit: number): Promise<OptionCandidate[]> {
    return getTopOptionsAdmin(type, limit);
}

export async function getDashboardData(ticker: string): Promise<any | null> {
    const rawData = await getDashboardDataAdmin(ticker);
    if (!rawData) return null;

    // --- Top Call Selection Logic ---
    const topCall = (() => {
        if (!rawData.optionsTable?.chains) return null;

        const calls = rawData.optionsTable.chains.filter((c: any) => c.option_type === 'call');
        const trendBonus = (rawData.kpis.trendStrength.price > rawData.kpis.trendStrength.sma50) ? 1 : 0;

        const scoredCalls = calls.map((c: any) => {
            let score = 0;
            // Setup Quality Score
            if (c.setup_quality_signal === 'Strong') score += 3;
            else if (c.setup_quality_signal === 'Medium') score += 1;
            
            // Trend Bonus
            score += trendBonus;

            // Liquidity Bonus
            if (c.oi > 1000) score += 1;
            if (c.spread_bps < 50) score += 1;

            // Calculate DTE (Days to Expiration)
            const dte = (new Date(c.expiration_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);

            return { ...c, score, dte };
        });

        scoredCalls.sort((a: any, b: any) => {
            // Highest score first
            if (b.score !== a.score) return b.score - a.score;
            // Tie-breakers
            if (b.oi !== a.oi) return b.oi - a.oi; // Higher OI is better
            if (a.implied_volatility !== b.implied_volatility) return a.implied_volatility - b.implied_volatility; // Lower IV is better
            return a.dte - b.dte; // Nearer DTE (but >=7) is better
        });
        
        // Find the best call that is at least 7 days out
        return scoredCalls.find((c: any) => c.dte >= 7) || null;
    })();

    return {
        ...rawData,
        topCallSetup: topCall
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

export async function handleFeedback(feedbackText: string): Promise<void> {
  const input: SummarizeFeedbackInput = { feedbackText };
  const summaryOutput = await summarizeFeedback(input);
  await saveFeedback(feedbackText, summaryOutput.summary);
}

export async function createCheckoutSession(uid: string): Promise<{ sessionId: string }> {
  const user = await getOrCreateUserAdmin(uid);
  const origin = headers().get('origin')!;
  
  const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID!;
  if (!priceId) {
      throw new Error('Stripe Price ID is not configured.');
  }

  const sessionId = await createStripeCheckoutSession(
    uid,
    user.email,
    priceId,
    `${origin}/dashboard`,
    `${origin}/dashboard`
  );

  return { sessionId };
}

    
