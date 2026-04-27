import { oidcOAuthEnvSchema } from '$src/backend/env';
import { OAuth2Client } from 'arctic';

const { OIDC_CLIENT_ID, GOOGLE_REDIRECT_URI } = oidcOAuthEnvSchema.parse(process.env);

export const oauth = new OAuth2Client(OIDC_CLIENT_ID, null, GOOGLE_REDIRECT_URI);

export const ALLOWED_REDIRECT_URIS = [GOOGLE_REDIRECT_URI, 'https://antalmanac.com/auth/native'] as const;
export type AllowedRedirectUri = (typeof ALLOWED_REDIRECT_URIS)[number];

export function isAllowedRedirectUri(value: string): value is AllowedRedirectUri {
    return (ALLOWED_REDIRECT_URIS as readonly string[]).includes(value);
}

export function oauthClientForRedirectUri(redirectUri: AllowedRedirectUri): OAuth2Client {
    if (redirectUri === GOOGLE_REDIRECT_URI) {
        return oauth;
    }

    return new OAuth2Client(OIDC_CLIENT_ID, null, redirectUri);
}
