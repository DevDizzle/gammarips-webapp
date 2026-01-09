'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/google-genai';
import { customerServiceFlow } from './customer-service-agent';
import { groundedQaFlow } from './grounded-qa-flow';

// Input/Output Schemas for the Router
const RouterInputSchema = z.object({
  userInput: z.string().describe("The raw message from the user."),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string()
  })).optional().describe("Previous conversation context to help determine intent.")
});

const RouterOutputSchema = z.object({
  response: z.string().describe("The final response text from the selected agent."),
  source: z.enum(['customer_service', 'financial_analyst']).describe("Which agent handled the request.")
});

// Define the Classification Prompt
const classificationPrompt = ai.definePrompt({
  name: 'intentClassifier',
  model: googleAI.model('gemini-2.5-flash-lite'), // Fast model for classification
  input: { 
    schema: z.object({
      userInput: z.string(),
      lastMessage: z.string().optional()
    })
  },
  output: {
    schema: z.object({
      intent: z.enum(['SERVICE', 'FINANCE']),
      reasoning: z.string().optional()
    })
  },
  prompt: `
You are an intent classifier for "GammaRips", a financial analysis platform.
Your job is to route user messages to the correct department: **Customer Service** or **Financial Analysis**.

**Categories:**
1. **SERVICE:** 
   - Questions about subscriptions, billing, account settings, passwords.
   - Bug reports, technical issues with the website/dashboard.
   - Questions about "how to use" the platform features.
   - Greetings or general "help" requests.
   - Policy questions (privacy, data security).

2. **FINANCE:**
   - Questions about specific stocks, tickers (e.g., AAPL, TSLA), or the market.
   - Requests for price targets, charts, options setups, or volatility data.
   - "Is this a good buy?" or investment-related queries.
   - Any question requiring market data or financial knowledge.

**Context:**
Last message (if any): {{lastMessage}}
Current message: {{userInput}}

**Task:**
Analyze the current message and classify the intent. return JSON.
`
});

// The Main Router Flow
export const chatRouterFlow = ai.defineFlow(
  {
    name: 'chatRouterFlow',
    inputSchema: RouterInputSchema,
    outputSchema: RouterOutputSchema,
  },
  async (input) => {
    // 1. Classify Intent
    const lastMsg = input.history && input.history.length > 0 
      ? input.history[input.history.length - 1].content 
      : undefined;

    const classification = await classificationPrompt({
      userInput: input.userInput,
      lastMessage: lastMsg
    });
    
    // Default to FINANCE if classification fails or is ambiguous (safer to assume data query)
    const intent = classification.output?.intent || 'FINANCE';

    // 2. Route to the correct agent
    if (intent === 'SERVICE') {
      // Call Customer Service Agent
      const result = await customerServiceFlow({
        question: input.userInput,
        history: input.history
      });
      return {
        response: result.answer,
        source: 'customer_service'
      };
    } else {
      // Call Financial Analyst (Grounded QA)
      const result = await groundedQaFlow({
        question: input.userInput,
        history: input.history
      });
      return {
        response: result.answer,
        source: 'financial_analyst'
      };
    }
  }
) as any;
