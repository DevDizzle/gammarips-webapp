import { NextRequest, NextResponse } from 'next/server';

// Disable caching for SSE
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const targetUrl = process.env.MCP_SERVER_URL;

  if (!targetUrl) {
    return new NextResponse('MCP_SERVER_URL not configured', { status: 500 });
  }

  try {
    const urlObj = new URL(targetUrl);
    const hostname = urlObj.hostname;

    console.log(`[Proxy] Connecting to ${targetUrl} with Host: ${hostname}...`);

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Host': hostname, // Explicitly set Host header to satisfy Cloud Run
      },
      // cache: 'no-store' is the Next.js fetch equivalent for no-cache
      cache: 'no-store',
    } as RequestInit); // cast needed for some TS setups with Next.js extensions

    if (!response.ok) {
      console.error(`[Proxy] Backend error: ${response.status} ${response.statusText}`);
      return new NextResponse(`Backend Error: ${response.statusText}`, { status: response.status });
    }

    if (!response.body) {
      return new NextResponse('No response body from backend', { status: 502 });
    }

    // Return a stream response
    return new NextResponse(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('[Proxy] Connection failed:', error);
    return new NextResponse('Proxy connection failed', { status: 500 });
  }
}
