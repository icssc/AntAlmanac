import { ShortCourse, ShortCourseSchedule, User, RepeatingCustomEvent } from '@packages/antalmanac-types';
import { randomBytes } from 'crypto';
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
     * If a guest user with the specified name exists, return their ID, otherwise return null.
     */
    static async guestUserIdWithNameOrNull(db: DatabaseOrTransaction, name: string): Promise<string | null> {
        return db
            .select({ id: accounts.userId })
            .from(accounts)
            .where(and(eq(accounts.accountType, 'GUEST'), eq(accounts.providerAccountId, name)))
            .limit(1)
            .then((xs) => xs[0]?.id ?? null);
    }
    /**
     * Retrieves an account with the specified user ID and account type 'GOOGLE'.
     *
     * @param db - The database or transaction object.
     * @param userId - The ID of the user whose account is to be retrieved.
     * @returns A promise that resolves to the account object if found, otherwise null.
     */
    static async getAccount(db: DatabaseOrTransaction, providerId: string): Promise<Account | null> {
        return db.transaction((tx) =>
            tx
                .select()
                .from(accounts)
                .where(and(eq(accounts.accountType, 'GOOGLE'), eq(accounts.providerAccountId, providerId)))
                .limit(1)
                .then((res) => res[0] ?? null)
        );
    }

    /**
     * Adds a new account to an existing user.
     *
     * @param db - The database or transaction object.
     * @param userId - The ID of the user to whom the account will be added.
     * @param providerId - The provider account ID for the new account.
     * @returns A promise that resolves to the newly created account object.
     */
    static async createAccount(db: DatabaseOrTransaction, userId: string, providerId: string): Promise<Account | null> {
        return db.transaction((tx) =>
            tx
                .insert(accounts)
                .values({ userId: userId, providerAccountId: providerId, accountType: 'GOOGLE' })
                .returning()
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
    static async createUserAccount(db: DatabaseOrTransaction, providerId: string) {
        const userId = crypto.randomUUID();
        await db.insert(users).values({
            id: userId,
        });

        const account = await this.createAccount(db, userId, providerId);
        return account;
    }

    /**
     * Creates a guest user if they don't already exist.
     *
     * @param db Database or transaction object
     * @param name Guest user's name, to be used as providerAccountID and username
     * @returns The new/existing user's ID
     */
    static async createGuestUserOptional(db: DatabaseOrTransaction, name: string) {
        return db.transaction(async (tx) => {
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
        });
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
     * If the guest user with the username in the userData object doesn't already exist,
     * create a new guest user and populate their data. Otherwise, returns null.
     */
    static async insertGuestUserData(db: DatabaseOrTransaction, userData: User): Promise<string | null> {
        return db.transaction(async (tx) => {
            const userId = await RDS.guestUserIdWithNameOrNull(tx, userData.id);
            if (userId) return null;
            return RDS.upsertGuestUserData(tx, userData);
        });
    }

    /**
     * Does the same thing as `insertGuestUserData`, but also updates the user's schedules and courses if they exist.
     *
     * @param db The Drizzle client or transaction object
     * @param userData The object of data containing the user's schedules and courses
     * @returns The user's ID
     */
    static async upsertGuestUserData(db: DatabaseOrTransaction, userData: User): Promise<string> {
        return db.transaction(async (tx) => {
            const userId = await this.createGuestUserOptional(tx, userData.id);

            if (userId === undefined) {
                throw new Error(`Failed to create guest user for ${userData.id}`);
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

    static async getGuestUserData(db: DatabaseOrTransaction, guestId: string): Promise<User | null> {
        const userAndAccount = await RDS.getUserAndAccount(db, 'GUEST', guestId);
        if (!userAndAccount) {
            return null;
        }

        const userId = userAndAccount.user.id;

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

        const scheduleIndex = userAndAccount.user.currentScheduleId
            ? userSchedules.findIndex((schedule) => schedule.id === userAndAccount.user.currentScheduleId)
            : userSchedules.length;

        return {
            id: guestId,
            userData: {
                schedules: userSchedules,
                scheduleIndex,
            },
        };
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

    static async getCurrentSession(db: DatabaseOrTransaction, refreshToken: string) {
        return db.transaction((tx) =>
            tx
                .select()
                .from(sessions)
                .where(eq(sessions.refreshToken, refreshToken))
                .then((res) => res[0] ?? null)
        );
    }

    static async createSession(db: DatabaseOrTransaction, userID: string): Promise<Session | null> {
        return db.transaction((tx) =>
            tx
                .insert(sessions)
                .values({
                    id: crypto.randomUUID(),
                    userId: userID,
                    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                })
                .returning()
                .then((res) => res[0] ?? null)
        );
    }

    static async refreshToken(db: DatabaseOrTransaction, refreshToken: string): Promise<Session | null> {
        let updateSession = await db
            .update(sessions)
            .set({ refreshToken: randomBytes(24).toString('base64url') })
            .where(eq(sessions.refreshToken, refreshToken))
            .returning()
            .then((res) => res[0] ?? null);
        return updateSession;
    }

    static async upsertSession(
        db: DatabaseOrTransaction,
        userId: string,
        refreshToken: string
    ): Promise<Session | null> {
        const currentSession = await this.getCurrentSession(db, refreshToken);
        if (currentSession && new Date(currentSession.expires) < new Date()) {
            return await this.refreshToken(db, refreshToken);
        }
        return await RDS.createSession(db, userId);
    }
}
