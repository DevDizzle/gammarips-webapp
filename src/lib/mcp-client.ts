import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { EventSource } from "eventsource";
import * as https from "https";

// Singleton instance to avoid reconnecting on every hot-reload in dev
let globalMcpClient: Client | null = null;

export async function getMcpClient() {
  // Use the local proxy to bypass Cloud Run 421 errors
  // The proxy handles the connection to the external MCP_SERVER_URL using fetch
  const port = process.env.PORT || '3000';
  const proxyUrl = `http://127.0.0.1:${port}/api/mcp-proxy`;
  
  // Ensure the actual target is set for the proxy to use
  if (!process.env.MCP_SERVER_URL) {
    console.warn("⚠️ MCP_SERVER_URL is missing. Proxy will fail.");
  }

  if (globalMcpClient) {
    return globalMcpClient;
  }

  console.log(`🔌 Connecting to ProfitScout MCP via Proxy at ${proxyUrl}...`);

  // Custom Agent (standard settings)
  const agent = new https.Agent({
    keepAlive: true,
  });

  // @ts-ignore
  const transport = new SSEClientTransport(new URL(proxyUrl), { 
    eventSourceClass: EventSource,
    eventSourceInit: {
      https: { agent }
    }
  });
  
  const client = new Client(
    {
      name: "profitscout-nextjs-client",
      version: "1.0.0",
    },
    {
      capabilities: {
        sampling: {},
      },
    }
  );

  try {
    await client.connect(transport);
    console.log("✅ Connected to ProfitScout MCP!");
    globalMcpClient = client;
    return client;
  } catch (error) {
    console.error("❌ Failed to connect to MCP Server:", error);
    // Return null or throw depending on how we want to handle failures
    throw error;
  }
}

/**
 * Helper to call a tool on the MCP server
 */
export async function callMcpTool(toolName: string, args: any) {
  const client = await getMcpClient();
  
  // MCP SDK callTool structure
  const result = await client.callTool({
    name: toolName,
    arguments: args,
  });

  // Result is usually { content: [{ type: 'text', text: '...' }] }
  // We simplify it for the Genkit agent
  if (result.content && Array.isArray(result.content)) {
    return result.content.map((c: any) => c.text).join("\n");
  }
  
  return JSON.stringify(result);
}
