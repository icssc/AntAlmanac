import { createId } from '@paralleldrive/cuid2';
import { AnyPgColumn, pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';

import { schedules } from '../schedule/schedule';

/**
 * User entity is analogous to a person.
 */
export const users = pgTable('users', {
    /**
     * Unique ID (CUID) to represent the entity.
     */
    id: text('id').primaryKey().$defaultFn(createId),

    /**
     * Phone number for subscribing to notifications.
     */
    phone: text('phone'),

    /**
     * Profile picture.
     */
    avatar: text('avatar'),

    /**
     * User's name.
     */
    name: text('name'),

    /**
     * User's email.
     */
    email: text('email'),

    /**
     * Imported User Flag.
     *
     * Indicates if the user was imported into a Google account.
     */
    imported: boolean('imported').default(false),

    /**
     * Most recently viewed schedule.
     */
    currentScheduleId: text('current_schedule_id').references(
        // Necessary because this is a circular dependency.
        (): AnyPgColumn => schedules.id,
        { onDelete: 'set null' }
    ),

    lastUpdated: timestamp('last_updated', { withTimezone: true }).defaultNow(),
});

export type User = typeof users.$inferSelect;
