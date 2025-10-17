import { UserSchema } from '@packages/antalmanac-types';
import { TRPCError } from '@trpc/server';
import { type } from 'arktype';
import * as client from 'openid-client';
import { z } from 'zod';

import { db } from 'src/db';
import { oidcEnvSchema } from 'src/env';
import { mangleDuplicateScheduleNames } from 'src/lib/formatting';
import { RDS } from 'src/lib/rds';
import { procedure, router } from '../trpc';

const { OIDC_CLIENT_ID, GOOGLE_REDIRECT_URI, OIDC_ISSUER_URL } = oidcEnvSchema.parse(process.env);

const userInputSchema = type([{ userId: 'string' }, '|', { googleId: 'string' }]);

// OIDC Configuration (replaces Google OAuth2Client)
let oidcConfig: client.Configuration | null = null;

const getOidcConfig = async (): Promise<client.Configuration> => {
    if (!oidcConfig) {
        console.log('[OIDC] Discovering issuer at:', OIDC_ISSUER_URL);
        console.log('[OIDC] Using client ID:', OIDC_CLIENT_ID);
        oidcConfig = await client.discovery(new URL(OIDC_ISSUER_URL), OIDC_CLIENT_ID, undefined, client.None());
        console.log('[OIDC] Discovery successful, issuer:', oidcConfig.serverMetadata().issuer);
    }
    return oidcConfig;
};

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
    token: 'string',
    code_verifier: 'string',
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
     * Retrieves OIDC authentication URL for login/sign up.
     * (Previously Google OAuth, now OIDC but functionally identical)
     */
    getOidcAuthUrl: procedure.query(async () => {
        try {
            const config = await getOidcConfig();

            const code_verifier = client.randomPKCECodeVerifier();
            const code_challenge = await client.calculatePKCECodeChallenge(code_verifier);
            const state = client.randomState();

            console.log('[OIDC] Generating auth URL with PKCE');

            const authUrl = client.buildAuthorizationUrl(config, {
                redirect_uri: GOOGLE_REDIRECT_URI,
                scope: 'openid profile email',
                code_challenge,
                code_challenge_method: 'S256',
                state,
                // Note: Not using nonce since PKCE already provides protection
            });

            console.log('[OIDC] Auth URL generated successfully');

            return {
                url: authUrl.toString(),
                code_verifier,
                state,
            };
        } catch (error: unknown) {
            const err = error as Error;
            console.error('[OIDC] Error generating auth URL:', err.message);
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to generate authentication URL',
            });
        }
    }),

    /**
     * Logs in or signs up a user and creates user's session
     * (Previously Google OAuth callback, now OIDC but functionally identical)
     */
    handleOidcCallback: procedure.input(saveGoogleSchema.assert).mutation(async ({ input }) => {
        try {
            const config = await getOidcConfig();

            console.log('[OIDC] Handling callback with code:', input.code.substring(0, 10) + '...');
            console.log('[OIDC] Using PKCE code_verifier and state validation');

            // Build callback URL with the authorization code
            const callbackUrl = new URL(GOOGLE_REDIRECT_URI);
            callbackUrl.searchParams.set('code', input.code);
            callbackUrl.searchParams.set('state', input.state);

            console.log('[OIDC] Callback URL constructed');

            // Exchange authorization code for tokens with PKCE
            let tokens: client.TokenEndpointResponse;
            try {
                // Log the token endpoint being used
                const tokenEndpoint = config.serverMetadata().token_endpoint;
                console.log('[OIDC] Token endpoint:', tokenEndpoint);
                console.log('[OIDC] Exchanging code with PKCE verifier');

                // Set custom fetch for debugging
                config[client.customFetch] = async (url: string, options: RequestInit) => {
                    console.log('[OIDC] Fetching:', url);
                    console.log('[OIDC] Request headers:', options.headers);
                    const response = await fetch(url, options);
                    const clonedResponse = response.clone();
                    const text = await clonedResponse.text();
                    console.log('[OIDC] Response status:', response.status);
                    console.log('[OIDC] Response Content-Type:', response.headers.get('content-type'));
                    console.log('[OIDC] Response body:', text);
                    return response;
                };

                tokens = await client.authorizationCodeGrant(config, callbackUrl, {
                    pkceCodeVerifier: input.code_verifier,
                    expectedState: input.state,
                    // Skip nonce validation - we're already secured with PKCE
                    // The nonce would need to be validated against the ID token, but we're not
                    // verifying ID token signatures in this flow (using access token + userinfo instead)
                });
                console.log('[OIDC] Token exchange successful with PKCE validation');
                console.log('[OIDC] Access token received, id_token present:', !!tokens.id_token);
            } catch (callbackError: unknown) {
                const err = callbackError as Error & {
                    error?: string;
                    error_description?: string;
                    response?: { status?: number; statusText?: string };
                };
                console.error('[OIDC] Token exchange failed:', {
                    error: err.message,
                    errorDescription: err.error_description,
                    error_type: err.error,
                    status: err.response?.status,
                    statusText: err.response?.statusText,
                    stack: err.stack,
                });
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: `Token exchange failed: ${err.message}`,
                });
            }

            if (!tokens || !tokens.access_token) {
                console.error('[OIDC] No access token in response');
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'No access token received',
                });
            }

            // Get user info from ID token claims (no userinfo endpoint needed)
            // Decode the ID token to get claims
            if (!tokens.id_token) {
                console.error('[OIDC] No ID token in response');
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'No ID token received',
                });
            }

            // Parse JWT payload (claims are in the middle part of the JWT)
            const idTokenParts = tokens.id_token.split('.');
            const idTokenPayload = JSON.parse(Buffer.from(idTokenParts[1], 'base64').toString());

            console.log('[OIDC] ID token claims:', {
                sub: idTokenPayload.sub,
                email: idTokenPayload.email,
                name: idTokenPayload.name,
            });

            // Map ID token claims to userInfo format
            const userInfo = {
                sub: idTokenPayload.sub as string,
                email: (idTokenPayload.email as string) || '',
                name: (idTokenPayload.name as string) || '',
                picture: (idTokenPayload.picture as string) || '',
            };

            if (!userInfo.sub) {
                console.error('[OIDC] Invalid ID token claims - missing sub');
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'Invalid ID token - missing subject (sub) claim',
                });
            }

            // Register or get user account (using 'GOOGLE' type to maintain compatibility)
            console.log('[OIDC] Registering user account with sub:', userInfo.sub);
            const account = await RDS.registerUserAccount(
                db,
                userInfo.sub,
                userInfo.name || userInfo.email || 'OIDC User',
                'GOOGLE', // Keep as 'GOOGLE' to maintain database compatibility
                userInfo.email,
                userInfo.picture
            );

            const userId: string = account.userId;
            console.log('[OIDC] User account registered/retrieved, userId:', userId);

            if (userId.length > 0) {
                const session = await RDS.upsertSession(db, userId, input.token);
                console.log('[OIDC] Session created successfully');
                return {
                    sessionToken: session?.refreshToken,
                    userId: userId,
                    providerId: userInfo.sub,
                    newUser: account.newUser,
                };
            }

            console.warn('[OIDC] No userId returned from account registration');
            return { sessionToken: null, userId: null, providerId: null, newUser: account.newUser };
        } catch (error: unknown) {
            const err = error as Error & { code?: string; name?: string };
            // Catch-all error handler with detailed logging
            console.error('[OIDC] Unexpected error in handleGoogleCallback:', {
                message: err.message,
                code: err.code,
                name: err.name,
                stack: err.stack,
            });

            // Re-throw TRPCErrors as-is
            if (error instanceof TRPCError) {
                throw error;
            }

            // Wrap other errors
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: `Authentication failed: ${err.message}`,
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
});

export default userDataRouter;
