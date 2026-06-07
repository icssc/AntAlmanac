import 'server-only';
import { AUTH_PROVIDER_ID } from '$lib/auth/authConstants';
import { type AuthAdditionalData } from '$lib/auth/authTypes';
import { getSafeAuthRedirectPath } from '$lib/auth/authUtils';
import { env } from '$src/env';
import { db } from '@packages/db';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { createAuthMiddleware, getOAuthState } from 'better-auth/api';
import { betterAuth } from 'better-auth/minimal';
import { nextCookies } from 'better-auth/next-js';
import { genericOAuth } from 'better-auth/plugins';

export const auth = betterAuth({
    appName: 'AntAlmanac',
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    database: drizzleAdapter(db, { provider: 'pg', usePlural: true }),
    plugins: [
        genericOAuth({
            config: [
                {
                    providerId: AUTH_PROVIDER_ID,
                    issuer: env.OIDC_ISSUER_URL,
                    discoveryUrl: `${env.OIDC_ISSUER_URL}/.well-known/openid-configuration`,
                    clientId: env.OIDC_CLIENT_ID,
                    scopes: ['openid', 'profile', 'email'],
                    pkce: true,
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
    advanced: {
        database: {
            generateId: 'uuid',
        },
    },
    hooks: {
        after: createAuthMiddleware(async (ctx) => {
            if (ctx.path === '/oauth2/callback/:providerId') {
                const additionalData = (await getOAuthState()) as AuthAdditionalData | null;
                if (additionalData) {
                    if (additionalData.returnUrl) {
                        const returnUrl = getSafeAuthRedirectPath(
                            additionalData.returnUrl,
                            ctx.request?.url,
                            new URL(env.BETTER_AUTH_URL).origin
                        );
                        ctx.redirect(returnUrl);
                    }
                }
            }
        }),
    },
    databaseHooks: {
        account: {
            create: {
                before: async (account) => {
                    const additionalData = (await getOAuthState()) as AuthAdditionalData | null;
                    return {
                        data: {
                            ...account,
                            accountType: additionalData?.provider ?? 'OIDC',
                        },
                    };
                },
            },
        },
    },
    account: {
        fields: {
            accountId: 'providerAccountId',
        },
        additionalFields: {
            accountType: {
                type: 'string',
                required: true,
                defaultValue: 'OIDC',
                input: true,
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
        expiresIn: 30 * 24 * 60 * 60, // 30 days
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60, // 5 minutes
        },
    },
});

export type AuthorizationUrlParams =
    (typeof auth)['options']['plugins'][0]['options']['config'][0]['authorizationUrlParams'];
