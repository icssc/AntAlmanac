import type { db } from '@packages/db';
import type * as schema from '@packages/db/src/schema';
import { accounts, sessions, users, type Account } from '@packages/db/src/schema';
import { buildConflictUpdateSet } from '@packages/db/src/utils';
import { and, eq, ExtractTablesWithRelations, sql } from 'drizzle-orm';
import type { PgTransaction, PgQueryResultHKT } from 'drizzle-orm/pg-core';

type Transaction = PgTransaction<PgQueryResultHKT, typeof schema, ExtractTablesWithRelations<typeof schema>>;
type DatabaseOrTransaction = Omit<typeof db, '$client'> | Transaction;

export class AccountsRDS {
    /**
     * Retrieves an account with the specified account type and provider ID.
     */
    static async getAccountByProviderId(
        db: DatabaseOrTransaction,
        accountType: Account['accountType'],
        providerId: string
    ): Promise<Account | null> {
        return db
            .select()
            .from(accounts)
            .where(and(eq(accounts.accountType, accountType), eq(accounts.providerAccountId, providerId)))
            .limit(1)
            .then((res) => res[0] ?? null);
    }

    /**
     * Registers a new user+account pair, or returns the existing account if one already exists
     * for the given provider. Supports OIDC and APPLE account types.
     */
    static async registerUserAccount(
        db: DatabaseOrTransaction,
        accountType: Account['accountType'],
        providerId: string,
        name?: string,
        email?: string,
        avatar?: string
    ) {
        if (accountType !== 'OIDC' && accountType !== 'APPLE') {
            throw new Error('Invalid account type. Must be OIDC or APPLE.');
        }

        return db.transaction(async (tx) => {
            const existingAccount = await AccountsRDS.getAccountByProviderId(tx, accountType, providerId);

            if (existingAccount) {
                return { ...existingAccount, newUser: false };
            }

            const existingUser = email
                ? await tx
                      .select()
                      .from(users)
                      .where(sql`lower(${users.email}) = lower(${email.trim()})`)
                      .limit(1)
                      .then((res) => res[0] ?? null)
                : null;

            let userId: string;
            let newUser: boolean;

            if (existingUser) {
                await tx
                    .update(users)
                    .set({
                        name: existingUser.name || name,
                        email: existingUser.email || email || '',
                        avatar: existingUser.avatar || avatar || '',
                    })
                    .where(eq(users.id, existingUser.id));
                userId = existingUser.id;
                newUser = false;
            } else {
                const inserted = await tx
                    .insert(users)
                    .values({ name, email: email ?? '', avatar: avatar ?? '' })
                    .returning({ id: users.id })
                    .then((res) => res[0]);
                userId = inserted.id;
                newUser = true;
            }

            const account = await tx
                .insert(accounts)
                .values({ userId, accountType, providerAccountId: providerId })
                .onConflictDoUpdate({
                    target: [accounts.userId, accounts.accountType],
                    set: buildConflictUpdateSet(accounts, {
                        userId: 'keep',
                        accountType: 'keep',
                        providerAccountId: 'update',
                        createdAt: 'keep',
                        updatedAt: 'update',
                    }),
                })
                .returning()
                .then((res) => res[0]);

            return { ...account, newUser };
        });
    }

    /**
     * Returns the user and account associated with a session token.
     */
    static async getUserAndAccountBySessionToken(db: DatabaseOrTransaction, refreshToken: string) {
        return db
            .select()
            .from(sessions)
            .innerJoin(users, eq(sessions.userId, users.id))
            .innerJoin(accounts, eq(users.id, accounts.userId))
            .where(eq(sessions.refreshToken, refreshToken))
            .execute()
            .then((res) => {
                return { users: res[0].users, accounts: res[0].accounts };
            });
    }
}
