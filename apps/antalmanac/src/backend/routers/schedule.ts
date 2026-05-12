import { RDS } from '$src/backend/lib/rds';
import { procedure, protectedProcedure, router } from '$src/backend/trpc';
import { type ScheduleSaveState, ScheduleSaveStateSchema } from '@packages/antalmanac-types';
import { db } from '@packages/db';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

const scheduleRouter = router({
    get: protectedProcedure.query(async ({ ctx }) => {
        return await RDS.fetchUserDataWithSession(db, ctx.sessionToken);
    }),

    save: protectedProcedure
        .input(z.object({ userData: z.custom<ScheduleSaveState>() }))
        .mutation(async ({ input, ctx }) => {
            const result = ScheduleSaveStateSchema.safeParse(input.userData);
            if (!result.success) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: `Invalid schedule data: ${result.error.message}`,
                });
            }

            const userData = result.data;

            try {
                return await RDS.upsertUserData(db, ctx.userId, userData);
            } catch (error) {
                console.error('RDS Failed to upsert user data:', error);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to save user data',
                });
            }
        }),

    getGuest: procedure.input(z.object({ username: z.string() })).query(async ({ input }) => {
        const result = await RDS.getGuestScheduleByUsername(db, input.username);
        if (!result) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: `Couldn't find schedules for username "${input.username}".`,
            });
        }
        return result;
    }),

    flagImported: protectedProcedure.input(z.object({ username: z.string() })).mutation(async ({ input }) => {
        return await RDS.flagImportedUser(db, input.username);
    }),
});

export default scheduleRouter;
