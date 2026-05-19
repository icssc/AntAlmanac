import type {
    ShortCourse,
    ShortCourseSchedule,
    RepeatingCustomEvent,
    ScheduleSaveState,
} from '@packages/antalmanac-types';
import type { db } from '@packages/db';
import type * as schema from '@packages/db/src/schema';
import { coursesInSchedule, customEvents, schedules, users } from '@packages/db/src/schema';
import {
    buildConflictUpdateSet,
    buildConflictUpdateWhereChanged,
    type ConflictUpdatePolicy,
} from '@packages/db/src/utils';
import { createId } from '@paralleldrive/cuid2';
import { and, eq, ExtractTablesWithRelations, not, notInArray, or } from 'drizzle-orm';
import type { PgTransaction, PgQueryResultHKT } from 'drizzle-orm/pg-core';

import { aggregateUserData } from './users';

type Transaction = PgTransaction<PgQueryResultHKT, typeof schema, ExtractTablesWithRelations<typeof schema>>;
type DatabaseOrTransaction = Omit<typeof db, '$client'> | Transaction;

/**
 * Upserts the given user's schedules and selected schedule index.
 *
 * @param db The Drizzle client or transaction object
 * @param userId The internal user ID whose data is being saved
 * @param saveState The schedules and selected index to persist
 */
export async function upsertUserData(
    db: DatabaseOrTransaction,
    userId: string,
    saveState: ScheduleSaveState
): Promise<{ userId: string; scheduleIdMap: Record<string, string> }> {
    return db.transaction(async (tx) => {
        const scheduleIdMap = await upsertSchedulesAndContents(tx, userId, saveState.schedules);

        const scheduleDbIds = Object.values(scheduleIdMap);
        const scheduleIndex = saveState.scheduleIndex;
        const currentScheduleId =
            scheduleIndex === undefined || scheduleIndex >= scheduleDbIds.length ? null : scheduleDbIds[scheduleIndex];

        if (currentScheduleId !== null) {
            await tx.update(users).set({ currentScheduleId }).where(eq(users.id, userId));
        }

        return { userId, scheduleIdMap };
    });
}

async function upsertSchedulesAndContents(
    tx: Transaction,
    userId: string,
    scheduleArray: ShortCourseSchedule[]
): Promise<Record<string, string>> {
    const existingRows = await tx.select({ id: schedules.id }).from(schedules).where(eq(schedules.userId, userId));
    const existingIds = new Set(existingRows.map((s) => s.id));

    const prepared = scheduleArray.map((schedule, index) => ({
        schedule,
        index,
        dbId: schedule.id && existingIds.has(schedule.id) ? schedule.id : createId(),
    }));

    const keepIds = prepared.map((p) => p.dbId);
    await tx
        .delete(schedules)
        .where(
            keepIds.length === 0
                ? eq(schedules.userId, userId)
                : and(eq(schedules.userId, userId), notInArray(schedules.id, keepIds))
        );

    if (prepared.length > 0) {
        const scheduleUpdatePolicy = {
            id: 'keep',
            userId: 'keep',
            name: 'update',
            notes: 'update',
            index: 'update',
            createdAt: 'keep',
            lastUpdated: 'update',
        } satisfies ConflictUpdatePolicy<typeof schedules>;

        await tx
            .insert(schedules)
            .values(
                prepared.map(({ schedule, index, dbId }) => ({
                    id: dbId,
                    userId,
                    name: schedule.scheduleName,
                    notes: schedule.scheduleNote,
                    index,
                }))
            )
            .onConflictDoUpdate({
                target: schedules.id,
                set: buildConflictUpdateSet(schedules, scheduleUpdatePolicy),
                where: buildConflictUpdateWhereChanged(schedules, scheduleUpdatePolicy, ['lastUpdated']),
            });
    }

    await Promise.all(
        prepared.flatMap(({ schedule, dbId }) => [
            upsertCourses(tx, dbId, schedule.courses).catch((error) => {
                throw new Error(`Failed to upsert courses for ${schedule.scheduleName}: ${error}`);
            }),
            upsertCustomEvents(tx, dbId, schedule.customEvents).catch((error) => {
                throw new Error(`Failed to upsert custom events for ${schedule.scheduleName}: ${error}`);
            }),
        ])
    );

    const scheduleIdMap: Record<string, string> = {};
    for (const { schedule, dbId } of prepared) {
        if (schedule.id !== undefined) {
            scheduleIdMap[schedule.id] = dbId;
        }
    }

    return scheduleIdMap;
}

