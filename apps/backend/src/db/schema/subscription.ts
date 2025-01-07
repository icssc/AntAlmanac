import { integer, pgEnum, pgTable, primaryKey, text } from 'drizzle-orm/pg-core';
import { users } from './auth/user';


export const subscriptionTargetStatus = pgEnum(
    'subscription_target_status',
    ['OPEN', 'WAITLISTED', 'FULL']
)

export const lastUpdatedStatus = pgEnum(
    'last_updated_status',
    ['OPEN/WAITLISTED', 'WAITLISTED/OPEN', 'FULL/OPEN', 'OPEN/FULL']
)

export const subscriptions = pgTable(
    'subscriptions',
    {
        /**
         * The user that is subscribing to course updates for the specified section.
         */
        userId: text('userId').references(() => users.id, { onDelete: 'cascade' }),

        /**
         * Section code.
         */
        sectionCode: integer('sectionCode'),

        /**
         * Term/quarter of subscriptions
         * @example 2024-WINTER, 2024-SPRING, 2025-FALL, etc.
         */

        term: text('term'),

        /**
         * Status since polling script last updated 
         * @example "OPEN/WAITLISTED" would indicate the section was open and is now waitlisted
         */

        lastUpdated: lastUpdatedStatus('lastUpdated'),

        /**
         * @example "OPEN" could indicate that the user wants to be notified when this
         * section changes from "WAITLISTED" to "OPEN".
         */
        status: subscriptionTargetStatus('status'),
    },
    (table) => [
        primaryKey({
            columns: [table.userId, table.sectionCode],
        }),
    ]
);

export type Subscription = typeof subscriptions.$inferSelect;
