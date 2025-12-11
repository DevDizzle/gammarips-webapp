'use server';
/**
 * @fileOverview A Genkit flow for answering financial questions with Google Search grounding.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// IMPORTANT: no googleSearch import; it's configured via model config.tools

const GroundedQaInputSchema = z.object({
  question: z
    .string()
    .describe("The user's question about options contracts or financial markets."),
});
export type GroundedQaInput = z.infer<typeof GroundedQaInputSchema>;

const GroundedQaOutputSchema = z.object({
  answer: z.string().describe('The AI-generated, search-grounded answer.'),
  sources: z.array(z.string()).optional().describe('An array of source URLs used for grounding.'),
});
export type GroundedQaOutput = z.infer<typeof GroundedQaOutputSchema>;

const groundedQaPrompt = `
You are a highly knowledgeable financial analysis assistant specializing in options contracts.
Your task is to analyze the provided options contract details and general market data from the
search results to answer the user's question.

Instructions:
1. Analyze the user's query about options contracts.
2. Use only information grounded in the Google Search results; do not invent facts.
3. Focus on factual analysis: key metrics (strike, expiry, IV, premium), risks, and status.
4. Do NOT provide investment recommendations or financial advice.
5. If the search results do not contain enough information, say so clearly.
6. Include citations inline using the provided source links (e.g. [1], [2]) and map them to the
   "sources" list you receive from the tool, in order.
7. Follow all financial regulations and disclaimers.

User Question:
{{question}}

Financial Disclaimer:
This information is for educational and informational purposes only and does not constitute
financial advice, investment recommendations, or an offer to buy or sell any options contracts.
Options trading involves significant risk and is not suitable for all investors.
`;

// Prompt that uses Gemini 2.5 Pro + Google Search grounding
const groundedQaAgent = ai.definePrompt(
  {
    name: 'groundedQaAgent',
    input: { schema: GroundedQaInputSchema },
    output: { schema: GroundedQaOutputSchema },
    // Use Gemini 2.5 Pro through the Google GenAI plugin
    model: 'googleai/gemini-2.5-pro',
    // This is the important part: enable Google Search grounding as a model tool
    config: {
      tools: [{ googleSearch: {} }],
    },
    prompt: groundedQaPrompt,
  }
);

// Helper to extract grounded source URLs from raw Gemini response
function extractGroundingSources(raw: unknown): string[] {
  try {
    const candidate =
      (raw as any)?.candidates?.[0] ??
      (raw as any)?.response?.candidates?.[0];

    const groundingMetadata = candidate?.groundingMetadata;
    const webSources: any[] = groundingMetadata?.webSearchSources ?? [];

    return webSources
      .map((s) => s.uri || s.url)
      .filter((u: unknown): u is string => typeof u === 'string');
  } catch {
    return [];
  }
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
      const output = llmResponse.output;

      if (!output) {
        throw new Error('The model did not return a valid structured response.');
      }

      const baseAnswer = output.answer;
      const raw = llmResponse.raw;
      const sources = extractGroundingSources(raw);

      const disclaimerText =
        'This information is for educational and informational purposes only and does not ' +
        'constitute financial advice. All trading involves risk.';

      const finalAnswer = baseAnswer.includes('This information is for educational and informational purposes only')
        ? baseAnswer
        : `${baseAnswer}\n\n**Disclaimer:** ${disclaimerText}`;

      return {
        answer: finalAnswer,
        sources,
      };
    } catch (error) {
      console.error('[Grounded QA Flow Error]', error);
      return {
        answer:
          "I'm sorry, but I encountered an error while trying to find an answer to your question. " +
          'The search query may have failed or returned no relevant data. Please try rephrasing your question.',
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
export async function getGroundedAnswer(question: string): Promise<GroundedQaOutput> {
  return groundedQaFlow({ question });
}
