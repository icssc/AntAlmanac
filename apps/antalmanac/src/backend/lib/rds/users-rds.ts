import type { ShortCourse, ShortCourseSchedule, ScheduleSaveState } from '@packages/antalmanac-types';
import type { db } from '@packages/db';
import type * as schema from '@packages/db/src/schema';
import {
    accounts,
    coursesInSchedule,
    customEvents,
    schedules,
    sessions,
    users,
    type Schedule,
    type CourseInSchedule,
    type CustomEvent,
    type User,
} from '@packages/db/src/schema';
import { and, eq, ExtractTablesWithRelations, gt, sql } from 'drizzle-orm';
import type { PgTransaction, PgQueryResultHKT } from 'drizzle-orm/pg-core';

import { SessionsRDS } from './sessions-rds';

type Transaction = PgTransaction<PgQueryResultHKT, typeof schema, ExtractTablesWithRelations<typeof schema>>;
type DatabaseOrTransaction = Omit<typeof db, '$client'> | Transaction;

export class UsersRDS {
    /**
     * Retrieves a user by their ID from the database.
     */
    static async getUserById(db: DatabaseOrTransaction, userId: string) {
        return db
            .select()
            .from(users)
            .where(eq(users.id, userId))
            .then((res) => res[0]);
    }

    static async getUserByEmail(db: DatabaseOrTransaction, email: string) {
        return db
            .select()
            .from(users)
            .where(sql`lower(${users.email}) = lower(${email.trim()})`)
            .limit(1)
            .then((res) => res[0]);
    }

    /**
     * Retrieves a guest user's publicly-shareable schedule data by their guest username.
     */
    static async getGuestScheduleByUsername(
        db: DatabaseOrTransaction,
        username: string
    ): Promise<(User & { userData: ScheduleSaveState }) | null> {
        const row = await db
            .select()
            .from(accounts)
            .innerJoin(users, eq(accounts.userId, users.id))
            .where(and(eq(accounts.accountType, 'GUEST'), eq(accounts.providerAccountId, username)))
            .limit(1)
            .then((res) => res[0] ?? null);

        if (!row) {
            return null;
        }

        const userId = row.users.id;

        const [sectionResults, customEventResults] = await Promise.all([
            db
                .select()
                .from(schedules)
                .where(eq(schedules.userId, userId))
                .leftJoin(coursesInSchedule, eq(schedules.id, coursesInSchedule.scheduleId)),
            db
                .select()
                .from(schedules)
                .where(eq(schedules.userId, userId))
                .leftJoin(customEvents, eq(schedules.id, customEvents.scheduleId)),
        ]);

        const userSchedules = UsersRDS.aggregateUserData(sectionResults, customEventResults);

        const scheduleIndex = row.users.currentScheduleId
            ? userSchedules.findIndex((s) => s.id === row.users.currentScheduleId)
            : userSchedules.length;

        return {
            ...row.users,
            userData: {
                schedules: userSchedules,
                scheduleIndex,
            },
        };
    }

    /**
     * Retrieves a friend's user data, filtered to only schedules they have chosen to share with friends.
     */
    static async getUserFriendDataByUid(
        db: DatabaseOrTransaction,
        userId: string
    ): Promise<(User & { userData: ScheduleSaveState }) | null> {
        return db.transaction(async (tx) => {
            const user = await tx
                .select()
                .from(users)
                .where(eq(users.id, userId))
                .then((res) => res[0]);

            if (!user) {
                return null;
            }

            const sharedCondition = and(eq(schedules.userId, userId), eq(schedules.sharedWithFriends, true));

            const sectionResults = await tx
                .select()
                .from(schedules)
                .where(sharedCondition)
                .leftJoin(coursesInSchedule, eq(schedules.id, coursesInSchedule.scheduleId));

            const customEventResults = await tx
                .select()
                .from(schedules)
                .where(sharedCondition)
                .leftJoin(customEvents, eq(schedules.id, customEvents.scheduleId));

            const userSchedules = UsersRDS.aggregateUserData(sectionResults, customEventResults);

            return {
                ...user,
                userData: {
                    schedules: userSchedules,
                    scheduleIndex: 0,
                },
            };
        });
    }

