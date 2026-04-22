import { index, pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core';

import { schedules } from './schedule';

/**
 * customEvents have a N:1 relation with schedules.
 */
export const customEvents = pgTable(
    'customEvents',
    {
        id: text('id').notNull(),

        scheduleId: text('scheduleId')
            .references(() => schedules.id, { onDelete: 'cascade' })
            .notNull(),

        title: text('title').notNull(),

        start: text('start').notNull(),

        end: text('end').notNull(),

        days: text('days').notNull(), // Boolean (1/0) string

        color: text('color'),

        building: text('building'),

        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),

        lastUpdated: timestamp('last_updated', { withTimezone: true })
            .defaultNow()
            .notNull()
            .$onUpdate(() => new Date()),
    },
    (table) => [
        primaryKey({
            columns: [table.scheduleId, table.id],
        }),
        index('customEvents_scheduleId_idx').on(table.scheduleId),
    ]
);

export type CustomEvent = typeof customEvents.$inferSelect;
