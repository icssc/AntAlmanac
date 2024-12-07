import { type } from 'arktype';


import { UserSchema } from '@packages/antalmanac-types';

import { db } from 'src/db';
import { mangleDupliateScheduleNames } from 'src/lib/formatting';
import { RDS } from 'src/lib/rds';
import { TRPCError } from '@trpc/server';
import { procedure, router } from '../trpc';

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

const usersRouter = router({
    /**
     * Loads schedule data for a user that's logged in.
     */
    getUserData: procedure.input(userInputSchema.assert).query(async ({ input }) => {
        if ('googleId' in input) {
            throw new TRPCError({
                code: 'NOT_IMPLEMENTED',
                message: 'Google login not implemented',
            })
        }
        return await RDS.getGuestUserData(db, input.userId);
    }),

    /**
     * Loads schedule data for a user that's logged in.
     */
    saveUserData: procedure
        .input(saveInputSchema.assert)
        .mutation(
            async ({ input }) => {
                const data = input.data;

                // Mangle duplicate schedule names
                data.userData.schedules = mangleDupliateScheduleNames(data.userData.schedules);

                await RDS.upsertGuestUserData(db, data)
                    .catch((error) => console.error('Failed to upsert user data:', error));
            }
        ),
});

export default usersRouter;
