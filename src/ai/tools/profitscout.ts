import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { callMcpTool } from '@/lib/mcp-client';

// --- Tool Schemas ---

const TickerSchema = z.object({
  ticker: z.string().describe("The stock ticker symbol (e.g., 'AAPL', 'NVDA')."),
});

const SearchSchema = z.object({
  criteria: z.string().describe("Natural language description of what to find (e.g., 'tech stocks with high volatility', 'semiconductor sector')."),
});

const WebSearchSchema = z.object({
  query: z.string().describe("The search query to find information on the internet."),
});

const PolicySchema = z.object({
  topic: z.string().describe("The policy topic (e.g., 'refund', 'contact', 'privacy')."),
});

const EmptySchema = z.object({});

// --- Tool Definitions ---

export const getWinnersDashboard = ai.defineTool(
  {
    name: 'get_winners_dashboard',
    description: `Retrieves the 'High Gamma' winners dashboard. 
    Use this when the user asks 'what's good today?', 'show me top plays', or wants general market ideas. 
    Returns a ranked list of the best options trading setups based on proprietary algorithms.`,
    inputSchema: EmptySchema,
    outputSchema: z.string(),
  },
  async () => {
    return await callMcpTool('get_winners_dashboard', {});
  }
);

export const getStockAnalysis = ai.defineTool(
  {
    name: 'get_stock_analysis',
    description: `The MASTER TOOL for deep-diving a specific stock. 
    Aggregates technicals, news, and fundamentals into a single comprehensive report.
    ALWAYS use this if the user asks about a specific ticker (e.g., 'Analyze TSLA').`,
    inputSchema: TickerSchema,
    outputSchema: z.string(),
  },
  async ({ ticker }) => {
    return await callMcpTool('get_stock_analysis', { ticker });
  }
);

export const searchOpportunities = ai.defineTool(
  {
    name: 'search_opportunities',
    description: `Search for stocks or setups matching specific criteria (sector, volatility, price action).`,
    inputSchema: SearchSchema,
    outputSchema: z.string(),
  },
  async ({ criteria }) => {
    return await callMcpTool('search_opportunities', { query: criteria });
  }
);

export const webSearch = ai.defineTool(
  {
    name: 'web_search',
    description: `Search the public internet for information. Use this for general queries, recent news not covered by stock analysis, or fact-checking.`,
    inputSchema: WebSearchSchema,
    outputSchema: z.string(),
  },
  async ({ query }) => {
    return await callMcpTool('web_search', { query });
  }
);

export const getSupportPolicy = ai.defineTool(
  {
    name: 'get_support_policy',
    description: `Retrieve official company policy information (refunds, contact info, terms).`,
    inputSchema: PolicySchema,
    outputSchema: z.string(),
  },
  async ({ topic }) => {
    return await callMcpTool('get_support_policy', { query: topic });
  }
);

// --- Export as a set for the agent ---
export const profitScoutTools = [
  getWinnersDashboard,
  getStockAnalysis,
  searchOpportunities,
  webSearch,
  getSupportPolicy
];
