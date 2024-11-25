import { type } from 'arktype';

import { UserSchema } from '@packages/antalmanac-types';

import { db } from 'src/db';
import { ddbClient } from 'src/db/ddb';
import { mangleDupliateScheduleNames } from 'src/lib/formatting';
import { RDS } from 'src/lib/rds';
import { procedure, router } from '../trpc';

const userInputSchema = type([{ userId: 'string' }, '|', { googleId: 'string' }]);

const viewInputSchema = type({
    /**
     * ID of the user who's requesting to view another user's schedule.
     */
    requesterId: 'string',

    /**
     * ID of the user whose schedule is being requested.
     */
    requesteeId: 'string',
});

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
            return await ddbClient.getGoogleUserData(input.googleId);
        }
        return await ddbClient.getUserData(input.userId);
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

                // Don't await because the show must go on without RDS.
                RDS.upsertGuestUserData(db, data)
                    .catch((error) => console.error('Failed to upsert user data:', error));
                
                return ddbClient.insertItem(data);
            }
        ),
});

export default usersRouter;
