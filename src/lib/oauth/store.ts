/**
 * Firestore persistence for the authorization server. Server-only (Admin SDK);
 * firestore.rules denies every client read/write on these collections.
 *
 * Secrets (authorization codes, refresh tokens, machine client secrets) are
 * stored ONLY as SHA-256 hashes — the doc id is the hash, so a lookup is one
 * get() and a leaked database dump yields nothing replayable.
 */
import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getAdminApp } from '../firebase-admin';
import {
  COL_CLIENTS,
  COL_CODES,
  COL_REFRESH,
  COL_REQUESTS,
  AUTH_CODE_TTL,
  CONSENT_REQUEST_TTL,
  REFRESH_TOKEN_TTL,
  DCR_CLIENT_TTL,
} from './config';

export function sha256Hex(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}

export function randomHex(bytes = 16): string {
  return randomBytes(bytes).toString('hex');
}

export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

function db() {
  return getFirestore(getAdminApp());
}

function inSeconds(s: number): Timestamp {
  return Timestamp.fromMillis(Date.now() + s * 1000);
}

function isExpired(ts: unknown): boolean {
  return !(ts instanceof Timestamp) || ts.toMillis() <= Date.now();
}

// ---------------------------------------------------------------------------
// Clients
// ---------------------------------------------------------------------------

export type ClientKind = 'dcr' | 'machine';

export interface ClientRecord {
  client_id: string;
  kind: ClientKind;
  client_name: string;
  redirect_uris: string[];
  grant_types: string[];
  response_types: string[];
  token_endpoint_auth_method: 'none' | 'client_secret_basic' | 'client_secret_post';
  scope: string;
  status: 'active' | 'revoked';
  /** Owning user — machine clients only. */
  uid?: string;
  /** sha256 of the secret — confidential clients only. */
  client_secret_hash?: string;
  client_uri?: string;
}

export async function getClient(clientId: string): Promise<ClientRecord | null> {
  if (!clientId || clientId.length > 256) return null;
  const snap = await db().collection(COL_CLIENTS).doc(clientId).get();
  if (!snap.exists) return null;
  const d = snap.data()!;
  if (d.kind === 'dcr' && d.expires_at && isExpired(d.expires_at)) return null;
  return d as ClientRecord;
}

export async function putClient(rec: ClientRecord, extra: Record<string, unknown> = {}): Promise<void> {
  const doc: Record<string, unknown> = {
    ...rec,
    ...extra,
    created_at: FieldValue.serverTimestamp(),
  };
  if (rec.kind === 'dcr') doc.expires_at = inSeconds(DCR_CLIENT_TTL);
  await db().collection(COL_CLIENTS).doc(rec.client_id).set(doc);
}

/** Bump last_used_at and, for dynamic clients, slide the expiry window. */
export async function touchClient(clientId: string, kind: ClientKind): Promise<void> {
  const patch: Record<string, unknown> = { last_used_at: FieldValue.serverTimestamp() };
  if (kind === 'dcr') patch.expires_at = inSeconds(DCR_CLIENT_TTL);
  await db().collection(COL_CLIENTS).doc(clientId).set(patch, { merge: true });
}

export async function listMachineClientsForUser(uid: string): Promise<
  Array<{ client_id: string; client_name: string; status: string; createdAtISO: string | null; lastUsedAtISO: string | null }>
> {
  const q = await db().collection(COL_CLIENTS).where('uid', '==', uid).get();
  return q.docs
    .map((d) => d.data())
    .filter((d) => d.kind === 'machine')
    .map((d) => ({
      client_id: d.client_id as string,
      client_name: d.client_name as string,
      status: d.status as string,
      createdAtISO: d.created_at instanceof Timestamp ? d.created_at.toDate().toISOString() : null,
      lastUsedAtISO: d.last_used_at instanceof Timestamp ? d.last_used_at.toDate().toISOString() : null,
    }))
    .sort((a, b) => (a.createdAtISO || '').localeCompare(b.createdAtISO || ''));
}

export async function revokeClient(clientId: string, uid: string, reason: string): Promise<boolean> {
  const ref = db().collection(COL_CLIENTS).doc(clientId);
  const snap = await ref.get();
  if (!snap.exists || snap.data()!.uid !== uid) return false;
  await ref.set(
    { status: 'revoked', revoked_at: FieldValue.serverTimestamp(), revoked_reason: reason },
    { merge: true }
  );
  return true;
}

// ---------------------------------------------------------------------------
// Pending authorization requests (between /oauth/authorize and consent)
// ---------------------------------------------------------------------------

export interface PendingRequest {
  rid: string;
  client_id: string;
  client_name: string;
  client_kind: ClientKind | 'cimd';
  redirect_uri: string;
  code_challenge: string;
  code_challenge_method: 'S256';
  scope: string;
  resource: string;
  state: string | null;
}

export async function putPendingRequest(req: Omit<PendingRequest, 'rid'>): Promise<string> {
  const rid = randomToken(24);
  await db()
    .collection(COL_REQUESTS)
    .doc(rid)
    .set({
      ...req,
      rid,
      status: 'pending',
      created_at: FieldValue.serverTimestamp(),
      expires_at: inSeconds(CONSENT_REQUEST_TTL),
    });
  return rid;
}

