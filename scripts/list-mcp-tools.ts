
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { EventSource } from "eventsource";
import * as dotenv from "dotenv";
import * as https from "https";

dotenv.config();

async function listTools() {
  const envUrl = process.env.MCP_SERVER_URL;
  if (!envUrl) {
    console.error("MCP_SERVER_URL is not set");
    return;
  }

  // Append /sse if missing
  let targetUrl = envUrl;
  if (targetUrl.endsWith('/')) {
    targetUrl = targetUrl.slice(0, -1);
  }
  if (!targetUrl.endsWith('/sse')) {
    targetUrl += '/sse';
  }

  console.log(`Connecting to MCP server at ${targetUrl}...`);

  // Force HTTP/1.1
  const agent = new https.Agent({
    keepAlive: true,
  });

  const urlObj = new URL(targetUrl);

  const transport = new SSEClientTransport(new URL(targetUrl), {
    // @ts-ignore
    eventSourceClass: EventSource,
    eventSourceInit: {
      withCredentials: false,
      https: { agent }, // Apply the fix here
      headers: {
        Host: urlObj.hostname,
      },
    },
  });

  const client = new Client(
    {
      name: "tool-lister",
      version: "1.0.0",
    },
    {
      capabilities: {},
    }
  );

  try {
    await client.connect(transport);
    console.log("Connected!");

    const tools = await client.listTools();
    console.log("Available tools:");
    console.log(JSON.stringify(tools, null, 2));

    await client.close();
  } catch (error) {
    console.error("Error:", error);
  }
}

listTools();
