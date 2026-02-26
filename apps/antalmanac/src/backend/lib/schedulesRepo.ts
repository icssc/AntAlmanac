import {
    type ShortCourse,
    type ShortCourseSchedule,
    type User,
    type RepeatingCustomEvent,
} from '@packages/antalmanac-types';
import {
    coursesInSchedule,
    customEvents,
    schedules,
    users,
    type CourseInSchedule,
    type CustomEvent,
    type Schedule,
} from '@packages/db/src/schema';
import { eq } from 'drizzle-orm';

import { registerUserAccount } from './accountsRepo';
import type { DatabaseOrTransaction, Transaction } from './rdsTypes';

async function upsertCourses(tx: Transaction, scheduleId: string, courses: ShortCourse[]) {
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

async function upsertCustomEvents(tx: Transaction, scheduleId: string, repeatingCustomEvents: RepeatingCustomEvent[]) {
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

async function upsertScheduleAndContents(
    tx: Transaction,
    userId: string,
    schedule: ShortCourseSchedule,
    index: number
) {
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

    await Promise.all([
        upsertCourses(tx, scheduleId, schedule.courses).catch((error) => {
            throw new Error(`Failed to insert courses for ${schedule.scheduleName}: ${error}`);
        }),
        upsertCustomEvents(tx, scheduleId, schedule.customEvents).catch((error) => {
            throw new Error(`Failed to insert custom events for ${schedule.scheduleName}: ${error}`);
        }),
    ]);

    return scheduleId;
}

export async function upsertSchedulesAndContents(
    tx: Transaction,
    userId: string,
    scheduleArray: ShortCourseSchedule[]
): Promise<string[]> {
    await tx.delete(schedules).where(eq(schedules.userId, userId));

    return Promise.all(scheduleArray.map((schedule, index) => upsertScheduleAndContents(tx, userId, schedule, index)));
}

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
            id: scheduleId,
            scheduleName: schedule.name,
            scheduleNote: schedule.notes,
            courses: [],
            customEvents: [],
            index: schedule.index,
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

export async function getUserDataByUid(db: DatabaseOrTransaction, userId: string): Promise<User | null> {
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

        const userSchedules = aggregateUserData(sectionResults, customEventResults);

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

export async function upsertUserData(db: DatabaseOrTransaction, userData: User): Promise<string> {
    return db.transaction(async (tx) => {
        const account = await registerUserAccount(
            db,
            'OIDC',
            userData.id,
            userData.name,
            userData.email,
            userData.avatar
        );
        const userId = account.userId;
        if (!account) {
            throw new Error('Failed to create user');
        }

        const scheduleIds = await upsertSchedulesAndContents(tx, userId, userData.userData.schedules);

        const scheduleIndex = userData.userData.scheduleIndex;

        const currentScheduleId =
            scheduleIndex === undefined || scheduleIndex >= scheduleIds.length ? null : scheduleIds[scheduleIndex];

        if (currentScheduleId !== null) {
            await tx.update(users).set({ currentScheduleId }).where(eq(users.id, userId));
        }

        return userId;
    });
}
