import { ShortCourse, ShortCourseSchedule, User, RepeatingCustomEvent } from '@packages/antalmanac-types';
import { and, eq } from 'drizzle-orm';

import { type Database } from '$db/index';
import {
    schedules,
    users,
    coursesInSchedule,
    customEvents,
    AccountType,
    Schedule,
    CourseInSchedule,
    CustomEvent,
    sessions,
    Account,
    accounts,
    Session,
} from '$db/schema';

type DatabaseOrTransaction = Omit<Database, '$client'>;

export class RDS {
    /**
     * Retrieves an account with the specified user ID and account type.
     *
     * @param db - The database or transaction object.
     * @param userId - The ID of the user whose account is to be retrieved.
     * @returns A promise that resolves to the account object if found, otherwise null.
     */
    static async getAccountByProviderId(
        db: DatabaseOrTransaction,
        accountType: Account['accountType'],
        providerId: string
    ): Promise<Account | null> {
        return db.transaction((tx) =>
            tx
                .select()
                .from(accounts)
                .where(and(eq(accounts.accountType, accountType), eq(accounts.providerAccountId, providerId)))
                .limit(1)
                .then((res) => res[0] ?? null)
        );
    }

    static async getAccountAndUserByToken(db: DatabaseOrTransaction, refreshToken: string) {
        return db.transaction((tx) =>
            tx
                .select()
                .from(sessions)
                .innerJoin(users, eq(sessions.userId, users.id))
                .innerJoin(accounts, eq(users.id, accounts.userId))
                .where(eq(sessions.refreshToken, refreshToken))
                .execute()
                .then((res) => {
                    return { users: res[0].users, accounts: res[0].accounts };
                })
        );
    }
    static async getGuestAccountAndUserByName(db: DatabaseOrTransaction, name: string) {
        return db.transaction((tx) =>
            tx
                .select()
                .from(accounts)
                .innerJoin(users, eq(accounts.userId, users.id))
                .where(and(eq(users.name, name), eq(accounts.accountType, 'GUEST')))
                .execute()
                .then((res) => {
                    return { users: res[0].users, accounts: res[0].accounts };
                })
        );
    }

    /**
     * Retrieves a user by their ID from the database.
     *
     * @param db - The database or transaction object to use for the query.
     * @param userId - The ID of the user to retrieve.
     * @returns A promise that resolves to the user object if found, otherwise undefined.
     */
    static async getUserById(db: DatabaseOrTransaction, userId: string) {
        return db.transaction((tx) =>
            tx
                .select()
                .from(users)
                .where(eq(users.id, userId))
                .then((res) => res[0])
        );
    }

    static async getAccountById(db: DatabaseOrTransaction, userId: string) {
        return db.transaction((tx) =>
            tx
                .select()
                .from(accounts)
                .where(eq(accounts.userId, userId))
                .then((res) => res[0])
        );
    }

    static async getUserByEmail(db: DatabaseOrTransaction, email: string) {
        return db.transaction((tx) =>
            tx
                .select()
                .from(users)
                .where(eq(users.email, email))
                .then((res) => res[0])
        );
    }
    /**
     * Creates a new user and an associated account with the specified provider ID.
     *
     * @param db - The database or transaction object.
     * @param providerId - The provider account ID for the new account.
     * @returns A promise that resolves to the newly created account object.
     */
    static async registerUserAccount(
        db: DatabaseOrTransaction,
        providerId: string,
        name: string,
        accountType: Account['accountType'],
        email?: string,
        avatar?: string
    ) {
        const existingAccount = await this.getAccountByProviderId(db, accountType, providerId);
        if (!existingAccount) {
            const { userId } = await db
                .insert(users)
                .values({
                    avatar: avatar ?? '',
                    name: name,
                    email: email ?? '',
                })
                .returning({ userId: users.id })
                .then((res) => res[0]);

            const account = await db
                .insert(accounts)
                .values({ userId: userId, providerAccountId: providerId, accountType: accountType })
                .returning()
                .then((res) => res[0]);

            return account;
        }

        return existingAccount;
    }

    /**
     * Creates a new schedule if one with its name doesn't already exist
     * and replaces its courses and custom events with the ones provided.
     *
     * @returns The ID of the new/existing schedule
     */
    static async upsertScheduleAndContents(
        db: DatabaseOrTransaction,
        userId: string,
        schedule: ShortCourseSchedule,
        index: number
    ) {
        // Add schedule
        const dbSchedule = {
            userId,
            name: schedule.scheduleName,
            notes: schedule.scheduleNote,
            index,
            lastUpdated: new Date(),
        };

        const scheduleResult = await db
            .transaction((tx) => tx.insert(schedules).values(dbSchedule).returning({ id: schedules.id }))
            .catch((error) => {
                throw new Error(`Failed to insert schedule for ${userId} (${schedule.scheduleName}): ${error}`);
            });

        const scheduleId = scheduleResult[0].id;
        if (scheduleId === undefined) {
            throw new Error(`Failed to insert schedule for ${userId}`);
        }

        // Add courses and custom events
        await Promise.all([
            this.upsertCourses(db, scheduleId, schedule.courses).catch((error) => {
                throw new Error(`Failed to insert courses for ${schedule.scheduleName}: ${error}`);
            }),

            this.upsertCustomEvents(db, scheduleId, schedule.customEvents).catch((error) => {
                throw new Error(`Failed to insert custom events for ${schedule.scheduleName}: ${error}`);
            }),
        ]);

        return scheduleId;
    }

