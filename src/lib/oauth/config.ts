/**
 * OAuth 2.1 authorization server for the GammaRips MCP — configuration.
 *
 * gammarips.com is the AUTHORIZATION SERVER (issuer). The MCP server
 * (mcp.gammarips.com, separate repo) is the RESOURCE SERVER: it validates the
 * RS256 access tokens minted here against /oauth/jwks and never stores
 * OAuth state. Decision: gammarips-mcp docs/DECISIONS/2026-08-15-oauth-pro-endpoint.md.
 *
 * Every value here is a non-secret constant. The signing key is in keys.ts
 * (Secret Manager OAUTH_SIGNING_KEY).
 */

export const OAUTH_ISSUER = (process.env.OAUTH_ISSUER || 'https://gammarips.com').replace(/\/+$/, '');

export const AUTHORIZE_PATH = '/oauth/authorize';
export const CONSENT_PATH = '/oauth/consent';
export const TOKEN_PATH = '/oauth/token';
export const REGISTER_PATH = '/oauth/register';
export const REVOKE_PATH = '/oauth/revoke';
export const JWKS_PATH = '/oauth/jwks';

/**
 * Resource indicators (RFC 8707) this server will mint tokens for. A token's
 * `aud` is the exact resource the client asked for, so the MCP server can
 * reject tokens minted for anything else. Origins are listed; the path must be
 * one of RESOURCE_PATHS. The run.app hosts are the same Cloud Run service.
 */
export const RESOURCE_ORIGINS: readonly string[] = (
  process.env.OAUTH_MCP_RESOURCE_ORIGINS ||
  [
    'https://mcp.gammarips.com',
    'https://gammarips-mcp-406581297632.us-central1.run.app',
    'https://gammarips-mcp-hrhjaecvhq-uc.a.run.app',
  ].join(',')
)
  .split(',')
  .map((s) => s.trim().replace(/\/+$/, '').toLowerCase())
  .filter(Boolean);

export const RESOURCE_PATHS: readonly string[] = ['', '/pro', '/mcp'];

/** The canonical MCP resource when a client sends no `resource` parameter. */
export const DEFAULT_RESOURCE = process.env.OAUTH_DEFAULT_RESOURCE || 'https://mcp.gammarips.com/pro';

/** The single scope. Tier (free vs pro) comes from the subscription, not from scope. */
export const SCOPE_MCP_READ = 'mcp:read';
export const SCOPES_SUPPORTED: readonly string[] = [SCOPE_MCP_READ];

// Lifetimes (seconds).
export const ACCESS_TOKEN_TTL = 60 * 60; // 1h, user tokens (refresh re-checks the subscription)
export const MACHINE_TOKEN_TTL = Number(process.env.OAUTH_MACHINE_TOKEN_TTL_SECONDS || 60 * 60); // 1h
export const AUTH_CODE_TTL = 5 * 60; // 5 min, single use
export const CONSENT_REQUEST_TTL = 10 * 60; // 10 min to sign in + approve
export const REFRESH_TOKEN_TTL = 30 * 24 * 60 * 60; // 30 days, rotates on every use
export const DCR_CLIENT_TTL = 90 * 24 * 60 * 60; // unused dynamic clients expire

// Dynamic client registration limits.
export const DCR_MAX_REDIRECT_URIS = 10;
export const DCR_MAX_CLIENT_NAME = 100;
export const MACHINE_CLIENTS_PER_USER = 5;

// Firestore collections (server-only; firestore.rules denies every client read/write).
export const COL_CLIENTS = 'oauth_clients';
export const COL_CODES = 'oauth_codes';
export const COL_REFRESH = 'oauth_refresh_tokens';
export const COL_REQUESTS = 'oauth_requests';

export const GRANT_AUTH_CODE = 'authorization_code';
export const GRANT_REFRESH = 'refresh_token';
export const GRANT_CLIENT_CREDENTIALS = 'client_credentials';

export const MACHINE_CLIENT_ID_PREFIX = 'gr_mc_';
export const MACHINE_CLIENT_SECRET_PREFIX = 'gr_ms_';
