import { type } from 'arktype';

import { UserSchema } from '@packages/antalmanac-types';

import { RDS } from 'src/lib/rds';
import { router, procedure } from '../trpc';
import { ddbClient } from '../db/ddb';

import { db } from '../db';

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
        return (await ddbClient.getUserData(input.userId)) ?? (await ddbClient.getLegacyUserData(input.userId));
    }),

    /**
     * Loads schedule data for a user that's logged in.
     */
    saveUserData: procedure
        .input(saveInputSchema.assert)
        .mutation(
            async ({ input }) => {
                // Don't await because the show must go on without RDS.
                RDS.upsertGuestUserData(db, input.data)
                    .catch((error) => console.error('Failed to upsert user data:', error));
                
                return ddbClient.insertItem(input.data);
            }
        ),

    /**
     * Users can view other users' schedules, even anonymously.
     * Visibility permissions are used to determine if a user can view another user's schedule.
     *
     * Visibility values:
     * - (default) private: Only the owner can view and edit.
     * - public: Other users can view, but can't edit, i.e. "read-only".
     * - open: Anybody can view and edit.
     */
    viewUserData: procedure.input(viewInputSchema.assert).query(async ({ input }) => {
        return await ddbClient.viewUserData(input.requesterId, input.requesteeId);
    }),
});

export default usersRouter;
