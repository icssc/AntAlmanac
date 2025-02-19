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
         * Year of subscription
         * @example 2024, 2025, etc.
         */

        year: text('year'),

        /**
         * Quarter of subscription
         * @example Fall, Winter, Spring, Summer, etc.
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
