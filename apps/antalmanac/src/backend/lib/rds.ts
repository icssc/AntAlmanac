import { ShortCourse, ShortCourseSchedule, User, RepeatingCustomEvent, Notification } from '@packages/antalmanac-types';
import { db } from '@packages/db/src/index';
import * as schema from '@packages/db/src/schema';
import { and, eq, ExtractTablesWithRelations, gt } from 'drizzle-orm';
import { PgTransaction, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import {
    schedules,
    users,
    accounts,
    coursesInSchedule,
    customEvents,
    AccountType,
    Schedule,
    CourseInSchedule,
    CustomEvent,
    sessions,
    Account,
    Session,
    subscriptions,
} from '@packages/db/src/schema';

type Transaction = PgTransaction<PgQueryResultHKT, typeof schema, ExtractTablesWithRelations<typeof schema>>;
type DatabaseOrTransaction = Omit<typeof db, '$client'> | Transaction;

export class RDS {
    /**
     * If a guest user with the specified name exists, return their ID, otherwise return null.
     */
    private static async guestUserIdWithNameOrNull(tx: Transaction, name: string): Promise<string | null> {
        return tx
            .select({ id: accounts.userId })
            .from(accounts)
            .where(and(eq(accounts.accountType, 'GUEST'), eq(accounts.providerAccountId, name)))
            .limit(1)
            .then((xs) => xs[0]?.id ?? null);
    }

    /**
     * Creates a guest user if they don't already exist.
     *
     * @param tx Database or transaction object
     * @param name Guest user's name, to be used as providerAccountID and username
     * @returns The new/existing user's ID
     */
    private static async createGuestUserOptional(tx: Transaction, name: string) {
        const maybeUserId = await RDS.guestUserIdWithNameOrNull(tx, name);

        const userId = maybeUserId
            ? maybeUserId
            : await tx
                  .insert(users)
                  .values({ name })
                  .returning({ id: users.id })
                  .then((users) => users[0].id);

        if (userId === undefined) {
            throw new Error(`Failed to create guest user for ${name}`);
        }

        await tx
            .insert(accounts)
            .values({ userId, accountType: 'GUEST', providerAccountId: name })
            .onConflictDoNothing()
            .execute();

        return userId;
    }
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
        accountType: Account['accountType'],
        providerId: string,
        name?: string,
        email?: string,
        avatar?: string
    ) {
        // ! TODO @KevinWu098
        // ! Auth uses hardcoded migration logic to handle cases in which stale userIDs
        // ! still contain non OIDC google ids. This is not correct and needs to be fixed.
        // ! Auth and operations upon users and accounts should not depend on localStorage. This is a hack.
        const oidcProviderId = providerId.startsWith('google_') ? providerId : `google_${providerId}`;
        if (accountType !== 'OIDC') {
            throw new Error('Invalid account type. Must be OIDC.');
        }

        // First check if an account with OIDC providerId already exists
        const existingAccount = await this.getAccountByProviderId(db, accountType, oidcProviderId);
        if (existingAccount && accountType === 'OIDC') {
            return { ...existingAccount, newUser: false };
        }

        const existingUser = email ? await this.getUserByEmail(db, email) : null;

        if (!existingUser) {
            const result = await db
                .insert(users)
                .values({
                    avatar: avatar ?? '',
                    name: name,
                    email: email ?? '',
                })
                .returning({ userId: users.id })
                .then((res) => res[0]);
            const newUserId = result.userId;

            const account = await db
                .insert(accounts)
                .values({ userId: newUserId, providerAccountId: providerId, accountType })
                .returning()
                .then((res) => res[0]);

            return { ...account, newUser: true };
        }

        await db
            .update(users)
            .set({
                name: name,
                email: email ?? '',
                avatar: avatar ?? existingUser.avatar,
                lastUpdated: new Date(),
            })
            .where(eq(users.id, existingUser.id));

        const newAccount = await db
            .insert(accounts)
            .values({ userId: existingUser.id, providerAccountId: providerId, accountType })
            .returning()
            .then((res) => res[0]);

        return { ...newAccount, newUser: false };
    }

    /**
     * Creates a new schedule if one with its name doesn't already exist
     * and replaces its courses and custom events with the ones provided.
     *
     *
     * @returns The ID of the new/existing schedule
     */
    private static async upsertScheduleAndContents(
        tx: Transaction,
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

        const scheduleResult = await tx.insert(schedules).values(dbSchedule).returning({ id: schedules.id });

        const scheduleId = scheduleResult[0].id;
        if (scheduleId === undefined) {
            throw new Error(`Failed to insert schedule for ${userId}`);
        }

        // Add courses and custom events
        await Promise.all([
            this.upsertCourses(tx, scheduleId, schedule.courses).catch((error) => {
                throw new Error(`Failed to insert courses for ${schedule.scheduleName}: ${error}`);
            }),

            this.upsertCustomEvents(tx, scheduleId, schedule.customEvents).catch((error) => {
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
            const account = await this.registerUserAccount(
                db,
                'OIDC',
                userData.id,
                userData.name,
                userData.email,
                userData.avatar
            );
            const userId = account.userId;
            if (!account) {
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
        tx: Transaction,
        userId: string,
        scheduleArray: ShortCourseSchedule[]
    ): Promise<string[]> {
        // Drop all schedules, which will cascade to courses and custom events
        await tx.delete(schedules).where(eq(schedules.userId, userId));

        return Promise.all(
            scheduleArray.map((schedule, index) => this.upsertScheduleAndContents(tx, userId, schedule, index))
        );
    }

    /**
     * Drops all courses in the schedule and re-add them,
     * deduplicating by section code and term.
     * */
    private static async upsertCourses(tx: Transaction, scheduleId: string, courses: ShortCourse[]) {

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

        await tx.insert(coursesInSchedule).values(dbCoursesUnique);
    }

    private static async upsertCustomEvents(
        tx: Transaction,
        scheduleId: string,
        repeatingCustomEvents: RepeatingCustomEvent[]
    ) {
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

        await tx.insert(customEvents).values(dbCustomEvents);
    }

    /**
     * Retrieves user data by user ID, including schedules and custom events.
     *
     * @param db - The database or transaction object to use for the query.
     * @param userId - The unique identifier of the user.
     * @returns A promise that resolves to a User object containing user data and schedules, or null if the user is not found.
     */
    static async getUserDataByUid(db: DatabaseOrTransaction, userId: string): Promise<User | null> {
        return db.transaction(async (tx) => {
            const user = await tx
                .select()
                .from(users)
                .where(eq(users.id, userId))
                .then((res) => res[0]);

            if (!user) {
                return null;
            }

            const sectionResults = await tx
                .select()
                .from(schedules)
                .where(eq(schedules.userId, userId))
                .leftJoin(coursesInSchedule, eq(schedules.id, coursesInSchedule.scheduleId));

            const customEventResults = await tx
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
        });
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
    static async createSession(tx: Transaction, userID: string): Promise<Session | null> {
        return tx
            .insert(sessions)
            .values({
                userId: userID,
                expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            })
            .returning()
            .then((res) => res[0] ?? null);
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
        return db.transaction(async (tx) => {
            const currentSession = await tx
                .select()
                .from(sessions)
                .where(eq(sessions.refreshToken, refreshToken ?? ''))
                .then((res) => res[0] ?? null);

            if (currentSession) return currentSession;
            return await RDS.createSession(tx, userId);
        });
    }

    private static async getUserDataWithSession(tx: Transaction, refreshToken: string) {
        return tx
            .select()
            .from(users)
            .leftJoin(sessions, eq(users.id, sessions.userId))
            .where(and(eq(sessions.refreshToken, refreshToken), gt(sessions.expires, new Date())))
            .then((res) => res[0].users);
    }

    /**
     * Fetches user data associated with a valid session using a refresh token.
     *
     * This function initiates a database transaction to retrieve user information
     * based on the provided refresh token. If a user is found, it gathers the user's
     * schedules and custom events, aggregates them, and determines the current schedule index.
     *
     * @param db - The database or transaction object to perform the operation.
     * @param refreshToken - The refresh token used to identify the session.
     * @returns A promise that resolves to an object containing the user's ID and user data,
     *          including schedules and the current schedule index, or null if no user is found.
     */
    static async fetchUserDataWithSession(db: DatabaseOrTransaction, refreshToken: string) {
        return db.transaction(async (tx) => {
            const user = await this.getUserDataWithSession(tx, refreshToken);

            if (user) {
                const sectionResults = await tx
                    .select()
                    .from(schedules)
                    .where(eq(schedules.userId, user.id))
                    .leftJoin(coursesInSchedule, eq(schedules.id, coursesInSchedule.scheduleId));

                const customEventResults = await tx
                    .select()
                    .from(schedules)
                    .where(eq(schedules.userId, user.id))
                    .leftJoin(customEvents, eq(schedules.id, customEvents.scheduleId));

                const userSchedules = RDS.aggregateUserData(sectionResults, customEventResults);

                const scheduleIndex = user.currentScheduleId
                    ? userSchedules.findIndex((schedule) => schedule.id === user.currentScheduleId)
                    : userSchedules.length;
                return {
                    id: user.id,
                    userData: {
                        schedules: userSchedules,
                        scheduleIndex,
                    },
                };
            }
            return null;
        });
    }

    static async getUserAndAccountBySessionToken(db: DatabaseOrTransaction, refreshToken: string) {
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

    /**
     * Flags a user as imported based on the provided provider ID.
     *
     * This function checks if a user associated with the given provider ID has already been flagged as imported.
     * If not, it updates the user's record to set the imported flag to true.
     *
     * @param db The database or transaction object used to perform the operation.
     * @param providerId The provider ID used to identify the user.
     * @returns A promise that resolves to true if the user was successfully flagged as imported, or false if the user
     *          was already flagged or if an error occurred during the operation.
     */
    static async flagImportedUser(db: DatabaseOrTransaction, providerId: string) {
        try {
            const { users: user, accounts } = await this.getGuestAccountAndUserByName(db, providerId);
            if (user.imported) {
                return false;
            }

            await db.transaction((tx) =>
                tx.update(users).set({ imported: true }).where(eq(users.id, accounts.userId)).execute()
            );
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Retrieves notifications associated with a specified user
     *
     * @param db - The database or transaction object to use for the operation.
     * @param userId - The ID of the user for whom we're retrieving notifications.
     * @returns A promise that resolves to the notifications associated with a userId, or an empty array if not found.
     */
    static async retrieveNotifications(db: DatabaseOrTransaction, userId: string) {
        return db.transaction((tx) => tx.select().from(subscriptions).where(eq(subscriptions.userId, userId)));
    }

    /**
     * Upserts notification for a specified user
     *
     * @param db - The database or transaction object to use for the operation.
     * @param userId - The ID of the user for whom we're upserting a notification.
     * @param notification - The notification object to upsert.
     * @returns A promise that upserts the notification associated with a userId.
     */
    static async upsertNotification(db: DatabaseOrTransaction, userId: string, notification: Notification) {
        return db.transaction((tx) =>
            tx
                .insert(subscriptions)
                .values({
                    userId,
                    sectionCode: Number(notification.sectionCode),
                    year: notification.term.split(' ')[0],
                    quarter: notification.term.split(' ')[1],
                    openStatus: notification.notificationStatus.openStatus,
                    waitlistStatus: notification.notificationStatus.waitlistStatus,
                    fullStatus: notification.notificationStatus.fullStatus,
                    restrictionStatus: notification.notificationStatus.restrictionStatus,
                    lastUpdatedStatus: notification.lastUpdatedStatus,
                    lastCodes: notification.lastCodes,
                })
                .onConflictDoUpdate({
                    target: [
                        subscriptions.userId,
                        subscriptions.year,
                        subscriptions.quarter,
                        subscriptions.sectionCode,
                    ],
                    set: {
                        openStatus: notification.notificationStatus.openStatus,
                        waitlistStatus: notification.notificationStatus.waitlistStatus,
                        fullStatus: notification.notificationStatus.fullStatus,
                        restrictionStatus: notification.notificationStatus.restrictionStatus,
                        lastUpdatedStatus: notification.lastUpdatedStatus,
                        lastCodes: notification.lastCodes,
                    },
                })
        );
    }

    /**
     * Updates lastUpdatedStatus and lastCodes of ALL notifications with a shared sectionCode, year, and quarter
     *
     * @param db - The database or transaction object to use for the operation.
     * @param notification - The notification object type we are updating.
     * @returns A promise that updates ALL notifications with a shared sectionCode, year, and quarter.
     */
    static async updateAllNotifications(db: DatabaseOrTransaction, notification: Notification) {
        return db.transaction((tx) =>
            tx
                .update(subscriptions)
                .set({
                    lastUpdatedStatus: notification.lastUpdatedStatus,
                    lastCodes: notification.lastCodes,
                })
                .where(
                    and(
                        eq(subscriptions.sectionCode, Number(notification.sectionCode)),
                        eq(subscriptions.year, notification.term.split(' ')[0]),
                        eq(subscriptions.quarter, notification.term.split(' ')[1])
                    )
                )
        );
    }

    /**
     * Deletes a notification for a specified user
     *
     * @param db - The database or transaction object to use for the operation.
     * @param notification - The notification object type we are deleting.
     * @param userId - The ID of the user for whom we're deleting a notification.
     * @returns A promise that deletes a user's notification.
     */
    static async deleteNotification(db: DatabaseOrTransaction, notification: Notification, userId: string) {
        return db.transaction((tx) =>
            tx
                .delete(subscriptions)
                .where(
                    and(
                        eq(subscriptions.userId, userId),
                        eq(subscriptions.sectionCode, Number(notification.sectionCode)),
                        eq(subscriptions.year, notification.term.split(' ')[0]),
                        eq(subscriptions.quarter, notification.term.split(' ')[1])
                    )
                )
        );
    }

    /**
     * Deletes ALL notifications for a specified user
     *
     * @param db - The database or transaction object to use for the operation.
     * @param userId - The ID of the user for whom we're deleting all notifications.
     * @returns A promise that deletes all of a user's notifications.
     */
    static async deleteAllNotifications(db: DatabaseOrTransaction, userId: string) {
        return db.transaction((tx) => tx.delete(subscriptions).where(eq(subscriptions.userId, userId)));
    }
}
