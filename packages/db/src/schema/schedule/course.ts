import { sql } from 'drizzle-orm';
import { check, integer, pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core';

import { schedules } from './index';

/**
 * coursesInSchedule have a N:1 relation with schedules.
 *
 * Schedules can't have duplicate courses. i.e. courses with the same section code and term.
 *
 * Once a schedule and its courses have been loaded, additional context can be retrieved
 * for the courses by querying PPA with the section code and term.
 */
export const coursesInSchedule = pgTable(
    'coursesInSchedule',
    {
        scheduleId: text('scheduleId')
            .references(() => schedules.id, { onDelete: 'cascade' })
            .notNull(),

        /**
         * The course's section code.
         */
        sectionCode: integer('sectionCode').notNull(),

        /**
         * @example Winter 2024.
         */
        term: text('term').notNull(),

        /**
         * Color that the course has when displayed on calendar.
         */
        color: text('color').notNull(),

        /**
         * Visibility state of the course in the calendar.
         * @see VisibilityState
         */
        visibility: text('visibility').notNull().default('visible'),

        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),

        lastUpdated: timestamp('last_updated', { withTimezone: true })
            .defaultNow()
            .notNull()
            .$onUpdate(() => new Date()),
    },
    (table) => [
        primaryKey({
            columns: [table.scheduleId, table.sectionCode, table.term],
        }),
        check('visibility_check', sql`${table.visibility} IN ('visible', 'outlined', 'disappeared')`),
    ]
);

export type CourseInSchedule = typeof coursesInSchedule.$inferSelect;
