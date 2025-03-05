
import { z } from 'zod';
import { db } from 'src/db';
import { RDS } from 'src/lib/rds';
import { procedure, router } from '../trpc';

const authRouter = router({
    handleGuestSession: procedure.input(z.object({ name: z.string() })).query(async ({ input }) => {
        const account = await RDS.registerUserAccount(db, input.name, input.name, 'GUEST');

        if (account.userId.length > 0) {
            let session = await RDS.upsertSession(db, account.userId);
            return session?.refreshToken;
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
    Removes a session from the database
     */
    removeSession: procedure.input(z.object({ token: z.string() })).mutation(async ({ input }) => {
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
