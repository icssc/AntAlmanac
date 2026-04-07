import { ShortCourseSchedule, User } from '@packages/antalmanac-types';
import { db } from '@packages/db/src/index';
import * as schema from '@packages/db/src/schema';
import {
    accounts,
    coursesInSchedule,
    customEvents,
    schedules,
    sessions,
    users,
    Schedule,
    CourseInSchedule,
    CustomEvent,
} from '@packages/db/src/schema';
import { and, eq, ExtractTablesWithRelations, gt } from 'drizzle-orm';
import { PgTransaction, PgQueryResultHKT } from 'drizzle-orm/pg-core';

type Transaction = PgTransaction<PgQueryResultHKT, typeof schema, ExtractTablesWithRelations<typeof schema>>;
type DatabaseOrTransaction = Omit<typeof db, '$client'> | Transaction;

export class UsersRDS {
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

            const userSchedules = UsersRDS.aggregateUserData(sectionResults, customEventResults);

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

                const userSchedules = UsersRDS.aggregateUserData(sectionResults, customEventResults);

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
            const res = await db.transaction((tx) =>
                tx
                    .select()
                    .from(accounts)
                    .innerJoin(users, eq(accounts.userId, users.id))
                    .where(and(eq(users.name, providerId), eq(accounts.accountType, 'GUEST')))
                    .execute()
                    .then((rows) => ({ users: rows[0].users, accounts: rows[0].accounts }))
            );

            if (res.users.imported) {
                return false;
            }

            await db.transaction((tx) =>
                tx.update(users).set({ imported: true }).where(eq(users.id, res.accounts.userId)).execute()
            );
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Aggregates the user's schedule data from the results of two queries.
     */
    static aggregateUserData(
        sectionResults: { schedules: Schedule; coursesInSchedule: CourseInSchedule | null }[],
        customEventResults: { schedules: Schedule; customEvents: CustomEvent | null }[]
    ): (ShortCourseSchedule & { id: string; index: number })[] {
        const schedulesMapping: Record<string, ShortCourseSchedule & { id: string; index: number }> = {};

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

        return Object.values(schedulesMapping).sort((a, b) => a.index - b.index);
    }
}
