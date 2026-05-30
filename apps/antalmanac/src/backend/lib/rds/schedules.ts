import type {
    ShortCourse,
    ShortCourseSchedule,
    RepeatingCustomEvent,
    ScheduleSaveState,
} from '@packages/antalmanac-types';
import { coursesInSchedule, customEvents, schedules, users } from '@packages/db/src/schema';
import {
    buildConflictUpdateSet,
    buildConflictUpdateWhereChanged,
    type ConflictUpdatePolicy,
} from '@packages/db/src/utils';
import { createId } from '@paralleldrive/cuid2';
import { and, eq, not, notInArray, or } from 'drizzle-orm';

import { loadSchedules } from './helpers';
import type { DatabaseOrTransaction, Transaction } from './types';

/**
 * Upserts the given user's schedules and selected schedule index.
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
    const existingRows = await tx
        .select({ id: schedules.id, sharedWithFriends: schedules.sharedWithFriends })
        .from(schedules)
        .where(eq(schedules.userId, userId));
    const existingIds = new Set(existingRows.map((s) => s.id));
    const existingSharingStatuses = new Map(existingRows.map((s) => [s.id, s.sharedWithFriends]));

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
            sharedWithFriends: 'keep',
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
                    sharedWithFriends: existingSharingStatuses.get(dbId) ?? true,
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
        index: 'update',
        createdAt: 'keep',
        lastUpdated: 'update',
    } satisfies ConflictUpdatePolicy<typeof coursesInSchedule>;

    await tx
        .insert(coursesInSchedule)
        .values(incoming.map((course, index) => ({ scheduleId, ...course, index })))
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
    const schedule = await db
        .select()
        .from(schedules)
        .where(eq(schedules.id, scheduleId))
        .then((res) => res[0]);

    if (!schedule) {
        return null;
    }

    const scheduleArray = await loadSchedules(db, eq(schedules.id, scheduleId));
    const result = scheduleArray[0];
    if (!result) return null;
    return { ...result, userId: schedule.userId };
}

/**
 * Returns the sharedWithFriends status for all schedules owned by the given user.
 */
export async function getScheduleSharingStatuses(db: DatabaseOrTransaction, userId: string) {
    return db
        .select({ id: schedules.id, sharedWithFriends: schedules.sharedWithFriends })
        .from(schedules)
        .where(eq(schedules.userId, userId));
}

/**
 * Toggles the sharedWithFriends flag on a schedule owned by the given user.
 * Returns the updated value, or null if the schedule was not found.
 */
export async function toggleScheduleSharing(
    db: DatabaseOrTransaction,
    userId: string,
    scheduleId: string
): Promise<{ sharedWithFriends: boolean } | null> {
    return db.transaction(async (tx) => {
        const [schedule] = await tx
            .select({ sharedWithFriends: schedules.sharedWithFriends })
            .from(schedules)
            .where(and(eq(schedules.id, scheduleId), eq(schedules.userId, userId)))
            .limit(1);

        if (!schedule) return null;

        const [updated] = await tx
            .update(schedules)
            .set({ sharedWithFriends: !schedule.sharedWithFriends })
            .where(and(eq(schedules.id, scheduleId), eq(schedules.userId, userId)))
            .returning({ sharedWithFriends: schedules.sharedWithFriends });

        return { sharedWithFriends: updated.sharedWithFriends };
    });
}
