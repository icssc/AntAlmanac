import { primaryKey, pgTable, text, pgEnum } from 'drizzle-orm/pg-core';

import { users } from './user';


export const oAuthProvider = pgEnum(
    'account_provider',
    ['GOOGLE']
);

// Each user can have multiple accounts, each account is associated with a provider.
// A user without an account is a username-only user.
export const accounts = pgTable(
    'accounts',
    {
        userId: text('user_id')
            .references(() => users.id, { onDelete: 'cascade' })
            .notNull(),

        provider: oAuthProvider('provider').notNull(),

        providerAccountId: text('provider_account_id').notNull(),
    },
    (table) => {
        return {
            primaryKey: primaryKey({
                columns: [table.userId, table.provider, table.providerAccountId],
            }),
        };
    }
);

export type Account = typeof accounts.$inferSelect;
