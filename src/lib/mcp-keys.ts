/**
 * MCP API key crypto — the webapp side of the gammarips-mcp auth contract.
 *
 * The MCP server (separate repo) authenticates a request by SHA-256-hashing
 * the raw key and looking up `mcp_api_keys/{hash}`. This module MUST hash
 * identically to the server:
 *
 *   Python (MCP):  hashlib.sha256(raw_key.encode("utf-8")).hexdigest()
 *   Node (here):   crypto.createHash("sha256").update(raw, "utf8").digest("hex")
 *
 * Key format: `gr_live_` + 32 lowercase hex chars (16 random bytes) — matches
 * the MCP's `KEY_PREFIX` check and `scripts/issue_api_key.py`.
 *
 * The raw key is shown to the user exactly once; only its hash is ever stored.
 */

import { createHash, randomBytes } from 'crypto';

export const KEY_PREFIX = 'gr_live_';

export function generateRawKey(): string {
  return KEY_PREFIX + randomBytes(16).toString('hex');
}

export function hashKey(rawKey: string): string {
  return createHash('sha256').update(rawKey, 'utf8').digest('hex');
}

/** First 12 chars (`gr_live_` + 4 hex) — safe to store/display, non-recoverable. */
export function keyPrefixOf(rawKey: string): string {
  return rawKey.slice(0, 12);
}
