'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {
  getStockDataAdmin,
  getWinnerForTickerAdmin,
  getGcsFileContentAdmin,
  type Stock,
  type Winner
} from '@/lib/firebase-admin';

const FinancialDataInputSchema = z.object({
  ticker: z.string().optional().describe("The stock ticker symbol (e.g., 'AAPL')."),
  contractSymbol: z.string().optional().describe("The specific option contract symbol (e.g., 'O:AAPL250117C00250000')."),
});

const FinancialDataOutputSchema = z.object({
  data: z.string().describe("The synthesized financial data and analysis text."),
  sourceType: z.enum(['ticker_analysis', 'contract_setup', 'none']),
});

/**
 * Helper to safely fetch text content from a GCS URI.
 * truncates very long content to avoid token limits.
 */
async function fetchTextContent(uri: string | null | undefined, label: string): Promise<string> {
  if (!uri || !uri.startsWith('gs://')) return '';
  try {
    let content = await getGcsFileContentAdmin(uri);
    // Truncate to ~2000 chars to save context
    if (content.length > 2000) {
      content = content.substring(0, 2000) + "\n...[Content Truncated]...";
    }
    return `\n--- START ${label} ---\n${content}\n--- END ${label}---\n`;
  } catch (error) {
    console.warn(`Failed to fetch ${label} from ${uri}:`, error);
    return '';
  }
}

export const fetchGammaRipsData = ai.defineTool(
  {
    name: 'fetchGammaRipsData',
    description: `Fetches proprietary financial analysis, options setups, and reports for a given stock ticker or option contract. 
    ALWAYS use this tool BEFORE searching Google when asked about a specific stock that might be in our system.`,
    inputSchema: FinancialDataInputSchema,
    outputSchema: FinancialDataOutputSchema,
  },
  async (input): Promise<z.infer<typeof FinancialDataOutputSchema>> => {
    const { ticker, contractSymbol } = input;
    let combinedText = "";

    // Priority 1: Contract Specific Data
    if (contractSymbol) {
      // We don't have a direct "getWinnerByContract" yet, but usually we find winners by ticker
      // If the user provides a contract, they likely know the ticker. 
      // For now, if we only have contractSymbol, we might need to parse ticker from it or rely on ticker being passed.
      // Assuming ticker is usually available or we can find the winner by iterating (inefficient) or just rely on ticker.
      // Let's assume if contractSymbol is passed, ticker is likely passed too, or we skip to ticker logic.
      // Actually, let's try to extract ticker from standard option symbols if possible, but let's just rely on 'ticker' input for now.
    }

    // Priority 2: Ticker Level Data
    if (ticker) {
      const stockData = await getStockDataAdmin(ticker);
      const winnerData = await getWinnerForTickerAdmin(ticker);

      if (!stockData && !winnerData) {
        return { 
          data: `No proprietary data found for ${ticker}. Please rely on public search.`, 
          sourceType: 'none' 
        };
      }

      combinedText += `### Internal Analysis for ${ticker.toUpperCase()}
`;

      if (winnerData) {
        combinedText += `
**Active Setup:**
- Type: ${winnerData.option_type?.toUpperCase()}
- Strike: $${winnerData.strike_price}
- Expiration: ${winnerData.expiration_date}
- Score: ${winnerData.weighted_score?.toFixed(2)}
- Outlook: ${winnerData.outlook_signal}
- Summary: ${winnerData.summary || 'N/A'}
`;
      }

      if (stockData) {
        combinedText += `
**Fundamentals:**
- Company: ${stockData.company_name}
- Industry: ${stockData.industry}
- Recommendation: ${stockData.recommendation} (Score: ${stockData.weighted_score})
`;
        
        // Fetch detailed text reports
        const analysisText = await fetchTextContent(stockData.recommendation_analysis, "RECOMMENDATION ANALYSIS");
        const newsText = await fetchTextContent(stockData.news, "RECENT NEWS");
        // const financialsText = await fetchTextContent(stockData.financials, "FINANCIAL STATEMENTS"); // Often too large/JSON
        
        combinedText += analysisText;
        combinedText += newsText;
      }
      
      return {
        data: combinedText,
        sourceType: 'ticker_analysis'
      };
    }

    return { 
      data: "Please provide a ticker symbol to fetch data.", 
      sourceType: 'none' 
    };
  }
);
