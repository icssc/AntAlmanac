import { z } from 'zod';

import { procedure, router } from '../trpc';

import { db } from 'src/db';
import { RDS } from 'src/lib/rds';

const authRouter = router({
    /**
     * Returns the session refresh token for a guest user
     */
    handleGuestSession: procedure.input(z.object({ name: z.string() })).query(async ({ input }) => {
        const account = await RDS.registerUserAccount(db, input.name, input.name, 'GUEST');

        if (account && account.userId.length > 0) {
            const session = await RDS.upsertSession(db, account.userId);
            return session?.refreshToken;
        }
        return null;
    }),
    /**
     * returns true if the session exists exist and hasn't expired
     */
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
