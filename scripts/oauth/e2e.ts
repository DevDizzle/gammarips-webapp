/**
 * End-to-end check of the OAuth 2.1 authorization server against a running
 * MCP resource server, driven by the REAL MCP SDK client (the same auth code
 * Claude Code, the Inspector, and other TS clients use).
 *
 * Flows:
 *   A. Dynamic client registration + authorization_code + PKCE + consent,
 *      tokens used on MCP /pro, refresh rotation, refresh-reuse revocation,
 *      code replay rejection.
 *   B. Client ID Metadata Document (Claude Code's real metadata URL) +
 *      loopback redirect on an ephemeral port.
 *   C. Machine client: client_credentials -> token -> MCP /pro (headless path).
 *   D. A non-subscriber gets tier=free: /pro admits, pro tool bounces.
 *
 * Usage (local): start `next dev` with ADC + GOOGLE_CLOUD_PROJECT set, start the
 * MCP with OAUTH_ISSUER/OAUTH_JWKS_URL/OAUTH_MCP_RESOURCE_ORIGINS pointing at it,
 * then:
 *   GOOGLE_CLOUD_PROJECT=profitscout-fida8 FIREBASE_CLIENT_EMAIL= FIREBASE_PRIVATE_KEY= \
 *   AS_URL=http://localhost:3000 MCP_URL=http://localhost:8080 npx tsx scripts/oauth/e2e.ts
 *
 * It creates two throwaway Firebase Auth users (one with a founder_lifetime
 * user doc => tier pro, one with no doc => tier free), signs them in with the
 * Identity Toolkit REST API (NEXT_PUBLIC_FIREBASE_API_KEY) for the consent
 * step, writes oauth_* docs, and deletes everything it created at the end.
 * It never touches a real customer's account.
 */
import 'dotenv/config';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { initializeApp, applicationDefault, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { UnauthorizedError } from '@modelcontextprotocol/sdk/client/auth.js';
import type { OAuthClientProvider } from '@modelcontextprotocol/sdk/client/auth.js';
import type {
  OAuthClientInformationMixed,
  OAuthClientMetadata,
  OAuthTokens,
} from '@modelcontextprotocol/sdk/shared/auth.js';

const AS = (process.env.AS_URL || 'http://localhost:3000').replace(/\/$/, '');
const MCP = (process.env.MCP_URL || 'http://localhost:8080').replace(/\/$/, '');
const PRO = `${MCP}/pro`;
const PROJECT = process.env.GOOGLE_CLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || 'profitscout-fida8';
const WEB_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '';
const RUN = Math.random().toString(36).slice(2, 8);
const UID = `oauth-e2e-pro-${RUN}`;
const FREE_UID = `oauth-e2e-free-${RUN}`;
// Throwaway credential for the two temp Auth users this run creates and then
// deletes. Generated per run; nothing here is a stored or shared secret.
const TEMP_USER_PASSWORD = randomBytes(18).toString('base64url');

if (!WEB_API_KEY) {
  console.error('NEXT_PUBLIC_FIREBASE_API_KEY is required');
  process.exit(2);
}

if (!getApps().length) {
  initializeApp({ credential: applicationDefault(), projectId: PROJECT });
}
const db = getFirestore();
const createdClientIds: string[] = [];
let step = 0;
function log(msg: string) {
  step += 1;
  console.log(`[${String(step).padStart(2, '0')}] ${msg}`);
}

async function setupUsers() {
  await getAuth().createUser({ uid: UID, email: `${UID}@e2e.invalid`, password: TEMP_USER_PASSWORD, emailVerified: true });
  await getAuth().createUser({ uid: FREE_UID, email: `${FREE_UID}@e2e.invalid`, password: TEMP_USER_PASSWORD, emailVerified: true });
  // The pro user: a founder_lifetime doc is what isUserMcpEntitledAdmin honors
  // without Stripe. The free user has no doc at all.
  await db.collection('users').doc(UID).set({
    uid: UID,
    email: `${UID}@e2e.invalid`,
    isSubscribed: true,
    subscriptionStatus: 'founder_lifetime',
    plan: 'pro',
    createdAt: new Date(),
    e2e: true,
  });
}

async function idTokenFor(uid: string): Promise<string> {
  // The browser key is referrer-restricted to the site's origins; the
  // e2e speaks as the site would.
  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${WEB_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Referer: process.env.E2E_REFERER || 'https://gammarips.com/' },
    body: JSON.stringify({ email: `${uid}@e2e.invalid`, password: TEMP_USER_PASSWORD, returnSecureToken: true }),
  });
  const j = (await res.json()) as { idToken?: string; error?: unknown };
  if (!j.idToken) throw new Error('signInWithPassword failed: ' + JSON.stringify(j.error));
  return j.idToken;
}

