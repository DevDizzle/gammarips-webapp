'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/google-genai';
import { readFile } from 'fs/promises';
import { join } from 'path';

// Input/Output Schemas
const CustomerServiceInputSchema = z.object({
  question: z.string().describe("The user's query regarding support, policy, or account management."),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string()
  })).optional().describe("Previous conversation context.")
});

const CustomerServiceOutputSchema = z.object({
  answer: z.string().describe("The helpful, policy-compliant response.")
});

// Helper to load the knowledge base
async function getPolicyContent(): Promise<string> {
  try {
    const filePath = join(process.cwd(), 'src/ai/knowledge/customer-service-policy.md');
    return await readFile(filePath, 'utf-8');
  } catch (error) {
    console.error("Failed to load customer service policy:", error);
    return "Policy file unavailable. Please answer politely based on general professional customer service standards.";
  }
}

// Prompt Definition
export const customerServiceAgent = ai.definePrompt({
  name: 'customerServiceAgent',
  model: googleAI.model('gemini-2.5-flash-lite'), // Fast, cost-effective model for text tasks
  input: { schema: CustomerServiceInputSchema },
  config: {
    temperature: 0.3, // Low temperature for consistent, policy-adherent answers
  },
  prompt: `
You are the AI Customer Service Representative for **GammaRips**, an educational stock market analysis platform. 
Your goal is to be helpful, professional, and empathetic while strictly adhering to the company policy.

**Directives:**
1.  **BE CONCISE:** Keep your answer **under 100 words**. Be direct and solution-oriented. Avoid excessive pleasantries.
2.  **FOLLOW POLICY:** Use the provided "Customer Service Policy" as your source of truth.
3.  **FORMATTING:** Use bullet points if explaining steps.
4.  **ENGAGE:** **Always end with 1 short, relevant follow-up question** to ensure the user's issue is fully resolved (e.g., "Did that fix the login issue?" or "Do you need help upgrading?").
5.  **NO FINANCIAL ADVICE:** If asked about market moves (e.g., "Is AAPL a buy?"), politely redirect them to the dashboard.

**Customer Service Policy / Knowledge Base:**
"""
{{policy}}
"""

**Conversation History:**
{{#each history}}
{{role}}: {{content}}
{{/each}}

**User's Current Question:**
{{question}}

**Your Response:**
`,
});

// Flow Definition
export const customerServiceFlow = ai.defineFlow(
  {
    name: 'customerServiceFlow',
    inputSchema: CustomerServiceInputSchema,
    outputSchema: CustomerServiceOutputSchema,
  },
  async (input) => {
    // 1. Load Policy
    const policyText = await getPolicyContent();

    // 2. Generate Response
    // We pass the policy text into the prompt template dynamically
    const response = await customerServiceAgent({
      ...input,
      // @ts-ignore - 'policy' is injected into the prompt template but not strictly in the InputSchema to keep the API clean. 
      // In Genkit, extra props passed to the prompt function are available in the template.
      policy: policyText 
    });

    // 3. Extract Text
    const text = response.text || "I apologize, I'm having trouble processing your request right now.";

    return { answer: text };
  }
);