    /**
     * Does the same thing as `insertGuestUserData`, but also updates the user's schedules and courses if they exist.
     *
     * @param db The Drizzle client or transaction object
     * @param userData The object of data containing the user's schedules and courses
     * @returns The user's ID
     */
    static async upsertUserData(db: DatabaseOrTransaction, userData: User): Promise<string> {
        return db.transaction(async (tx) => {
            const userId = userData.id;

            const user = await this.registerUserAccount(db, userId, userId, 'GUEST');
            if (!user) {
                throw new Error(`Failed to create user`);
            }

            // Add schedules and courses
            const scheduleIds = await this.upsertSchedulesAndContents(tx, userId, userData.userData.schedules);

            // Update user's current schedule index
            const scheduleIndex = userData.userData.scheduleIndex;

            const currentScheduleId =
                scheduleIndex === undefined || scheduleIndex >= scheduleIds.length ? null : scheduleIds[scheduleIndex];

            if (currentScheduleId !== null) {
                await tx.update(users).set({ currentScheduleId: currentScheduleId }).where(eq(users.id, userId));
            }

            return userId;
        });
    }

    /** Deletes and recreates all of the user's schedules and contents */
    private static async upsertSchedulesAndContents(
        db: DatabaseOrTransaction,
        userId: string,
        scheduleArray: ShortCourseSchedule[]
    ): Promise<string[]> {
        // Drop all schedules, which will cascade to courses and custom events
        await db.delete(schedules).where(eq(schedules.userId, userId));

        return Promise.all(
            scheduleArray.map((schedule, index) => this.upsertScheduleAndContents(db, userId, schedule, index))
        );
    }

    /**
     * Drops all courses in the schedule and re-add them,
     * deduplicating by section code and term.
     * */
    private static async upsertCourses(db: DatabaseOrTransaction, scheduleId: string, courses: ShortCourse[]) {
        await db.transaction((tx) => tx.delete(coursesInSchedule).where(eq(coursesInSchedule.scheduleId, scheduleId)));

        if (courses.length === 0) {
            return;
        }

        const coursesUnique: Set<string> = new Set();

        const dbCourses = courses.map((course) => ({
            scheduleId,
            sectionCode: parseInt(course.sectionCode),
            term: course.term,
            color: course.color,
            lastUpdated: new Date(),
        }));

        const dbCoursesUnique = dbCourses.filter((course) => {
            const key = `${course.sectionCode}-${course.term}`;
            if (coursesUnique.has(key)) {
                return false;
            }
            coursesUnique.add(key);
            return true;
        });

        await db.transaction((tx) => tx.insert(coursesInSchedule).values(dbCoursesUnique));
    }

    private static async upsertCustomEvents(
        db: DatabaseOrTransaction,
        scheduleId: string,
        repeatingCustomEvents: RepeatingCustomEvent[]
    ) {
        await db.transaction(
            async (tx) => await tx.delete(customEvents).where(eq(customEvents.scheduleId, scheduleId))
        );

        if (repeatingCustomEvents.length === 0) {
            return;
        }

        const dbCustomEvents = repeatingCustomEvents.map((event) => ({
            scheduleId,
            title: event.title,
            start: event.start,
            end: event.end,
            days: event.days.map((day) => (day ? '1' : '0')).join(''),
            color: event.color,
            building: event.building,
            lastUpdated: new Date(),
        }));

        await db.transaction(async (tx) => await tx.insert(customEvents).values(dbCustomEvents));
    }

    private static async fetchUserData(db: DatabaseOrTransaction, user: any) {
        const userId = user.id;
        const sectionResults = await db
            .select()
            .from(schedules)
            .where(eq(schedules.userId, userId))
            .leftJoin(coursesInSchedule, eq(schedules.id, coursesInSchedule.scheduleId));

        const customEventResults = await db
            .select()
            .from(schedules)
            .where(eq(schedules.userId, userId))
            .leftJoin(customEvents, eq(schedules.id, customEvents.scheduleId));

        const userSchedules = RDS.aggregateUserData(sectionResults, customEventResults);

        const scheduleIndex = user.currentScheduleId
            ? userSchedules.findIndex((schedule) => schedule.id === user.currentScheduleId)
            : userSchedules.length;

        return {
            id: userId,
            userData: {
                schedules: userSchedules,
                scheduleIndex,
            },
        };
    }
    /**
     * Retrieves user data by user ID, including schedules and custom events.
     *
     * @param db - The database or transaction object to use for the query.
     * @param userId - The unique identifier of the user.
     * @returns A promise that resolves to a User object containing user data and schedules, or null if the user is not found.
     */
    static async getUserDataByUid(db: DatabaseOrTransaction, userId: string): Promise<User | null> {
        const user = await RDS.getUserById(db, userId);
        if (!user) {
            return null;
        }
        return await this.fetchUserData(db, user);
    }

