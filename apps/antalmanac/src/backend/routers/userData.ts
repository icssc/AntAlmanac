import { oidcOAuthEnvSchema } from '$src/backend/env';
import { mangleDuplicateScheduleNames } from '$src/backend/lib/formatting';
import { RDS } from '$src/backend/lib/rds';
import { procedure, protectedProcedure, router } from '$src/backend/trpc';
import { type ScheduleSaveState, ScheduleSaveStateSchema } from '@packages/antalmanac-types';
import { db } from '@packages/db';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

const { OIDC_ISSUER_URL, GOOGLE_REDIRECT_URI } = oidcOAuthEnvSchema.parse(process.env);

const userDataRouter = router({
    getUserAndAccount: protectedProcedure.query(async ({ ctx }) => {
        return await RDS.getUserAndAccountBySessionToken(db, ctx.sessionToken);
    }),

    /**
     * Retrieves the currently authenticated user's profile.
     *
     * @returns The user row for the session user.
     */
    getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
        return await RDS.getUserById(db, ctx.userId);
    }),

    getGoogleId: protectedProcedure.query(async ({ ctx }) => {
        return await RDS.getGoogleIdByUserId(db, ctx.userId);
    }),

    getGuestScheduleByUsername: procedure.input(z.object({ username: z.string() })).query(async ({ input }) => {
        const result = await RDS.getGuestScheduleByUsername(db, input.username);
        if (!result) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: `Couldn't find schedules for username "${input.username}".`,
            });
        }
        return result;
    }),

    getUserData: protectedProcedure.query(async ({ ctx }) => {
        return await RDS.fetchUserDataWithSession(db, ctx.sessionToken);
    }),

    saveUserData: protectedProcedure
        .input(z.object({ userData: z.custom<ScheduleSaveState>() }))
        .mutation(async ({ input, ctx }) => {
            const userData = input.userData;
            userData.schedules = mangleDuplicateScheduleNames(userData.schedules);

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

    flagImportedSchedule: protectedProcedure.input(z.object({ username: z.string() })).mutation(async ({ input }) => {
        return await RDS.flagImportedUser(db, input.username);
    }),

    /**
     * Logs out a user by invalidating their session and redirecting to OIDC logout
     */
    getLogoutUrl: procedure.input(z.object({ redirectUrl: z.string().optional() })).query(async ({ input }) => {
        // Build OIDC logout URL
        const oidcLogoutUrl = new URL(`${OIDC_ISSUER_URL}/logout`);
        const redirectTo = input.redirectUrl || GOOGLE_REDIRECT_URI.replace('/auth', '');
        oidcLogoutUrl.searchParams.set('post_logout_redirect_uri', redirectTo);

        return {
            logoutUrl: oidcLogoutUrl.toString(),
        };
    }),

    /**
     * Exports schedule data for a user as JSON.
     * This allows users to export their schedule data to transfer between environments (prod/staging).
     * @param input - An object containing the user ID.
     * @returns The schedule data in JSON format.
     */
    exportScheduleData: protectedProcedure.query(async ({ ctx }) => {
        const userData = await RDS.fetchUserDataWithSession(db, ctx.sessionToken);
        if (!userData) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'User not found',
            });
        }

        return userData.userData;
    }),

    /**
     * Imports schedule data from JSON.
     * Validates the imported data before saving to prevent invalid data from being stored.
     * @param input - An object containing the user ID and the schedule data to import.
     * @returns Success status.
     */
    importScheduleData: protectedProcedure
        .input(z.object({ scheduleData: z.unknown() }))
        .mutation(async ({ input, ctx }) => {
            let validatedScheduleData: ScheduleSaveState;
            try {
                validatedScheduleData = ScheduleSaveStateSchema.assert(input.scheduleData);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: `Invalid schedule data format: ${errorMessage}`,
                });
            }

            if (
                validatedScheduleData.scheduleIndex < 0 ||
                validatedScheduleData.scheduleIndex >= validatedScheduleData.schedules.length
            ) {
                validatedScheduleData.scheduleIndex =
                    validatedScheduleData.schedules.length > 0 ? validatedScheduleData.schedules.length - 1 : 0;
            }

            for (const schedule of validatedScheduleData.schedules) {
                for (const course of schedule.courses) {
                    if (typeof course.sectionCode !== 'string' || isNaN(parseInt(course.sectionCode))) {
                        throw new TRPCError({
                            code: 'BAD_REQUEST',
                            message: `Invalid section code: ${course.sectionCode}`,
                        });
                    }
                    if (typeof course.term !== 'string' || course.term.length === 0) {
                        throw new TRPCError({
                            code: 'BAD_REQUEST',
                            message: `Invalid term: ${course.term}`,
                        });
                    }
                    if (typeof course.color !== 'string') {
                        throw new TRPCError({
                            code: 'BAD_REQUEST',
                            message: `Invalid color: ${course.color}`,
                        });
                    }
                }

                for (const event of schedule.customEvents) {
                    if (event.days.length !== 7) {
                        throw new TRPCError({
                            code: 'BAD_REQUEST',
                            message: 'Invalid custom event days: must be an array of 7 booleans',
                        });
                    }
                }
            }

            validatedScheduleData.schedules = mangleDuplicateScheduleNames(validatedScheduleData.schedules);

            await RDS.upsertUserData(db, ctx.userId, validatedScheduleData).catch((error) => {
                console.error('RDS Failed to import user data:', error);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to import schedule data',
                });
            });

            return { success: true };
        }),
});

export default userDataRouter;
