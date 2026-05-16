import { sql } from 'drizzle-orm';
import { pgTable, text, pgEnum, timestamp, uuid } from 'drizzle-orm/pg-core';

import { users } from './user';

/**
 * GOOGLE: legacy pre-OIDC accounts (raw Google IDs, no longer created)
 * GUEST: anonymous/guest schedule saves
 * OIDC: Google Sign-In via icssc/auth OIDC server
 * APPLE: Apple Sign-In via icssc/auth OIDC server
 */
const accountTypes = ['GOOGLE', 'GUEST', 'OIDC', 'APPLE'] as const;

export const accountTypeEnum = pgEnum('account_type', accountTypes);

export type AccountType = (typeof accountTypes)[number];

// Each user can have multiple accounts, each account is associated with a provider.
// A user without an account is a username-only user.
export const accounts = pgTable('accounts', {
    id: uuid('id')
        .primaryKey()
        .default(sql`gen_random_uuid()`),
    userId: text('user_id')
        .references(() => users.id, { onDelete: 'cascade' })
        .notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    providerId: text('provider_id'),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    idToken: text('id_token'),
    scope: text('scope'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
    accountType: accountTypeEnum('account_type')
        .notNull()
        .$default(() => 'GUEST'),
});

export type Account = typeof accounts.$inferSelect;
