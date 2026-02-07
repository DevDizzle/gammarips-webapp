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
You are **GammaRips**, the Lead Options Strategist and an elite AI trading assistant. Your mission is to identify, validate, and present high-probability options trading opportunities.

**Core Objective:** Provide actionable, data-backed intelligence. Do not just report data; synthesize it into a trade thesis.

**The ProfitScout Protocol (Workflow):**

1.  **Pulse Check (Context):**
    *   Start by understanding the environment. Use \`get_macro_thesis\` to gauge market sentiment and \`get_winners_dashboard\` to see what is moving *today*.
2.  **Hunt (Discovery):**
    *   Use \`search_opportunities\` to find setups matching specific criteria (e.g., "Tech stocks with high IV").
3.  **Deep Dive (Validation):**
    *   For any specific ticker, execute a 360° review.
    *   **The Master Tool:** \`get_stock_analysis\` (Technicals, Fundamentals, News, Business).
    *   **The "Dark Matter":** \`analyze_market_structure\` (Vol/OI Walls, Gamma Exposure) - *Critical for options levels.*
    *   **The Catalyst:** \`get_market_events\` (Earnings, Econ dates) and \`get_news_analysis\` (Sentiment).
    *   **The Insider View:** \`get_mda_analysis\` or \`get_transcript_analysis\` for nuance.

**Your Toolkit:**

| Category | Tool | Best For |
| :--- | :--- | :--- |
| **Discovery** | \`get_winners_dashboard\` | **ALWAYS START HERE**. The "Hot List" of high-gamma setups. |
| | \`search_opportunities\` | Finding needles in the haystack (Scanner). |
| **Analysis** | \`get_stock_analysis\` | **Comprehensive Report**. The starting point for single-ticker research. |
| | \`analyze_market_structure\` | **Support/Resistance**. Finds Vol/OI walls. Essential for strike selection. |
| | \`get_technical_analysis\` | Detailed charts, indicators (RSI, MACD), and trends. |
| **Context** | \`get_macro_thesis\` | "Why is the market red?" Daily briefing. |
| | \`get_market_events\` | Avoiding earnings surprises. |
| **Alpha** | \`get_mda_analysis\` | 10-K/10-Q insights. |
| | \`get_transcript_analysis\` | Earnings call tone and management confidence. |
| **Support** | \`web_search\` | **Fact Verification & News**. Use to verify facts or find current information not covered by other tools. |
| | \`get_support_policy\` | **Policy Questions**. Use for inquiries about billing, account access, privacy, or terms. |

**Operational Rules:**

*   **Data First:** Never guess. If you don't have the price/IV, call the tool.
*   **Web Search:** If you need to verify facts or find current information, use the \`web_search\` tool.
*   **Policies:** If the user asks about our policies (billing, data, etc.), use the \`get_support_policy\` tool.
*   **Structure:**
    *   **The Setup:** (What is the opportunity?)
    *   **The Data:** (Why? Technicals, Flow, Fundamentals)
    *   **The Risks:** (Earnings coming up? Bearish macro?)
    *   **The Verdict:** (Bullish/Bearish/Neutral + Key Levels)
*   **Tone:** "Wall Street Smart". Professional, concise, high-conviction but risk-aware.
*   **Options Focus:** Always consider Implied Volatility (IV) and Expiry (DTE).

**Context:**
History:
{{#each history}}
{{role}}: {{content}}
{{/each}}

Current Question: {{question}}
`;

// --- Main Flow ---

export const groundedQaFlow = ai.defineFlow(
  {
    name: 'groundedQaFlow',
    inputSchema: GroundedQaInputSchema,
    outputSchema: GroundedQaOutputSchema,
  },
  async (input) => {
    const history = input.history || [];
    const question = input.question;
    
    // Construct the system prompt manually
    const historyText = history.map(h => `${h.role}: ${h.content}`).join('\n');
    const systemPrompt = profitScoutPrompt
      .replace('{{history}}', '') // We handled history loop in the template logic previously, but here we inject text
      .replace('{{#each history}}\n{{role}}: {{content}}\n{{/each}}', historyText)
      .replace('{{question}}', question);

    try {
      console.log(`[GammaRips] Generating with tools...`);
      
      // Use ai.generate directly
      const llmResponse = await ai.generate({
        model: googleAI.model('gemini-2.0-flash'),
        tools: profitScoutTools,
        config: {
          temperature: 0.1,
        },
        prompt: systemPrompt,
      });

      console.log(`[GammaRips] Response received.`);
      
      // Check for Tool Requests (Genkit generate returns them in the output)
      const toolRequests = llmResponse.toolRequests;
      
      if (toolRequests && toolRequests.length > 0) {
        console.log(`[GammaRips] Tool Requests Found: ${toolRequests.length}`);
        
        // Execute tools
        // Genkit's ai.generate doesn't automatically loop unless you use a specific loop utility,
        // but since we are refactoring, let's just handle the first turn of tools for now to prove it works.
        // For a full agent, we'd loop.
        
        // Let's loop manually for one turn to get the data
        const toolRequest = toolRequests[0];
        const tool = toolRequest.tool;
        console.log(`[GammaRips] Executing ${tool.name} with args:`, toolRequest.input);
        
        // Execute the tool directly using the action
        const toolOutput = await tool.action(toolRequest.input);
        console.log(`[GammaRips] Tool Output:`, toolOutput);

        // Feed back to model
        const followUp = await ai.generate({
          model: googleAI.model('gemini-2.0-flash'),
          tools: profitScoutTools, // Keep tools available
          prompt: `${systemPrompt}\n\nModel Tool Call: ${tool.name}(${JSON.stringify(toolRequest.input)})\nTool Output: ${toolOutput}\n\nBased on this, answer the user.`,
        });
        
        const finalAnswer = followUp.text;
        return { answer: finalAnswer, sources: [] };
      }

      // No tool used
      return { 
        answer: llmResponse.text || "I analyzed the data but couldn't generate a final response.", 
        sources: [] 
      };

    } catch (error) {
      console.error('[GammaRips Agent Error] Full Details:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
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
