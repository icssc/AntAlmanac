import { ShortCourse, ShortCourseSchedule, User, RepeatingCustomEvent } from '@packages/antalmanac-types';
import { db } from '@packages/db/src/index';
import * as schema from '@packages/db/src/schema';
import { coursesInSchedule, customEvents, schedules, users } from '@packages/db/src/schema';
import { eq, ExtractTablesWithRelations } from 'drizzle-orm';
import { PgTransaction, PgQueryResultHKT } from 'drizzle-orm/pg-core';

import { AccountsRDS } from './accounts-rds';

type Transaction = PgTransaction<PgQueryResultHKT, typeof schema, ExtractTablesWithRelations<typeof schema>>;
type DatabaseOrTransaction = Omit<typeof db, '$client'> | Transaction;

export class SchedulesRDS {
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
            const account = await AccountsRDS.registerUserAccount(
                tx,
                'OIDC',
                userData.id,
                userData.name,
                userData.email,
                userData.avatar
            );
            if (!account) {
                throw new Error(`Failed to create user`);
            }
            const userId = account.userId;

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
}
