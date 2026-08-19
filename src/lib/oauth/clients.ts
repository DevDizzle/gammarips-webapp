/**
 * Client registration and resolution:
 *   - Client ID Metadata Documents (draft-ietf-oauth-client-id-metadata-document):
 *     client_id is an https URL; we fetch and validate the JSON. This is what
 *     Claude Code uses (https://claude.ai/oauth/claude-code-client-metadata).
 *   - Dynamic Client Registration (RFC 7591): POST /oauth/register. Deprecated
 *     by MCP but still what ChatGPT / claude.ai / Cursor fall back to.
 *   - Machine clients: confidential clients a subscriber creates on /account,
 *     for headless agents (client_credentials grant — no browser, no human).
 */
import { lookup } from 'dns/promises';
import { isIP } from 'net';
import {
  DCR_MAX_CLIENT_NAME,
  DCR_MAX_REDIRECT_URIS,
  GRANT_AUTH_CODE,
  GRANT_CLIENT_CREDENTIALS,
  GRANT_REFRESH,
  MACHINE_CLIENTS_PER_USER,
  MACHINE_CLIENT_ID_PREFIX,
  MACHINE_CLIENT_SECRET_PREFIX,
  SCOPE_MCP_READ,
  SCOPES_SUPPORTED,
} from './config';
import { OAuthError } from './errors';
import { isAcceptableRedirectUri } from './redirect';
import {
  type ClientRecord,
  getClient,
  listMachineClientsForUser,
  putClient,
  randomHex,
  safeEqual,
  sha256Hex,
} from './store';

export type ResolvedClient = ClientRecord & { source: 'cimd' | 'dcr' | 'machine' };

// ---------------------------------------------------------------------------
// Shared validation
// ---------------------------------------------------------------------------

function cleanName(raw: unknown, fallback: string): string {
  if (typeof raw !== 'string') return fallback;
  // Printable characters only; this string is rendered on the consent page.
  const s = raw.replace(/[\x00-\x1f\x7f]/g, '').trim();
  return s ? s.slice(0, DCR_MAX_CLIENT_NAME) : fallback;
}

function cleanRedirectUris(raw: unknown): string[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new OAuthError('invalid_redirect_uri', 'redirect_uris must be a non-empty array.');
  }
  if (raw.length > DCR_MAX_REDIRECT_URIS) {
    throw new OAuthError('invalid_redirect_uri', `At most ${DCR_MAX_REDIRECT_URIS} redirect_uris.`);
  }
  const out: string[] = [];
  for (const u of raw) {
    if (!isAcceptableRedirectUri(u)) {
      throw new OAuthError(
        'invalid_redirect_uri',
        'Each redirect_uri must be https, http on localhost/127.0.0.1, or a private-use scheme, with no fragment.'
      );
    }
    out.push(u as string);
  }
  return out;
}

export function validateScope(raw: unknown): string {
  if (raw === undefined || raw === null || raw === '') return SCOPE_MCP_READ;
  if (typeof raw !== 'string' || raw.length > 256) {
    throw new OAuthError('invalid_scope', 'scope must be a space-separated string.');
  }
  const parts = raw.split(/\s+/).filter(Boolean);
  for (const p of parts) {
    // `offline_access` is tolerated (clients add it to ask for a refresh token;
    // we always issue one to user clients) but never echoed.
    if (p === 'offline_access') continue;
    if (!SCOPES_SUPPORTED.includes(p)) {
      throw new OAuthError('invalid_scope', `Unsupported scope '${p}'. Supported: ${SCOPES_SUPPORTED.join(' ')}.`);
    }
  }
  return SCOPE_MCP_READ;
}

// ---------------------------------------------------------------------------
// Dynamic client registration (RFC 7591)
// ---------------------------------------------------------------------------

export interface DcrResult {
  record: ClientRecord;
  /** Present only for confidential registrations; shown once. */
  client_secret?: string;
}

