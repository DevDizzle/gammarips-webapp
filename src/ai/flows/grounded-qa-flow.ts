'use server';
/**
 * @fileOverview A Genkit flow for answering financial questions with Google Search grounding
 * AND proprietary ProfitScout MCP tools.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/google-genai';
import { profitScoutTools } from '@/ai/tools/profitscout';

// --- Schemas ---

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const GroundedQaInputSchema = z.object({
  question: z.string().describe("The user's current question."),
  history: z.array(MessageSchema).optional().describe("Conversation history for context."),
});
export type GroundedQaInput = z.infer<typeof GroundedQaInputSchema>;

const GroundedQaOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer.'),
  sources: z.array(z.string()).optional().describe('Source URLs from grounding.'),
});
export type GroundedQaOutput = z.infer<typeof GroundedQaOutputSchema>;

// --- System Prompt ---

const profitScoutPrompt = `
You are **ProfitScout**, an elite AI trading assistant specialized in identifying high-probability options trading opportunities.
Your goal is to provide actionable intelligence by synthesizing technical, fundamental, and news data.

**Your Toolkit:**
1.  **Market Pulse:**
    -   \`get_winners_dashboard\`: **ALWAYS START HERE** for general market inquiries (e.g., "What's good?", "Top plays").
    -   \`search_opportunities\`: Find stocks matching specific criteria.
2.  **Deep Dive:**
    -   \`get_stock_analysis\`: The **MASTER TOOL**. Use this for comprehensive reports on specific tickers.
3.  **External Knowledge:**
    -   **Google Search**: Use this for the latest news, macro events, or data not covered by internal tools.

**Operational Rules:**
-   **Data First:** Never hallucinate prices. Verify with tools.
-   **Style:** Be professional, concise, and "Wall Street Smart". Use bullet points.
-   **Risk:** Always imply risk. These are probabilities, not certainties.
-   **Follow-up:** End with a relevant question to guide the user (e.g., "Want to see the chart?").

**Context:**
History: {{history}}
Current Question: {{question}}
`;

// --- Agent Definition ---

const profitScoutAgent = ai.definePrompt({
  name: 'profitScoutAgent',
  input: { schema: GroundedQaInputSchema },
  model: googleAI.model('gemini-2.0-flash'), // Using Flash for speed/cost balance, or Pro for reasoning
  config: {
    tools: [
      { googleSearch: {} },
      ...profitScoutTools
    ],
    temperature: 0.4, // Lower temperature for more analytical responses
  },
  prompt: profitScoutPrompt,
});

/**
 * Helper to extract sources from Google Search grounding metadata
 */
function extractGroundedSources(raw: any): string[] {
  if (!raw) return [];
  const candidates = raw?.response?.candidates ?? raw?.candidates ?? [];
  const chunks = candidates[0]?.groundingMetadata?.groundingChunks;
  if (!chunks || !Array.isArray(chunks)) return [];
  return chunks
    .map((c: any) => c.web?.uri)
    .filter((uri: any) => typeof uri === 'string');
}

// --- Main Flow ---

export const groundedQaFlow = ai.defineFlow(
  {
    name: 'groundedQaFlow',
    inputSchema: GroundedQaInputSchema,
    outputSchema: GroundedQaOutputSchema,
  },
  async (input) => {
    try {
      const llmResponse = await profitScoutAgent(input);
      
      const text = (llmResponse as any).text || (llmResponse as any).output?.answer || '';
      const sources = extractGroundedSources((llmResponse as any).raw);

      // Add standard disclaimer if missing
      const disclaimer = "\n\n**Disclaimer:** Content is for educational purposes only, not financial advice.";
      const finalAnswer = text.toLowerCase().includes('educational purposes') 
        ? text 
        : text + disclaimer;

      return {
        answer: finalAnswer,
        sources,
      };
    } catch (error) {
      console.error('[ProfitScout Agent Error]', error);
      return {
        answer: "I'm having trouble connecting to the market data feed right now. Please try again in a moment.",
        sources: []
      };
    }
  }
);

/**
 * Wrapper for backward compatibility or simple calls
 */
export async function getGroundedAnswer(question: string): Promise<GroundedQaOutput> {
  return groundedQaFlow({ question });
}