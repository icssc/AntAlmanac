import { procedure, router } from '../trpc';
import { z } from 'zod';
import { db } from 'src/db';
import { RDS } from 'src/lib/rds';

const sessionRouter = router({
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
});

export default sessionRouter;