/** Plays the browser: follow the authorize redirect to consent, approve as `uid`, return the final redirect. */
async function browserApprove(authorizeUrl: URL, uid: string, decision: 'allow' | 'deny' = 'allow'): Promise<URL> {
  const r1 = await fetch(authorizeUrl, { redirect: 'manual' });
  assert.equal(r1.status, 302, `authorize should 302, got ${r1.status}`);
  const consent = new URL(r1.headers.get('location')!, AS);
  assert.equal(consent.pathname, '/oauth/consent');
  const rid = consent.searchParams.get('rid')!;
  assert.ok(rid, 'consent URL carries rid');
  assert.equal(consent.searchParams.get('redirect'), `/oauth/consent?rid=${encodeURIComponent(rid)}`);
  const page = await fetch(consent);
  assert.equal(page.status, 200);
  const idToken = await idTokenFor(uid);
  const r2 = await fetch(`${AS}/oauth/consent/decide`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rid, idToken, decision }),
  });
  const r2Text = await r2.text();
  assert.equal(r2.status, 200, `decide: ${r2.status} ${r2Text}`);
  const { redirect_to } = JSON.parse(r2Text) as { redirect_to: string };
  // second decision on the same rid must fail (single use)
  const r3 = await fetch(`${AS}/oauth/consent/decide`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rid, idToken, decision }),
  });
  assert.equal(r3.status, 410, 'rid is single use');
  return new URL(redirect_to);
}

class MemoryProvider implements OAuthClientProvider {
  info: OAuthClientInformationMixed | undefined;
  toks: OAuthTokens | undefined;
  verifier = '';
  authorizeUrl: URL | undefined;
  constructor(
    public readonly redirectUrl: string,
    public readonly clientMetadata: OAuthClientMetadata,
    public readonly clientMetadataUrl?: string
  ) {}
  state() {
    return 'st-' + Math.random().toString(36).slice(2);
  }
  clientInformation() {
    return this.info;
  }
  saveClientInformation(i: OAuthClientInformationMixed) {
    this.info = i;
    if (i.client_id) createdClientIds.push(i.client_id);
  }
  tokens() {
    return this.toks;
  }
  saveTokens(t: OAuthTokens) {
    this.toks = t;
  }
  redirectToAuthorization(url: URL) {
    this.authorizeUrl = url;
  }
  saveCodeVerifier(v: string) {
    this.verifier = v;
  }
  codeVerifier() {
    return this.verifier;
  }
}

async function connectOnce(provider: OAuthClientProvider) {
  const transport = new StreamableHTTPClientTransport(new URL(PRO), { authProvider: provider });
  const client = new Client({ name: 'gammarips-e2e', version: '1.0.0' });
  try {
    await client.connect(transport);
    return { client, transport, unauthorized: false as const };
  } catch (e) {
    if (e instanceof UnauthorizedError) return { client, transport, unauthorized: true as const };
    throw e;
  }
}

async function decodeJwt(token: string) {
  const [, payload] = token.split('.');
  return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
}

