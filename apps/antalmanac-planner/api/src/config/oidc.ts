/**
 * @module OIDCConfig
 */

import { OAuth2Client } from 'arctic';

export const REDIRECT_URI_PATH_WEB = '/planner/api/users/auth/google/callback';
export const REDIRECT_URI_PATH_NATIVE = '/planner/api/users/auth/google/callback/native';

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
  const clientId = process.env.OIDC_CLIENT_ID;

  if (!issuerUrl || !clientId) {
    throw new Error('OIDC_ISSUER_URL and OIDC_CLIENT_ID must be defined');
  }

  return new OAuth2Client(clientId, null, redirectUri);
}