    private static async getUserAndAccount(
        db: DatabaseOrTransaction,
        accountType: AccountType,
        providerAccountId: string
    ) {
        const res = await db
            .select()
            .from(accounts)
            .where(and(eq(accounts.accountType, accountType), eq(accounts.providerAccountId, providerAccountId)))
            .leftJoin(users, eq(accounts.userId, users.id))
            .limit(1);

        if (res.length === 0 || res[0].users === null || res[0].accounts === null) {
            return null;
        }

        return { user: res[0].users, account: res[0].accounts };
    }

    /**
     * Aggregates the user's schedule data from the results of two queries.
     */
    private static aggregateUserData(
        sectionResults: { schedules: Schedule; coursesInSchedule: CourseInSchedule | null }[],
        customEventResults: { schedules: Schedule; customEvents: CustomEvent | null }[]
    ): (ShortCourseSchedule & { id: string; index: number })[] {
        // Map from schedule ID to schedule data
        const schedulesMapping: Record<string, ShortCourseSchedule & { id: string; index: number }> = {};

        // Add courses to schedules
        sectionResults.forEach(({ schedules: schedule, coursesInSchedule: course }) => {
            const scheduleId = schedule.id;

            const scheduleAggregate = schedulesMapping[scheduleId] || {
                id: scheduleId,
                scheduleName: schedule.name,
                scheduleNote: schedule.notes,
                courses: [],
                customEvents: [],
                index: schedule.index,
            };

            if (course) {
                scheduleAggregate.courses.push({
                    sectionCode: course.sectionCode.toString(),
                    term: course.term,
                    color: course.color,
                });
            }

            schedulesMapping[scheduleId] = scheduleAggregate;
        });

        // Add custom events to schedules
        customEventResults.forEach(({ schedules: schedule, customEvents: customEvent }) => {
            const scheduleId = schedule.id;
            const scheduleAggregate = schedulesMapping[scheduleId] || {
                scheduleName: schedule.name,
                scheduleNote: schedule.notes,
                courses: [],
                customEvents: [],
            };

            if (customEvent) {
                scheduleAggregate.customEvents.push({
                    customEventID: customEvent.id,
                    title: customEvent.title,
                    start: customEvent.start,
                    end: customEvent.end,
                    days: customEvent.days.split('').map((day) => day === '1'),
                    color: customEvent.color ?? undefined,
                    building: customEvent.building ?? undefined,
                });
            }

            schedulesMapping[scheduleId] = scheduleAggregate;
        });

        // Sort schedules by index
        return Object.values(schedulesMapping).sort((a, b) => a.index - b.index);
    }

    /**
     * Retrieves the current session from the database using the provided refresh token.
     *
     * @param db - The database or transaction object to use for the query.
     * @param refreshToken - The refresh token to search for in the sessions table.
     * @returns A promise that resolves to the current session object if found, or null if not found.
     */
    static async getCurrentSession(db: DatabaseOrTransaction, refreshToken: string) {
        return db.transaction((tx) =>
            tx
                .select()
                .from(sessions)
                .where(eq(sessions.refreshToken, refreshToken))
                .then((res) => res[0] ?? null)
        );
    }

    /**
     * Creates a new session for a user in the database.
     *
     * @param db - The database or transaction object to use for the operation.
     * @param userID - The ID of the user for whom the session is being created.
     * @returns A promise that resolves to the created session object or null if the creation failed.
     */
    static async createSession(db: DatabaseOrTransaction, userID: string): Promise<Session | null> {
        return db.transaction((tx) =>
            tx
                .insert(sessions)
                .values({
                    userId: userID,
                    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                })
                .returning()
                .then((res) => res[0] ?? null)
        );
    }

    /**
     * Removes a session from the database for a given user and refresh token.
     *
     * @param db - The database or transaction object to perform the operation.
     * @param userId - The ID of the user whose session is to be removed.
     * @param refreshToken - The refresh token of the session to be removed. If null, no action is taken.
     * @returns A promise that resolves when the session is removed.
     */
    static async removeSession(db: DatabaseOrTransaction, userId: string, refreshToken: string | null) {
        if (refreshToken) {
            await db.delete(sessions).where(and(eq(sessions.userId, userId), eq(sessions.refreshToken, refreshToken)));
        }
    }

    /**
     * Upserts a session for a user. If a session with the given refresh token already exists,
     * it returns the current session. Otherwise, it creates a new session for the user.
     *
     * @param db - The database or transaction object to use for the operation.
     * @param userId - The ID of the user for whom the session is being upserted.
     * @param refreshToken - The refresh token to check for an existing session.
     * @returns A promise that resolves to the current session if it exists, or a new session if it was created, or null if the operation fails.
     */
    static async upsertSession(
        db: DatabaseOrTransaction,
        userId: string,
        refreshToken?: string
    ): Promise<Session | null> {
        const currentSession = await this.getCurrentSession(db, refreshToken ?? '');
        if (currentSession) return currentSession;
        return await RDS.createSession(db, userId);
    }
}
