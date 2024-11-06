import { primaryKey, pgTable, text, pgEnum } from 'drizzle-orm/pg-core';

import { users } from './user';


const accountTypes = ['GOOGLE', 'GUEST'] as const;

export const accountTypeEnum = pgEnum(
    'account_type',
    accountTypes
);

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
    },
    (table) => {
        return {
            primaryKey: primaryKey({
                columns: [table.userId, table.accountType],
            }),
        };
    }
);

export type Account = typeof accounts.$inferSelect;
