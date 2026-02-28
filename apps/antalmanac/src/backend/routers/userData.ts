import {
    CourseInfo,
    ScheduleCourse,
    ScheduleSaveState,
    RepeatingCustomEvent,
    type User,
} from '@packages/antalmanac-types';
import { db } from '@packages/db/src';
import { TRPCError } from '@trpc/server';
import { CodeChallengeMethod, decodeIdToken, generateCodeVerifier, generateState, OAuth2Tokens } from 'arctic';
import { type } from 'arktype';
import { z } from 'zod';

import { procedure, router } from '../trpc';

import { oidcOAuthEnvSchema } from '$src/backend/env';
import { oauth } from '$src/backend/lib/auth/oauth';
import { mangleDuplicateScheduleNames } from '$src/backend/lib/formatting';
import { RDS } from '$src/backend/lib/rds';
import { getCourseInfo } from '$src/backend/lib/websoc-service';

const { OIDC_ISSUER_URL, GOOGLE_REDIRECT_URI } = oidcOAuthEnvSchema.parse(process.env);
const NODE_ENV = process.env.NODE_ENV;

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

const saveGoogleSchema = type({
    code: 'string',
    state: 'string',
});

/**
 * Hydrates schedule courses with full course information from WebSOC.
 * Transforms ShortCourse[] to ScheduleCourse[] by fetching course details.
 */
async function hydrateScheduleCourses(schedules: ScheduleSaveState['schedules']): Promise<
    Array<{
        scheduleName: string;
        courses: ScheduleCourse[];
        customEvents: RepeatingCustomEvent[];
        scheduleNote: string;
    }>
