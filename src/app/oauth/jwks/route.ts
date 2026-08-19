/** RFC 7517 JWK Set: the public keys the MCP server verifies access tokens with. */
import { NextResponse } from 'next/server';
import { getJwks } from '@/lib/oauth/keys';
import { corsHeaders, corsPreflight } from '@/lib/oauth/cors';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const jwks = await getJwks();
    return NextResponse.json(jwks, {
      headers: { ...corsHeaders(), 'Cache-Control': 'public, max-age=300' },
    });
  } catch (err) {
    console.error('oauth: jwks unavailable', err);
    return NextResponse.json(
      { error: 'temporarily_unavailable', error_description: 'Signing keys are not configured.' },
      { status: 503, headers: corsHeaders() }
    );
  }
}

export async function OPTIONS() {
  return corsPreflight();
}
