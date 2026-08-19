/** RFC 7591 dynamic client registration (deprecated by MCP 2026-07-28, kept for ChatGPT / claude.ai / Cursor fallbacks). */
import { NextResponse, type NextRequest } from 'next/server';
import { registerDynamicClient } from '@/lib/oauth/clients';
import { OAuthError, oauthErrorResponse } from '@/lib/oauth/errors';
import { corsHeaders, corsPreflight } from '@/lib/oauth/cors';
import { allow, clientIp } from '@/lib/oauth/ratelimit';

export const dynamic = 'force-dynamic';

const MAX_BODY = 16 * 1024;

export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req.headers);
    // Per-IP and global buckets. Registration writes a Firestore doc (90-day
    // TTL), so the global cap bounds the worst-case growth under abuse.
    if (!allow(`dcr:ip:${ip}`, 10, 20) || !allow('dcr:global', 20, 40)) {
      throw new OAuthError('temporarily_unavailable', 'Registration rate limit exceeded. Try again in a minute.', 429);
    }
    const text = await req.text();
    if (text.length > MAX_BODY) throw new OAuthError('invalid_client_metadata', 'Registration body is too large.');
    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      throw new OAuthError('invalid_client_metadata', 'Registration body must be JSON.');
    }
    const { record, client_secret } = await registerDynamicClient(body);
    const out: Record<string, unknown> = {
      client_id: record.client_id,
      client_id_issued_at: Math.floor(Date.now() / 1000),
      client_name: record.client_name,
      redirect_uris: record.redirect_uris,
      grant_types: record.grant_types,
      response_types: record.response_types,
      token_endpoint_auth_method: record.token_endpoint_auth_method,
      scope: record.scope,
    };
    if (client_secret) {
      out.client_secret = client_secret;
      out.client_secret_expires_at = 0;
    }
    return NextResponse.json(out, {
      status: 201,
      headers: { ...corsHeaders(), 'Cache-Control': 'no-store', Pragma: 'no-cache' },
    });
  } catch (err) {
    return oauthErrorResponse(err);
  }
}

export async function OPTIONS() {
  return corsPreflight();
}
