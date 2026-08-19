/**
 * CORS for the OAuth endpoints. Browser-based MCP clients (MCP Inspector, web
 * agents) read the metadata and call /oauth/token from a page origin. The
 * endpoints carry no cookies and no per-origin state, so `*` is safe.
 */
import { NextResponse } from 'next/server';

export function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Mcp-Protocol-Version',
    'Access-Control-Max-Age': '86400',
  };
}

export function corsPreflight(): NextResponse {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}