    /**
     * Resolves a session token to a userId, verifying the session is valid and not expired.
     * Returns null if the session is invalid or expired.
     */
    static async getUserIdBySessionToken(db: DatabaseOrTransaction, sessionToken: string): Promise<string | null> {
        const session = await SessionsRDS.getCurrentSession(db, sessionToken);
        if (!session || session.expires <= new Date()) return null;
        return session.userId;
    }

    /**
     * Flags the guest user with the given username as imported.
     *
     * @returns true if the user was successfully flagged, false if already flagged or not found.
     */
    static async flagImportedUser(db: DatabaseOrTransaction, username: string) {
        return db.transaction(async (tx) => {
            const row = await tx
                .select({ userId: users.id, imported: users.imported })
                .from(accounts)
                .innerJoin(users, eq(accounts.userId, users.id))
                .where(and(eq(accounts.accountType, 'GUEST'), eq(accounts.providerAccountId, username)))
                .limit(1)
                .then((res) => res[0] ?? null);

            if (!row || row.imported) {
                return false;
            }

            await tx.update(users).set({ imported: true }).where(eq(users.id, row.userId)).execute();
            return true;
        });
    }

    private static async getUserDataWithSession(db: DatabaseOrTransaction, refreshToken: string) {
        return db
            .select()
            .from(users)
            .leftJoin(sessions, eq(users.id, sessions.userId))
            .where(and(eq(sessions.refreshToken, refreshToken), gt(sessions.expires, new Date())))
            .then((res) => res[0].users);
    }

    /**
     * Fetches user data associated with a valid session using a refresh token.
     */
    static async fetchUserDataWithSession(db: DatabaseOrTransaction, refreshToken: string) {
        const user = await UsersRDS.getUserDataWithSession(db, refreshToken);

        if (!user) {
            return null;
        }

        const [sectionResults, customEventResults] = await Promise.all([
            db
                .select()
                .from(schedules)
                .where(eq(schedules.userId, user.id))
                .leftJoin(coursesInSchedule, eq(schedules.id, coursesInSchedule.scheduleId)),
            db
                .select()
                .from(schedules)
                .where(eq(schedules.userId, user.id))
                .leftJoin(customEvents, eq(schedules.id, customEvents.scheduleId)),
        ]);

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

    /**
     * Aggregates the user's schedule data from the results of two joined queries.
     */
    static aggregateUserData(
        sectionResults: { schedules: Schedule; coursesInSchedule: CourseInSchedule | null }[],
        customEventResults: { schedules: Schedule; customEvents: CustomEvent | null }[]
    ): (ShortCourseSchedule & { id: string; index: number })[] {
        const schedulesMapping: Record<string, ShortCourseSchedule & { id: string; index: number }> = {};

        const courseIndexes: Record<Schedule['id'], Record<ShortCourse['sectionCode'], CourseInSchedule['index']>> = {};

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
                const sectionCode = course.sectionCode.toString();
                scheduleAggregate.courses.push({
                    sectionCode,
                    term: course.term,
                    color: course.color,
                });

                if (course.index !== null) {
                    if (!courseIndexes[scheduleId]) {
                        courseIndexes[scheduleId] = {};
                    }
                    courseIndexes[scheduleId][sectionCode] = course.index;
                }
            }

            schedulesMapping[scheduleId] = scheduleAggregate;
        });

        for (const [scheduleId, indexes] of Object.entries(courseIndexes)) {
            schedulesMapping[scheduleId].courses.sort((a, b) => {
                const aIndex = indexes[a.sectionCode];
                const bIndex = indexes[b.sectionCode];
                if (typeof aIndex !== 'number' || typeof bIndex !== 'number') {
                    return 0;
                }
                return aIndex - bIndex;
            });
        }

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
                    color: customEvent.color ?? '#551a8b',
                    building: customEvent.building ?? undefined,
                });
            }

            schedulesMapping[scheduleId] = scheduleAggregate;
        });

        return Object.values(schedulesMapping).sort((a, b) => a.index - b.index);
    }
}
