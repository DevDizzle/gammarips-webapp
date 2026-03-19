
'use server';
/**
 * @deprecated This flow is deprecated in favor of the more comprehensive profitScoutAgent.
 * It is kept for compatibility with older test scripts but should not be used for new development.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

declare const webSearch: any;
declare const getStockAnalysis: any;

export const groundedQaFlow = ai.defineFlow(
  {
    name: 'groundedQaFlow',
    inputSchema: z.object({
      question: z.string(),
      history: z.any().optional(),
    }),
    outputSchema: z.object({
        text: z.string()
    }),
  },
  async (input) => {
    const model = ai.getGenerativeModel({
      model: 'gemini-1.5-pro-preview',
      tools: [webSearch, getStockAnalysis],
      system: `You are **GammaRips**, the Lead Options Strategist and an elite AI trading assistant. 
Your mission is to identify, validate, and present high-probability options trading opportunities.

**Core Objective:** Provide actionable, data-backed intelligence.

**Your Toolkit:**
- Discovery: get_winners_dashboard (Hot List), web_search (Real-time Intel)
- Analysis: get_stock_analysis (Comprehensive), analyze_market_structure (Support/Resistance)
- Context: get_macro_thesis, get_market_events
- Service: get_support_policy (Refunds, Privacy)

**Operational Rules:**
1. **Data First:** Never guess. If you don't have the price/IV, call web_search.
2. **Policy:** If asked about refunds/accounts, use get_support_policy.
3. **Financial Advice:** Clearly state you are an educational tool if asked for advice.`,
    });

    const response = await model.generate({
      history: input.history,
      input: input.question,
    });

    return { text: response.text };
  }
);
