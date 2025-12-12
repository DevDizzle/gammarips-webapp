'use server';
/**
 * @fileOverview A Genkit flow for answering financial questions with Google Search grounding.
 *
 * - getGroundedAnswer - A function that takes a user's question and returns a fact-checked answer.
 * - GroundedQaInput - The input type for the getGroundedAnswer function.
 * - GroundedQaOutput - The return type for the getGroundedAnswer function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/google-genai';
import { fetchGammaRipsData } from '@/ai/tools/financial-data';

const GroundedQaInputSchema = z.object({
  question: z
    .string()
    .describe("The user's question about options contracts or financial markets."),
});
export type GroundedQaInput = z.infer<typeof GroundedQaInputSchema>;

const GroundedQaOutputSchema = z.object({
  answer: z.string().describe('The AI-generated, search-grounded answer.'),
  sources: z
    .array(z.string())
    .optional()
    .describe('An array of source URLs used for grounding.'),
});
export type GroundedQaOutput = z.infer<typeof GroundedQaOutputSchema>;

// System prompt for the grounded QA agent
const groundedQaPrompt = `
You are a concise, helpful financial analyst. Your goal is to give the user a quick, actionable snapshot of the situation and guide them to the next step.

**Directives:**
1.  **BE CONCISE:** Keep your answer **under 150 words**. Use bullet points for readability.
2.  **CHECK PROPRIETARY DATA:** If the user asks about a stock (e.g., AAPL, TSLA), **ALWAYS use the \`fetchGammaRipsData\` tool** first.
3.  **DECISION SUPPORT:** Don't just list facts. Help the user evaluate the potential trade by briefly highlighting **1-2 key Bullish factors and 1-2 key Bearish factors** based on the data.
4.  **ENGAGE:** **Always end with 1 short, relevant follow-up question** to keep the conversation going (e.g., "Should we look at the support levels?" or "Want to check the option volume?").
5.  **NO FINANCIAL ADVICE:** Phrase analysis as "educational observations" or "market data," not "you should buy."

**User Question:**
{{question}}
`;

// Define the prompt using Gemini 2.5 Pro + Google Search grounding
const groundedQaAgent = ai.definePrompt({
  name: 'groundedQaAgent',
  input: { schema: GroundedQaInputSchema },
  // We rely on plain text + raw grounding metadata instead of structured output.
  model: googleAI.model('gemini-2.5-pro'),
  config: {
    // Enable Grounding with Google Search AND our custom tool
    // Docs pattern: tools: [{ googleSearch: {} }]
    // https://firebase.google.com/docs/ai-logic/grounding-google-search
    tools: [
      { googleSearch: {} },
      fetchGammaRipsData
    ],
  },
  prompt: groundedQaPrompt,
});

/**
 * Extracts grounded source URLs from the raw Gemini response.
 * Looks at candidates[0].groundingMetadata.groundingChunks[].web.uri
 */
function extractGroundedSources(raw: any): string[] {
  if (!raw) return [];

  const candidates =
    raw?.response?.candidates ?? // shape used by Firebase AI Logic Web docs
    raw?.candidates ??
    [];

  const groundingMetadata = candidates[0]?.groundingMetadata;
  const groundingChunks = groundingMetadata?.groundingChunks as
    | Array<{ web?: { uri?: string; title?: string } }>
    | undefined;

  if (!groundingChunks || !Array.isArray(groundingChunks)) return [];

  return groundingChunks
    .map((chunk) => chunk.web?.uri)
    .filter((uri): uri is string => typeof uri === 'string');
}

export const groundedQaFlow = ai.defineFlow(
  {
    name: 'groundedQaFlow',
    inputSchema: GroundedQaInputSchema,
    outputSchema: GroundedQaOutputSchema,
  },
  async (input) => {
    try {
      const llmResponse = await groundedQaAgent(input);

      const baseAnswer: string =
        (llmResponse as any).text ??
        (llmResponse as any).output?.answer ??
        '';

      if (!baseAnswer) {
        throw new Error('The model did not return a valid text response.');
      }

      const sources = extractGroundedSources((llmResponse as any).raw);

      const disclaimerText =
        'This information is for educational and informational purposes only and does not constitute financial advice. All trading involves risk.';

      const alreadyHasDisclaimer = baseAnswer
        .toLowerCase()
        .includes('educational and informational purposes');

      const finalAnswer = alreadyHasDisclaimer
        ? baseAnswer
        : `${baseAnswer}\n\n**Disclaimer:** ${disclaimerText}`;

      return {
        answer: finalAnswer,
        sources,
      };
    } catch (error) {
      // Log the full error for debugging
      console.error('[Grounded QA Flow Error]', error);
      if (error instanceof Error) {
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        // Log raw response if available in the error object (common in API errors)
        if ((error as any).response) {
            console.error('Error Response:', JSON.stringify((error as any).response, null, 2));
        }
      }

      return {
        answer:
          "I'm sorry, but I encountered an error while trying to answer your question using grounded search. The query may have failed or returned insufficient data. Please try rephrasing your question or narrowing the scope.",
        sources: [],
      };
    }
  }
);

/**
 * A wrapper function to call the grounded question-answering flow.
 * @param question The user's question.
 * @returns A promise that resolves to the grounded answer and its sources.
 */
export async function getGroundedAnswer(
  question: string
): Promise<GroundedQaOutput> {
  return groundedQaFlow({ question });
}