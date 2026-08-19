/** PKCE (RFC 7636), S256 only — OAuth 2.1 forbids `plain` for new servers. */
import { createHash, timingSafeEqual } from 'crypto';

const VERIFIER_RE = /^[A-Za-z0-9\-._~]{43,128}$/;
const CHALLENGE_RE = /^[A-Za-z0-9\-_]{43}$/;

export function isValidCodeChallenge(challenge: unknown): challenge is string {
  return typeof challenge === 'string' && CHALLENGE_RE.test(challenge);
}

export function isValidCodeVerifier(verifier: unknown): verifier is string {
  return typeof verifier === 'string' && VERIFIER_RE.test(verifier);
}

export function s256(verifier: string): string {
  return createHash('sha256').update(verifier, 'ascii').digest('base64url');
}

export function verifyPkce(verifier: unknown, challenge: string): boolean {
  if (!isValidCodeVerifier(verifier)) return false;
  const a = Buffer.from(s256(verifier));
  const b = Buffer.from(challenge);
  return a.length === b.length && timingSafeEqual(a, b);
}
