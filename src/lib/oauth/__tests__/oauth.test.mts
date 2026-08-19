/**
 * Unit tests for the pure parts of the authorization server. Run with:
 *   npx tsx --test src/lib/oauth/__tests__/oauth.test.mts
 * No Firestore, no network: store.ts is not exercised here (see
 * scripts/oauth/e2e.ts for the live flow).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import { importSPKI, jwtVerify, createLocalJWKSet } from 'jose';

process.env.OAUTH_ISSUER = 'https://gammarips.com';
// Fresh RSA pair for the signer under test.
const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
process.env.OAUTH_SIGNING_KEY = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
process.env.OAUTH_SIGNING_KID = 'test-kid';

const { verifyPkce, s256, isValidCodeChallenge } = await import('../pkce');
const { parseRedirectUri, redirectUriMatches, findMatchingRedirectUri } = await import('../redirect');
const { normalizeResource } = await import('../resource');
const { authorizationServerMetadata } = await import('../metadata');
const { getJwks, signAccessToken } = await import('../keys');
const { parseCimdDocument, isCimdClientId, extractClientCredentials, validateScope } = await import('../clients');
const { OAuthError } = await import('../errors');

test('PKCE S256 verifies the matching verifier and rejects others', () => {
  const verifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
  const challenge = s256(verifier);
  assert.equal(isValidCodeChallenge(challenge), true);
  assert.equal(verifyPkce(verifier, challenge), true);
  assert.equal(verifyPkce(verifier + 'x', challenge), false);
  assert.equal(verifyPkce('short', challenge), false);
  assert.equal(verifyPkce(undefined, challenge), false);
});

test('redirect URIs: https any host, http loopback any port, private schemes, no fragments', () => {
  assert.ok(parseRedirectUri('https://chatgpt.com/connector_platform_oauth_redirect'));
  assert.ok(parseRedirectUri('https://claude.ai/api/mcp/auth_callback'));
  assert.ok(parseRedirectUri('http://localhost/callback'));
  assert.ok(parseRedirectUri('http://127.0.0.1:3118/callback'));
  assert.ok(parseRedirectUri('cursor://anysphere.cursor-mcp/oauth/callback'));
  assert.equal(parseRedirectUri('http://evil.example/callback'), null);
  assert.equal(parseRedirectUri('https://x.example/cb#frag'), null);
  assert.equal(parseRedirectUri('javascript:alert(1)'), null);
  assert.equal(parseRedirectUri('data:text/html,hi'), null);
  assert.equal(parseRedirectUri(''), null);
  assert.equal(parseRedirectUri(42), null);
});

test('loopback matching ignores the port (Claude Code CIMD registers no port)', () => {
  assert.equal(redirectUriMatches('http://localhost/callback', 'http://localhost:3118/callback'), true);
  assert.equal(redirectUriMatches('http://127.0.0.1/callback', 'http://127.0.0.1:54321/callback'), true);
  assert.equal(redirectUriMatches('http://localhost/callback', 'http://localhost:3118/other'), false);
  assert.equal(redirectUriMatches('http://localhost/callback', 'http://127.0.0.1:3118/callback'), false);
  assert.equal(redirectUriMatches('https://a.example/cb', 'https://a.example:8443/cb'), false);
  assert.equal(redirectUriMatches('https://a.example/cb', 'https://a.example/cb'), true);
  assert.equal(
    findMatchingRedirectUri(['http://localhost/callback', 'http://127.0.0.1/callback'], 'http://localhost:35535/callback'),
    'http://localhost:35535/callback'
  );
  assert.equal(findMatchingRedirectUri(['https://a.example/cb'], 'https://b.example/cb'), null);
});

test('resource indicators: only our MCP origins and paths', () => {
  assert.equal(normalizeResource(undefined), 'https://mcp.gammarips.com/pro');
  assert.equal(normalizeResource('https://mcp.gammarips.com/pro'), 'https://mcp.gammarips.com/pro');
  assert.equal(normalizeResource('https://MCP.gammarips.com/pro/'), 'https://mcp.gammarips.com/pro');
  assert.equal(normalizeResource('https://mcp.gammarips.com/mcp'), 'https://mcp.gammarips.com/mcp');
  assert.equal(normalizeResource('https://mcp.gammarips.com'), 'https://mcp.gammarips.com');
  assert.equal(normalizeResource('https://mcp.gammarips.com/other'), null);
  assert.equal(normalizeResource('https://evil.example/pro'), null);
  assert.equal(normalizeResource('http://mcp.gammarips.com/pro'), null);
  assert.equal(normalizeResource('https://mcp.gammarips.com/pro?x=1'), null);
  assert.equal(normalizeResource('https://mcp.gammarips.com/pro#f'), null);
});

test('AS metadata carries the MCP-required fields', () => {
  const m = authorizationServerMetadata();
  assert.equal(m.issuer, 'https://gammarips.com');
  assert.equal(m.authorization_endpoint, 'https://gammarips.com/oauth/authorize');
  assert.equal(m.token_endpoint, 'https://gammarips.com/oauth/token');
  assert.equal(m.registration_endpoint, 'https://gammarips.com/oauth/register');
  assert.equal(m.jwks_uri, 'https://gammarips.com/oauth/jwks');
  assert.deepEqual(m.code_challenge_methods_supported, ['S256']);
  assert.equal(m.client_id_metadata_document_supported, true);
  assert.equal(m.authorization_response_iss_parameter_supported, true);
  assert.ok((m.grant_types_supported as string[]).includes('client_credentials'));
});

test('access tokens are RS256 JWTs that verify against the published JWKS', async () => {
  const token = await signAccessToken(
    'https://gammarips.com',
    {
      sub: 'uid_123',
      aud: 'https://mcp.gammarips.com/pro',
      client_id: 'https://claude.ai/oauth/claude-code-client-metadata',
      scope: 'mcp:read',
      tier: 'pro',
      grant: 'authorization_code',
      client_kind: 'user',
    },
    3600,
    'jti-1'
  );
  const jwks = await getJwks();
  assert.equal(jwks.keys.length, 1);
  assert.equal(jwks.keys[0].kid, 'test-kid');
  assert.equal((jwks.keys[0] as any).d, undefined, 'private members must not be published');
  const { payload, protectedHeader } = await jwtVerify(token, createLocalJWKSet(jwks), {
    issuer: 'https://gammarips.com',
    audience: 'https://mcp.gammarips.com/pro',
  });
  assert.equal(protectedHeader.alg, 'RS256');
  assert.equal(protectedHeader.kid, 'test-kid');
  assert.equal(protectedHeader.typ, 'at+jwt');
  assert.equal(payload.sub, 'uid_123');
  assert.equal(payload.tier, 'pro');
  assert.equal(payload.client_kind, 'user');
  // The raw public key also verifies (what the Python side does with PyJWT).
  const spki = publicKey.export({ type: 'spki', format: 'pem' }).toString();
  await jwtVerify(token, await importSPKI(spki, 'RS256'), { issuer: 'https://gammarips.com' });
});

test('CIMD: Claude Code metadata document parses; mismatched client_id rejected', () => {
  const id = 'https://claude.ai/oauth/claude-code-client-metadata';
  const doc = {
    client_id: id,
    client_name: 'Claude Code',
    client_uri: 'https://claude.ai',
    redirect_uris: ['http://localhost/callback', 'http://127.0.0.1/callback'],
    grant_types: ['authorization_code', 'refresh_token'],
    response_types: ['code'],
    token_endpoint_auth_method: 'none',
  };
  assert.equal(isCimdClientId(id), true);
  assert.equal(isCimdClientId('https://claude.ai'), false, 'needs a path component');
  assert.equal(isCimdClientId('gr_dc_abc'), false);
  const rec = parseCimdDocument(id, doc);
  assert.equal(rec.client_name, 'Claude Code');
  assert.deepEqual(rec.redirect_uris, doc.redirect_uris);
  assert.throws(() => parseCimdDocument(id, { ...doc, client_id: 'https://claude.ai/other' }), OAuthError);
  assert.throws(() => parseCimdDocument(id, { ...doc, redirect_uris: ['http://evil.example/cb'] }), OAuthError);
  assert.throws(() => parseCimdDocument(id, { ...doc, token_endpoint_auth_method: 'private_key_jwt' }), OAuthError);
});

test('client credentials: Basic header wins, then body; none when absent', () => {
  const basic = 'Basic ' + Buffer.from('gr_mc_1:gr_ms_secret').toString('base64');
  assert.deepEqual(extractClientCredentials(basic, new URLSearchParams()), {
    client_id: 'gr_mc_1',
    client_secret: 'gr_ms_secret',
    via: 'basic',
  });
  assert.deepEqual(extractClientCredentials(null, new URLSearchParams('client_id=x&client_secret=y')), {
    client_id: 'x',
    client_secret: 'y',
    via: 'body',
  });
  assert.deepEqual(extractClientCredentials(null, new URLSearchParams('client_id=x')), {
    client_id: 'x',
    client_secret: null,
    via: 'none',
  });
});

test('scope: mcp:read only; offline_access tolerated; unknown rejected', () => {
  assert.equal(validateScope(undefined), 'mcp:read');
  assert.equal(validateScope('mcp:read offline_access'), 'mcp:read');
  assert.throws(() => validateScope('admin'), OAuthError);
});

test('post-sign-in redirect accepts only same-origin paths', async () => {
  const { safeLocalPath } = await import('../../safe-redirect');
  assert.equal(safeLocalPath('/oauth/consent?rid=abc'), '/oauth/consent?rid=abc');
  assert.equal(safeLocalPath('/account'), '/account');
  assert.equal(safeLocalPath(null), '/');
  assert.equal(safeLocalPath(''), '/');
  assert.equal(safeLocalPath('https://evil.example/x'), '/');
  assert.equal(safeLocalPath('//evil.example/x'), '/');
  assert.equal(safeLocalPath('/\\evil.example/x'), '/');
  assert.equal(safeLocalPath('javascript:alert(1)'), '/');
  assert.equal(safeLocalPath('/ok\nbad'), '/');
  assert.equal(safeLocalPath('account'), '/');
});
