import { RDS } from '$src/backend/lib/rds';
import { procedure, protectedProcedure, router } from '$src/backend/trpc';
import { db } from '@packages/db';

const authRouter = router({
    validateSession: procedure.query(({ ctx }) => {
        return ctx.sessionToken !== null && ctx.userId !== null;
    }),
    invalidateSession: protectedProcedure.mutation(async ({ ctx }) => {
        const session = await RDS.getCurrentSession(db, ctx.sessionToken);
        if (!session) {
            return false;
        }

        try {
            await RDS.removeSession(db, session.userId, session.refreshToken);
            return true;
        } catch {
            return false;
        }
    }),
    getSessionUserId: procedure.query(({ ctx }) => {
        return ctx.userId ?? '';
    }),
});

export default authRouter;
