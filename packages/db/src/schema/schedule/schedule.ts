import { createId } from '@paralleldrive/cuid2';
import { sql } from 'drizzle-orm';
import { pgTable, text, timestamp, integer, boolean, uniqueIndex } from 'drizzle-orm/pg-core';

import { users } from '../auth/user';

// NOTE: partial unique on (userId, index) for active schedules only is declared here for
// documentation; migration 0021 creates it manually (replacing deferrable unique from 0009).
// Do not let drizzle-kit regenerate the old global deferrable unique.
export const schedules = pgTable(
    'schedules',
    {
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
         * If not null, the schedule is archived/soft deleted and hidden.
         */
        archivedAt: timestamp('archived_at', { withTimezone: true }),

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
    },
    (table) => [
        uniqueIndex('schedules_user_id_index_active_unique')
            .on(table.userId, table.index)
            .where(sql`${table.archivedAt} IS NULL`),
    ]
);

export type Schedule = typeof schedules.$inferSelect;
