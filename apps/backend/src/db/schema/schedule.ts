import { createId } from '@paralleldrive/cuid2';
import { boolean, pgTable, text } from 'drizzle-orm/pg-core';
import { user } from './auth/user';

export const schedule = pgTable('schedule', {
    id: text('id').primaryKey().$defaultFn(createId),

    /**
     * A schedule is owned by a user.
     */
    userId: text('user_id')
        .references(() => user.id, { onDelete: 'cascade' })
        .notNull(),

    /**
     * Whether this schedule was the most recently focused.
     */
    active: boolean('active'),

    /**
     * Name of the schedule.
     */
    name: text('name'),

    /**
     * Any custom notes.
     */
    notes: text('notes'),
});
