/**
 * @module OIDCConfig
 */

import { OAuth2Client } from 'arctic';

export const REDIRECT_URI_PATH_WEB = '/planner/api/users/auth/google/callback';
export const REDIRECT_URI_PATH_NATIVE = '/planner/api/users/auth/google/callback/native';

/**
 * Path of the MCP OAuth flow's Google round-trip. The MCP server bounces the browser to the
 * OIDC provider with this as the redirect, then resumes the OAuth flow in the callback.
 * Must be registered as an allowed redirect URI with the OIDC provider. See `controllers/mcp/`.
 */
export const REDIRECT_URI_PATH_MCP = '/planner/api/mcp/auth/google/callback';

export function buildMcpRedirectUri(origin: string): string {
    return (process.env.PRODUCTION_DOMAIN ?? origin) + REDIRECT_URI_PATH_MCP;
}

export function buildRedirectUri(native = false): string {
    const path = native ? REDIRECT_URI_PATH_NATIVE : REDIRECT_URI_PATH_WEB;
    return (process.env.PRODUCTION_DOMAIN ?? '') + path;
}

/**
 * Creates and configures an Arctic OAuth2 client for OIDC authentication.
 *
 * @param redirectUri Optional override for the redirect URI. Defaults to the
 * standard web callback. The native iOS flow passes the `/callback/native`
 * variant so the authorize and token-exchange requests both advertise the
 * redirect URI that AASA claims.
 */
export function createOIDCClient(redirectUri: string = buildRedirectUri()): OAuth2Client {
    const issuerUrl = process.env.OIDC_ISSUER_URL;
    const clientId = process.env.PLANNER_OIDC_CLIENT_ID;

    if (!issuerUrl || !clientId) {
        throw new Error('OIDC_ISSUER_URL and PLANNER_OIDC_CLIENT_ID must be defined');
    }

    return new OAuth2Client(clientId, null, redirectUri);
}
