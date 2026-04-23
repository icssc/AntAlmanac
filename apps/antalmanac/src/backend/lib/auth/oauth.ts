import { oidcOAuthEnvSchema } from '$src/backend/env';
import { OAuth2Client } from 'arctic';

const { OIDC_CLIENT_ID, GOOGLE_REDIRECT_URI } = oidcOAuthEnvSchema.parse(process.env);

export const oauth = new OAuth2Client(OIDC_CLIENT_ID, null, GOOGLE_REDIRECT_URI);

/**
 * Allowed redirect URIs for the AntAlmanac OAuth client.
 *
 * - The default (`GOOGLE_REDIRECT_URI`, e.g. `https://antalmanac.com/auth`) is
 *   used by the browser flow.
 * - `https://antalmanac.com/auth/native` is used by the native iOS wrapper,
 *   where the OAuth flow runs inside `ASWebAuthenticationSession` (iOS 17.4+)
 *   with an HTTPS Universal Link callback. The AASA file at
 *   `/.well-known/apple-app-site-association` binds this path to the AA iOS
 *   binary, so callbacks cannot be intercepted by other apps.
 *
 * The matching redirect URIs must be registered on the OIDC provider
 * (auth.icssc.club) for the AntAlmanac client, otherwise the provider will
 * reject the authorize request.
 */
export const ALLOWED_REDIRECT_URIS = [GOOGLE_REDIRECT_URI, 'https://antalmanac.com/auth/native'] as const;
export type AllowedRedirectUri = (typeof ALLOWED_REDIRECT_URIS)[number];

export function isAllowedRedirectUri(value: string): value is AllowedRedirectUri {
    return (ALLOWED_REDIRECT_URIS as readonly string[]).includes(value);
}

/**
 * Returns an `OAuth2Client` bound to the given redirect URI. Falls back to the
 * shared default `oauth` client when the URI is the default.
 *
 * The `arctic` `OAuth2Client` bakes the redirect URI into both URL construction
 * and token exchange, so the same URI used to build the authorize URL must be
 * used when validating the authorization code.
 */
export function oauthClientForRedirectUri(redirectUri: AllowedRedirectUri): OAuth2Client {
    if (redirectUri === GOOGLE_REDIRECT_URI) return oauth;
    return new OAuth2Client(OIDC_CLIENT_ID, null, redirectUri);
}
