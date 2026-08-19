/** Resource indicator (RFC 8707) validation against the MCP server set. */
import { RESOURCE_ORIGINS, RESOURCE_PATHS, DEFAULT_RESOURCE } from './config';

/**
 * Normalize a resource indicator: lowercase scheme+host, drop a trailing
 * slash, reject query/fragment. Returns null when it is not one of ours.
 */
export function normalizeResource(raw: unknown): string | null {
  if (raw === undefined || raw === null || raw === '') return DEFAULT_RESOURCE;
  if (typeof raw !== 'string' || raw.length > 512) return null;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.search || url.hash || url.username || url.password) return null;
  const origin = `${url.protocol}//${url.host}`.toLowerCase();
  // Only origins from the operator-controlled list; https in production, and
  // http is accepted only for a listed loopback origin (local development).
  if (!RESOURCE_ORIGINS.includes(origin)) return null;
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && /^(localhost|127\.0\.0\.1)$/.test(url.hostname))) {
    return null;
  }
  const path = url.pathname.replace(/\/+$/, '');
  if (!RESOURCE_PATHS.includes(path)) return null;
  return origin + path;
}
