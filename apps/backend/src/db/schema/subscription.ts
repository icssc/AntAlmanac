import { integer, boolean, pgTable, primaryKey, text, pg } from 'drizzle-orm/pg-core';

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
        sectionCode: integer('sectionCode').notNull(),

        /**
         * Year of subscription
         * @example 2024, 2025, etc.
         */

        year: text('year').notNull(),

        /**
         * Quarter of subscription
         * @example Fall, Winter, Spring, Summer, etc.
         */

        quarter: text('quarter').notNull(),

        /**
         * Status since polling script last updated 
         * @example "OPEN" | "WAITLISTED" | "FULL"
         */

        lastUpdated: text('lastUpdated'),

        /**
         * Restriction codes since polling script last updated 
         * @example "A,L" | "B" | None
         */

        lastCodes: text('lastCodes').default(""),

        /**
         * Boolean if user wants to be notified when the section is OPEN
         */
        openStatus: boolean('openStatus').default(false),

        /**
         * Boolean if user wants to be notified when the section is WAITLISTED
         */
        waitlistStatus: boolean('waitlistStatus').default(false),

        /**
         * Boolean if user wants to be notified when the section is FULL
         */
        fullStatus: boolean('fullStatus').default(false),

          /**
         * Boolean if user wants to be notified when the section has RESTRICTION CODE CHANGES
         */
        restrictionStatus: boolean('restrictionStatus').default(false),


    },
    (table) => [
        primaryKey({
            columns: [table.userId, table.sectionCode],
        }),
    ]
);

export type Subscription = typeof subscriptions.$inferSelect;
