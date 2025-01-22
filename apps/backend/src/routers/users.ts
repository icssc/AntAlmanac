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
        return await RDS.getGuestUserData(db, input.userId);
    }),
    handleGuestSession: procedure.input(z.object({ name: z.string() })).query(async ({ input }) => {
        const userId = await RDS.createGuestUserOptional(db, input.name);

        if (userId.length > 0) {
            let session = await RDS.upsertSession(db, userId, '');
            return session?.refreshToken ?? null;
        }
        return null;
    }),
    /**
     * Returns the current session, returns true if the session exists exist and hasn't expired
     */
    validateSession: procedure.input(z.object({ token: z.string() })).query(async ({ input }) => {
        if (input.token === '') return false;
        const session = await RDS.getCurrentSession(db, input.token);
        return session !== null && session.expires > new Date();
    }),
    /**
     */
    removeSession: procedure.input(z.object({ token: z.string() })).mutation(async ({ input }) => {
        const session = await RDS.getCurrentSession(db, input.token);
        if (!session) return null;

        await RDS.removeSession(db, session.userId, session.refreshToken);
    }),
    /**
     * Returns the user id associated with a given session
     */
    getSessionUser: procedure.input(z.object({ token: z.string() })).query(async ({ input }) => {
        const user = await RDS.getCurrentSession(db, input.token);
        if (user) return user.userId;
        return '';
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
            // const { tokens } = await oauth2Client.getToken({ code: input.code });
            const { tokens } = await oauth2Client.getToken({ code: input.code });
            oauth2Client.setCredentials(tokens);
            const ticket = await oauth2Client.verifyIdToken({
                idToken: tokens.id_token!,
                audience: GOOGLE_CLIENT_ID,
            });

            const payload = ticket.getPayload()!;
            let account = await RDS.getAccount(db, payload.sub);

            let userId: string;
            if (account) {
                userId = account.userId;
            } else {
                const newAccount = await RDS.createUserAccount(
                    db,
                    payload.sub,
                    payload.picture ?? '',
                    payload.name ?? '',
                    'GOOGLE'
                );
                userId = newAccount?.userId ?? '';
            }

            if (userId.length > 0) {
                let session = await RDS.upsertSession(db, userId, input.token);
                return session?.refreshToken ?? null;
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

        return await RDS.upsertGuestUserData(db, data).catch((error) =>
            console.error('RDS Failed to upsert user data:', error)
        );
    }),
});

export default usersRouter;
