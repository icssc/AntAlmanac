import type { ShortCourseSchedule, ScheduleSaveState } from '@packages/antalmanac-types';
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

import { getCurrentSession } from './sessions';

type Transaction = PgTransaction<PgQueryResultHKT, typeof schema, ExtractTablesWithRelations<typeof schema>>;
type DatabaseOrTransaction = Omit<typeof db, '$client'> | Transaction;

/**
 * Retrieves a user by their ID from the database.
 */
export async function getUserById(db: DatabaseOrTransaction, userId: string) {
    return db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .then((res) => res[0]);
}

export async function getUserByEmail(db: DatabaseOrTransaction, email: string) {
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
export async function getGuestScheduleByUsername(
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

    const userSchedules = aggregateUserData(sectionResults, customEventResults);

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
 * Resolves a session token to a userId, verifying the session is valid and not expired.
 * Returns null if the session is invalid or expired.
 */
export async function getUserIdBySessionToken(db: DatabaseOrTransaction, sessionToken: string): Promise<string | null> {
    const session = await getCurrentSession(db, sessionToken);
    if (!session || session.expires <= new Date()) return null;
    return session.userId;
}

/**
 * Flags the guest user with the given username as imported.
 *
 * @returns true if the user was successfully flagged, false if already flagged or not found.
 */
export async function flagImportedUser(db: DatabaseOrTransaction, username: string) {
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

async function getUserDataWithSession(db: DatabaseOrTransaction, refreshToken: string) {
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
export async function fetchUserDataWithSession(db: DatabaseOrTransaction, refreshToken: string) {
    const user = await getUserDataWithSession(db, refreshToken);

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

    const userSchedules = aggregateUserData(sectionResults, customEventResults);

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
export function aggregateUserData(
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
                color: customEvent.color ?? '#551a8b',
                building: customEvent.building ?? undefined,
            });
        }

        schedulesMapping[scheduleId] = scheduleAggregate;
    });

    return Object.values(schedulesMapping).sort((a, b) => a.index - b.index);
}
