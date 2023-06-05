import { procedure, router } from '../trpc';
import { ScheduleSaveStateSchema } from '@packages/antalmanac-types';
import { AuthUserClient } from '$db/ddb';

const authUsersRouter = router({
    getUserData: procedure.query(async ({ ctx }) => {
        console.log('got user data')
        console.log(ctx.authId)
        const authUser = await AuthUserClient.get(ctx.authId);
        if (authUser) {
            const {id, ...cleanedAuthUser} = authUser;
            return cleanedAuthUser;
        }
    }),
    updateUserData: procedure.input(ScheduleSaveStateSchema.assert).mutation(async ({ input, ctx }) => {
        await AuthUserClient.updateSchedule(ctx.authId, input);
    }),
});

export default authUsersRouter;
