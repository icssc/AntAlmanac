import { UserSchema } from '@packages/antalmanac-types';
import { TRPCError } from '@trpc/server';
import { type } from 'arktype';
import { OAuth2Client } from 'google-auth-library';
import { z } from 'zod';

import { db } from 'src/db';
import { googleOAuthEnvSchema } from 'src/env';
import { mangleDuplicateScheduleNames } from 'src/lib/formatting';
import { RDS } from 'src/lib/rds';
import { procedure, router } from '../trpc';

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = googleOAuthEnvSchema.parse(process.env);

const userInputSchema = type([{ userId: 'string' }, '|', { googleId: 'string' }]);

const oauth2Client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);

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
     * Retrieves google ID by user ID.
     * @param input - An object containing the user ID.
     * @returns The user's google ID associated with the user ID.
     */
    getGoogleIdByUserId: procedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
        return await RDS.getGoogleIdByUserId(db, input.userId);
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
    getGoogleAuthUrl: procedure.query(async () => {
        const url = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: ['profile', 'email'],
        });
        return url;
    }),
    /**
     * Logs in or signs up a user and creates user's session
     */
    handleGoogleCallback: procedure.input(saveGoogleSchema.assert).mutation(async ({ input }) => {
        const { tokens } = await oauth2Client.getToken({ code: input.code });
        if (!tokens || !tokens.id_token) {
            throw new TRPCError({
                code: 'UNAUTHORIZED',
                message: 'Invalid token',
            });
        }
        oauth2Client.setCredentials(tokens);

        const ticket = await oauth2Client.verifyIdToken({
            idToken: tokens.id_token ?? '',
            audience: GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload) {
            throw new TRPCError({
                code: 'UNAUTHORIZED',
                message: 'Invalid ID token',
            });
        }

        const account = await RDS.registerUserAccount(
            db,
            payload.sub,
            payload.name ?? '',
            'GOOGLE',
            payload.email ?? '',
            payload.picture ?? ''
        );

        const userId: string = account.userId;

        if (userId.length > 0) {
            const session = await RDS.upsertSession(db, userId, input.token);
            return {
                sessionToken: session?.refreshToken,
                userId: userId,
                providerId: payload.sub,
                newUser: account.newUser,
            };
        }

        return { sessionToken: null, userId: null, providerId: null, newUser: account.newUser };
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
