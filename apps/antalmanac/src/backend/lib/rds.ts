import { ShortCourse, ShortCourseSchedule, User, RepeatingCustomEvent, Notification } from '@packages/antalmanac-types';
import { db } from '@packages/db/src/index';
import * as schema from '@packages/db/src/schema';
import {
    schedules,
    users,
    accounts,
    coursesInSchedule,
    customEvents,
    AccountType,
    Account,
    Session,
} from '@packages/db/src/schema';
import { and, eq, ExtractTablesWithRelations } from 'drizzle-orm';
import { PgTransaction, PgQueryResultHKT } from 'drizzle-orm/pg-core';

import { NotificationRDS } from './notification-rds';
import { SessionsRDS } from './sessions-rds';
import { UsersRDS } from './users-rds';

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

    static async getUserById(db: DatabaseOrTransaction, userId: string) {
        return UsersRDS.getUserById(db, userId);
    }

    static async getUserByEmail(db: DatabaseOrTransaction, email: string) {
        return UsersRDS.getUserByEmail(db, email);
    }

    /**
     * Retrieves a google ID by their user ID from the database.
     *
     * @param db - The database to use for the query.
     * @param userId - The ID of the user to retrieve.
     * @returns The google ID if found, otherwise null.
     */
    static async getGoogleIdByUserId(db: DatabaseOrTransaction, userId: string): Promise<string | null> {
        return db.transaction((tx) =>
            tx
                .select({ providerAccountId: accounts.providerAccountId })
                .from(accounts)
                .where(eq(accounts.userId, userId))
                .limit(1)
                .then((res) => (res.length > 0 ? res[0].providerAccountId : null))
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
                .values({ userId: newUserId, providerAccountId: oidcProviderId, accountType })
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
            .values({ userId: existingUser.id, providerAccountId: oidcProviderId, accountType })
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
        await tx.delete(coursesInSchedule).where(eq(coursesInSchedule.scheduleId, scheduleId));

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

    static async getUserDataByUid(db: DatabaseOrTransaction, userId: string): Promise<User | null> {
        return UsersRDS.getUserDataByUid(db, userId);
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

    static async getCurrentSession(db: DatabaseOrTransaction, refreshToken: string) {
        return SessionsRDS.getCurrentSession(db, refreshToken);
    }

    static async createSession(tx: Transaction, userID: string): Promise<Session | null> {
        return SessionsRDS.createSession(tx, userID);
    }

    static async removeSession(db: DatabaseOrTransaction, userId: string, refreshToken: string | null) {
        return SessionsRDS.removeSession(db, userId, refreshToken);
    }

    static async upsertSession(
        db: DatabaseOrTransaction,
        userId: string,
        refreshToken?: string
    ): Promise<Session | null> {
        return SessionsRDS.upsertSession(db, userId, refreshToken);
    }

    static async fetchUserDataWithSession(db: DatabaseOrTransaction, refreshToken: string) {
        return UsersRDS.fetchUserDataWithSession(db, refreshToken);
    }

    static async getUserAndAccountBySessionToken(db: DatabaseOrTransaction, refreshToken: string) {
        return SessionsRDS.getUserAndAccountBySessionToken(db, refreshToken);
    }

    static async flagImportedUser(db: DatabaseOrTransaction, providerId: string) {
        return UsersRDS.flagImportedUser(db, providerId);
    }

    static async retrieveNotifications(db: DatabaseOrTransaction, userId: string) {
        return NotificationRDS.retrieveNotifications(db, userId);
    }

    static async upsertNotification(
        db: DatabaseOrTransaction,
        userId: string,
        notification: Notification,
        environmentValue?: string | null
    ) {
        return NotificationRDS.upsertNotification(db, userId, notification, environmentValue);
    }

    static async updateAllNotifications(db: DatabaseOrTransaction, notification: Notification) {
        return NotificationRDS.updateAllNotifications(db, notification);
    }

    static async deleteNotification(db: DatabaseOrTransaction, notification: Notification, userId: string) {
        return NotificationRDS.deleteNotification(db, notification, userId);
    }

    static async deleteAllNotifications(db: DatabaseOrTransaction, userId: string) {
        return NotificationRDS.deleteAllNotifications(db, userId);
    }
}
