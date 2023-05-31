import { procedure, router } from '../trpc';
import { ScheduleSaveStateSchema } from '@packages/antalmanac-types';
import { AuthUserClient } from '$db/ddb';

const authUsersRouter = router({
    getUserData: procedure.query(async ({ ctx }) => {
        const userData = await AuthUserClient.get(ctx.authId);
        return userData?.userData;
    }),
    updateUserData: procedure.input(ScheduleSaveStateSchema.assert).mutation(async ({ input, ctx }) => {
        await AuthUserClient.updateSchedule(ctx.authId, input);
    }),
});

export default authUsersRouter;
