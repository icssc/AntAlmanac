import { pgTable, text, timestamp, pgEnum, primaryKey, index } from 'drizzle-orm/pg-core';

import { users } from './auth/user';

export const friendshipStatusEnum = pgEnum('friendship_status', ['PENDING', 'ACCEPTED', 'DECLINED', 'BLOCKED']);

/**
 * Friendship entity represents a relationship between two users.
 */
export const friendships = pgTable(
    'friendships',
    {
        /**
         * The user who initiated the friend request.
         */
        requesterId: text('requester_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),

        /**
         * The user being requested.
         */
        addresseeId: text('addressee_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),

        /**
         * The status of the friendship.
         */
        status: friendshipStatusEnum('status').notNull().default('PENDING'),

        /**
         * When the request was created.
         */
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),

        /**
         * When the status was last updated.
         */
        updatedAt: timestamp('updated_at', { withTimezone: true })
            .defaultNow()
            .notNull()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        primaryKey({
            columns: [table.requesterId, table.addresseeId],
        }),
        index('addressee_idx').on(table.addresseeId),
    ]
);

export type Friendship = typeof friendships.$inferSelect;
export type FriendshipStatus = (typeof friendshipStatusEnum.enumValues)[number];
