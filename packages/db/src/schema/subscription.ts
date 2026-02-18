import { boolean, pgTable, primaryKey, text } from 'drizzle-orm/pg-core';

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
        sectionCode: text('sectionCode').notNull(),

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
         * @example "OPEN" | "Waitl" | "FULL" |
         */

        lastUpdatedStatus: text('lastUpdatedStatus'),

        /**
         * Restriction codes since polling script last updated
         * @example "A,L" | "B" | None
         */

        lastCodes: text('lastCodes').default(''),

        /**
         * Boolean if user wants to be notified when the section is OPEN
         */
        notifyOnOpen: boolean('notifyOnOpen').default(false),

        /**
         * Boolean if user wants to be notified when the section is WAITLISTED
         */
        notifyOnWaitlist: boolean('notifyOnWaitlist').default(false),

        /**
         * Boolean if user wants to be notified when the section is FULL
         */
        notifyOnFull: boolean('notifyOnFull').default(false),

        /**
         * Boolean if user wants to be notified when the section has RESTRICTION CODE CHANGES
         */
        notifyOnRestriction: boolean('notifyOnRestriction').default(false),

        /**
         * Environment when this subscription was created (e.g. "production", "staging-1337", "staging-1447").
         * AANTS only sends emails when its STAGE matches this value.
         */
        environment: text('environment').notNull(),
    },
    (table) => [
        primaryKey({
            columns: [table.userId, table.sectionCode, table.year, table.quarter],
        }),
    ]
);

export type Subscription = typeof subscriptions.$inferSelect;
