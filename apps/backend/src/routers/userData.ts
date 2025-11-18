import { UserSchema } from '@packages/antalmanac-types';
import { TRPCError } from '@trpc/server';
import { type } from 'arktype';
import { z } from 'zod';

import { db } from 'src/db';
import { oidcOAuthEnvSchema } from 'src/env';
import { mangleDuplicateScheduleNames } from 'src/lib/formatting';
import { RDS } from 'src/lib/rds';
import { oauth } from 'src/lib/auth/oauth';
import { CodeChallengeMethod, decodeIdToken, generateCodeVerifier, generateState, OAuth2Tokens } from 'arctic';
import { procedure, router } from '../trpc';

const { OIDC_ISSUER_URL, GOOGLE_OAUTH_REDIRECT_URI } = oidcOAuthEnvSchema.parse(process.env);
const NODE_ENV = process.env.NODE_ENV;

const userInputSchema = type([{ userId: 'string' }, '|', { googleId: 'string' }]);

const saveInputSchema = type({
    /**
     * ID of the requester.
     */
    id: 'string',

    /**
     * Schedule data being saved.
     *
     * The ID of the requester and user ID in the schedule data may differ,
     * i.e. if the user is editing and saving another user's schedule.
     */
    data: UserSchema,
});

const saveGoogleSchema = type({
    code: 'string',
    state: 'string',
});

const userDataRouter = router({
    /**
     * Loads schedule data for a user that's logged in.
     * @param input - An object containing the session token.
     * @returns The account and user data associated with the session token.
     */
    getUserAndAccountBySessionToken: procedure.input(z.object({ token: z.string() })).query(async ({ input }) => {
        return await RDS.getUserAndAccountBySessionToken(db, input.token);
    }),

    /**
     * Retrieves user information by user ID.
     * @param input - An object containing the user ID.
     * @returns The user information associated with the user ID.
     */
    getUserByUid: procedure.input(userInputSchema.assert).query(async ({ input }) => {
        if ('userId' in input) {
            return await RDS.getUserById(db, input.userId);
        } else {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Invalid input: userId is required',
            });
        }
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
    getUserDataWithSession: procedure.input(z.object({ refreshToken: z.string() })).query(async ({ input }) => {
        if ('refreshToken' in input) {
            return await RDS.fetchUserDataWithSession(db, input.refreshToken);
        } else {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Invalid input: userId is required',
            });
        }
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

    getAccountByProviderId: procedure
        .input(z.object({ accountType: z.enum(['GOOGLE', 'GUEST']), providerId: z.string() }))
        .query(async ({ input }) => {
            const account = await RDS.getAccountByProviderId(db, input.accountType, input.providerId);
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
    getGoogleAuthUrl: procedure.query(async ({ ctx }) => {
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

        const res = ctx.res;

        const isProduction = NODE_ENV === 'production';
        const cookieOptions = {
            path: '/',
            httpOnly: true,
            secure: isProduction,
            maxAge: 60 * 10 * 1000, // 10 minutes
            sameSite: isProduction ? ('none' as const) : ('lax' as const),
        };

        res.cookie('oauth_state', state, cookieOptions);
        res.cookie('oauth_code_verifier', codeVerifier, cookieOptions);

        const referer = ctx.req.headers.referer;

        if (referer) {
            res.cookie('auth_redirect_url', referer, cookieOptions);
        }

        return url;
    }),
    /**
     * Logs in or signs up a user and creates user's session
     */
    handleGoogleCallback: procedure.input(saveGoogleSchema.assert).mutation(async ({ input, ctx }) => {
        const { req, res } = ctx;

        const storedState = req.cookies.oauth_state ?? null;
        const codeVerifier = req.cookies.oauth_code_verifier ?? null;
        const redirectUrl = req.cookies.auth_redirect_url ?? '/';

        res.clearCookie('auth_redirect_url');
        res.clearCookie('oauth_state');
        res.clearCookie('oauth_code_verifier');

        if (!input.code || !input.state || !storedState || !codeVerifier) {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Missing required OAuth parameters',
            });
        }

        if (input.state !== storedState) {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'State mismatch',
            });
        }

        let tokens: OAuth2Tokens;
        try {
            tokens = await oauth.validateAuthorizationCode('https://auth.icssc.club/token', input.code, codeVerifier);
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

        const account = await RDS.registerUserAccount(
            db,
            oauthUserId,
            username ?? '',
            'OIDC',
            email ?? '',
            picture ?? ''
        );

        const userId: string = account.userId;

        if (userId.length > 0) {
            // Create session with OIDC and Google tokens
            const session = await RDS.upsertSession(db, userId, oidcRefreshToken ?? '');

            return {
                sessionToken: session?.refreshToken,
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
     * Loads schedule data for a user that's logged in.
     */
    saveUserData: procedure.input(saveInputSchema.assert).mutation(async ({ input }) => {
        const data = input.data;

        // Mangle duplicate schedule names
        data.userData.schedules = mangleDuplicateScheduleNames(data.userData.schedules);

        return await RDS.upsertUserData(db, data).catch((error) =>
            console.error('RDS Failed to upsert user data:', error)
        );
    }),

    flagImportedSchedule: procedure.input(z.object({ providerId: z.string() })).mutation(async ({ input }) => {
        return await RDS.flagImportedUser(db, input.providerId);
    }),

    /**
     * Logs out a user by invalidating their session and redirecting to OIDC logout
     */
    logout: procedure
        .input(z.object({ sessionToken: z.string(), redirectUrl: z.string().optional() }))
        .mutation(async ({ input }) => {
            // Invalidate the local session
            const session = await RDS.getCurrentSession(db, input.sessionToken);
            if (session) {
                await RDS.removeSession(db, session.userId, session.refreshToken);
            }

            // Build OIDC logout URL
            const oidcLogoutUrl = new URL(`${OIDC_ISSUER_URL}/logout`);
            const redirectTo = input.redirectUrl || GOOGLE_OAUTH_REDIRECT_URI.replace('/auth', '');
            oidcLogoutUrl.searchParams.set('post_logout_redirect_uri', redirectTo);

            return {
                logoutUrl: oidcLogoutUrl.toString(),
            };
        }),
});

export default userDataRouter;
