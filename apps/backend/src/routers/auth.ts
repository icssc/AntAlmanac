import { z } from 'zod';

import { db } from 'src/db';
import { RDS } from 'src/lib/rds';
import { procedure, router } from '../trpc';

const authRouter = router({
    validateSession: procedure.input(z.object({ token: z.string() })).query(async ({ input }) => {
        if (input.token === '') return false;
        const session = await RDS.getCurrentSession(db, input.token);

        return session !== null && session.expires > new Date();
    }),
    /**
     * Removes a session from the database
     */
    invalidateSession: procedure.input(z.object({ token: z.string() })).mutation(async ({ input }) => {
        const session = await RDS.getCurrentSession(db, input.token);
        if (!session) return false;

        try {
            await RDS.removeSession(db, session.userId, session.refreshToken);
            return true;
        } catch (error) {
            return false;
        }
    }),
    /**
     * Returns the user id associated with a given session
     */
    getSessionUserId: procedure.input(z.object({ token: z.string() })).query(async ({ input }) => {
        if (input.token === '') return '';
        const session = (await RDS.getCurrentSession(db, input.token)) ?? '';
        return session.userId;
    }),
});

export default authRouter;
