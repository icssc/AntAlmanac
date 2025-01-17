import { type } from 'arktype';

import { UserSchema } from '@packages/antalmanac-types';
import { OAuth2Client } from 'google-auth-library';

import { db } from 'src/db';
import { mangleDupliateScheduleNames } from 'src/lib/formatting';
import { RDS } from 'src/lib/rds';
import { TRPCError } from '@trpc/server';
import { procedure, router } from '../trpc';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

import { users, sessions } from '$db/schema';

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
    getGoogleAuthUrl: procedure.query(async () => {
        const url = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: ['profile', 'email'],
        });
        return url;
    }),
    handleGoogleCallback: procedure.input(z.object({ code: z.string() })).query(async ({ input }) => {
        // on signup/signin
        const { tokens } = await oauth2Client.getToken({ code: input.code });
        oauth2Client.setCredentials(tokens);
        const ticket = await oauth2Client.verifyIdToken({
            idToken: tokens.id_token!,
            audience: GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload()!;
        console.log(payload);

        let user = await db.query.users.findFirst({
            where: eq(users.id, payload.sub!),
        });
        if (!user) {
            // create user
            user = await db
                .insert(users)
                .values({
                    id: payload.sub,
                    name: payload.name,
                    avatar: payload.picture,
                })
                .returning()
                .then((res) => res[0]);
        }

        if (user) {
            // setup session
            const session = await db
                .insert(sessions)
                .values({
                    id: crypto.randomUUID(),
                    userId: user.id,
                    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                })
                .returning()
                .then((res) => res[0]);
        }
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
