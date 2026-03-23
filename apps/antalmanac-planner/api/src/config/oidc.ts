/**
 * @module OIDCConfig
 */

import { OAuth2Client } from 'arctic';

/**
 * Creates and configures an Arctic OAuth2 client for OIDC authentication
 */
export function createOIDCClient(): OAuth2Client {
  const issuerUrl = process.env.OIDC_ISSUER_URL;
  const clientId = process.env.OIDC_CLIENT_ID;
  const redirectUri = process.env.PRODUCTION_DOMAIN + '/planner/api/users/auth/google/callback';

  if (!issuerUrl || !clientId) {
    throw new Error('OIDC_ISSUER_URL and OIDC_CLIENT_ID must be defined');
  }

  return new OAuth2Client(clientId, null, redirectUri);
}
