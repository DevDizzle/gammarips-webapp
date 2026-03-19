
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// These tools are defined elsewhere and available to the agent.
declare const getWinnersDashboard: any;
declare const getStockAnalysis: any;
declare const getMarketStructure: any;
declare const getMacroThesis: any;
declare const getMarketEvents: any;
declare const getSupportPolicy: any;
declare const webSearch: any;

export const profitScoutAgent = ai.defineFlow(
  {
    name: 'profitScoutAgent',
    inputSchema: z.object({
      question: z.string(),
      history: z.any().optional(),
    }),
    outputSchema: z.object({ text: z.string() }),
  },
  async (input) => {
    const model = ai.getGenerativeModel({
      model: 'gemini-1.5-pro-preview',
      tools: [
        getWinnersDashboard,
        getStockAnalysis,
        getMarketStructure,
        getMacroThesis,
        getMarketEvents,
        getSupportPolicy,
        webSearch,
      ],
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
