/**
 * Token endpoint grants. Pure orchestration over store.ts + keys.ts; the
 * route handler only parses the request and serializes the result.
 */
import { randomUUID } from 'crypto';
import {
  ACCESS_TOKEN_TTL,
  GRANT_AUTH_CODE,
  GRANT_CLIENT_CREDENTIALS,
  GRANT_REFRESH,
  MACHINE_TOKEN_TTL,
  OAUTH_ISSUER,
} from './config';
import { OAuthError } from './errors';
import { type ResolvedClient, validateScope } from './clients';
import { tierForUid } from './entitlement';
import { signAccessToken } from './keys';
import { verifyPkce } from './pkce';
import { normalizeResource } from './resource';
import {
  consumeCode,
  issueRefreshToken,
  revokeRefreshFamily,
  revokeRefreshTokenByValue,
  rotateRefreshToken,
  touchClient,
} from './store';

export interface TokenResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  scope: string;
  refresh_token?: string;
}

export async function handleAuthorizationCodeGrant(
  client: ResolvedClient,
  form: URLSearchParams
): Promise<TokenResponse> {
  if (!client.grant_types.includes(GRANT_AUTH_CODE)) {
    throw new OAuthError('unauthorized_client', 'This client cannot use the authorization_code grant.');
  }
  const code = form.get('code') || '';
  // OAuth 2.1 §4.1.3: with PKCE mandatory, redirect_uri at the token endpoint
  // is optional; when the client sends it, it must equal the one the code was
  // issued for.
  const redirectUri = form.get('redirect_uri');
  const verifier = form.get('code_verifier');
  const resourceParam = form.get('resource');

  if (!code) throw new OAuthError('invalid_request', 'code is required.');
  if (!verifier) throw new OAuthError('invalid_request', 'code_verifier is required (PKCE).');

  const consumed = await consumeCode(code);
  if (consumed.kind === 'invalid') {
    throw new OAuthError('invalid_grant', 'Authorization code is invalid or expired.');
  }
  if (consumed.kind === 'replayed') {
    // A second redemption means the code leaked. The first redemption already
    // minted a token family: kill it (OAuth 2.1 §4.1.2).
    if (consumed.family_id) await revokeRefreshFamily(consumed.family_id, 'code_replay');
    console.warn('oauth: authorization code replay detected; family revoked');
    throw new OAuthError('invalid_grant', 'Authorization code was already used.');
  }
  const rec = consumed.record;
  if (rec.client_id !== client.client_id) {
    await revokeRefreshFamily(rec.family_id, 'code_client_mismatch');
    throw new OAuthError('invalid_grant', 'Authorization code was issued to a different client.');
  }
  if (redirectUri !== null && redirectUri !== rec.redirect_uri) {
    await revokeRefreshFamily(rec.family_id, 'code_redirect_mismatch');
    throw new OAuthError('invalid_grant', 'redirect_uri does not match the authorization request.');
  }
  if (!verifyPkce(verifier, rec.code_challenge)) {
    await revokeRefreshFamily(rec.family_id, 'pkce_failed');
    throw new OAuthError('invalid_grant', 'PKCE verification failed.');
  }
  if (resourceParam) {
    const r = normalizeResource(resourceParam);
    if (!r || r !== rec.resource) {
      throw new OAuthError('invalid_target', 'resource does not match the authorization request.');
    }
  }

  const tier = await tierForUid(rec.uid);
  const access_token = await signAccessToken(
    OAUTH_ISSUER,
    {
      sub: rec.uid,
      aud: rec.resource,
      client_id: client.client_id,
      scope: rec.scope,
      tier,
      grant: GRANT_AUTH_CODE,
      client_kind: 'user',
    },
    ACCESS_TOKEN_TTL,
    randomUUID()
  );
  const out: TokenResponse = { access_token, token_type: 'Bearer', expires_in: ACCESS_TOKEN_TTL, scope: rec.scope };
  // A refresh token only for clients that registered the grant (a client that
  // did not cannot use it, and an unusable secret is just a liability).
  if (client.grant_types.includes(GRANT_REFRESH)) {
    out.refresh_token = await issueRefreshToken({
      uid: rec.uid,
      client_id: client.client_id,
      scope: rec.scope,
      resource: rec.resource,
      family_id: rec.family_id,
    });
  }
  if (client.source === 'dcr') await touchClient(client.client_id, 'dcr');
  return out;
}

