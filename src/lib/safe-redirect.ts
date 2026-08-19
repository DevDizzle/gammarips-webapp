/**
 * Only a same-origin path may be a post-sign-in destination. Next treats a
 * cross-origin href as a full navigation, so an unchecked `?redirect=` is an
 * open redirector (and gammarips.com is now an OAuth issuer, where that is a
 * MUST NOT). Accept "/path[?query][#hash]" only: no scheme, no "//host",
 * no "/\host", no control characters.
 */
export function safeLocalPath(raw: string | null | undefined): string {
  if (!raw) return '/';
  if (raw.length > 2048) return '/';
  if (!raw.startsWith('/')) return '/';
  if (raw.startsWith('//') || raw.startsWith('/\\')) return '/';
  if (/[\x00-\x1f\x7f]/.test(raw)) return '/';
  try {
    const u = new URL(raw, 'https://gammarips.com');
    if (u.origin !== 'https://gammarips.com') return '/';
  } catch {
    return '/';
  }
  return raw;
}
