
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
import { googleSearch } from '@genkit-ai/googleai';

const GroundedQaInputSchema = z.object({
  question: z.string().describe('The user\'s question about options contracts or financial markets.'),
});
export type GroundedQaInput = z.infer<typeof GroundedQaInputSchema>;

const GroundedQaOutputSchema = z.object({
  answer: z.string().describe('The AI-generated, search-grounded answer.'),
  sources: z.array(z.string()).optional().describe('An array of source URLs used for grounding.'),
});
export type GroundedQaOutput = z.infer<typeof GroundedQaOutputSchema>;


const groundedQaPrompt = `
You are a highly knowledgeable financial analysis assistant specializing in options contracts. Your task is to analyze the provided options contract details and general market data from the search results to answer the user's question.

**Instructions:**
1. **Analyze the user's query** about options contracts.
2. **Utilize only the information provided in the search results** to formulate your response. Do not use prior knowledge about non-public information.
3. **Focus on factual analysis**, such as identifying key metrics (strike price, expiration date, implied volatility, premium), potential risks, or explaining a specific contract's current status based on the data.
4. **Do not provide investment recommendations or financial advice.**
5. **If the search results do not contain enough information**, state this limitation clearly.
6. **Include citations** for all factual claims using the provided source links.
7. **Adhere strictly to all financial regulations and disclaimers.**

**User Question:**
{{question}}

**Financial Disclaimer:**
This information is for educational and informational purposes only and does not constitute financial advice, investment recommendations, or an offer to buy or sell any options contracts. Options trading involves significant risk and is not suitable for all investors. Consult with a qualified financial advisor before making investment decisions.
`;

const groundedQaAgent = ai.definePrompt(
  {
    name: 'groundedQaAgent',
    input: { schema: GroundedQaInputSchema },
    output: { schema: GroundedQaOutputSchema },
    prompt: groundedQaPrompt,
    tools: [googleSearch],
    model: 'googleai/gemini-2.5-pro',
  }
);


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
            throw new Error("The model did not return a valid response.");
        }
        
        const answer = output.answer;
        const toolRequests = llmResponse.requests;
        const sources = toolRequests
            ?.filter(request => request.tool?.name === 'googleSearch' && request.output)
            .flatMap(request => (request.output as any[]).map(out => out.url)) || [];


        return {
            answer: `${answer}\n\n**Disclaimer:** ${output.answer.includes('This information is for educational and informational purposes only') ? '' : 'This information is for educational and informational purposes only and does not constitute financial advice. All trading involves risk.'}`,
            sources: sources
        };
    } catch (error) {
        console.error("[Grounded QA Flow Error]", error);
        return {
            answer: "I'm sorry, but I encountered an error while trying to find an answer to your question. The search query may have failed or returned no relevant data. Please try rephrasing your question.",
            sources: []
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
