/**
 * RS256 signing keys for access tokens. The private key lives in Secret
 * Manager (`OAUTH_SIGNING_KEY`, PKCS#8 PEM) and is exposed to the runtime as
 * an env var by apphosting.yaml. `OAUTH_SIGNING_KID` names it in the JWKS.
 * Rotation: move the old pair to `OAUTH_SIGNING_KEY_PREV` / `OAUTH_SIGNING_KID_PREV`
 * so tokens signed before the rotation still verify until they expire (1h).
 */
import { createPublicKey } from 'crypto';
import { importPKCS8, SignJWT, type CryptoKey, type JWK } from 'jose';

const ALG = 'RS256';

interface LoadedKey {
  kid: string;
  privateKey: CryptoKey;
  publicJwk: JWK;
}

let _current: LoadedKey | null = null;
let _previous: LoadedKey | null | undefined; // undefined = not loaded yet

function readPem(name: string): string | null {
  const raw = process.env[name];
  if (!raw) return null;
  // Secret Manager keeps newlines; a .env file may carry them as literal "\n".
  return raw.replace(/\\n/g, '\n').trim();
}

async function load(pemEnv: string, kidEnv: string, required: boolean): Promise<LoadedKey | null> {
  const pem = readPem(pemEnv);
  if (!pem) {
    if (required) {
      throw new Error(`oauth: ${pemEnv} is not set — the authorization server cannot sign tokens`);
    }
    return null;
  }
  const kid = (process.env[kidEnv] || '').trim();
  if (!kid) throw new Error(`oauth: ${kidEnv} is not set`);
  // The private key stays a non-extractable WebCrypto key; the public JWK is
  // derived with Node crypto from the PEM, so only n/e are ever published.
  const privateKey = await importPKCS8(pem, ALG);
  const pub = createPublicKey(pem).export({ format: 'jwk' }) as { kty: string; n: string; e: string };
  const publicJwk: JWK = { kty: pub.kty, n: pub.n, e: pub.e, kid, use: 'sig', alg: ALG };
  return { kid, privateKey, publicJwk };
}

async function currentKey(): Promise<LoadedKey> {
  if (!_current) _current = (await load('OAUTH_SIGNING_KEY', 'OAUTH_SIGNING_KID', true))!;
  return _current;
}

async function previousKey(): Promise<LoadedKey | null> {
  if (_previous === undefined) {
    _previous = await load('OAUTH_SIGNING_KEY_PREV', 'OAUTH_SIGNING_KID_PREV', false);
  }
  return _previous;
}

/** RFC 7517 JWK Set with the current and (during rotation) previous public keys. */
export async function getJwks(): Promise<{ keys: JWK[] }> {
  const cur = await currentKey();
  const prev = await previousKey();
  return { keys: prev ? [cur.publicJwk, prev.publicJwk] : [cur.publicJwk] };
}

export interface AccessTokenClaims {
  sub: string; // Firebase uid
  aud: string; // resource indicator
  client_id: string;
  scope: string;
  tier: 'pro' | 'free';
  grant: 'authorization_code' | 'refresh_token' | 'client_credentials';
  client_kind: 'user' | 'machine';
}

export async function signAccessToken(
  issuer: string,
  claims: AccessTokenClaims,
  ttlSeconds: number,
  jti: string
): Promise<string> {
  const key = await currentKey();
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({
    client_id: claims.client_id,
    scope: claims.scope,
    tier: claims.tier,
    grant: claims.grant,
    client_kind: claims.client_kind,
  })
    .setProtectedHeader({ alg: ALG, kid: key.kid, typ: 'at+jwt' })
    .setIssuer(issuer)
    .setSubject(claims.sub)
    .setAudience(claims.aud)
    .setIssuedAt(now)
    .setNotBefore(now - 5)
    .setExpirationTime(now + ttlSeconds)
    .setJti(jti)
    .sign(key.privateKey);
}

/** Test seam: drop the cached keys so a test can swap env vars. */
export function _resetKeyCacheForTests(): void {
  _current = null;
  _previous = undefined;
}
