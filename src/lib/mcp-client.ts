import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { NodeEventSource } from "./node-event-source";
import * as https from "https";

// Define Transport interface locally if we can't import it easily, 
// but Client expects a specific type. We'll try to match it structurally.
interface Transport {
  start(): Promise<void>;
  send(message: any): Promise<void>;
  close(): Promise<void>;
  onclose?: () => void;
  onerror?: (error: Error) => void;
  onmessage?: (message: any) => void;
}

class CustomSSETransport implements Transport {
  private _eventSource?: NodeEventSource;
  private _endpoint?: string;
  private _url: string;
  private _headers: Record<string, string>;

  onclose?: () => void;
  onerror?: (error: Error) => void;
  onmessage?: (message: any) => void;

  private _onDisconnect?: () => void;

  constructor(url: string, headers: Record<string, string>, onDisconnect?: () => void) {
    this._url = url;
    this._headers = headers;
    this._onDisconnect = onDisconnect;
  }

  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this._eventSource = new NodeEventSource(this._url, { headers: this._headers });

      this._eventSource.on('open', () => {
         console.log("[CustomSSETransport] Connection opened");
      });

      this._eventSource.on('error', (err: any) => {
         const error = new Error(err.message || 'SSE Error');
         console.error("[CustomSSETransport] Error:", error);
         
         // Notify connection is dead
         if (this._onDisconnect) this._onDisconnect();

         if (this.onerror) this.onerror(error);
         // Only reject if we haven't connected yet? 
         // For now, simple logic.
         // If endpoint is not set, we are starting up.
         if (!this._endpoint) reject(error);
      });

      this._eventSource.on('endpoint', (event: any) => {
         console.log("[CustomSSETransport] Received endpoint:", event.data);
         this._endpoint = event.data;
         resolve();
      });

      this._eventSource.on('message', (event: any) => {
         try {
           const message = JSON.parse(event.data);
           if (this.onmessage) this.onmessage(message);
         } catch (e) {
           console.error("[CustomSSETransport] Failed to parse SSE message", e);
         }
      });
    });
  }

  async send(message: any): Promise<void> {
    if (!this._endpoint) throw new Error("Not connected");
    
    // Construct full endpoint URL
    const baseUrl = new URL(this._url);
    // _endpoint is relative path like /messages/?session_id=...
    // We need to append it to the origin/base
    // If _url is https://host/sse, and endpoint is /messages/..., 
    // we want https://host/messages/...
    
    const endpointUrl = new URL(this._endpoint, baseUrl.origin);
    
    // Force HTTP/1.1 agent for fetch if needed? 
    // Global fetch uses its own agent. Usually fine.
    
    const response = await fetch(endpointUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this._headers
      },
      body: JSON.stringify(message)
    });

    if (!response.ok) {
        throw new Error(`Post message failed: ${response.status} ${response.statusText}`);
    }
  }

  async close(): Promise<void> {
    this._eventSource?.close();
    if (this._onDisconnect) this._onDisconnect();
    if (this.onclose) this.onclose();
  }
}

// Singleton instance to avoid reconnecting on every hot-reload in dev
let globalMcpClient: Client | null = null;

export function resetMcpClient() {
  console.log("♻️  Manually resetting global MCP client.");
  globalMcpClient = null;
}

export async function getMcpClient() {
  const mcpServerUrl = process.env.MCP_SERVER_URL;
  const mcpApiKey = process.env.MCP_API_KEY;
  
  if (!mcpServerUrl) {
    console.error("⚠️ MCP_SERVER_URL is missing.");
    throw new Error("MCP_SERVER_URL is not set in environment variables");
  }

  if (!mcpApiKey) {
    console.warn("⚠️ MCP_API_KEY is missing. MCP calls may fail if server requires auth.");
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

  console.log(`🔌 Connecting to GammaRips MCP at ${sseUrl}...`);

  // Build headers with API key if available
  const headers: Record<string, string> = {};
  if (mcpApiKey) {
    headers['X-API-Key'] = mcpApiKey.trim();
  }

  const transport = new CustomSSETransport(sseUrl, headers, () => {
      console.log("♻️  MCP Client disconnected. Resetting global instance.");
      globalMcpClient = null;
  });
  
  const client = new Client(
    {
      name: "gammarips-nextjs-client",
      version: "1.0.0",
    },
    {
      capabilities: {
        sampling: {},
      },
    }
  );

  try {
    // client.connect expects a Transport. Our CustomSSETransport matches the interface.
    // Cast to any if strict typing fails due to minor mismatches (like JSONRPCMessage type).
    await client.connect(transport as any);
    console.log("✅ Connected to GammaRips MCP!");
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
  
  const result = await client.callTool({
    name: toolName,
    arguments: args,
  });

  if (result.content && Array.isArray(result.content)) {
    return result.content.map((c: any) => c.text).join("\n");
  }
  
  return JSON.stringify(result);
}
