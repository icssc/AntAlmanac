import { createId } from '@paralleldrive/cuid2';
import { boolean, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { users } from '../auth/user';

// NOTE: the unique constraint on (userId, index) is intentionally not declared here.
// It is managed manually in migration 0009 as DEFERRABLE INITIALLY DEFERRED
// to allow index reorders within a transaction. Do not let drizzle-kit regenerate it.
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

    /**
     * Index of the schedule in the user's list of schedules.
     */
    index: integer('index').notNull(),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),

    /**
     * Updates to content in schedule will not bump this column.
     * Only direct updates to the schedule table will bump this column (e.g. name, notes, index).
     *
     * {@see} backend/lib/rds.ts, `upsertSchedulesAndContents`
     */
    lastUpdated: timestamp('last_updated', { withTimezone: true })
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),

    /**
     * Whether this schedule is visible to friends.
     * Defaults to true so existing schedules remain visible.
     */
    sharedWithFriends: boolean('shared_with_friends').notNull().default(true),
});

export type Schedule = typeof schedules.$inferSelect;
