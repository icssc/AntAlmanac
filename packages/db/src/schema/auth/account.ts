import { pgTable, text, pgEnum, primaryKey, timestamp } from 'drizzle-orm/pg-core';

import { users } from './user';

const accountTypes = ['GOOGLE', 'GUEST', 'OIDC'] as const;

export const accountTypeEnum = pgEnum('account_type', accountTypes);

export type AccountType = (typeof accountTypes)[number];

// Each user can have multiple accounts, each account is associated with a provider.
// A user without an account is a username-only user.
export const accounts = pgTable(
    'accounts',
    {
        userId: text('user_id')
            .references(() => users.id, { onDelete: 'cascade' })
            .notNull(),

        accountType: accountTypeEnum('account_type')
            .notNull()
            .$default(() => 'GUEST'),

        providerAccountId: text('provider_account_id').notNull(),

        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),

        updatedAt: timestamp('updated_at', { withTimezone: true })
            .defaultNow()
            .notNull()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [primaryKey({ columns: [table.userId, table.accountType] })]
);

export type Account = typeof accounts.$inferSelect;
