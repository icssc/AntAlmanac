import { createId } from '@paralleldrive/cuid2';
import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { users } from '../auth/user';

// NOTE: unique constraints on (userId, name) and (userId, index) are intentionally
// not declared here. They are managed manually in migration 0009 as DEFERRABLE INITIALLY DEFERRED
// to allow index/name swaps within a transaction. Do not let drizzle-kit regenerate them.
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

    lastUpdated: timestamp('last_updated', { withTimezone: true }).notNull(),
});

export type Schedule = typeof schedules.$inferSelect;
