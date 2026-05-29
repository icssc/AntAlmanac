import { RDS } from '$src/backend/lib/rds';
import { procedure, protectedProcedure, router } from '$src/backend/trpc';
import { type ScheduleSaveState, ScheduleSaveStateSchema } from '@packages/antalmanac-types';
import { db } from '@packages/db';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

const scheduleRouter = router({
    get: protectedProcedure.query(async ({ ctx }) => {
        return await RDS.fetchUserDataByUserId(db, ctx.userId);
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

    /**
     * Retrieves a friend's user data filtered to only schedules shared with friends.
     * @param input - An object containing the friend's user ID.
     * @returns The friend's shared schedule data.
     */
    getFriendUserData: protectedProcedure.input(z.object({ userId: z.string() })).query(async ({ input, ctx }) => {
        const allowed = await RDS.areFriends(db, ctx.userId, input.userId);
        if (!allowed) {
            throw new TRPCError({ code: 'FORBIDDEN', message: 'You are not friends with this user.' });
        }
        return await RDS.getUserFriendDataByUid(db, input.userId);
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

    /**
     * Retrieves a shared schedule by schedule ID.
     * All schedules are publicly accessible via their ID.
     * @param input - An object containing the schedule ID.
     * @returns The schedule data associated with the schedule ID, or throws NOT_FOUND if not found.
     */
    getSharedSchedule: procedure.input(z.object({ scheduleId: z.string() })).query(async ({ input }) => {
        const schedule = await RDS.getScheduleById(db, input.scheduleId);
        if (!schedule) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'Schedule not found',
            });
        }
        return schedule;
    }),

    flagImported: protectedProcedure.input(z.object({ username: z.string() })).mutation(async ({ input }) => {
        return await RDS.flagImportedUser(db, input.username);
    }),
});

export default scheduleRouter;
