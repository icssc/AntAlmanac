import { betterAuth } from 'better-auth';
import { genericOAuth } from 'better-auth/plugins';

import { oidcOAuthEnvSchema } from '$src/backend/env';

const { OIDC_CLIENT_ID, OIDC_ISSUER_URL } = oidcOAuthEnvSchema.parse(process.env);

export const AUTH_PROVIDER_ID = 'icssc';

export const auth = betterAuth({
    appName: 'AntAlmanac',
    baseUrl: process.env.BETTER_AUTH_URL,
    plugins: [
        genericOAuth({
            config: [
                {
                    providerId: AUTH_PROVIDER_ID,
                    issuer: OIDC_ISSUER_URL,
                    authorizationUrl: `${OIDC_ISSUER_URL}/authorize`,
                    tokenUrl: `${OIDC_ISSUER_URL}/token`,
                    clientId: OIDC_CLIENT_ID,
                    scopes: ['openid', 'profile', 'email'],
                    pkce: true,
                    requireIssuerValidation: true,
                },
            ],
        }),
    ],
});