export async function getPendingRequest(rid: string): Promise<PendingRequest | null> {
  if (!rid || rid.length > 64) return null;
  const snap = await db().collection(COL_REQUESTS).doc(rid).get();
  if (!snap.exists) return null;
  const d = snap.data()!;
  if (d.status !== 'pending' || isExpired(d.expires_at)) return null;
  return d as PendingRequest;
}

/** Atomically consume a pending request. Returns null if already decided/expired. */
export async function consumePendingRequest(
  rid: string,
  decision: 'allow' | 'deny',
  uid: string
): Promise<PendingRequest | null> {
  const ref = db().collection(COL_REQUESTS).doc(rid);
  return db().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) return null;
    const d = snap.data()!;
    if (d.status !== 'pending' || isExpired(d.expires_at)) return null;
    tx.update(ref, { status: decision, decided_at: FieldValue.serverTimestamp(), uid });
    return d as PendingRequest;
  });
}

// ---------------------------------------------------------------------------
// Authorization codes (single use)
// ---------------------------------------------------------------------------

export interface CodeRecord {
  client_id: string;
  uid: string;
  redirect_uri: string;
  code_challenge: string;
  scope: string;
  resource: string;
  family_id: string;
}

export async function issueCode(rec: CodeRecord): Promise<string> {
  const code = randomToken(32);
  await db()
    .collection(COL_CODES)
    .doc(sha256Hex(code))
    .set({
      ...rec,
      status: 'active',
      created_at: FieldValue.serverTimestamp(),
      expires_at: inSeconds(AUTH_CODE_TTL),
    });
  return code;
}

export type ConsumeCodeResult =
  | { kind: 'ok'; record: CodeRecord }
  | { kind: 'replayed'; family_id: string }
  | { kind: 'invalid' };

/**
 * Atomically redeem a code. First use returns the record. A second use is a
 * replay: the family id comes back so the caller revokes every token that
 * the first redemption minted (OAuth 2.1 §4.1.2 / §7.2.2). Unknown or
 * expired codes are `invalid`.
 */
export async function consumeCode(code: string): Promise<ConsumeCodeResult> {
  if (!code || code.length > 128) return { kind: 'invalid' };
  const ref = db().collection(COL_CODES).doc(sha256Hex(code));
  return db().runTransaction(async (tx): Promise<ConsumeCodeResult> => {
    const snap = await tx.get(ref);
    if (!snap.exists) return { kind: 'invalid' };
    const d = snap.data()!;
    if (isExpired(d.expires_at)) return { kind: 'invalid' };
    if (d.status !== 'active') return { kind: 'replayed', family_id: String(d.family_id || '') };
    tx.update(ref, { status: 'used', used_at: FieldValue.serverTimestamp() });
    return { kind: 'ok', record: d as CodeRecord };
  });
}

// ---------------------------------------------------------------------------
// Refresh tokens (rotating; family revocation on reuse)
// ---------------------------------------------------------------------------

export interface RefreshRecord {
  uid: string;
  client_id: string;
  scope: string;
  resource: string;
  family_id: string;
}

export async function issueRefreshToken(rec: RefreshRecord): Promise<string> {
  const token = randomToken(32);
  await db()
    .collection(COL_REFRESH)
    .doc(sha256Hex(token))
    .set({
      ...rec,
      status: 'active',
      created_at: FieldValue.serverTimestamp(),
      expires_at: inSeconds(REFRESH_TOKEN_TTL),
    });
  return token;
}

/**
 * Rotate: mark the presented token `rotated` and return its record so the
 * caller can mint the successor. `'reused'` means a rotated/revoked token was
 * presented again — theft signal; the caller revokes the family.
 */
export async function rotateRefreshToken(token: string): Promise<RefreshRecord | 'reused' | null> {
  if (!token || token.length > 128) return null;
  const ref = db().collection(COL_REFRESH).doc(sha256Hex(token));
  return db().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) return null;
    const d = snap.data()!;
    if (isExpired(d.expires_at)) return null;
    if (d.status !== 'active') return 'reused';
    tx.update(ref, { status: 'rotated', rotated_at: FieldValue.serverTimestamp() });
    return d as RefreshRecord;
  });
}

export async function revokeRefreshFamily(familyId: string, reason: string): Promise<number> {
  const q = await db().collection(COL_REFRESH).where('family_id', '==', familyId).get();
  const batch = db().batch();
  let n = 0;
  for (const doc of q.docs) {
    if (doc.data().status !== 'revoked') {
      batch.set(
        doc.ref,
        { status: 'revoked', revoked_at: FieldValue.serverTimestamp(), revoked_reason: reason },
        { merge: true }
      );
      n++;
    }
  }
  if (n) await batch.commit();
  return n;
}

/** The client a refresh token was issued to, or null when unknown. */
export async function refreshTokenOwner(token: string): Promise<string | null> {
  if (!token || token.length > 128) return null;
  const snap = await db().collection(COL_REFRESH).doc(sha256Hex(token)).get();
  return snap.exists ? String(snap.data()!.client_id || '') || null : null;
}

export async function revokeRefreshTokenByValue(token: string, reason: string): Promise<boolean> {
  if (!token || token.length > 128) return false;
  const ref = db().collection(COL_REFRESH).doc(sha256Hex(token));
  const snap = await ref.get();
  if (!snap.exists) return false;
  await revokeRefreshFamily(snap.data()!.family_id, reason);
  return true;
}
