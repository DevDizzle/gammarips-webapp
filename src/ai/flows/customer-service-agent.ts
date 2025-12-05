
'use server';
/**
 * @fileOverview An AI customer service agent that answers user feedback.
 *
 * - answerFeedback - A function that generates a response to user feedback.
 * - AnswerFeedbackInput - The input type for the answerFeedback function.
 * - AnswerFeedbackOutput - The return type for the answerFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load the knowledge base from the markdown file.
const knowledgeBase = readFileSync(resolve('./src/ai/knowledge/customer-service-policy.md'), 'utf-8');

const AnswerFeedbackInputSchema = z.object({
  message: z.string().describe('The user\'s feedback or question.'),
  trackingId: z.string().describe('The unique tracking ID for the feedback.'),
});
export type AnswerFeedbackInput = z.infer<typeof AnswerFeedbackInputSchema>;

const AnswerFeedbackOutputSchema = z.object({
  response: z.string().describe('The AI-generated response to the user.'),
});
export type AnswerFeedbackOutput = z.infer<typeof AnswerFeedbackOutputSchema>;

const customerServiceAgentPrompt = ai.definePrompt({
  name: 'customerServiceAgentPrompt',
  input: {schema: AnswerFeedbackInputSchema},
  output: {schema: AnswerFeedbackOutputSchema},
  prompt: `You are an expert customer service agent for GammaRips, an AI-powered options trading research tool. Your goal is to provide a helpful, empathetic, and professional response to user feedback.

You MUST strictly adhere to the policies and tone outlined in the knowledge base below. Never give financial advice.

**Knowledge Base:**
---
{{{knowledgeBase}}}
---

**User's Message:**
"{{{message}}}"

**Instructions:**
1.  Read the user's message carefully to understand their issue or question.
2.  Consult the knowledge base to formulate a response that aligns with company policy and tone.
3.  If the user is reporting a bug or a problem, acknowledge their frustration and thank them.
4.  If the user is asking a question, provide a clear answer based *only* on the knowledge base.
5.  If the user is giving a compliment or positive feedback, thank them warmly.
6.  Keep the response concise and to the point.
7.  Do not invent information. If the answer is not in the knowledge base, state that you have forwarded their query to the team for a more detailed look.

Generate a helpful response to the user.`,
});

// This is the main flow that will be called by the Cloud Function.
// Note the `name` change to match the endpoint path.
export const answerFeedback = ai.defineFlow(
  {
    name: 'answerFeedback', // This name is used to create the API endpoint path.
    inputSchema: AnswerFeedbackInputSchema,
    outputSchema: AnswerFeedbackOutputSchema,
    auth: {
      // Secure the endpoint with an API key.
      // The key must be passed in the Authorization header: `Bearer <key>`
      policy: (auth, input) => {
        if (!process.env.GENKIT_API_KEY) {
          throw new Error('GENKIT_API_KEY is not set.');
        }
        if (auth.apiKey !== process.env.GENKIT_API_KEY) {
          throw new Error('Invalid API key.');
        }
      },
    },
  },
  async input => {
    const {output} = await customerServiceAgentPrompt({ ...input, knowledgeBase });
    if (!output) {
      throw new Error('AI agent failed to generate a response.');
    }
    return output;
  }
);
