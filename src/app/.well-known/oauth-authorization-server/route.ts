/**
 * RFC 8414 Authorization Server Metadata. MCP clients fetch this after they
 * read the MCP server's protected-resource metadata, which names
 * https://gammarips.com as the authorization server.
 */
import { NextResponse } from 'next/server';
import { authorizationServerMetadata } from '@/lib/oauth/metadata';
import { corsHeaders, corsPreflight } from '@/lib/oauth/cors';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(authorizationServerMetadata(), {
    headers: { ...corsHeaders(), 'Cache-Control': 'public, max-age=300' },
  });
}

export async function OPTIONS() {
  return corsPreflight();
}