async function fullCodeFlow(provider: MemoryProvider, uid: string, label: string) {
  const first = await connectOnce(provider);
  assert.equal(first.unauthorized, true, `${label}: first connect must be unauthorized`);
  assert.ok(provider.authorizeUrl, `${label}: provider was sent to authorize`);
  const au = provider.authorizeUrl!;
  assert.equal(au.origin + au.pathname, `${AS}/oauth/authorize`);
  assert.equal(au.searchParams.get('code_challenge_method'), 'S256');
  assert.equal(au.searchParams.get('resource'), PRO);
  log(`${label}: authorize URL ok (client_id=${au.searchParams.get('client_id')!.slice(0, 40)}...)`);

  const back = await browserApprove(au, uid);
  assert.equal(back.searchParams.get('state'), au.searchParams.get('state'), 'state round-trips');
  assert.equal(back.searchParams.get('iss'), AS, 'RFC 9207 iss present');
  const code = back.searchParams.get('code')!;
  assert.ok(code);
  log(`${label}: consent approved, code returned to ${back.origin}${back.pathname}`);

  await first.transport.finishAuth(code);
  assert.ok(provider.toks?.access_token, `${label}: tokens saved`);
  const claims = await decodeJwt(provider.toks!.access_token);
  assert.equal(claims.iss, AS);
  assert.equal(claims.aud, PRO);
  assert.equal(claims.sub, uid);
  log(`${label}: token exchanged (tier=${claims.tier}, client_kind=${claims.client_kind}, exp-iat=${claims.exp - claims.iat}s)`);

  const second = await connectOnce(provider);
  assert.equal(second.unauthorized, false, `${label}: connect with token`);
  const tools = await second.client.listTools();
  assert.ok(tools.tools.length >= 9, `${label}: tools listed (${tools.tools.length})`);
  log(`${label}: connected to /pro, ${tools.tools.length} tools`);
  return { provider, client: second.client, transport: second.transport, code, claims };
}

async function tokenPost(form: Record<string, string>, basic?: [string, string]) {
  const headers: Record<string, string> = { 'Content-Type': 'application/x-www-form-urlencoded' };
  if (basic) headers.Authorization = 'Basic ' + Buffer.from(`${basic[0]}:${basic[1]}`).toString('base64');
  const res = await fetch(`${AS}/oauth/token`, { method: 'POST', headers, body: new URLSearchParams(form) });
  return { status: res.status, json: (await res.json()) as any };
}

async function cleanup() {
  for (const col of ['oauth_codes', 'oauth_refresh_tokens', 'oauth_requests']) {
    for (const cid of createdClientIds) {
      const q = await db.collection(col).where('client_id', '==', cid).get();
      const batch = db.batch();
      q.docs.forEach((d) => batch.delete(d.ref));
      if (q.size) await batch.commit();
    }
  }
  for (const cid of createdClientIds) {
    if (!cid.startsWith('https://')) await db.collection('oauth_clients').doc(cid).delete().catch(() => {});
  }
  await db.collection('users').doc(UID).delete().catch(() => {});
  await getAuth().deleteUser(UID).catch(() => {});
  await getAuth().deleteUser(FREE_UID).catch(() => {});
}

