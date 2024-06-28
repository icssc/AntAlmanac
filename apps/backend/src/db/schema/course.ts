import { integer, pgTable, primaryKey, text } from 'drizzle-orm/pg-core';
import { schedule } from './schedule';

/**
 * Courses have a N:1 relation with schedules.
 *
 * Schedules can't have duplicate courses. i.e. courses with the same section code and term.
 *
 * Once a schedule and its courses have been loaded, additional context can be retrieved
 * for the courses by querying PPA with the section code and term.
 */
export const course = pgTable(
    'course',
    {
        scheduleId: text('scheduleId').references(() => schedule.id, { onDelete: 'cascade' }),

        /**
         * The course's section code.
         */
        sectionCode: integer('sectionCode'),

        /**
         * @example Winter 2024.
         */
        term: text('term'),

        /**
         * Color that the course has when displayed on calendar.
         */
        color: text('color'),
    },
    (table) => {
        return {
            primaryKey: primaryKey({
                columns: [table.scheduleId, table.sectionCode, table.term],
            }),
        };
    }
);
