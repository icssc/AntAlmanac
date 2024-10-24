import { createId } from '@paralleldrive/cuid2';
import { boolean, pgTable, text } from 'drizzle-orm/pg-core';
import { users } from './auth/user';

export const schedules = pgTable('schedules', {
    id: text('id').primaryKey().$defaultFn(createId),

    /**
     * A schedule is owned by a user.
     */
    userId: text('user_id')
        .references(() => users.id, { onDelete: 'cascade' })
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
