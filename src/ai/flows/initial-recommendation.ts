'use server';

/**
 * @fileOverview Provides an initial buy/hold/sell recommendation for a selected stock(s).
 *
 * - getInitialRecommendation - A function that provides the initial stock recommendation.
 * - InitialRecommendationInput - The input type for the getInitialRecommendation function.
 * - InitialRecommendationOutput - The return type for the getInitialRecommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { getStockDataBundleAdmin } from '@/lib/firebase-admin';


const InitialRecommendationInputSchema = z.object({
  uris: z
    .array(z.string())
    .min(0)
    .max(10)
    .describe(
      'An array of 0, 1, 2 or up to 10 GCS URIs for stock data bundles. If 0, the AI should pick one.'
    ),
  ticker: z.string().optional().describe('The stock ticker.'),
  companyName: z.string().optional().describe('The name of the company.'),
  traceId: z.string().optional().describe('A unique ID for tracing the request through logs.'),
});
export type InitialRecommendationInput = z.infer<
  typeof InitialRecommendationInputSchema
>;

const InitialRecommendationOutputSchema = z.object({
  recommendation: z
    .string()
    .describe(
      'The recommendation (BUY, HOLD, or SELL) and a 1-sentence summary.'
    ),
  reasoning: z
    .array(z.string())
    .describe(
      'An array of 3-5 bullet points for the reasoning behind the recommendation.'
    ),
});
export type InitialRecommendationOutput = z.infer<
  typeof InitialRecommendationOutputSchema
>;

export async function getInitialRecommendation(
  input: InitialRecommendationInput
): Promise<InitialRecommendationOutput> {
  if (input.uris.length === 0) {
    // AI Top Pick (placeholder)
    return aiTopPickFlow(input);
  } else if (input.uris.length === 1) {
    // Single stock
    return singleStockRecommendationFlow(input);
  } else if (input.uris.length === 2) {
    // Comparing 2 stocks
    return compareTwoStocksRecommendationFlow(input);
  } else if (input.uris.length > 2) {
    // Multi-stock top pick (placeholder)
    return multiStockTopPickFlow(input);
  } else {
    throw new Error('Invalid input configuration');
  }
}

const getStockDataBundle = ai.defineTool(
  {
    name: 'getStockDataBundle',
    description: 'Fetches and returns the full JSON content of a stock data bundle from a GCS URI.',
    inputSchema: z.object({
      uri: z.string().describe('The GCS URI of the stock data bundle.'),
      traceId: z.string().optional(),
    }),
    outputSchema: z.any(), // Flexible JSON object
  },
  async (input) => {
    console.log(JSON.stringify({
      traceId: input.traceId,
      tool: 'getStockDataBundle.run',
      uri: input.uri
    }));
    return getStockDataBundleAdmin(input.uri);
  }
);

// Compare Two Stocks Prompt
const COMPARE_TWO_STOCKS_PROMPT = `You are a financial advisor providing investment recommendations for two stocks.

First, use the getStockDataBundle tool to fetch the JSON content for each URI: {{uris.[0]}} and {{uris.[1]}}. Analyze only after loading all data.

Each data bundle contains:
- ticker
- company_name
- business_profile
- earnings_call_summary
- sec_mda
- prices
- technicals
- financial_statements
- ratios and/or key_metrics

Your goal is to provide concise BUY/HOLD/SELL recommendations for each stock, with a comparative analysis. You MUST reference specific numbers, metrics, and excerpts from the data in every step and in the final reasoning. No vague statements—e.g., "Revenue for Stock A grew 15% YoY to $2B from financial_statements, outpacing Stock B's 5% growth to $1B."

Use Chain of Thought reasoning: Step-by-step, analyze each key section comparatively, then synthesize.

Step 1: Load and summarize data for both stocks (tickers, company names, key metrics overview with specific extractions).

Step 2: Business Profile & Moat - Compare core business, products, advantages. Quote specifics from each business_profile.

Step 3: Financial Health & Earnings - Compare revenue, EPS, margins, YoY/QoQ trends from financial_statements and earnings_call_summary. Include management tones and catalysts with quotes.

Step 4: Valuation - Compare P/E, P/S, ROE, debt ratios from ratios/key_metrics. Assess premiums/discounts (e.g., "Stock A P/E 20 vs. Stock B 30").

Step 5: Technicals & Price Action - Compare price trends, SMAs, RSI from prices and technicals. Compute recent returns (e.g., "Stock A up 10% vs. Stock B down 2% over 90 days").

Step 6: Risks & Opportunities - Compare risks/drivers with quotes from sec_mda and earnings_call_summary.

Step 7: Synthesize - Based on comparisons, decide BUY/HOLD/SELL for each, with one potentially stronger. Provide a comparative summary sentence.

Structure:
- Recommendation: "BUY/HOLD/SELL for TICKER1 (Company1) vs. BUY/HOLD/SELL for TICKER2 (Company2) - 1-sentence comparative summary."
- Reasoning: 3-5 bullets with comparative, data-backed insights. End with: "To learn more, ask a follow-up question about any of these sections: Business Profile, Earnings Call, MD&A, Technicals, Stock Price, Financials, Ratios, and Key Metrics for either stock."

Keep under 500 words.

Output strictly as JSON: {"recommendation": "BUY/HOLD/SELL for TICKER1 (Company1) vs. BUY/HOLD/SELL for TICKER2 (Company2) - summary sentence", "reasoning": ["bullet point 1", "bullet point 2", ...]}. No other text.`;

// Define Prompts and Flows
const singleStockPrompt = ai.definePrompt(
  {
    name: 'singleStockPrompt',
    input: { schema: InitialRecommendationInputSchema },
    output: { schema: InitialRecommendationOutputSchema },
    prompt: "This is a placeholder prompt that should be removed.", // Removed SINGLE_STOCK_PROMPT
    tools: [getStockDataBundle],
    config: { temperature: 0.7 }
  }
);

const singleStockRecommendationFlow = ai.defineFlow(
  {
    name: 'singleStockRecommendationFlow',
    inputSchema: InitialRecommendationInputSchema,
    outputSchema: InitialRecommendationOutputSchema,
  },
  async (input) => {
    console.log(JSON.stringify({
      traceId: input.traceId,
      flow: 'singleStockRecommendationFlow.start',
    }));
    const { output } = await singleStockPrompt(input);
    return output!;
  }
);

const compareTwoStocksPrompt = ai.definePrompt(
  {
    name: 'compareTwoStocksPrompt',
    input: { schema: InitialRecommendationInputSchema },
    output: { schema: InitialRecommendationOutputSchema },
    prompt: COMPARE_TWO_STOCKS_PROMPT,
    tools: [getStockDataBundle],
    config: { temperature: 0.7 }
  }
);

const compareTwoStocksRecommendationFlow = ai.defineFlow(
  {
    name: 'compareTwoStocksRecommendationFlow',
    inputSchema: InitialRecommendationInputSchema,
    outputSchema: InitialRecommendationOutputSchema,
  },
  async (input) => {
    const { output } = await compareTwoStocksPrompt(input);
    return output!;
  }
);

const aiTopPickPrompt = ai.definePrompt(
  {
    name: 'aiTopPickPrompt',
    input: { schema: InitialRecommendationInputSchema },
    output: { schema: InitialRecommendationOutputSchema },
    prompt: "This is a placeholder prompt that should be removed.", // Removed AI_TOP_PICK_PROMPT
    tools: [], // No tools needed for this simplified placeholder
    config: { temperature: 0.7 }
  }
);

const aiTopPickFlow = ai.defineFlow(
  {
    name: 'aiTopPickFlow',
    inputSchema: InitialRecommendationInputSchema,
    outputSchema: InitialRecommendationOutputSchema,
  },
  async (input) => {
    const { output } = await aiTopPickPrompt(input);
    return output!;
  }
);

const multiStockTopPickPrompt = ai.definePrompt(
  {
    name: 'multiStockTopPickPrompt',
    input: { schema: InitialRecommendationInputSchema },
    output: { schema: InitialRecommendationOutputSchema },
    prompt: "This is a placeholder prompt that should be removed.", // Removed MULTI_STOCK_TOP_PICK_PROMPT
    tools: [getStockDataBundle],
    config: { temperature: 0.7 }
  }
);

const multiStockTopPickFlow = ai.defineFlow(
  {
    name: 'multiStockTopPickFlow',
    inputSchema: InitialRecommendationInputSchema,
    outputSchema: InitialRecommendationOutputSchema,
  },
  async (input) => {
    const { output } = await multiStockTopPickPrompt(input);
    return output!;
  }
);
