/**
 * Per-client OAuth profile probe against a LIVE authorization server + MCP.
 *
 * `e2e.ts` proves the protocol. This proves the SHAPES real clients actually
 * send: each vendor registers a different redirect style and authenticates at
 * the token endpoint a different way, and those are the parts that can fail on
 * OUR side. What this cannot cover is a vendor's own UI wiring, which is their
 * code; for that a human still has to press the button once per product.
 *
 * Each profile runs the full flow end to end: register (DCR, a client-ID
 * metadata document, or a confidential client with a secret), authorize,
 * consent, exchange, connect to /pro, list tools, and call a PRO tool.
 *
 * Usage (prod):
 *   GOOGLE_CLOUD_PROJECT=profitscout-fida8 FIREBASE_CLIENT_EMAIL= FIREBASE_PRIVATE_KEY= \
 *   NEXT_PUBLIC_FIREBASE_API_KEY=<live public web key> \
 *   AS_URL=https://gammarips.com MCP_URL=https://mcp.gammarips.com \
 *   npx tsx scripts/oauth/client-profiles.ts
 *
 * Creates one throwaway Firebase user and deletes it, plus every client and
 * token it registers. It never touches a real customer's account.
 */
import 'dotenv/config';
import assert from 'node:assert/strict';
import { randomBytes, createHash } from 'node:crypto';
import { initializeApp, applicationDefault, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const AS = (process.env.AS_URL || 'http://localhost:3000').replace(/\/$/, '');
const MCP = (process.env.MCP_URL || 'http://localhost:8080').replace(/\/$/, '');
const PRO = `${MCP}/pro`;
const PROJECT = process.env.GOOGLE_CLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || 'profitscout-fida8';
const WEB_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '';
const RUN = randomBytes(3).toString('hex');
const UID = `oauth-prof-${RUN}`;
const TEMP_PASSWORD = randomBytes(18).toString('base64url');

if (!WEB_API_KEY) {
  console.error('NEXT_PUBLIC_FIREBASE_API_KEY is required (the .env one is stale; take the live public key from the site bundle)');
  process.exit(2);
}
if (!getApps().length) initializeApp({ credential: applicationDefault(), projectId: PROJECT });
const db = getFirestore();

const createdClientIds: string[] = [];

// How the client proves itself at /oauth/token.
type TokenAuth = 'none' | 'client_secret_basic' | 'client_secret_post';

type Profile = {
  /** Display name. */
  client: string;
  /** What the vendor's client actually sends as redirect_uri. */
  redirect: string;
  /** A second redirect registered alongside, as several clients do. */
  alsoRegister?: string[];
  /** The redirect actually used at authorize time, if it differs (ephemeral port). */
  requestRedirect?: string;
  /** Registration style. */
  register: 'dcr' | 'cimd';
  /** A client-ID metadata document URL, for register: 'cimd'. */
  metadataUrl?: string;
  tokenAuth: TokenAuth;
  /** Why this shape is in the list. */
  note: string;
};

// Redirect values come from each vendor's own docs (engine repo:
// docs/GTM-CLIENT-CONNECT-MATRIX.md carries the source URLs). Where a vendor
// does not publish its callback, the profile still proves the SHAPE, which is
// what our server validates.
const PROFILES: Profile[] = [
  {
    client: 'Claude Code',
    register: 'cimd',
    metadataUrl: 'https://claude.ai/oauth/claude-code-client-metadata',
    redirect: 'http://localhost/callback',
    requestRedirect: 'http://localhost:53127/callback',
    tokenAuth: 'none',
    note: 'client-ID metadata document + ephemeral loopback port',
  },
  {
    client: 'claude.ai / Claude Desktop',
    register: 'dcr',
    redirect: 'https://claude.ai/api/mcp/auth_callback',
    tokenAuth: 'none',
    note: 'hosted web callback, public client (PKCE only)',
  },
  {
    client: 'ChatGPT (public client)',
    register: 'dcr',
    redirect: 'https://chatgpt.com/connector_platform_oauth_redirect',
    tokenAuth: 'none',
    note: 'hosted web callback, dynamic registration',
  },
  {
    client: 'ChatGPT (confidential client)',
    register: 'dcr',
    redirect: 'https://chatgpt.com/connector_platform_oauth_redirect',
    tokenAuth: 'client_secret_basic',
    note: 'the static client id + secret option, HTTP Basic at the token endpoint',
  },
  {
    client: 'ChatGPT (secret in body)',
    register: 'dcr',
    redirect: 'https://chatgpt.com/connector_platform_oauth_redirect',
    tokenAuth: 'client_secret_post',
    note: 'same, secret in the form body',
  },
  {
    client: 'Cursor',
    register: 'dcr',
    redirect: 'cursor://anysphere.cursor-retrieval/oauth/user-mcp/callback',
    tokenAuth: 'none',
    note: 'private-use scheme (RFC 8252 §7.1)',
  },
  {
    client: 'Codex CLI',
    register: 'dcr',
    redirect: 'http://localhost:1455/auth/callback',
    tokenAuth: 'none',
    note: 'fixed loopback port',
  },
  {
    client: 'Gemini CLI',
    register: 'dcr',
    redirect: 'http://localhost/oauth2callback',
    requestRedirect: 'http://localhost:41739/oauth2callback',
    tokenAuth: 'none',
    note: 'ephemeral loopback port',
  },
  {
    client: 'Grok / generic web connector',
    register: 'dcr',
    redirect: 'https://grok.com/connectors/callback',
    tokenAuth: 'none',
    note: 'generic hosted callback; Grok does not publish its exact URL',
  },
  {
    client: 'Native client on 127.0.0.1',
    register: 'dcr',
    redirect: 'http://127.0.0.1:8765/callback',
    tokenAuth: 'none',
    note: 'the documented App Hosting residual; expected to fail on prod, pass on localhost',
  },
];

function b64url(b: Buffer) {
  return b.toString('base64url');
}

async function idToken(): Promise<string> {
  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${WEB_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Referer: process.env.E2E_REFERER || 'https://gammarips.com/' },
    body: JSON.stringify({ email: `${UID}@e2e.invalid`, password: TEMP_PASSWORD, returnSecureToken: true }),
  });
  const j = (await res.json()) as { idToken?: string; error?: unknown };
  if (!j.idToken) throw new Error('signInWithPassword failed: ' + JSON.stringify(j.error));
  return j.idToken;
}

