import type { DatabaseOrTransaction } from '$backend/lib/rds/types';
import { VisibilityState, VISIBILITY_STATES, type ShortCourseSchedule } from '@packages/antalmanac-types';
import {
    coursesInSchedule,
    customEvents,
    schedules,
    type CourseInSchedule,
    type CustomEvent,
    type Schedule,
} from '@packages/db/src/schema';
import { eq, type SQL } from 'drizzle-orm';

/**
 * Loads schedules matching the given condition with courses and custom events joined in parallel.
 */
export async function loadSchedules(
    db: DatabaseOrTransaction,
    where: SQL
): Promise<(ShortCourseSchedule & { id: string; index: number })[]> {
    const [sectionResults, customEventResults] = await Promise.all([
        db
            .select()
            .from(schedules)
            .where(where)
            .leftJoin(coursesInSchedule, eq(schedules.id, coursesInSchedule.scheduleId))
            .orderBy(coursesInSchedule.index),
        db.select().from(schedules).where(where).leftJoin(customEvents, eq(schedules.id, customEvents.scheduleId)),
    ]);

    return aggregateUserData(sectionResults, customEventResults);
}

/**
 * Aggregates the user's schedule data from the results of two joined queries.
 */
function aggregateUserData(
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
            const sectionCode = course.sectionCode.toString();
            scheduleAggregate.courses.push({
                sectionCode,
                term: course.term,
                color: course.color,
                visibility: VISIBILITY_STATES.includes(course.visibility as VisibilityState)
                    ? (course.visibility as VisibilityState)
                    : VisibilityState.Visible,
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
                color: customEvent.color ?? '#551a8b',
                building: customEvent.building ?? undefined,
            });
        }

        schedulesMapping[scheduleId] = scheduleAggregate;
    });

    return Object.values(schedulesMapping).sort((a, b) => a.index - b.index);
}
