import { integer, boolean, pgTable, primaryKey, text } from 'drizzle-orm/pg-core';
import { users } from './auth/user';

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
         * @example "OPEN" | "WAITLISTED" | "FULL"
         */

        lastUpdated: text('lastUpdated'),

        /**
         * Boolean if user wants to be notified when the section is OPEN
         */
        openStatus: boolean('openStatus'),

        /**
         * Boolean if user wants to be notified when the section is WAITLISTED
         */
        waitlistStatus: boolean('waitlistStatus'),

        /**
         * Boolean if user wants to be notified when the section is FULL
         */
        fullStatus: boolean('fullStatus'),

          /**
         * Boolean if user wants to be notified when the section has RESTRICTION CODE CHANGES
         */
        restrictionStatus: boolean('restrictionStatus'),


    },
    (table) => [
        primaryKey({
            columns: [table.userId, table.sectionCode],
        }),
    ]
);

export type Subscription = typeof subscriptions.$inferSelect;
