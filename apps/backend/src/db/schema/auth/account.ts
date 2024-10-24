import { primaryKey, pgTable, text, pgEnum } from 'drizzle-orm/pg-core';

import { user } from './user';


export const oAuthProvider = pgEnum(
    'account_provider',
    ['GOOGLE']
);

// Each user can have multiple accounts, each account is associated with a provider.
// A user without an account is a username-only user.
export const account = pgTable(
    'account',
    {
        userId: text('user_id')
            .references(() => user.id, { onDelete: 'cascade' })
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

export type Account = typeof account.$inferSelect;
