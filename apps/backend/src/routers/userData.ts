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

const userDataRouter = router({
    /**
     * Loads schedule data for a user that's logged in.
     * @param input - An object containing the session token.
     * @returns The account and user data associated with the session token.
     */
    getUserAndAccountBySessionToken: procedure.input(z.object({ token: z.string() })).query(async ({ input }) => {
        return await RDS.getAccountAndUserByToken(db, input.token);
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

    getGuestUserByName: procedure.input(z.object({ name: z.string() })).query(async ({ input }) => {
        return RDS.getGuestAccountAndUserByName(db, input.name);
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
    handleGoogleCallback: procedure
        .input(z.object({ code: z.string(), token: z.string() }))
        .mutation(async ({ input }) => {
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
                return session?.refreshToken;
            }
            return null;
        }),
    /**
     * Logs in or signs up existing user
     */
    handleGuestLogin: procedure.input(z.object({ name: z.string() })).query(async ({ input }) => {
        const account = await RDS.registerUserAccount(db, input.name, input.name, 'GUEST');

        if (account.userId.length > 0) {
            const session = await RDS.upsertSession(db, account.userId);
            return session?.refreshToken;
        }
        return null;
    }),
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
});

export default userDataRouter;
