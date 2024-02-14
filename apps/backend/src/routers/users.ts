import { type } from 'arktype';
import { UserSchema } from '@packages/antalmanac-types';
import { router, procedure } from '../trpc';
import { ddbClient } from '../db/ddb';

const userInputSchema = type([{ userId: 'string' }, '|', { googleId: 'string' }]);

const usersRouter = router({
    getUserData: procedure.input(userInputSchema.assert).query(async ({ input }) => {
        if ('userId' in input) {
            return (
                (await ddbClient.getUserData(input.userId)) ??
                (await ddbClient.getLegacyUserData(input.userId))
            );
        } else {
            console.log('Google is not yet supported... Google ID: ', input.googleId);
        }
    }),
    saveUserData: procedure.input(UserSchema.assert).mutation(async ({ input }) => {
        await ddbClient.insertItem(input);
    }),
});

export default usersRouter;
