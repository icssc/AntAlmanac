import { createId } from '@paralleldrive/cuid2';
import { sql } from 'drizzle-orm';
import { pgTable, text, pgEnum, timestamp, primaryKey } from 'drizzle-orm/pg-core';

import { users } from './user';

const accountTypes = ['GOOGLE', 'GUEST', 'OIDC'] as const;

export const accountTypeEnum = pgEnum('account_type', accountTypes);

export type AccountType = (typeof accountTypes)[number];

// Each user can have multiple accounts, each account is associated with a provider.
// A user without an account is a username-only user.
export const accounts = pgTable(
    'accounts',
    {
        id: text('id').$defaultFn(createId),
        userId: text('user_id')
            .references(() => users.id, { onDelete: 'cascade' })
            .notNull(),
        accountId: text('account_id').notNull(),
        providerId: text('provider_id'),
        accessToken: text('access_token'),
        refreshToken: text('refresh_token'),
        accessTokenExpiresAt: timestamp('access_token_expires_at'),
        refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
        idToken: text('id_token'),
        scope: text('scope'),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at')
            .default(sql`(CURRENT_TIMESTAMP)`)
            .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
        accountType: accountTypeEnum('account_type')
            .notNull()
            .$default(() => 'GUEST'),
    },
    (table) => [primaryKey({ columns: [table.userId, table.accountType] })]
);

export type Account = typeof accounts.$inferSelect;