export async function registerDynamicClient(body: unknown): Promise<DcrResult> {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new OAuthError('invalid_client_metadata', 'Body must be a JSON object.');
  }
  const b = body as Record<string, unknown>;
  const redirect_uris = cleanRedirectUris(b.redirect_uris);
  const client_name = cleanName(b.client_name, 'Unnamed MCP client');

  const grantsIn = Array.isArray(b.grant_types) ? (b.grant_types as unknown[]) : [GRANT_AUTH_CODE, GRANT_REFRESH];
  const grant_types = grantsIn.filter((g): g is string => typeof g === 'string');
  for (const g of grant_types) {
    if (g !== GRANT_AUTH_CODE && g !== GRANT_REFRESH) {
      throw new OAuthError('invalid_client_metadata', `grant_type '${g}' is not available to dynamic clients.`);
    }
  }
  if (!grant_types.includes(GRANT_AUTH_CODE)) {
    throw new OAuthError('invalid_client_metadata', 'grant_types must include authorization_code.');
  }

  const responsesIn = Array.isArray(b.response_types) ? (b.response_types as unknown[]) : ['code'];
  for (const r of responsesIn) {
    if (r !== 'code') throw new OAuthError('invalid_client_metadata', "response_types must be ['code'].");
  }

  const authMethod = (b.token_endpoint_auth_method ?? 'none') as string;
  if (!['none', 'client_secret_basic', 'client_secret_post'].includes(authMethod)) {
    throw new OAuthError(
      'invalid_client_metadata',
      'token_endpoint_auth_method must be none, client_secret_basic, or client_secret_post.'
    );
  }

  const scope = validateScope(b.scope);
  const client_uri =
    typeof b.client_uri === 'string' && /^https:\/\//.test(b.client_uri) ? b.client_uri.slice(0, 512) : undefined;

  const client_id = 'gr_dc_' + randomHex(16);
  let client_secret: string | undefined;
  let client_secret_hash: string | undefined;
  if (authMethod !== 'none') {
    client_secret = 'gr_ds_' + randomHex(32);
    client_secret_hash = sha256Hex(client_secret);
  }

  const record: ClientRecord = {
    client_id,
    kind: 'dcr',
    client_name,
    redirect_uris,
    grant_types,
    response_types: ['code'],
    token_endpoint_auth_method: authMethod as ClientRecord['token_endpoint_auth_method'],
    scope,
    status: 'active',
    ...(client_uri ? { client_uri } : {}),
    ...(client_secret_hash ? { client_secret_hash } : {}),
  };
  await putClient(record, {
    software_id: cleanName(b.software_id, ''),
    software_version: cleanName(b.software_version, ''),
  });
  return { record, client_secret };
}

// ---------------------------------------------------------------------------
// Client ID Metadata Documents
// ---------------------------------------------------------------------------

const CIMD_FETCH_TIMEOUT_MS = 5000;
const CIMD_MAX_BYTES = 64 * 1024;
const CIMD_POSITIVE_TTL_MS = 10 * 60 * 1000;
const CIMD_NEGATIVE_TTL_MS = 2 * 60 * 1000;
const _cimdCache = new Map<string, { at: number; ttl: number; rec: ClientRecord | null }>();

export function isCimdClientId(clientId: string): boolean {
  if (!clientId.startsWith('https://') || clientId.length > 512) return false;
  try {
    const u = new URL(clientId);
    // The spec requires a path component; also refuse credentials/fragments.
    return u.protocol === 'https:' && u.pathname.length > 1 && !u.username && !u.password && !u.hash;
  } catch {
    return false;
  }
}

function isPrivateAddress(addr: string): boolean {
  if (isIP(addr) === 4) {
    const [a, b] = addr.split('.').map(Number);
    return (
      a === 10 ||
      a === 127 ||
      a === 0 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127) ||
      a >= 224
    );
  }
  const v6 = addr.toLowerCase();
  return (
    v6 === '::1' ||
    v6 === '::' ||
    v6.startsWith('fc') ||
    v6.startsWith('fd') ||
    v6.startsWith('fe80') ||
    v6.startsWith('::ffff:') // v4-mapped; conservative
  );
}

