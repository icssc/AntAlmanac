import { integer, pgEnum, pgTable, primaryKey, text } from 'drizzle-orm/pg-core';
import { user } from './auth/user';


export const subscriptionTargetStatus = pgEnum(
    'subscription_target_status',
    ['OPEN', 'WAITLISTED']
)

export const subscription = pgTable(
    'subscription',
    {
        /**
         * The user that is subscribing to course updates for the specified section.
         */
        userId: text('userId').references(() => user.id, { onDelete: 'cascade' }),

        /**
         * Section code.
         */
        sectionCode: integer('sectionCode'),

        /**
         * @example "OPEN" could indicate that the user wants to be notified when this
         * section changes from "WAITLISTED" to "OPEN".
         */
        status: subscriptionTargetStatus('status'),
    },
    (table) => {
        return {
            primaryKey: primaryKey({
                columns: [table.userId, table.sectionCode],
            }),
        };
    }
);
