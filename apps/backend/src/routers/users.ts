import { type } from 'arktype';
import { UserSchema } from '@packages/antalmanac-types';
import { router, procedure } from '../trpc';
import { ddbClient } from '../db/ddb';

const userInputSchema = type([{ userId: 'string' }, '|', { googleId: 'string' }]);

const usersRouter = router({
    getUserData: procedure.input(userInputSchema.assert).query(async ({ input }) => {
        if ('googleId' in input) {
            return await ddbClient.getGoogleUserData(input.googleId);
        }
        return (await ddbClient.getUserData(input.userId)) ?? (await ddbClient.getLegacyUserData(input.userId));
    }),
    saveUserData: procedure.input(UserSchema.assert).mutation(async ({ input }) => {
        await ddbClient.insertItem(input);
    }),
});

export default usersRouter;
