import { type } from 'arktype';

import { UserSchema } from '@packages/antalmanac-types';
import { OAuth2Client } from 'google-auth-library';

import { db } from 'src/db';
import { mangleDupliateScheduleNames } from 'src/lib/formatting';
import { RDS } from 'src/lib/rds';
import { TRPCError } from '@trpc/server';
import { procedure, router } from '../trpc';
import { z } from 'zod';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = 'http://localhost:5173';

const userInputSchema = type([{ userId: 'string' }, '|', { googleId: 'string' }]);

const oauth2Client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REDIRECT_URI);

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

const usersRouter = router({
    /**
     * Loads schedule data for a user that's logged in.
     */
    getUserData: procedure.input(userInputSchema.assert).query(async ({ input }) => {
        if ('googleId' in input) {
            throw new TRPCError({
                code: 'NOT_IMPLEMENTED',
                message: 'Google login not implemented',
            });
        }
        return await RDS.getUserDataByUid(db, input.userId);
    }),
    /**
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
        .query(async ({ input }) => {
            const { tokens } = await oauth2Client.getToken({ code: input.code });
            oauth2Client.setCredentials(tokens);
            const ticket = await oauth2Client.verifyIdToken({
                idToken: tokens.id_token!,
                audience: GOOGLE_CLIENT_ID,
            });

            const payload = ticket.getPayload()!;

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
                let session = await RDS.upsertSession(db, userId, input.token);
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
            let session = await RDS.upsertSession(db, account.userId);
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
        data.userData.schedules = mangleDupliateScheduleNames(data.userData.schedules);

        return await RDS.upsertUserData(db, data).catch((error) =>
            console.error('RDS Failed to upsert user data:', error)
        );
    }),
});

export default usersRouter;
