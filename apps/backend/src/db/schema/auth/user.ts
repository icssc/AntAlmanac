import { createId } from '@paralleldrive/cuid2';
import { integer, pgTable, text } from 'drizzle-orm/pg-core';

/**
 * User entity is analogous to a person.
 */
export const user = pgTable('user', {
    /**
     * Unique ID (CUID) to represent the entity.
     */
    id: text('id').primaryKey().$defaultFn(createId),

    /**
     * Phone number for subscribing to notifications.
     */
    phone: text('phone'),

    /**
     * Display name.
     */
    name: text('name'),

    /**
     * Profile picture..
     */
    avatar: text('avatar'),

    /**
     * Whether the email has been verified.
     */
    verified: integer('verified'),
});

export type User = typeof user.$inferSelect;
