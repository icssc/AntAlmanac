import { SESSION_COOKIE_NAME } from '$src/backend/context';
import { oidcOAuthEnvSchema } from '$src/backend/env';
import { ALLOWED_REDIRECT_URIS, isAllowedRedirectUri, oauthClientForRedirectUri } from '$src/backend/lib/auth/oauth';
import { getCookiesFromHeader, getSafeAuthRedirectPath } from '$src/backend/lib/helpers';
import { RDS } from '$src/backend/lib/rds';
import { procedure, protectedProcedure, router } from '$src/backend/trpc';
import { type ScheduleSaveState, ScheduleSaveStateSchema } from '@packages/antalmanac-types';
import { db } from '@packages/db';
import { TRPCError } from '@trpc/server';
import { CodeChallengeMethod, decodeIdToken, generateCodeVerifier, generateState, type OAuth2Tokens } from 'arctic';
import { z } from 'zod';

const { OIDC_ISSUER_URL, GOOGLE_REDIRECT_URI } = oidcOAuthEnvSchema.parse(process.env);
const NODE_ENV = process.env.NODE_ENV;

const userDataRouter = router({
    getUserAndAccount: protectedProcedure.query(async ({ ctx }) => {
        return await RDS.getUserAndAccountBySessionToken(db, ctx.sessionToken);
    }),

    getGuestScheduleByUsername: procedure.input(z.object({ username: z.string() })).query(async ({ input }) => {
        const result = await RDS.getGuestScheduleByUsername(db, input.username);
        if (!result) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: `Couldn't find schedules for username "${input.username}".`,
            });
        }
        return result;
    }),

    getUserData: protectedProcedure.query(async ({ ctx }) => {
        return await RDS.fetchUserDataWithSession(db, ctx.sessionToken);
    }),

    /**
     * Retrieves Google authentication URL for login/sign up.
     */
    getGoogleAuthUrl: procedure
        .input(
            z
                .object({
                    prompt: z.enum(['none', 'consent']).optional(),
                    redirectUri: z.enum(ALLOWED_REDIRECT_URIS).optional(),
                    returnTo: z.string().optional(),
                })
                .optional()
        )
        .query(async ({ input, ctx }) => {
            const state = generateState();
            const codeVerifier = generateCodeVerifier();

            const redirectUri = input?.redirectUri ?? ALLOWED_REDIRECT_URIS[0];
            const client = oauthClientForRedirectUri(redirectUri);

            const url = client.createAuthorizationURLWithPKCE(
                'https://auth.icssc.club/authorize',
                state,
                CodeChallengeMethod.S256,
                codeVerifier,
                ['openid', 'profile', 'email']
            );

            if (input?.prompt) {
                url.searchParams.set('prompt', input.prompt);
            }

            const isProduction = NODE_ENV === 'production';
            const cookieOptions = `Path=/; HttpOnly; ${
                isProduction ? 'Secure; SameSite=None' : 'SameSite=Lax'
            }; Max-Age=600`;

            // Set cookies via response headers (Next.js cookies() doesn't work in TRPC)
            ctx.resHeaders?.append('Set-Cookie', `oauth_state=${state}; ${cookieOptions}`);
            ctx.resHeaders?.append('Set-Cookie', `oauth_code_verifier=${codeVerifier}; ${cookieOptions}`);
            ctx.resHeaders?.append('Set-Cookie', `oauth_redirect_uri=${redirectUri}; ${cookieOptions}`);

            const referer = ctx.req.headers.get('referer');
            const redirectUrl = getSafeAuthRedirectPath(input?.returnTo ?? referer, ctx.req.url, GOOGLE_REDIRECT_URI);
            ctx.resHeaders?.append(
                'Set-Cookie',
                `auth_redirect_url=${encodeURIComponent(redirectUrl)}; ${cookieOptions}`
            );

            return url;
        }),
    /**
     * Logs in or signs up a user and creates user's session
     */
    handleGoogleCallback: procedure
        .input(z.object({ code: z.string(), state: z.string() }))
        .mutation(async ({ input, ctx }) => {
            try {
                const cookies = getCookiesFromHeader(ctx.req.headers);

                const storedState = cookies['oauth_state'] ?? null;
                const codeVerifier = cookies['oauth_code_verifier'] ?? null;
                const pinnedRedirectUri = cookies['oauth_redirect_uri'] ?? null;

                // Delete cookies via response headers
                const isProduction = NODE_ENV === 'production';
                const deleteCookieOptions = `Path=/; HttpOnly; ${
                    isProduction ? 'Secure; SameSite=None' : 'SameSite=Lax'
                }; Max-Age=0`;
                ctx.resHeaders?.append('Set-Cookie', `oauth_state=; ${deleteCookieOptions}`);
                ctx.resHeaders?.append('Set-Cookie', `oauth_code_verifier=; ${deleteCookieOptions}`);
                ctx.resHeaders?.append('Set-Cookie', `oauth_redirect_uri=; ${deleteCookieOptions}`);
                ctx.resHeaders?.append('Set-Cookie', `auth_redirect_url=; ${deleteCookieOptions}`);

                if (!input.code || !input.state || !storedState || !codeVerifier) {
                    console.error('[OAuth Callback] Missing parameters:', {
                        hasCode: !!input.code,
                        hasState: !!input.state,
                        hasStoredState: !!storedState,
                        hasCodeVerifier: !!codeVerifier,
                    });
                    throw new TRPCError({
                        code: 'BAD_REQUEST',
                        message: 'Missing required OAuth parameters',
                    });
                }

                if (input.state !== storedState) {
                    console.error('[OAuth Callback] State mismatch:', {
                        received: input.state,
                        stored: storedState,
                    });
                    throw new TRPCError({
                        code: 'BAD_REQUEST',
                        message: 'State mismatch',
                    });
                }

                const resolvedRedirectUri =
                    pinnedRedirectUri && isAllowedRedirectUri(pinnedRedirectUri)
                        ? pinnedRedirectUri
                        : ALLOWED_REDIRECT_URIS[0];
                const tokenClient = oauthClientForRedirectUri(resolvedRedirectUri);

                let tokens: OAuth2Tokens;
                try {
                    tokens = await tokenClient.validateAuthorizationCode(
                        'https://auth.icssc.club/token',
                        input.code,
                        codeVerifier
                    );
                } catch (error) {
                    console.error('OAuth Callback - Invalid credentials:', error);
                    throw new TRPCError({
                        code: 'UNAUTHORIZED',
                        message: 'Invalid authorization code',
                    });
                }

                const claims = decodeIdToken(tokens.idToken()) as {
                    sub: string;
                    name: string;
                    email: string;
                    picture?: string;
                };

                const oidcRefreshToken = tokens.refreshToken();
                if (!oidcRefreshToken) {
                    console.error('OAuth Callback - Missing OIDC refresh token in response');
                }

                const tokenData = tokens.data as {
                    google_access_token?: string;
                    google_refresh_token?: string;
                    google_token_expiry?: number;
                };
                const googleAccessToken = tokenData.google_access_token;
                const googleRefreshToken = tokenData.google_refresh_token;
                if (!googleAccessToken || !googleRefreshToken) {
                    console.error('OAuth Callback - Missing Google tokens in OIDC response:', tokenData);
                }

                const oauthUserId = claims.sub;
                const username = claims.name;
                const email = claims.email;
                const picture = claims.picture;

                const account = await RDS.registerUserAccount(db, 'OIDC', oauthUserId, username, email, picture ?? '');

                const userId: string = account.userId;

                if (userId.length > 0) {
                    // Create session with OIDC and Google tokens
                    const session = await RDS.upsertSession(db, userId, oidcRefreshToken ?? '');

                    if (!session?.refreshToken) {
                        throw new TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to create session',
                        });
                    }

                    const sessionCookieOptions = `Path=/; HttpOnly; ${
                        isProduction ? 'Secure; SameSite=Lax' : 'SameSite=Lax'
                    }; Max-Age=2592000`;
                    ctx.resHeaders?.append(
                        'Set-Cookie',
                        `${SESSION_COOKIE_NAME}=${session.refreshToken}; ${sessionCookieOptions}`
                    );

                    return {
                        userId: userId,
                        providerId: oauthUserId,
                        newUser: account.newUser,
                    };
                }

                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to create user session',
                });
            } catch (error) {
                console.error('OAuth Callback - Error:', error);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to handle OAuth callback',
                });
            }
        }),

    saveUserData: protectedProcedure
        .input(z.object({ userData: z.custom<ScheduleSaveState>() }))
        .mutation(async ({ input, ctx }) => {
            const result = ScheduleSaveStateSchema.safeParse(input.userData);
            if (!result.success) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: `Invalid schedule data: ${result.error.message}`,
                });
            }

            const userData = result.data;

            try {
                return await RDS.upsertUserData(db, ctx.userId, userData);
            } catch (error) {
                console.error('RDS Failed to upsert user data:', error);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to save user data',
                });
            }
        }),

    getAuthReturnUrl: procedure.query(async ({ ctx }) => {
        const cookies = getCookiesFromHeader(ctx.req.headers);
        const redirectUrl = getSafeAuthRedirectPath(cookies['auth_redirect_url'], ctx.req.url, GOOGLE_REDIRECT_URI);
        return redirectUrl || '/';
    }),

    flagImportedSchedule: protectedProcedure.input(z.object({ username: z.string() })).mutation(async ({ input }) => {
        return await RDS.flagImportedUser(db, input.username);
    }),

    /**
     * Logs out a user by invalidating their session and redirecting to OIDC logout
     */
    logout: procedure.input(z.object({ redirectUrl: z.string().optional() })).mutation(async ({ input, ctx }) => {
        const isProduction = NODE_ENV === 'production';
        ctx.resHeaders?.append(
            'Set-Cookie',
            `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; ${isProduction ? 'Secure; SameSite=Lax' : 'SameSite=Lax'}; Max-Age=0`
        );

        if (ctx.sessionToken) {
            try {
                const session = await RDS.getCurrentSession(db, ctx.sessionToken);
                if (session) {
                    await RDS.removeSession(db, session.userId, session.refreshToken);
                }
            } catch (error) {
                console.error('Failed to remove session during logout:', error);
            }
        }

        // Build OIDC logout URL
        const oidcLogoutUrl = new URL(`${OIDC_ISSUER_URL}/logout`);
        const redirectTo = input.redirectUrl || GOOGLE_REDIRECT_URI.replace('/auth', '');
        oidcLogoutUrl.searchParams.set('post_logout_redirect_uri', redirectTo);

        return {
            logoutUrl: oidcLogoutUrl.toString(),
        };
    }),
});

export default userDataRouter;
