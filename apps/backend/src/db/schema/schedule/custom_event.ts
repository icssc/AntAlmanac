import { createId } from '@paralleldrive/cuid2';
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { schedules } from "./schedule";

/**
 * customEvents have a N:1 relation with schedules.
 *
 * There can be multiple custom events with the same name in a schedule.
 */
export const customEvents = pgTable(
    'customEvents',
    {
        id: text('id').primaryKey().$defaultFn(createId),

        scheduleId: text('scheduleId')
            .references(() => schedules.id, { onDelete: 'cascade' })
            .notNull(),

        title: text('title').notNull(),

        start: text('start').notNull(),

        end: text('end').notNull(),

        days: text('days').notNull(), // Boolean (1/0) string

        color: text('color'),

        building: text('building'),

        lastUpdated: timestamp('last_updated', { withTimezone: true }).defaultNow(),

        term: text('term'),
    }
);

export type CustomEvent = typeof customEvents.$inferSelect;