export async function handleRefreshTokenGrant(
  client: ResolvedClient,
  form: URLSearchParams
): Promise<TokenResponse> {
  if (!client.grant_types.includes(GRANT_REFRESH)) {
    throw new OAuthError('unauthorized_client', 'This client cannot use the refresh_token grant.');
  }
  const token = form.get('refresh_token') || '';
  if (!token) throw new OAuthError('invalid_request', 'refresh_token is required.');

  const rec = await rotateRefreshToken(token);
  if (rec === null) throw new OAuthError('invalid_grant', 'Refresh token is invalid or expired.');
  if (rec === 'reused') {
    // Rotated token presented again: assume theft, revoke every token in the
    // family (OAuth 2.1 §4.3.1). The legitimate client re-authorizes.
    await revokeRefreshTokenByValue(token, 'refresh_reuse');
    console.warn('oauth: refresh token reuse detected; family revoked');
    throw new OAuthError('invalid_grant', 'Refresh token was already used.');
  }
  if (rec.client_id !== client.client_id) {
    await revokeRefreshFamily(rec.family_id, 'refresh_client_mismatch');
    throw new OAuthError('invalid_grant', 'Refresh token was issued to a different client.');
  }
  // A narrower scope may be requested, never a wider one; we have one scope.
  const scope = form.get('scope') ? validateScope(form.get('scope')) : rec.scope;
  const resourceParam = form.get('resource');
  if (resourceParam) {
    const r = normalizeResource(resourceParam);
    if (!r || r !== rec.resource) {
      throw new OAuthError('invalid_target', 'resource does not match the original grant.');
    }
  }

  // Re-check the subscription on every refresh: a lapsed subscriber's next
  // access token is `free`, at most ACCESS_TOKEN_TTL after the lapse.
  const tier = await tierForUid(rec.uid);
  const access_token = await signAccessToken(
    OAUTH_ISSUER,
    {
      sub: rec.uid,
      aud: rec.resource,
      client_id: client.client_id,
      scope,
      tier,
      grant: GRANT_REFRESH,
      client_kind: 'user',
    },
    ACCESS_TOKEN_TTL,
    randomUUID()
  );
  const refresh_token = await issueRefreshToken({
    uid: rec.uid,
    client_id: client.client_id,
    scope,
    resource: rec.resource,
    family_id: rec.family_id,
  });
  return { access_token, token_type: 'Bearer', expires_in: ACCESS_TOKEN_TTL, scope, refresh_token };
}

export async function handleClientCredentialsGrant(
  client: ResolvedClient,
  form: URLSearchParams
): Promise<TokenResponse> {
  if (client.source !== 'machine' || !client.uid || !client.grant_types.includes(GRANT_CLIENT_CREDENTIALS)) {
    throw new OAuthError(
      'unauthorized_client',
      'client_credentials is available only to machine clients created on gammarips.com/account.'
    );
  }
  const scope = validateScope(form.get('scope'));
  const resource = normalizeResource(form.get('resource'));
  if (!resource) throw new OAuthError('invalid_target', 'resource is not a GammaRips MCP server URL.');

  const tier = await tierForUid(client.uid);
  const access_token = await signAccessToken(
    OAUTH_ISSUER,
    {
      sub: client.uid,
      aud: resource,
      client_id: client.client_id,
      scope,
      tier,
      grant: GRANT_CLIENT_CREDENTIALS,
      client_kind: 'machine',
    },
    MACHINE_TOKEN_TTL,
    randomUUID()
  );
  await touchClient(client.client_id, 'machine');
  return { access_token, token_type: 'Bearer', expires_in: MACHINE_TOKEN_TTL, scope };
}