async function main() {
  await setupUsers();
  log(`temp users created (${UID} pro via founder_lifetime doc, ${FREE_UID} free)`);

  // --- A. DCR + code flow ---------------------------------------------------
  const a = new MemoryProvider('http://localhost:54321/callback', {
    client_name: 'gammarips e2e (dcr)',
    redirect_uris: ['http://localhost:54321/callback'],
    grant_types: ['authorization_code', 'refresh_token'],
    response_types: ['code'],
    token_endpoint_auth_method: 'none',
    scope: 'mcp:read',
  });
  const A = await fullCodeFlow(a, UID, 'A/dcr');
  assert.equal(A.claims.tier, 'pro', 'entitled uid gets tier=pro');
  const cal = await A.client.callTool({ name: 'get_market_calendar_status', arguments: {} });
  assert.equal(cal.isError ?? false, false);
  const pro = await A.client.callTool({ name: 'query_outcomes', arguments: { view: 'win_rate', days: 30 } });
  const proText = JSON.stringify(pro.content);
  assert.ok(!proText.includes('subscription_required'), 'pro tool allowed for tier=pro: ' + proText.slice(0, 200));
  log('A: free + pro tool calls succeeded through /pro with the OAuth token');

  // refresh rotation
  const rt1 = a.toks!.refresh_token!;
  const ref1 = await tokenPost({ grant_type: 'refresh_token', refresh_token: rt1, client_id: a.info!.client_id });
  assert.equal(ref1.status, 200, JSON.stringify(ref1.json));
  assert.ok(ref1.json.access_token && ref1.json.refresh_token && ref1.json.refresh_token !== rt1);
  log('A: refresh rotated (new access + new refresh token)');
  // reuse of the rotated token -> family revoked, incl. the new token
  const reuse = await tokenPost({ grant_type: 'refresh_token', refresh_token: rt1, client_id: a.info!.client_id });
  assert.equal(reuse.json.error, 'invalid_grant');
  const afterReuse = await tokenPost({
    grant_type: 'refresh_token',
    refresh_token: ref1.json.refresh_token,
    client_id: a.info!.client_id,
  });
  assert.equal(afterReuse.json.error, 'invalid_grant', 'whole family revoked on reuse');
  log('A: refresh-token reuse revoked the family');

  // code replay -> invalid_grant (and it revokes the family too)
  const replay = await tokenPost({
    grant_type: 'authorization_code',
    code: A.code,
    redirect_uri: a.redirectUrl,
    client_id: a.info!.client_id,
    code_verifier: a.verifier,
    resource: PRO,
  });
  assert.equal(replay.status, 400);
  assert.equal(replay.json.error, 'invalid_grant');
  log('A: authorization code replay rejected (invalid_grant)');
  await A.transport.close();

  // wrong client on a valid code path: register a second DCR client and try to redeem A's... (code already used) — covered by replay.

  // --- B. CIMD (Claude Code's real metadata) --------------------------------
  const b = new MemoryProvider(
    'http://localhost:3118/callback',
    {
      client_name: 'Claude Code (e2e)',
      redirect_uris: ['http://localhost/callback'],
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
      token_endpoint_auth_method: 'none',
    },
    'https://claude.ai/oauth/claude-code-client-metadata'
  );
  const B = await fullCodeFlow(b, UID, 'B/cimd');
  assert.equal(B.claims.client_id, 'https://claude.ai/oauth/claude-code-client-metadata');
  log('B: Claude Code CIMD client id accepted, ephemeral-port loopback redirect matched');
  await B.transport.close();

  // --- C. machine client (client_credentials) -------------------------------
  const { createMachineClient } = await import('../../src/lib/oauth/clients');
  const mc = await createMachineClient(UID, 'e2e machine');
  createdClientIds.push(mc.client_id);
  const cc = await tokenPost({ grant_type: 'client_credentials', resource: PRO }, [mc.client_id, mc.client_secret]);
  assert.equal(cc.status, 200, JSON.stringify(cc.json));
  const ccClaims = await decodeJwt(cc.json.access_token);
  assert.equal(ccClaims.client_kind, 'machine');
  assert.equal(ccClaims.tier, 'pro');
  assert.equal(cc.json.refresh_token, undefined, 'no refresh token for machine clients');
  // bad secret -> 401 invalid_client
  const bad = await tokenPost({ grant_type: 'client_credentials', resource: PRO }, [mc.client_id, 'gr_ms_wrong']);
  assert.equal(bad.status, 401);
  assert.equal(bad.json.error, 'invalid_client');
  // use it on /pro as a plain bearer (what a VM agent does)
  const t = new StreamableHTTPClientTransport(new URL(PRO), {
    requestInit: { headers: { Authorization: `Bearer ${cc.json.access_token}` } },
  });
  const c = new Client({ name: 'gammarips-e2e-machine', version: '1.0.0' });
  await c.connect(t);
  const tl = await c.listTools();
  assert.ok(tl.tools.length >= 9);
  const proC = await c.callTool({ name: 'query_outcomes', arguments: { view: 'win_rate', days: 30 } });
  assert.ok(!JSON.stringify(proC.content).includes('subscription_required'));
  await t.close();
  log('C: machine client minted a token (client_credentials) and used /pro headless');
  // revoke -> further mints fail
  const { revokeClient } = await import('../../src/lib/oauth/store');
  assert.equal(await revokeClient(mc.client_id, UID, 'e2e'), true);
  const afterRevoke = await tokenPost({ grant_type: 'client_credentials', resource: PRO }, [mc.client_id, mc.client_secret]);
  assert.equal(afterRevoke.status, 401);
  log('C: revoked machine client can no longer mint');

  // --- D. non-subscriber: tier=free -----------------------------------------
  // localhost, not 127.0.0.1: the App Hosting edge rewrites a literal
  // "127.0.0.1" token in a query param (SSRF normalization), so a 127.0.0.1
  // redirect_uri fails on prod though it passes locally. See the decision note.
  const d = new MemoryProvider('http://localhost:40000/callback', {
    client_name: 'gammarips e2e (free)',
    redirect_uris: ['http://localhost/callback'],
    grant_types: ['authorization_code', 'refresh_token'],
    response_types: ['code'],
    token_endpoint_auth_method: 'none',
  });
  const D = await fullCodeFlow(d, FREE_UID, 'D/free');
  assert.equal(D.claims.tier, 'free');
  const freeOk = await D.client.callTool({ name: 'get_pool', arguments: { view: 'preview' } });
  assert.ok(!JSON.stringify(freeOk.content).includes('subscription_required'));
  // The denial is a JSON-RPC error (code -32001, data.code=subscription_required);
  // the SDK surfaces it as McpError.
  let deniedText = '';
  try {
    const r = await D.client.callTool({ name: 'query_outcomes', arguments: { view: 'win_rate', days: 30 } });
    deniedText = JSON.stringify(r);
  } catch (e: any) {
    deniedText = `${e?.code} ${e?.message}`;
    assert.equal(e?.code, -32001, 'denial error code');
  }
  assert.ok(deniedText.includes('requires GammaRips Pro'), 'free tier bounces on a pro tool: ' + deniedText.slice(0, 300));
  log('D: free-tier token admitted to /pro; pro tool returned the subscription_required envelope');
  await D.transport.close();

  // --- negative: deny ---------------------------------------------------------
  const e = new MemoryProvider('http://localhost:1/callback', {
    client_name: 'gammarips e2e (deny)',
    redirect_uris: ['http://localhost/callback'],
    grant_types: ['authorization_code'],
    response_types: ['code'],
    token_endpoint_auth_method: 'none',
  });
  const first = await connectOnce(e);
  assert.equal(first.unauthorized, true);
  const denied = await browserApprove(e.authorizeUrl!, UID, 'deny');
  assert.equal(denied.searchParams.get('error'), 'access_denied');
  assert.equal(denied.searchParams.get('iss'), AS);
  log('E: deny returns error=access_denied with state + iss');

  // --- negative: unregistered redirect_uri -> HTML 400, no redirect ----------
  const badAu = new URL(e.authorizeUrl!.toString());
  badAu.searchParams.set('redirect_uri', 'https://evil.example/cb');
  const badRes = await fetch(badAu, { redirect: 'manual' });
  assert.equal(badRes.status, 400);
  assert.ok((badRes.headers.get('content-type') || '').includes('text/html'));
  log('F: unregistered redirect_uri is a 400 page, never a redirect');

  // --- discovery documents ----------------------------------------------------
  const meta = (await (await fetch(`${AS}/.well-known/oauth-authorization-server`)).json()) as any;
  assert.equal(meta.issuer, AS);
  const prm = (await (await fetch(`${MCP}/.well-known/oauth-protected-resource/pro`)).json()) as any;
  assert.equal(prm.resource, PRO);
  assert.deepEqual(prm.authorization_servers, [AS]);
  const mirror = await fetch(`${MCP}/.well-known/oauth-authorization-server`);
  assert.equal(mirror.status, 200);
  assert.equal(((await mirror.json()) as any).issuer, AS);
  log('G: AS metadata, protected-resource metadata, and the MCP-side mirror agree');

  console.log('\nALL OAUTH E2E CHECKS PASSED');
}

main()
  .catch((e) => {
    console.error('\nE2E FAILED:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await cleanup();
    console.log('cleanup done (oauth_* docs for e2e clients deleted, temp users removed)');
  });
