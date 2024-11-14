import { createId } from '@paralleldrive/cuid2';
import { pgTable, unique, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from '../auth/user';

export const schedules = pgTable('schedules', {
    id: text('id').primaryKey().$defaultFn(createId),

    /**
     * A schedule is owned by a user.
     */
    userId: text('user_id')
        .references(() => users.id, { onDelete: 'cascade' })
        .notNull(),

    /**
     * Name of the schedule.
     */
    name: text('name'),

    /**
     * Any custom notes.
     */
    notes: text('notes'),

    lastUpdated: timestamp('last_updated', { withTimezone: true }).notNull(),

}, (table) => ({
    unq: unique().on(table.userId, table.name)
}));

export type Schedule = typeof schedules.$inferSelect;