async function assertPublicHost(hostname: string): Promise<void> {
  const h = hostname.toLowerCase();
  if (isIP(h) || h === 'localhost' || h.endsWith('.localhost') || h.endsWith('.local') || h.endsWith('.internal')) {
    throw new OAuthError('invalid_client', 'client_id URL must resolve to a public hostname.');
  }
  let addrs: Array<{ address: string }>;
  try {
    addrs = await lookup(h, { all: true });
  } catch {
    throw new OAuthError('invalid_client', 'client_id URL hostname does not resolve.');
  }
  if (addrs.length === 0 || addrs.some((a) => isPrivateAddress(a.address))) {
    throw new OAuthError('invalid_client', 'client_id URL must resolve to a public address.');
  }
}

/** Test seam: replace the network fetch. */
let _cimdFetch: (url: string) => Promise<Response> = (url) =>
  fetch(url, {
    method: 'GET',
    redirect: 'manual',
    headers: {
      Accept: 'application/json',
      'User-Agent': 'gammarips-oauth/1.0 (+https://gammarips.com/developers)',
    },
    signal: AbortSignal.timeout(CIMD_FETCH_TIMEOUT_MS),
  });
export function _setCimdFetchForTests(fn: typeof _cimdFetch): void {
  _cimdFetch = fn;
  _cimdCache.clear();
}

export function parseCimdDocument(clientId: string, doc: unknown): ClientRecord {
  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) {
    throw new OAuthError('invalid_client', 'Client metadata document is not a JSON object.');
  }
  const d = doc as Record<string, unknown>;
  if (d.client_id !== clientId) {
    throw new OAuthError('invalid_client', 'Client metadata client_id does not match the document URL.');
  }
  const redirect_uris = cleanRedirectUris(d.redirect_uris);
  const client_name = cleanName(d.client_name, '');
  if (!client_name) throw new OAuthError('invalid_client', 'Client metadata document has no client_name.');
  const grant_types = Array.isArray(d.grant_types)
    ? (d.grant_types as unknown[]).filter((g): g is string => typeof g === 'string')
    : [GRANT_AUTH_CODE, GRANT_REFRESH];
  const authMethod = typeof d.token_endpoint_auth_method === 'string' ? d.token_endpoint_auth_method : 'none';
  if (authMethod !== 'none') {
    // private_key_jwt / secrets are not supported for CIMD clients here; PKCE
    // protects the code exchange and these clients are public by nature.
    throw new OAuthError(
      'invalid_client',
      `token_endpoint_auth_method '${authMethod}' is not supported for metadata-document clients.`
    );
  }
  return {
    client_id: clientId,
    kind: 'dcr',
    client_name,
    redirect_uris,
    grant_types,
    response_types: ['code'],
    token_endpoint_auth_method: 'none',
    scope: SCOPE_MCP_READ,
    status: 'active',
    ...(typeof d.client_uri === 'string' && /^https:\/\//.test(d.client_uri)
      ? { client_uri: d.client_uri.slice(0, 512) }
      : {}),
  };
}

async function resolveCimdClient(clientId: string): Promise<ClientRecord> {
  const cached = _cimdCache.get(clientId);
  if (cached && Date.now() - cached.at < cached.ttl) {
    if (cached.rec) return cached.rec;
    throw new OAuthError('invalid_client', 'Client metadata document could not be loaded.');
  }
  try {
    const url = new URL(clientId);
    await assertPublicHost(url.hostname);
    const res = await _cimdFetch(clientId);
    if (res.status !== 200) {
      // Do not echo the status: it would make the AS a status oracle for hosts
      // it can reach (DNS rebinding after the resolve check is the residual).
      throw new OAuthError('invalid_client', 'Client metadata document could not be loaded.');
    }
    const ctype = res.headers.get('content-type') || '';
    if (!/json/i.test(ctype)) {
      throw new OAuthError('invalid_client', 'Client metadata document is not JSON.');
    }
    const text = await res.text();
    if (text.length > CIMD_MAX_BYTES) {
      throw new OAuthError('invalid_client', 'Client metadata document is too large.');
    }
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      throw new OAuthError('invalid_client', 'Client metadata document is not valid JSON.');
    }
    const rec = parseCimdDocument(clientId, json);
    _cimdCache.set(clientId, { at: Date.now(), ttl: CIMD_POSITIVE_TTL_MS, rec });
    return rec;
  } catch (err) {
    _cimdCache.set(clientId, { at: Date.now(), ttl: CIMD_NEGATIVE_TTL_MS, rec: null });
    if (err instanceof OAuthError) throw err;
    throw new OAuthError('invalid_client', 'Client metadata document could not be fetched.');
  }
}

