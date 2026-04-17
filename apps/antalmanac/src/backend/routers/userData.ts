import { SESSION_COOKIE_NAME } from '$src/backend/context';
import { oidcOAuthEnvSchema } from '$src/backend/env';
import { oauth } from '$src/backend/lib/auth/oauth';
import { mangleDuplicateScheduleNames } from '$src/backend/lib/formatting';
import { RDS } from '$src/backend/lib/rds';
import { procedure, protectedProcedure, router } from '$src/backend/trpc';
import type { ScheduleSaveState } from '@packages/antalmanac-types';
import { db } from '@packages/db';
import { TRPCError } from '@trpc/server';
import { CodeChallengeMethod, decodeIdToken, generateCodeVerifier, generateState, type OAuth2Tokens } from 'arctic';
import { type } from 'arktype';
import { z } from 'zod';

const { OIDC_ISSUER_URL, GOOGLE_REDIRECT_URI } = oidcOAuthEnvSchema.parse(process.env);
const NODE_ENV = process.env.NODE_ENV;

const userInputSchema = type([{ userId: 'string' }, '|', { googleId: 'string' }]);

const saveInputSchema = z.object({
    /**
     * Schedule data being saved on behalf of the authenticated session user.
     */
    userData: z.custom<ScheduleSaveState>(),
});

const saveGoogleSchema = type({
    code: 'string',
    state: 'string',
});