> {
    // Build dictionary of all unique courses grouped by term
    const courseDict: { [term: string]: Set<string> } = {};
    for (const schedule of schedules) {
        for (const course of schedule.courses) {
            if (!('sectionCode' in course)) continue; // already hydrated
            if (course.term in courseDict) {
                courseDict[course.term].add(course.sectionCode);
            } else {
                courseDict[course.term] = new Set([course.sectionCode]);
            }
        }
    }

    // Fetch course info from WebSOC for each term
    const courseInfoDict = new Map<string, { [sectionCode: string]: CourseInfo }>();

    const websocRequests = Object.entries(courseDict).map(async ([term, courseSet]) => {
        const sectionCodes = Array.from(courseSet).join(',');
        try {
            const courseInfo = await getCourseInfo({ term, sectionCodes });
            courseInfoDict.set(term, courseInfo);
        } catch (e) {
            console.error(`Failed to fetch course info for term ${term}:`, e);
            courseInfoDict.set(term, {});
        }
    });

    await Promise.all(websocRequests);

    // Hydrate each schedule with full course data
    return schedules.map((schedule) => {
        const hydratedCourses: ScheduleCourse[] = schedule.courses
            .map((course) => {
                if ('section' in course) return course; // already hydrated
                const shortCourse = course;
                const courseInfoMap = courseInfoDict.get(shortCourse.term);
                if (!courseInfoMap) {
                    return null;
                }

                const courseInfo = courseInfoMap[shortCourse.sectionCode.padStart(5, '0')];
                if (!courseInfo) {
                    return null;
                }

                return {
                    ...courseInfo.courseDetails,
                    term: shortCourse.term,
                    section: {
                        ...courseInfo.section,
                        color: shortCourse.color,
                    },
                } as ScheduleCourse;
            })
            .filter((course): course is ScheduleCourse => course !== null);

        return {
            scheduleName: schedule.scheduleName,
            courses: hydratedCourses,
            customEvents: schedule.customEvents,
            scheduleNote: schedule.scheduleNote,
        };
    });
}

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
     * Retrieves user information by user ID.
     * @param input - An object containing the user ID.
     * @returns The user information associated with the user ID.
     */
    getUserByUid: procedure.input(userInputSchema.assert).query(async ({ input }) => {
        if ('userId' in input) {
            return await RDS.getUserById(db, input.userId);
        } else {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Invalid input: userId is required',
            });
        }
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
    /**
     * Retrieves user data by user ID with hydrated schedules.
     * @param input - An object containing the user ID.
     * @returns The user data with course information hydrated from WebSOC.
     */
    getUserDataHydrated: procedure.input(userInputSchema.assert).query(async ({ input }) => {
        if ('userId' in input) {
            const userData = await RDS.getUserDataByUid(db, input.userId);

            if (!userData?.userData?.schedules) {
                return userData;
            }

            try {
                const hydratedSchedules = await hydrateScheduleCourses(userData.userData.schedules);

                const result = {
                    ...userData,
                    userData: {
                        schedules: hydratedSchedules,
                        scheduleIndex: userData.userData.scheduleIndex,
                    },
                };
                return result;
            } catch (e) {
                console.error('Hydration failed, returning unhydrated schedules:', e);
                return userData;
            }
        } else {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Invalid input: userId is required',
            });
        }
    }),
    getUserDataWithSession: procedure.input(z.object({ refreshToken: z.string() })).query(async ({ input }) => {
        if ('refreshToken' in input) {
            const userData = await RDS.fetchUserDataWithSession(db, input.refreshToken);

            if (!userData?.userData?.schedules) {
                return userData;
            }

            try {
                const hydratedSchedules = await hydrateScheduleCourses(userData.userData.schedules);

                const result = {
                    ...userData,
                    userData: {
                        schedules: hydratedSchedules,
                        scheduleIndex: userData.userData.scheduleIndex,
                    },
                };
                return result;
            } catch (e) {
                console.error('Hydration failed, returning unhydrated schedules:', e);
                return userData;
            }
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
     * Retrieves Google authentication URL for login/sign up.
     * Retrieves Google auth url to login/sign up
     */
    getGoogleAuthUrl: procedure.query(async ({ ctx }) => {
        const state = generateState();
        const codeVerifier = generateCodeVerifier();

        const url = oauth.createAuthorizationURLWithPKCE(
            'https://auth.icssc.club/authorize',
            state,
            CodeChallengeMethod.S256,
            codeVerifier,
            [
                'openid',
                'profile',
                'email',
                // 'https://www.googleapis.com/auth/calendar.readonly'
            ]
        );

        const isProduction = NODE_ENV === 'production';
        const cookieOptions = `Path=/; HttpOnly; ${
            isProduction ? 'Secure; SameSite=None' : 'SameSite=Lax'
        }; Max-Age=600`;

        // Set cookies via response headers (Next.js cookies() doesn't work in TRPC)
        ctx.resHeaders?.append('Set-Cookie', `oauth_state=${state}; ${cookieOptions}`);
        ctx.resHeaders?.append('Set-Cookie', `oauth_code_verifier=${codeVerifier}; ${cookieOptions}`);

        const referer = ctx.req.headers.get('referer');
        if (referer) {
            ctx.resHeaders?.append('Set-Cookie', `auth_redirect_url=${encodeURIComponent(referer)}; ${cookieOptions}`);
        }

        return url;
    }),
    /**
     * Logs in or signs up a user and creates user's session
     */
    handleGoogleCallback: procedure.input(saveGoogleSchema.assert).mutation(async ({ input, ctx }) => {
        try {
            // Parse cookies from request headers
            const cookieHeader = ctx.req.headers.get('cookie') ?? '';
            const cookies = Object.fromEntries(
                cookieHeader
                    .split('; ')
                    .filter((c) => c.includes('='))
                    .map((c) => {
                        const [key, ...v] = c.split('=');
                        return [key, v.join('=')];
                    })
            );

            const storedState = cookies['oauth_state'] ?? null;
            const codeVerifier = cookies['oauth_code_verifier'] ?? null;
            const redirectUrl = decodeURIComponent(cookies['auth_redirect_url'] ?? '/');

            // Delete cookies via response headers
            const isProduction = NODE_ENV === 'production';
            const deleteCookieOptions = `Path=/; HttpOnly; ${
                isProduction ? 'Secure; SameSite=None' : 'SameSite=Lax'
            }; Max-Age=0`;
            ctx.resHeaders?.append('Set-Cookie', `oauth_state=; ${deleteCookieOptions}`);
            ctx.resHeaders?.append('Set-Cookie', `oauth_code_verifier=; ${deleteCookieOptions}`);
            ctx.resHeaders?.append('Set-Cookie', `auth_redirect_url=; ${deleteCookieOptions}`);

            if (!input.code || !input.state || !storedState || !codeVerifier) {
                console.error('[OAuth Callback] Missing parameters:', {
                    hasCode: !!input.code,
                    hasState: !!input.state,
                    hasStoredState: !!storedState,
                    hasCodeVerifier: !!codeVerifier,
                });
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Missing required OAuth parameters',
                });
            }

            if (input.state !== storedState) {
                console.error('[OAuth Callback] State mismatch:', {
                    received: input.state,
                    stored: storedState,
                });
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'State mismatch',
                });
            }

            let tokens: OAuth2Tokens;
            try {
                tokens = await oauth.validateAuthorizationCode(
                    'https://auth.icssc.club/token',
                    input.code,
                    codeVerifier
                );
            } catch (error) {
                console.error('OAuth Callback - Invalid credentials:', error);
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'Invalid authorization code',
                });
            }

            const claims = decodeIdToken(tokens.idToken()) as {
                sub: string;
                name: string;
                email: string;
                picture?: string;
            };

            const oidcRefreshToken = tokens.refreshToken();
            if (!oidcRefreshToken) {
                console.error('OAuth Callback - Missing OIDC refresh token in response');
            }

            const tokenData = tokens.data as {
                google_access_token?: string;
                google_refresh_token?: string;
                google_token_expiry?: number;
            };
            const googleAccessToken = tokenData.google_access_token;
            const googleRefreshToken = tokenData.google_refresh_token;
            if (!googleAccessToken || !googleRefreshToken) {
                console.error('OAuth Callback - Missing Google tokens in OIDC response:', tokenData);
            }

            const oauthUserId = claims.sub;
            const username = claims.name;
            const email = claims.email;
            const picture = claims.picture;

            const account = await RDS.registerUserAccount(db, 'OIDC', oauthUserId, username, email, picture ?? '');

            const userId: string = account.userId;

            if (userId.length > 0) {
                // Create session with OIDC and Google tokens
                const session = await RDS.upsertSession(db, userId, oidcRefreshToken ?? '');

                return {
                    sessionToken: session?.refreshToken,
                    userId: userId,
                    providerId: oauthUserId,
                    newUser: account.newUser,
                    redirectUrl,
                };
            }

            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to create user session',
            });
        } catch (error) {
            console.error('OAuth Callback - Error:', error);
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to handle OAuth callback',
            });
        }
    }),

    /**
     * Logs in or signs up existing user
     */
    //     handleGuestLogin: procedure.input(z.object({ name: z.string() })).query(async ({ input }) => {
    //         const account = await RDS.registerUserAccount(db, input.name, input.name, 'GUEST');
    //
    //         if (account.userId.length > 0) {
    //             const session = await RDS.upsertSession(db, account.userId);
    //             return session?.refreshToken;
    //         }
    //         return null;
    //     }),
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
    logout: procedure
        .input(z.object({ sessionToken: z.string(), redirectUrl: z.string().optional() }))
        .mutation(async ({ input }) => {
            // Invalidate the local session
            const session = await RDS.getCurrentSession(db, input.sessionToken);
            if (session) {
                await RDS.removeSession(db, session.userId, session.refreshToken);
            }

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
