/**
 * RFC 6749 §5.2 error responses for the token / registration endpoints, and
 * the redirect-form for the authorization endpoint (§4.1.2.1).
 */
import { NextResponse } from 'next/server';
import { OAUTH_ISSUER } from './config';
import { corsHeaders } from './cors';

export type OAuthErrorCode =
  | 'invalid_request'
  | 'invalid_client'
  | 'invalid_grant'
  | 'unauthorized_client'
  | 'unsupported_grant_type'
  | 'invalid_scope'
  | 'invalid_target'
  | 'access_denied'
  | 'unsupported_response_type'
  | 'server_error'
  | 'temporarily_unavailable'
  | 'invalid_redirect_uri'
  | 'invalid_client_metadata';

export class OAuthError extends Error {
  constructor(
    public readonly code: OAuthErrorCode,
    public readonly description: string,
    public readonly status: number = 400
  ) {
    super(`${code}: ${description}`);
  }
}

/** JSON error body for token / register / revoke endpoints. */
export function oauthErrorResponse(err: OAuthError | unknown): NextResponse {
  const e =
    err instanceof OAuthError
      ? err
      : new OAuthError('server_error', 'The authorization server hit an internal error.', 500);
  if (!(err instanceof OAuthError)) {
    console.error('oauth: unexpected error', err);
  }
  const headers: Record<string, string> = {
    ...corsHeaders(),
    'Cache-Control': 'no-store',
    Pragma: 'no-cache',
  };
  if (e.code === 'invalid_client' && e.status === 401) {
    headers['WWW-Authenticate'] = 'Basic realm="gammarips-oauth"';
  }
  return NextResponse.json(
    { error: e.code, error_description: e.description },
    { status: e.status, headers }
  );
}

/**
 * Build the redirect URL for an authorization-endpoint error. Only call this
 * with a redirect_uri that was ALREADY validated against the client's
 * registration — never with a raw request value (open redirect).
 */
export function errorRedirect(
  validatedRedirectUri: string,
  code: OAuthErrorCode,
  description: string,
  state: string | null
): string {
  const url = new URL(validatedRedirectUri);
  url.searchParams.set('error', code);
  url.searchParams.set('error_description', description);
  if (state) url.searchParams.set('state', state);
  // RFC 9207: every authorization response carries the issuer.
  url.searchParams.set('iss', OAUTH_ISSUER);
  return url.toString();
}
