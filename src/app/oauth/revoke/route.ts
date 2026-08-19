/** RFC 7009 token revocation (refresh tokens; access tokens expire on their own within 1h). */
import { NextResponse, type NextRequest } from 'next/server';
import { authenticateClient, extractClientCredentials } from '@/lib/oauth/clients';
import { OAuthError, oauthErrorResponse } from '@/lib/oauth/errors';
import { corsHeaders, corsPreflight } from '@/lib/oauth/cors';
import { allow, clientIp } from '@/lib/oauth/ratelimit';
import { revokeRefreshTokenByValue, refreshTokenOwner } from '@/lib/oauth/store';
import { parseForm } from '@/lib/oauth/form';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req.headers);
    if (!allow(`revoke:ip:${ip}`, 30, 60)) {
      throw new OAuthError('temporarily_unavailable', 'Rate limit exceeded.', 429);
    }
    const form = await parseForm(req);
    const token = form.get('token') || '';
    const creds = extractClientCredentials(req.headers.get('authorization'), form);
    // Authenticate the client when it identifies itself; a client may revoke
    // only its own tokens. RFC 7009 §2.2: unknown tokens still return 200.
    if (token) {
      const ownerClientId = await refreshTokenOwner(token);
      if (ownerClientId) {
        if (creds.client_id) {
          const client = await authenticateClient(creds);
          if (client.client_id !== ownerClientId) {
            throw new OAuthError('invalid_client', 'The token belongs to a different client.', 401);
          }
        }
        await revokeRefreshTokenByValue(token, 'client_revoke');
      }
    } else if (creds.client_id) {
      await authenticateClient(creds);
    }
    return new NextResponse(null, {
      status: 200,
      headers: { ...corsHeaders(), 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    return oauthErrorResponse(err);
  }
}

export async function OPTIONS() {
  return corsPreflight();
}