async function registerDcr(p: Profile) {
  const redirects = [p.redirect, ...(p.alsoRegister || [])];
  const body: Record<string, unknown> = {
    client_name: `profile-probe ${p.client} ${RUN}`,
    redirect_uris: redirects,
    grant_types: ['authorization_code', 'refresh_token'],
    response_types: ['code'],
    token_endpoint_auth_method: p.tokenAuth,
  };
  const res = await fetch(`${AS}/oauth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const j = (await res.json()) as any;
  if (res.status !== 201 && res.status !== 200) throw new Error(`register ${res.status}: ${JSON.stringify(j)}`);
  createdClientIds.push(j.client_id);
  return j as { client_id: string; client_secret?: string };
}

/** Runs one profile all the way to a pro tool call. Returns a verdict row. */
async function runProfile(p: Profile) {
  const verifier = b64url(randomBytes(32));
  const challenge = b64url(createHash('sha256').update(verifier).digest());
  const state = 'st-' + b64url(randomBytes(9));

  let clientId: string;
  let clientSecret: string | undefined;
  if (p.register === 'cimd') {
    clientId = p.metadataUrl!;
    createdClientIds.push(clientId);
  } else {
    const reg = await registerDcr(p);
    clientId = reg.client_id;
    clientSecret = reg.client_secret;
    if (p.tokenAuth !== 'none' && !clientSecret) throw new Error('expected a client_secret for a confidential client');
  }

  const usedRedirect = p.requestRedirect || p.redirect;
  const au = new URL(`${AS}/oauth/authorize`);
  au.searchParams.set('response_type', 'code');
  au.searchParams.set('client_id', clientId);
  au.searchParams.set('redirect_uri', usedRedirect);
  au.searchParams.set('code_challenge', challenge);
  au.searchParams.set('code_challenge_method', 'S256');
  au.searchParams.set('state', state);
  au.searchParams.set('scope', 'mcp:read');
  au.searchParams.set('resource', PRO);

  const r1 = await fetch(au, { redirect: 'manual' });
  if (r1.status !== 302) {
    return { p, ok: false, stage: 'authorize', detail: `${r1.status} ${(await r1.text()).slice(0, 120).replace(/\s+/g, ' ')}` };
  }
  const consent = new URL(r1.headers.get('location')!, AS);
  if (consent.pathname !== '/oauth/consent') {
    return { p, ok: false, stage: 'authorize', detail: `redirected to ${consent.pathname}` };
  }
  const rid = consent.searchParams.get('rid')!;

  const decide = await fetch(`${AS}/oauth/consent/decide`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rid, idToken: await idToken(), decision: 'allow' }),
  });
  if (decide.status !== 200) {
    return { p, ok: false, stage: 'consent', detail: `${decide.status} ${(await decide.text()).slice(0, 120)}` };
  }
  const { redirect_to } = (await decide.json()) as { redirect_to: string };
  const back = new URL(redirect_to);
  if (back.searchParams.get('state') !== state) {
    return { p, ok: false, stage: 'consent', detail: 'state did not round-trip' };
  }
  if (back.searchParams.get('iss') !== AS) {
    return { p, ok: false, stage: 'consent', detail: 'iss missing (RFC 9207)' };
  }
  const code = back.searchParams.get('code');
  if (!code) return { p, ok: false, stage: 'consent', detail: `no code: ${back.searchParams.get('error')}` };
  // The callback host must be the client's own, untouched.
  if (`${back.protocol}//${back.host}` !== `${new URL(usedRedirect).protocol}//${new URL(usedRedirect).host}`) {
    return { p, ok: false, stage: 'consent', detail: `code went to ${back.host}, not ${new URL(usedRedirect).host}` };
  }

  const form: Record<string, string> = {
    grant_type: 'authorization_code',
    code,
    redirect_uri: usedRedirect,
    code_verifier: verifier,
    resource: PRO,
  };
  const headers: Record<string, string> = { 'Content-Type': 'application/x-www-form-urlencoded' };
  if (p.tokenAuth === 'client_secret_basic') {
    headers.Authorization = 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  } else if (p.tokenAuth === 'client_secret_post') {
    form.client_id = clientId;
    form.client_secret = clientSecret!;
  } else {
    form.client_id = clientId;
  }
  const tok = await fetch(`${AS}/oauth/token`, { method: 'POST', headers, body: new URLSearchParams(form) });
  const tj = (await tok.json()) as any;
  if (tok.status !== 200 || !tj.access_token) {
    return { p, ok: false, stage: 'token', detail: `${tok.status} ${JSON.stringify(tj).slice(0, 160)}` };
  }
  const claims = JSON.parse(Buffer.from(tj.access_token.split('.')[1], 'base64url').toString('utf8'));
  if (claims.aud !== PRO) return { p, ok: false, stage: 'token', detail: `aud=${claims.aud}` };
  if (claims.tier !== 'pro') return { p, ok: false, stage: 'token', detail: `tier=${claims.tier}` };

  // Use it: initialize, list tools, then call a PRO tool on /pro.
  const rpc = async (body: unknown, sid?: string) =>
    fetch(PRO, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
        Authorization: `Bearer ${tj.access_token}`,
        ...(sid ? { 'Mcp-Session-Id': sid } : {}),
      },
      body: JSON.stringify(body),
    });

  const init = await rpc({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2025-06-18',
      capabilities: {},
      clientInfo: { name: 'gammarips-profile-probe', version: '1.0.0' },
    },
  });
  if (init.status !== 200) return { p, ok: false, stage: 'mcp/initialize', detail: `${init.status}` };
  const sid = init.headers.get('mcp-session-id') || undefined;
  await rpc({ jsonrpc: '2.0', method: 'notifications/initialized' }, sid);

  const listed = await rpc({ jsonrpc: '2.0', id: 2, method: 'tools/list' }, sid);
  const listText = await listed.text();
  // Streamable HTTP may answer as SSE, so dig the JSON payload out either way.
  // Count the tools ARRAY, never `"name":` occurrences: tool input schemas
  // contain their own `name` properties and inflate a regex count.
  const payload = listText.match(/^data: (\{.*\})$/m)?.[1] ?? listText;
  let toolCount = 0;
  try {
    toolCount = (JSON.parse(payload).result?.tools ?? []).length;
  } catch {
    return { p, ok: false, stage: 'mcp/tools-list', detail: 'unparseable tools/list response' };
  }
  if (listed.status !== 200 || toolCount < 9) {
    return { p, ok: false, stage: 'mcp/tools-list', detail: `${listed.status}, ${toolCount} tools` };
  }

  // query_outcomes is a PRO tool: this is the real entitlement check.
  const called = await rpc(
    { jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'query_outcomes', arguments: { view: 'win_rate', days: 30 } } },
    sid
  );
  const callText = await called.text();
  if (callText.includes('subscription_required')) {
    return { p, ok: false, stage: 'mcp/pro-tool', detail: 'pro tool denied for a tier=pro token' };
  }
  if (called.status !== 200) return { p, ok: false, stage: 'mcp/pro-tool', detail: `${called.status}` };

  return { p, ok: true, stage: 'done', detail: `${toolCount} tools, pro tool served` };
}

