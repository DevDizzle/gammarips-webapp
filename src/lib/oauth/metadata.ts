/** RFC 8414 Authorization Server Metadata for https://gammarips.com. */
import {
  AUTHORIZE_PATH,
  GRANT_AUTH_CODE,
  GRANT_CLIENT_CREDENTIALS,
  GRANT_REFRESH,
  JWKS_PATH,
  OAUTH_ISSUER,
  REGISTER_PATH,
  REVOKE_PATH,
  SCOPES_SUPPORTED,
  TOKEN_PATH,
} from './config';

export function authorizationServerMetadata(): Record<string, unknown> {
  return {
    issuer: OAUTH_ISSUER,
    authorization_endpoint: OAUTH_ISSUER + AUTHORIZE_PATH,
    token_endpoint: OAUTH_ISSUER + TOKEN_PATH,
    registration_endpoint: OAUTH_ISSUER + REGISTER_PATH,
    revocation_endpoint: OAUTH_ISSUER + REVOKE_PATH,
    jwks_uri: OAUTH_ISSUER + JWKS_PATH,
    scopes_supported: [...SCOPES_SUPPORTED],
    response_types_supported: ['code'],
    response_modes_supported: ['query'],
    grant_types_supported: [GRANT_AUTH_CODE, GRANT_REFRESH, GRANT_CLIENT_CREDENTIALS],
    token_endpoint_auth_methods_supported: ['none', 'client_secret_basic', 'client_secret_post'],
    revocation_endpoint_auth_methods_supported: ['none', 'client_secret_basic', 'client_secret_post'],
    code_challenge_methods_supported: ['S256'],
    // MCP 2026-07-28: CIMD is the preferred registration path; DCR is the fallback.
    client_id_metadata_document_supported: true,
    // RFC 9207: every authorization response carries iss=.
    authorization_response_iss_parameter_supported: true,
    service_documentation: 'https://gammarips.com/developers',
    ui_locales_supported: ['en-US'],
  };
}