async function upsertCourses(tx: Transaction, scheduleId: string, courses: ShortCourse[]) {
    const uniqueByKey = new Map<string, { sectionCode: number; term: string; color: string }>();
    for (const course of courses) {
        const sectionCode = parseInt(course.sectionCode);
        const key = `${sectionCode}-${course.term}`;
        if (!uniqueByKey.has(key)) {
            uniqueByKey.set(key, { sectionCode, term: course.term, color: course.color });
        }
    }
    const incoming = [...uniqueByKey.values()];

    const incomingCourses = incoming.map((course) =>
        and(eq(coursesInSchedule.sectionCode, course.sectionCode), eq(coursesInSchedule.term, course.term))
    );

    await tx
        .delete(coursesInSchedule)
        .where(
            incomingCourses.length === 0
                ? eq(coursesInSchedule.scheduleId, scheduleId)
                : and(eq(coursesInSchedule.scheduleId, scheduleId), not(or(...incomingCourses)!))
        );

    if (incoming.length === 0) {
        return;
    }

    const courseUpdatePolicy = {
        scheduleId: 'keep',
        sectionCode: 'keep',
        term: 'keep',
        color: 'update',
        createdAt: 'keep',
        lastUpdated: 'update',
    } satisfies ConflictUpdatePolicy<typeof coursesInSchedule>;

    await tx
        .insert(coursesInSchedule)
        .values(incoming.map((course) => ({ scheduleId, ...course })))
        .onConflictDoUpdate({
            target: [coursesInSchedule.scheduleId, coursesInSchedule.sectionCode, coursesInSchedule.term],
            set: buildConflictUpdateSet(coursesInSchedule, courseUpdatePolicy),
            where: buildConflictUpdateWhereChanged(coursesInSchedule, courseUpdatePolicy, ['lastUpdated']),
        });
}

async function upsertCustomEvents(tx: Transaction, scheduleId: string, repeatingCustomEvents: RepeatingCustomEvent[]) {
    const incomingIds = repeatingCustomEvents.map((event) => String(event.customEventID));

    await tx
        .delete(customEvents)
        .where(
            incomingIds.length === 0
                ? eq(customEvents.scheduleId, scheduleId)
                : and(eq(customEvents.scheduleId, scheduleId), notInArray(customEvents.id, incomingIds))
        );

    if (repeatingCustomEvents.length === 0) {
        return;
    }

    const customEventUpdatePolicy = {
        id: 'keep',
        scheduleId: 'keep',
        title: 'update',
        start: 'update',
        end: 'update',
        days: 'update',
        color: 'update',
        building: 'update',
        createdAt: 'keep',
        lastUpdated: 'update',
    } satisfies ConflictUpdatePolicy<typeof customEvents>;

    await tx
        .insert(customEvents)
        .values(
            repeatingCustomEvents.map((event) => ({
                id: String(event.customEventID),
                scheduleId,
                title: event.title,
                start: event.start,
                end: event.end,
                days: event.days.map((day) => (day ? '1' : '0')).join(''),
                color: event.color,
                building: event.building,
            }))
        )
        .onConflictDoUpdate({
            target: [customEvents.scheduleId, customEvents.id],
            set: buildConflictUpdateSet(customEvents, customEventUpdatePolicy),
            where: buildConflictUpdateWhereChanged(customEvents, customEventUpdatePolicy, ['lastUpdated']),
        });
}

/**
 * Retrieves a schedule by its ID. All schedules are publicly accessible via their ID.
 */
export async function getScheduleById(
    db: DatabaseOrTransaction,
    scheduleId: string
): Promise<(ShortCourseSchedule & { id: string; index: number; userId: string }) | null> {
    return db.transaction(async (tx) => {
        const schedule = await tx
            .select()
            .from(schedules)
            .where(eq(schedules.id, scheduleId))
            .then((res) => res[0]);

        if (!schedule) {
            return null;
        }

        const sectionResults = await tx
            .select()
            .from(schedules)
            .where(eq(schedules.id, scheduleId))
            .leftJoin(coursesInSchedule, eq(schedules.id, coursesInSchedule.scheduleId));

        const customEventResults = await tx
            .select()
            .from(schedules)
            .where(eq(schedules.id, scheduleId))
            .leftJoin(customEvents, eq(schedules.id, customEvents.scheduleId));

        const scheduleArray = aggregateUserData(sectionResults, customEventResults);
        const result = scheduleArray[0];
        if (!result) return null;
        return { ...result, userId: schedule.userId };
    });
}
