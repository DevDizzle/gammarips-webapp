import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { EventSource } from "eventsource";
import * as https from "https";

// Singleton instance to avoid reconnecting on every hot-reload in dev
let globalMcpClient: Client | null = null;

export async function getMcpClient() {
  const mcpServerUrl = process.env.MCP_SERVER_URL;
  
  if (!mcpServerUrl) {
    console.error("⚠️ MCP_SERVER_URL is missing.");
    throw new Error("MCP_SERVER_URL is not set in environment variables");
  }

  if (globalMcpClient) {
    return globalMcpClient;
  }

  // Ensure the URL ends with /sse as per standard FastMCP setup
  let sseUrl = mcpServerUrl;
  if (sseUrl.endsWith('/')) {
    sseUrl = sseUrl.slice(0, -1);
  }
  if (!sseUrl.endsWith('/sse')) {
    sseUrl += '/sse';
  }

  console.log(`🔌 Connecting to ProfitScout MCP at ${sseUrl}...`);

  // Force HTTP/1.1 to avoid Cloud Run 421 errors
  // See: https://github.com/modelcontextprotocol/python-sdk/issues/137#issuecomment-2579696950
  const agent = new https.Agent({
    keepAlive: true,
  });

  const transport = new SSEClientTransport(new URL(sseUrl), { 
    // @ts-expect-error - EventSource types mismatch between dom and node
    eventSourceClass: EventSource,
    eventSourceInit: {
      withCredentials: false,
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
