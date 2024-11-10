import { createId } from '@paralleldrive/cuid2';
import { AnyPgColumn, pgTable, text } from 'drizzle-orm/pg-core';

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
     * Profile picture..
     */
    avatar: text('avatar'),

    /**
     * User's name.
     */
    name: text('name'),

    /**
     * Most recently viewed schedule.
     */
    currentScheduleId: text('current_schedule_id')
        .references(
            // Necessary because this is a circular dependency.
            (): AnyPgColumn => schedules.id
        ),
});

export type User = typeof users.$inferSelect;
