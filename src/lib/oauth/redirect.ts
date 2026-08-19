/**
 * Redirect URI rules (OAuth 2.1 §4.1.1 / RFC 8252 §7.3 / MCP security
 * considerations):
 *   - https with any host (web clients: chatgpt.com, claude.ai, ...)
 *   - http ONLY on the loopback interface (localhost, 127.0.0.1, [::1]); the
 *     PORT is ignored at match time because native clients bind an ephemeral
 *     port per run (Claude Code registers http://localhost/callback and sends
 *     http://localhost:NNNNN/callback)
 *   - private-use schemes for native apps (cursor://, vscode://, ...)
 *   - never javascript:, data:, file:, vbscript:, blob:
 * Matching is exact (scheme, host, path, query), except the loopback port.
 */

const FORBIDDEN_SCHEMES = new Set(['javascript:', 'data:', 'file:', 'vbscript:', 'blob:', 'about:']);
const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);

export function isLoopbackHost(hostname: string): boolean {
  return LOOPBACK_HOSTS.has(hostname.toLowerCase());
}

export function parseRedirectUri(raw: unknown): URL | null {
  if (typeof raw !== 'string' || raw.length === 0 || raw.length > 2048) return null;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.hash) return null; // fragments are forbidden (RFC 6749 §3.1.2)
  if (FORBIDDEN_SCHEMES.has(url.protocol)) return null;
  if (url.protocol === 'http:') {
    return isLoopbackHost(url.hostname) ? url : null;
  }
  if (url.protocol === 'https:') {
    return url.hostname ? url : null;
  }
  // Private-use scheme (RFC 8252 §7.1): scheme must look like a reverse-domain
  // or app name. Require at least one character and no whitespace.
  if (!/^[a-z][a-z0-9+.-]*:$/.test(url.protocol)) return null;
  return url;
}

export function isAcceptableRedirectUri(raw: unknown): boolean {
  return parseRedirectUri(raw) !== null;
}

/** Exact match, except that loopback http URIs match on any port. */
export function redirectUriMatches(registered: string, requested: string): boolean {
  if (registered === requested) return true;
  const a = parseRedirectUri(registered);
  const b = parseRedirectUri(requested);
  if (!a || !b) return false;
  if (a.protocol !== 'http:' || b.protocol !== 'http:') return false;
  if (!isLoopbackHost(a.hostname) || !isLoopbackHost(b.hostname)) return false;
  return (
    a.hostname.toLowerCase() === b.hostname.toLowerCase() &&
    a.pathname === b.pathname &&
    a.search === b.search
  );
}

export function findMatchingRedirectUri(registered: readonly string[], requested: string): string | null {
  for (const r of registered) {
    if (redirectUriMatches(r, requested)) return requested;
  }
  return null;
}
