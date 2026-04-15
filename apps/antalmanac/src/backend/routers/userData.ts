import { oidcOAuthEnvSchema } from '$src/backend/env';
import { mangleDuplicateScheduleNames } from '$src/backend/lib/formatting';
import { RDS } from '$src/backend/lib/rds';
import { type User } from '@packages/antalmanac-types';
import { db } from '@packages/db';
import { TRPCError } from '@trpc/server';
import { type } from 'arktype';
import { z } from 'zod';

import { procedure, router } from '../trpc';

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
    /**
     * Loads schedule data for a user that's logged in.
     * @param input - An object containing the session token.
     * @returns The account and user data associated with the session token.
     */
    getUserAndAccountBySessionToken: procedure.input(z.object({ token: z.string() })).query(async ({ input }) => {
        return await RDS.getUserAndAccountBySessionToken(db, input.token);
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
    getUserDataWithSession: procedure.input(z.object({ refreshToken: z.string() })).query(async ({ input }) => {
        if ('refreshToken' in input) {
            return await RDS.fetchUserDataWithSession(db, input.refreshToken);
        } else {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Invalid input: userId is required',
            });
        }
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

    getAccountByProviderId: procedure
        .input(z.object({ accountType: z.enum(['OIDC', 'GOOGLE', 'GUEST']), providerId: z.string() }))
        .query(async ({ input }) => {
            const account = await RDS.getAccountByProviderId(db, input.accountType, input.providerId);
            if (!account) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: `Couldn't find schedules for username "${input.providerId}".`,
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

    flagImportedSchedule: procedure.input(z.object({ providerId: z.string() })).mutation(async ({ input }) => {
        return await RDS.flagImportedUser(db, input.providerId);
    }),

    /**
     * Logs out a user by invalidating their session and redirecting to OIDC logout
     */
    getLogoutUrl: procedure
        .input(z.object({ sessionToken: z.string(), redirectUrl: z.string().optional() }))
        .query(async ({ input }) => {
            // Build OIDC logout URL
            const oidcLogoutUrl = new URL(`${OIDC_ISSUER_URL}/logout`);
            const redirectTo = input.redirectUrl || GOOGLE_REDIRECT_URI.replace('/auth', '');
            oidcLogoutUrl.searchParams.set('post_logout_redirect_uri', redirectTo);

            return {
                logoutUrl: oidcLogoutUrl.toString(),
            };
        }),
});

export default userDataRouter;
