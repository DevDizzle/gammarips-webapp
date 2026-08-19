/**
 * OAuth 2.1 authorization endpoint (GET).
 *
 * Validates the client and redirect_uri FIRST (errors there render an HTML
 * page — never a redirect, per RFC 6749 §4.1.2.1), then the rest of the
 * request (errors there redirect back to the validated redirect_uri), then
 * parks the validated request in Firestore and sends the browser to the
 * consent page. Login + approval happen there; /oauth/consent/decide mints
 * the code.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { resolveClient, validateScope } from '@/lib/oauth/clients';
import { CONSENT_PATH, GRANT_AUTH_CODE, OAUTH_ISSUER } from '@/lib/oauth/config';
import { OAuthError, errorRedirect } from '@/lib/oauth/errors';
import { isValidCodeChallenge } from '@/lib/oauth/pkce';
import { allow, clientIp } from '@/lib/oauth/ratelimit';
import { findMatchingRedirectUri } from '@/lib/oauth/redirect';
import { normalizeResource } from '@/lib/oauth/resource';
import { putPendingRequest } from '@/lib/oauth/store';

export const dynamic = 'force-dynamic';

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

/** Error page for faults we must NOT redirect (unknown client, bad redirect_uri). */
function htmlError(title: string, detail: string, status = 400): NextResponse {
  const body = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${escapeHtml(title)} | GammaRips</title><style>body{font-family:system-ui,sans-serif;background:#0b0f14;color:#e6edf3;margin:0;display:flex;min-height:100vh;align-items:center;justify-content:center}main{max-width:32rem;padding:2rem;border:1px solid #30363d;border-radius:12px;background:#11161d}h1{font-size:1.25rem;margin:0 0 .75rem}p{line-height:1.5;color:#c9d1d9}a{color:#58a6ff}</style></head><body><main><h1>${escapeHtml(title)}</h1><p>${escapeHtml(detail)}</p><p>Close this window and start the connection again from your agent. Setup help: <a href="https://gammarips.com/developers">gammarips.com/developers</a>.</p></main></body></html>`;
  return new NextResponse(body, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Frame-Options': 'DENY',
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'",
    },
  });
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const ip = clientIp(req.headers);
  if (!allow(`authz:ip:${ip}`, 30, 60)) {
    return htmlError('Too many requests', 'The authorization endpoint rate limit was reached. Wait a minute and try again.', 429);
  }

  // 1. The client. Unknown client => page, not redirect.
  let client;
  try {
    client = await resolveClient(q.get('client_id'));
  } catch (err) {
    const msg = err instanceof OAuthError ? err.description : 'The client could not be resolved.';
    return htmlError('Unknown client', msg);
  }
  if (client.source === 'machine' || !client.grant_types.includes(GRANT_AUTH_CODE)) {
    return htmlError('Client not allowed', 'This client cannot use the browser authorization flow.');
  }

  // 2. The redirect_uri. Must match a registered one exactly (loopback: any port).
  let redirectUri = q.get('redirect_uri');
  if (!redirectUri) {
    if (client.redirect_uris.length === 1) redirectUri = client.redirect_uris[0];
    else return htmlError('Missing redirect_uri', 'The request has no redirect_uri and the client has more than one registered.');
  }
  const validatedRedirect = findMatchingRedirectUri(client.redirect_uris, redirectUri);
  if (!validatedRedirect) {
    return htmlError('Invalid redirect_uri', 'The redirect_uri in the request is not registered for this client.');
  }

  // From here on, errors go back to the (validated) client.
  const state = q.get('state');
  const bounce = (code: Parameters<typeof errorRedirect>[1], desc: string) =>
    NextResponse.redirect(errorRedirect(validatedRedirect, code, desc, state), 302);

  if (q.get('response_type') !== 'code') {
    return bounce('unsupported_response_type', "response_type must be 'code'.");
  }
  const codeChallenge = q.get('code_challenge');
  if (!isValidCodeChallenge(codeChallenge)) {
    return bounce('invalid_request', 'code_challenge is required (PKCE S256, 43 base64url chars).');
  }
  if ((q.get('code_challenge_method') || 'S256') !== 'S256') {
    return bounce('invalid_request', "code_challenge_method must be 'S256'.");
  }
  let scope: string;
  try {
    scope = validateScope(q.get('scope'));
  } catch (err) {
    return bounce('invalid_scope', err instanceof OAuthError ? err.description : 'Invalid scope.');
  }
  const resource = normalizeResource(q.get('resource'));
  if (!resource) {
    return bounce('invalid_target', 'resource must be the GammaRips MCP server URL (for example https://mcp.gammarips.com/pro).');
  }
  if (state && state.length > 2048) {
    return bounce('invalid_request', 'state is too long.');
  }

  // 3. Park it and go to consent. The consent URL carries `redirect` back to
  // itself so the shared sign-in flow (which honors ?redirect=) returns here.
  const rid = await putPendingRequest({
    client_id: client.client_id,
    client_name: client.client_name,
    client_kind: client.source,
    redirect_uri: validatedRedirect,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    scope,
    resource,
    state,
  });
  // Base the consent URL on the issuer, not on request headers: the client
  // reached this endpoint through the issuer (metadata), and forwarded-host
  // headers are not trusted input.
  const consent = new URL(CONSENT_PATH, OAUTH_ISSUER);
  consent.searchParams.set('rid', rid);
  consent.searchParams.set('redirect', `${CONSENT_PATH}?rid=${encodeURIComponent(rid)}`);
  return NextResponse.redirect(consent, 302);
}
