import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/google-genai';
import { getMcpClient } from '@/lib/mcp-client';

// --- Types ---

const AgentInputSchema = z.object({
  question: z.string().describe("The user's current question."),
  history: z.array(z.any()).optional().describe("Conversation history."),
});

const AgentOutputSchema = z.object({
  text: z.string(),
});

// --- Helpers ---

/**
 * Recursively converts a JSON Schema to a Zod schema.
 * This is required because Genkit/Gemini needs a typed schema definition,
 * not just a generic record.
 */
function jsonSchemaToZod(schema: any): z.ZodTypeAny {
  if (!schema) return z.any();

  switch (schema.type) {
    case 'string':
      return z.string().describe(schema.description || '');
    case 'number':
    case 'integer':
      return z.number().describe(schema.description || '');
    case 'boolean':
      return z.boolean().describe(schema.description || '');
    case 'array':
      return z.array(jsonSchemaToZod(schema.items)).describe(schema.description || '');
    case 'object':
      const shape: Record<string, z.ZodTypeAny> = {};
      const required = new Set(Array.isArray(schema.required) ? schema.required : []);
      
      if (schema.properties) {
        for (const [key, prop] of Object.entries(schema.properties)) {
          let fieldSchema = jsonSchemaToZod(prop);
          if (!required.has(key)) {
            fieldSchema = fieldSchema.optional();
          }
          shape[key] = fieldSchema;
        }
      }
      // Use passthrough to be safe, but defining properties is key
      return z.object(shape).passthrough().describe(schema.description || '');
    default:
      return z.any().describe(schema.description || '');
  }
}

/**
 * Converts an MCP Tool Definition to a Genkit Tool.
 */
function convertMcpToolToGenkit(mcpTool: any) {
  // 1. Convert the MCP JSON Schema to a Zod Schema
  let inputSchema: z.ZodTypeAny;
  try {
     // Ensure root is an object schema as expected by tool calling
     if (mcpTool.inputSchema && mcpTool.inputSchema.type === 'object') {
         inputSchema = jsonSchemaToZod(mcpTool.inputSchema);
     } else {
         // Fallback for missing/weird schema -> treat as optional object
         inputSchema = z.object({}).passthrough(); 
     }
  } catch (e) {
      console.error(`Error converting schema for tool ${mcpTool.name}`, e);
      inputSchema = z.object({}).passthrough();
  }

  return ai.defineTool(
    {
      name: mcpTool.name,
      description: mcpTool.description || '',
      inputSchema: inputSchema as z.ZodType<any>, 
    },
    async (input) => {
      console.log(`[MCP Proxy] Calling tool: ${mcpTool.name}`, input);
      try {
        const client = await getMcpClient();
        const result = await client.callTool({
          name: mcpTool.name,
          arguments: input,
        });

        // MCP returns content as a list of text/image blocks.
        if (result.content && Array.isArray(result.content)) {
          return result.content
            .filter((c: any) => c.type === 'text')
            .map((c: any) => c.text)
            .join("\n");
        }
        return JSON.stringify(result);
      } catch (error: any) {
        console.error(`[MCP Error] Tool ${mcpTool.name} failed:`, error);
        return `Error executing tool: ${error.message}`;
      }
    }
  );
}

// --- System Prompt ---

const SYSTEM_PROMPT = `
You are **GammaRips**, the Lead Options Strategist and an elite AI trading assistant. 
Your mission is to identify, validate, and present high-probability options trading opportunities.

**Core Objective:** Provide actionable, data-backed intelligence.

**Your Toolkit:**
- Discovery: get_winners_dashboard (Hot List), web_search (Real-time Intel)
- Analysis: get_stock_analysis (Comprehensive), analyze_market_structure (Support/Resistance)
- Context: get_macro_thesis, get_market_events
- Service: get_support_policy (Refunds, Privacy)

**Operational Rules:**
1. **Data First:** Never guess. If you don't have the price/IV, call web_search.
2. **Policy:** If asked about refunds/accounts, use get_support_policy.
3. **Financial Advice:** Clearly state you are an educational tool if asked for advice.
`;

// --- Agent Flow ---

export const profitScoutAgent = ai.defineFlow(
  {
    name: 'profitScoutAgent',
    inputSchema: AgentInputSchema,
    outputSchema: AgentOutputSchema,
  },
  async (input) => {
    const { question, history = [] } = input;

    // 1. Fetch Tools from MCP
    let tools: any[] = [];
    try {
        const client = await getMcpClient();
        const mcpToolsList = await client.listTools();
        tools = mcpToolsList.tools.map(convertMcpToolToGenkit);
    } catch (e) {
        console.error("Failed to fetch MCP tools:", e);
        return { text: "I'm currently unable to access my market data tools. Please check the system status." };
    }

    // 2. Initialize Conversation History
    const messages: any[] = history.map((msg: any) => ({
        role: msg.role,
        content: [{ text: msg.content }]
    }));

    // Add System Prompt
    messages.unshift({ role: 'system', content: [{ text: SYSTEM_PROMPT }] });

    // Add Current User Question
    messages.push({ role: 'user', content: [{ text: question }] });

    // 3. Generation Loop
    const MAX_TURNS = 5;
    let finalResponseText = "";

    for (let i = 0; i < MAX_TURNS; i++) {
        console.log(`[GammaRips] Turn ${i + 1}`);
        
        const response = await ai.generate({
            model: googleAI.model('gemini-3-flash-preview'),
            tools: tools,
            messages: messages,
            config: { temperature: 0.1 },
        });

        const { text, toolRequests } = response;
        finalResponseText = text;

        // Add Model Response to History
        messages.push({
            role: 'model',
            content: response.message!.content
        });

        // If no tools requested, we are done
        if (!toolRequests || toolRequests.length === 0) {
            break;
        }

        // Execute Tools
        for (const toolRequest of toolRequests) {
            const tool = tools.find(t => t.name === toolRequest.tool.name);
            if (tool) {
                // Execute
                let output;
                try {
                    output = await tool.action(toolRequest.input);
                    console.log(`[GammaRips] Tool Output for ${toolRequest.tool.name}:`, output.substring(0, 200) + (output.length > 200 ? '...' : ''));
                } catch (err: any) {
                    output = `Error: ${err.message}`;
                }

                // Append Tool Response to History
                messages.push({
                    role: 'tool',
                    content: [{
                        toolResponse: {
                            name: toolRequest.tool.name,
                            output: output,
                        }
                    }]
                });
            }
        }
    }

    return { text: finalResponseText };
  }
);
