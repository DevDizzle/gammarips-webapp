
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/google-genai';
import { getSupportPolicy } from '@/ai/tools/profitscout';

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

// Prompt Definition
export const customerServiceAgent = ai.definePrompt({
  name: 'customerServiceAgent',
  model: googleAI.model('gemini-2.0-flash'), // Fast, cost-effective model for text tasks
  input: { schema: CustomerServiceInputSchema },
  config: {
    tools: [getSupportPolicy],
    temperature: 0.3, // Low temperature for consistent, policy-adherent answers
  },
  prompt: `
You are the AI Customer Service Representative for **GammaRips**, an educational stock market analysis platform. 
Your goal is to be helpful, professional, and empathetic while strictly adhering to the company policy.

**Directives:**
1.  **BE CONCISE:** Keep your answer **under 100 words**. Be direct and solution-oriented. Avoid excessive pleasantries.
2.  **CHECK POLICY:** You have access to the \`get_support_policy\` tool. **Always check this tool** for the latest policy details regarding refunds, accounts, and privacy before answering.
3.  **FORMATTING:** Use bullet points if explaining steps.
4.  **ENGAGE:** **Always end with 1 short, relevant follow-up question** to ensure the user's issue is fully resolved (e.g., "Did that fix the login issue?" or "Do you need help upgrading?").
5.  **NO FINANCIAL ADVICE:** If asked about market moves (e.g., "Is AAPL a buy?"), politely redirect them to the dashboard.

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
    // Helper to run the agent loop
    const currentHistory = input.history || [];
    const currentQuestion = input.question;
    
    // Max turns to prevent infinite loops
    const MAX_TURNS = 5;

    for (let i = 0; i < MAX_TURNS; i++) {
      // 1. Generate Response
      const response = await customerServiceAgent({
        question: currentQuestion,
        history: currentHistory
      });

      // 2. Handle Tool Requests
      if (response.toolRequests && response.toolRequests.length > 0) {
        const toolRequest = response.toolRequests[0]; // Assume single tool call for now
        const tool = toolRequest.tool;
        
        // Execute the tool
        // Note: In a real robust setup, we'd use a tool map. 
        // Here we know we only have getSupportPolicy or similar.
        let toolOutput = "Tool execution failed.";
        
        try {
          if (tool.name === 'get_support_policy') {
             // @ts-expect-error - Tool output type mismatch
             toolOutput = await getSupportPolicy(toolRequest.input);
          } else {
             toolOutput = `Unknown tool: ${tool.name}`;
          }
        } catch (err: any) {
          toolOutput = `Error executing tool: ${err.message}`;
        }

        // Add the interaction to history for the next turn
        // We simulate the model's tool call and the tool's response in the history
        // Note: Genkit's history format is typically just user/model. 
        // For tool use, we append the tool result as context or a user message with data.
        // A simple way is to append the tool output as a "system" or "data" injection to the prompt context.
        // Since our prompt template just iterates history, we can append a model message (the tool call thought)
        // and a user message (the tool result).
        
        // However, a cleaner way for this simple prompt-based agent is to 
        // just append the tool result to the conversation context as if the system provided it.
        
        currentHistory.push({
          role: 'model',
          content: `Checking policy for: ${JSON.stringify(toolRequest.input)}`
        });
        
        currentHistory.push({
          role: 'user', // "System" context often injected as user message in simple chat models
          content: `POLICY DATA RETURNED: ${toolOutput}`
        });

        // Continue loop
        continue;
      }

      // 3. Extract Text (Final Answer)
      const text = response.text;
      if (text) {
        return { answer: text };
      }
    }

    return { answer: "I apologize, I'm having trouble retrieving the policy information right now." };
  }
);