import 'server-only';
import { betterAuthEnvSchema, oidcOAuthEnvSchema } from '$src/backend/env';
import { db } from '@packages/db';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { genericOAuth } from 'better-auth/plugins';

const { OIDC_CLIENT_ID, OIDC_ISSUER_URL, GOOGLE_REDIRECT_URI } = oidcOAuthEnvSchema.parse(process.env);
const { BETTER_AUTH_URL } = betterAuthEnvSchema.parse(process.env);

export const AUTH_PROVIDER_ID = 'icssc';

export const auth = betterAuth({
    appName: 'AntAlmanac',
    baseUrl: BETTER_AUTH_URL,
    database: drizzleAdapter(db, { provider: 'pg', usePlural: true }),
    plugins: [
        genericOAuth({
            config: [
                {
                    providerId: AUTH_PROVIDER_ID,
                    issuer: OIDC_ISSUER_URL,
                    discoveryUrl: `${OIDC_ISSUER_URL}/.well-known/openid-configuration`,
                    clientId: OIDC_CLIENT_ID,
                    scopes: ['openid', 'profile', 'email'],
                    pkce: true,
                    redirectURI: GOOGLE_REDIRECT_URI,
                    mapProfileToUser: (profile) => {
                        return {
                            ...profile,
                            avatar: profile.image,
                        } as object;
                    },
                },
            ],
        }),
        nextCookies(),
    ],
    account: {
        fields: {
            accountId: 'providerAccountId',
        },
        additionalFields: {
            accountType: {
                type: 'string',
                required: false,
                defaultValue: 'OIDC',
                input: false,
            },
        },
    },
    user: {
        fields: {
            updatedAt: 'lastUpdated',
            image: 'avatar',
        },
        additionalFields: {
            avatar: {
                type: 'string',
                required: false,
                defaultValue: '',
                input: false,
            },
        },
    },
    session: {
        fields: {
            token: 'refreshToken',
            expiresAt: 'expires',
        },
    },
});

export type AuthorizationUrlParams =
    (typeof auth)['options']['plugins'][0]['options']['config'][0]['authorizationUrlParams'];
