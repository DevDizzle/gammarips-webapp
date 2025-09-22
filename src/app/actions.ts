

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
    getOptionsSignalsAdmin,
    getOptionsHeaderSignalAdmin,
} from '@/lib/firebase-admin';
import type { Stock, EconomicEvent, OptionCandidate, Winner, TickerOptionsData, OptionsSignal } from '@/lib/firebase-admin';
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
            ivSignal: topSignal.iv_signal,
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
    
    // --- Fetch separate markdown for AI analysis ---
    const allStocks = await getStocksAdmin();
    const stock = allStocks.find(s => s.id === ticker.toUpperCase());
    let stockLevelAnalysis = rawData.stockLevelAnalysis; // Use original as fallback

    if (stock && stock.recommendation_analysis) {
        try {
            stockLevelAnalysis = await getGcsFileContentAdmin(stock.recommendation_analysis);
        } catch (error) {
            console.error(`Failed to fetch separate AI analysis for ${ticker}, using fallback.`, error);
        }
    }


    return {
        ...rawData,
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