const userDataRouter = router({
    getUserAndAccountBySessionToken: protectedProcedure.query(async ({ ctx }) => {
        return await RDS.getUserAndAccountBySessionToken(db, ctx.sessionToken);
    }),

    /**
     * Retrieves the currently authenticated user's profile.
     *
     * @returns The user row (email/name/avatar/...) for the session user.
     */
    getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
        return await RDS.getUserById(db, ctx.userId);
    }),

    /**
     * Retrieves google ID by user ID.
     * @param input - An object containing the user ID.
     * @returns The user's google ID associated with the user ID.
     */
    getGoogleIdByUserId: protectedProcedure.query(async ({ ctx }) => {
        return await RDS.getGoogleIdByUserId(db, ctx.userId);
    }),

    /**
     * Retrieves user data by user ID.
     * @param input - An object containing the user ID.
     * @returns The user data associated with the user ID.
     */
    getUserData: procedure.input(userInputSchema.assert).query(async ({ input }) => {
        if ('userId' in input) {
            return await RDS.getUserDataByUid(db, input.userId);
        } else {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Invalid input: userId is required',
            });
        }
    }),
    getUserDataWithSession: protectedProcedure.query(async ({ ctx }) => {
        return await RDS.fetchUserDataWithSession(db, ctx.sessionToken);
    }),

    getGuestAccountAndUserByName: procedure.input(z.object({ name: z.string() })).query(async ({ input }) => {
        const result = await RDS.getGuestAccountAndUserByName(db, input.name);
        if (!result) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'User not found',
            });
        }
        return result;
    }),

    /**
     * Resolves a guest username to its internal account/user id so callers can
     * then read the guest's public schedule via `getUserData`.
     *
     * Intentionally restricted to GUEST accounts — OIDC accounts are not
     * lookup-able by provider id through this public endpoint.
     */
    getAccountByProviderId: procedure.input(z.object({ providerId: z.string() })).query(async ({ input }) => {
        const account = await RDS.getAccountByProviderId(db, 'GUEST', input.providerId);
        if (!account) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: `Couldn't find schedules for username "${input.providerId}".`,
            });
        }
        return account;
    }),
    /**
     * Retrieves Google authentication URL for login/sign up.
     * Retrieves Google auth url to login/sign up
     */
    getGoogleAuthUrl: procedure
        .input(z.object({ prompt: z.enum(['none', 'consent']).optional() }).optional())
        .query(async ({ input, ctx }) => {
            const state = generateState();
            const codeVerifier = generateCodeVerifier();

            const url = oauth.createAuthorizationURLWithPKCE(
                'https://auth.icssc.club/authorize',
                state,
                CodeChallengeMethod.S256,
                codeVerifier,
                [
                    'openid',
                    'profile',
                    'email',
                    // 'https://www.googleapis.com/auth/calendar.readonly'
                ]
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

            const referer = ctx.req.headers.get('referer');
            if (referer) {
                ctx.resHeaders?.append(
                    'Set-Cookie',
                    `auth_redirect_url=${encodeURIComponent(referer)}; ${cookieOptions}`
                );
            }

            return url;
        }),
    /**
     * Logs in or signs up a user and creates user's session
     */
    handleGoogleCallback: procedure.input(saveGoogleSchema.assert).mutation(async ({ input, ctx }) => {
        try {
            // Parse cookies from request headers
            const cookieHeader = ctx.req.headers.get('cookie') ?? '';
            const cookies = Object.fromEntries(
                cookieHeader
                    .split('; ')
                    .filter((c) => c.includes('='))
                    .map((c) => {
                        const [key, ...v] = c.split('=');
                        return [key, v.join('=')];
                    })
            );

            const storedState = cookies['oauth_state'] ?? null;
            const codeVerifier = cookies['oauth_code_verifier'] ?? null;
            const redirectUrl = decodeURIComponent(cookies['auth_redirect_url'] ?? '/');

            // Delete cookies via response headers
            const isProduction = NODE_ENV === 'production';
            const deleteCookieOptions = `Path=/; HttpOnly; ${
                isProduction ? 'Secure; SameSite=None' : 'SameSite=Lax'
            }; Max-Age=0`;
            ctx.resHeaders?.append('Set-Cookie', `oauth_state=; ${deleteCookieOptions}`);
            ctx.resHeaders?.append('Set-Cookie', `oauth_code_verifier=; ${deleteCookieOptions}`);
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

            let tokens: OAuth2Tokens;
            try {
                tokens = await oauth.validateAuthorizationCode(
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
                    redirectUrl,
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

    /**
     * Logs in or signs up existing user
     */
    //     handleGuestLogin: procedure.input(z.object({ name: z.string() })).query(async ({ input }) => {
    //         const account = await RDS.registerUserAccount(db, input.name, input.name, 'GUEST');
    //
    //         if (account.userId.length > 0) {
    //             const session = await RDS.upsertSession(db, account.userId);
    //             return session?.refreshToken;
    //         }
    //         return null;
    //     }),
    /**
     * Saves schedule data for the currently authenticated user.
     *
     * The owning user is derived from the session; the client only sends the
     * schedule payload.
     */
    saveUserData: protectedProcedure.input(saveInputSchema).mutation(async ({ input, ctx }) => {
        const userData = input.userData;
        userData.schedules = mangleDuplicateScheduleNames(userData.schedules);

        return await RDS.upsertUserData(db, ctx.userId, userData).catch((error) =>
            console.error('RDS Failed to upsert user data:', error)
        );
    }),

    flagImportedSchedule: protectedProcedure.input(z.object({ providerId: z.string() })).mutation(async ({ input }) => {
        return await RDS.flagImportedUser(db, input.providerId);
    }),

    /**
     * Logs out a user by invalidating their session and redirecting to OIDC logout
     */
    logout: procedure.input(z.object({ redirectUrl: z.string().optional() })).mutation(async ({ input, ctx }) => {
        if (ctx.sessionToken) {
            const session = await RDS.getCurrentSession(db, ctx.sessionToken);
            if (session) {
                await RDS.removeSession(db, session.userId, session.refreshToken);
            }
        }

        const isProduction = NODE_ENV === 'production';
        ctx.resHeaders?.append(
            'Set-Cookie',
            `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; ${isProduction ? 'Secure; SameSite=Lax' : 'SameSite=Lax'}; Max-Age=0`
        );

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
