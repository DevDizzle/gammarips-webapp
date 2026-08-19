/**
 * OAuth 2.1 token endpoint. Grants: authorization_code (+PKCE, public or
 * confidential clients), refresh_token (rotating), client_credentials
 * (machine clients only). Form-encoded per RFC 6749; JSON accepted too.
 */
import { NextResponse, type NextRequest } from 'next/server';
import {
  GRANT_AUTH_CODE,
  GRANT_CLIENT_CREDENTIALS,
  GRANT_REFRESH,
} from '@/lib/oauth/config';
import { authenticateClient, extractClientCredentials } from '@/lib/oauth/clients';
import { OAuthError, oauthErrorResponse } from '@/lib/oauth/errors';
import { corsHeaders, corsPreflight } from '@/lib/oauth/cors';
import { allow, clientIp } from '@/lib/oauth/ratelimit';
import { parseForm } from '@/lib/oauth/form';
import {
  handleAuthorizationCodeGrant,
  handleClientCredentialsGrant,
  handleRefreshTokenGrant,
} from '@/lib/oauth/tokens';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req.headers);
    if (!allow(`token:ip:${ip}`, 60, 90)) {
      throw new OAuthError('temporarily_unavailable', 'Token endpoint rate limit exceeded.', 429);
    }
    const form = await parseForm(req);
    const grantType = form.get('grant_type') || '';
    const creds = extractClientCredentials(req.headers.get('authorization'), form);
    const client = await authenticateClient(creds);

    let result;
    switch (grantType) {
      case GRANT_AUTH_CODE:
        result = await handleAuthorizationCodeGrant(client, form);
        break;
      case GRANT_REFRESH:
        result = await handleRefreshTokenGrant(client, form);
        break;
      case GRANT_CLIENT_CREDENTIALS:
        if (!client.client_secret_hash || creds.via === 'none') {
          throw new OAuthError('invalid_client', 'client_credentials requires client authentication.', 401);
        }
        result = await handleClientCredentialsGrant(client, form);
        break;
      default:
        throw new OAuthError('unsupported_grant_type', `grant_type '${grantType}' is not supported.`);
    }
    return NextResponse.json(result, {
      headers: { ...corsHeaders(), 'Cache-Control': 'no-store', Pragma: 'no-cache' },
    });
  } catch (err) {
    return oauthErrorResponse(err);
  }
}

export async function OPTIONS() {
  return corsPreflight();
}
