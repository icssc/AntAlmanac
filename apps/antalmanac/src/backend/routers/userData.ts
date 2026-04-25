import { oidcOAuthEnvSchema } from '$src/backend/env';
import { mangleDuplicateScheduleNames } from '$src/backend/lib/formatting';
import { RDS } from '$src/backend/lib/rds';
import { procedure, protectedProcedure, router } from '$src/backend/trpc';
import { type User, type ScheduleSaveState, ScheduleSaveStateSchema } from '@packages/antalmanac-types';
import { db } from '@packages/db';
import { TRPCError } from '@trpc/server';
import { type } from 'arktype';
import { z } from 'zod';

const { OIDC_ISSUER_URL, GOOGLE_REDIRECT_URI } = oidcOAuthEnvSchema.parse(process.env);

const userInputSchema = type([{ userId: 'string' }, '|', { googleId: 'string' }]);

const saveInputSchema = z.object({
    /**
     * ID of the requester.
     */
    id: z.string(),

    /**
     * Schedule data being saved.
     *
     * The ID of the requester and user ID in the schedule data may differ,
     * i.e. if the user is editing and saving another user's schedule.
     */
    data: z.custom<User>(),
});

const userDataRouter = router({
    getUserAndAccountBySessionToken: protectedProcedure.query(async ({ ctx }) => {
        return await RDS.getUserAndAccountBySessionToken(db, ctx.sessionToken);
    }),
    /**
     * Retrieves user data by user ID.
     * @param input - An object containing the user ID.
     * @returns The user data associated with the user ID.
     */
    getUserData: procedure.input(userInputSchema.assert).query(async ({ input }) => {
        if ('userId' in input) {
            return await RDS.getUserDataByUid(db, input.userId);
        } else {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Invalid input: userId is required',
            });
        }
    }),
    getUserDataWithSession: protectedProcedure.query(async ({ ctx }) => {
        return await RDS.fetchUserDataWithSession(db, ctx.sessionToken);
    }),

    getGuestAccountAndUserByName: procedure.input(z.object({ name: z.string() })).query(async ({ input }) => {
        const result = await RDS.getGuestAccountAndUserByName(db, input.name);
        if (!result) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'User not found',
            });
        }
        return result;
    }),

    getAccountByProviderAccountId: procedure
        .input(z.object({ accountType: z.enum(['OIDC', 'GOOGLE', 'GUEST']), providerAccountId: z.string() }))
        .query(async ({ input }) => {
            const account = await RDS.getAccountByProviderAccountId(db, input.accountType, input.providerAccountId);
            if (!account) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: `Couldn't find schedules for username "${input.providerAccountId}".`,
                });
            }
            return account;
        }),
    /**
     * Loads schedule data for a user that's logged in.
     */
    saveUserData: procedure.input(saveInputSchema).mutation(async ({ input }) => {
        const data = input.data;

        // Mangle duplicate schedule names
        data.userData.schedules = mangleDuplicateScheduleNames(data.userData.schedules);

        return await RDS.upsertUserData(db, data).catch((error) =>
            console.error('RDS Failed to upsert user data:', error)
        );
    }),

    flagImportedSchedule: procedure.input(z.object({ providerAccountId: z.string() })).mutation(async ({ input }) => {
        return await RDS.flagImportedUser(db, input.providerAccountId);
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
    exportScheduleData: procedure.input(userInputSchema.assert).query(async ({ input }) => {
        if ('userId' in input) {
            const userData = await RDS.getUserDataByUid(db, input.userId);
            if (!userData) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'User not found',
                });
            }
            return userData.userData;
        } else {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Invalid input: userId is required',
            });
        }
    }),

    /**
     * Imports schedule data from JSON.
     * Validates the imported data before saving to prevent invalid data from being stored.
     * @param input - An object containing the user ID and the schedule data to import.
     * @returns Success status.
     */
    importScheduleData: procedure
        .input(
            z.object({
                userId: z.string(),
                scheduleData: z.unknown(),
            })
        )
        .mutation(async ({ input }) => {
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

            const userData: User = {
                id: input.userId,
                userData: validatedScheduleData,
            };

            await RDS.upsertUserData(db, userData).catch((error) => {
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