// ---------------------------------------------------------------------------
// Resolution (any kind)
// ---------------------------------------------------------------------------

export async function resolveClient(clientId: unknown): Promise<ResolvedClient> {
  if (typeof clientId !== 'string' || !clientId) {
    throw new OAuthError('invalid_client', 'client_id is required.', 401);
  }
  if (isCimdClientId(clientId)) {
    const rec = await resolveCimdClient(clientId);
    return { ...rec, source: 'cimd' };
  }
  const rec = await getClient(clientId);
  if (!rec || rec.status !== 'active') {
    throw new OAuthError('invalid_client', 'Unknown or revoked client_id.', 401);
  }
  return { ...rec, source: rec.kind === 'machine' ? 'machine' : 'dcr' };
}

// ---------------------------------------------------------------------------
// Token-endpoint client authentication (RFC 6749 §2.3)
// ---------------------------------------------------------------------------

export interface ClientCredentials {
  client_id: string;
  client_secret: string | null;
  via: 'basic' | 'body' | 'none';
}

export function extractClientCredentials(
  authorizationHeader: string | null,
  form: URLSearchParams
): ClientCredentials {
  if (authorizationHeader && /^basic\s+/i.test(authorizationHeader)) {
    const b64 = authorizationHeader.replace(/^basic\s+/i, '').trim();
    let decoded = '';
    try {
      decoded = Buffer.from(b64, 'base64').toString('utf8');
    } catch {
      throw new OAuthError('invalid_client', 'Malformed Basic credentials.', 401);
    }
    const idx = decoded.indexOf(':');
    if (idx < 0) throw new OAuthError('invalid_client', 'Malformed Basic credentials.', 401);
    // RFC 6749 §2.3.1: both parts are form-urlencoded before base64.
    const id = safeDecode(decoded.slice(0, idx));
    const secret = safeDecode(decoded.slice(idx + 1));
    return { client_id: id, client_secret: secret, via: 'basic' };
  }
  const id = form.get('client_id') || '';
  const secret = form.get('client_secret');
  return { client_id: id, client_secret: secret || null, via: secret ? 'body' : 'none' };
}

function safeDecode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

/** Resolve + authenticate the client for a token request. */
export async function authenticateClient(creds: ClientCredentials): Promise<ResolvedClient> {
  const client = await resolveClient(creds.client_id);
  if (client.client_secret_hash) {
    if (!creds.client_secret || !safeEqual(sha256Hex(creds.client_secret), client.client_secret_hash)) {
      throw new OAuthError('invalid_client', 'Client authentication failed.', 401);
    }
  }
  return client;
}

// ---------------------------------------------------------------------------
// Machine clients (client_credentials; created on /account by a subscriber)
// ---------------------------------------------------------------------------

export async function createMachineClient(
  uid: string,
  name: string
): Promise<{ client_id: string; client_secret: string; client_name: string }> {
  const existing = await listMachineClientsForUser(uid);
  const active = existing.filter((c) => c.status === 'active');
  if (active.length >= MACHINE_CLIENTS_PER_USER) {
    throw new Error(
      `You can have at most ${MACHINE_CLIENTS_PER_USER} active machine clients. Revoke one first.`
    );
  }
  const client_name = cleanName(name, 'Headless agent');
  const client_id = MACHINE_CLIENT_ID_PREFIX + randomHex(16);
  const client_secret = MACHINE_CLIENT_SECRET_PREFIX + randomHex(32);
  const record: ClientRecord = {
    client_id,
    kind: 'machine',
    client_name,
    redirect_uris: [],
    grant_types: [GRANT_CLIENT_CREDENTIALS],
    response_types: [],
    token_endpoint_auth_method: 'client_secret_basic',
    scope: SCOPE_MCP_READ,
    status: 'active',
    uid,
    client_secret_hash: sha256Hex(client_secret),
  };
  await putClient(record);
  return { client_id, client_secret, client_name };
}