async function cleanup() {
  for (const col of ['oauth_codes', 'oauth_refresh_tokens', 'oauth_requests']) {
    for (const cid of createdClientIds) {
      const q = await db.collection(col).where('client_id', '==', cid).get();
      if (!q.size) continue;
      const batch = db.batch();
      q.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
  }
  for (const cid of createdClientIds) {
    if (!cid.startsWith('https://')) await db.collection('oauth_clients').doc(cid).delete().catch(() => {});
  }
  await db.collection('users').doc(UID).delete().catch(() => {});
  await getAuth().deleteUser(UID).catch(() => {});
}

async function main() {
  await getAuth().createUser({ uid: UID, email: `${UID}@e2e.invalid`, password: TEMP_PASSWORD, emailVerified: true });
  await db.collection('users').doc(UID).set({
    uid: UID,
    email: `${UID}@e2e.invalid`,
    isSubscribed: true,
    subscriptionStatus: 'founder_lifetime',
    plan: 'pro',
    createdAt: new Date(),
    e2e: true,
  });
  console.log(`AS  ${AS}\nMCP ${PRO}\n`);

  const rows: Awaited<ReturnType<typeof runProfile>>[] = [];
  for (const p of PROFILES) {
    let row: Awaited<ReturnType<typeof runProfile>>;
    try {
      row = await runProfile(p);
    } catch (e) {
      row = { p, ok: false, stage: 'threw', detail: String(e).slice(0, 160) };
    }
    rows.push(row);
    console.log(`${row.ok ? 'PASS' : 'FAIL'}  ${p.client.padEnd(30)} ${row.ok ? row.detail : row.stage + ': ' + row.detail}`);
  }

  console.log('\n--- shapes ---');
  for (const r of rows) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.p.note}`);
  const failures = rows.filter((r) => !r.ok);
  console.log(`\n${rows.length - failures.length}/${rows.length} profiles reached a pro tool on ${PRO}`);
  return failures;
}

main()
  .then(async (failures) => {
    await cleanup();
    console.log('cleanup done');
    process.exit(failures.length ? 1 : 0);
  })
  .catch(async (e) => {
    console.error('\nPROBE FAILED:', e);
    await cleanup();
    console.log('cleanup done');
    process.exit(1);
  });
