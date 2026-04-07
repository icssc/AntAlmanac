import { db } from '@packages/db/src/index';
import * as schema from '@packages/db/src/schema';
import { accounts, sessions, users, Account, AccountType } from '@packages/db/src/schema';
import { and, eq, ExtractTablesWithRelations } from 'drizzle-orm';
import { PgTransaction, PgQueryResultHKT } from 'drizzle-orm/pg-core';

import { UsersRDS } from './users-rds';

type Transaction = PgTransaction<PgQueryResultHKT, typeof schema, ExtractTablesWithRelations<typeof schema>>;
type DatabaseOrTransaction = Omit<typeof db, '$client'> | Transaction;

export class AccountsRDS {
    /**
     * If a guest user with the specified name exists, return their ID, otherwise return null.
     */
    private static async guestUserIdWithNameOrNull(tx: Transaction, name: string): Promise<string | null> {
        return tx
            .select({ id: accounts.userId })
            .from(accounts)
            .where(and(eq(accounts.accountType, 'GUEST'), eq(accounts.providerAccountId, name)))
            .limit(1)
            .then((xs) => xs[0]?.id ?? null);
    }

    /**
     * Creates a guest user if they don't already exist.
     *
     * @param tx Database or transaction object
     * @param name Guest user's name, to be used as providerAccountID and username
     * @returns The new/existing user's ID
     */
    private static async createGuestUserOptional(tx: Transaction, name: string) {
        const maybeUserId = await AccountsRDS.guestUserIdWithNameOrNull(tx, name);

        const userId = maybeUserId
            ? maybeUserId
            : await tx
                  .insert(users)
                  .values({ name })
                  .returning({ id: users.id })
                  .then((users) => users[0].id);

        if (userId === undefined) {
            throw new Error(`Failed to create guest user for ${name}`);
        }

        await tx
            .insert(accounts)
            .values({ userId, accountType: 'GUEST', providerAccountId: name })
            .onConflictDoNothing()
            .execute();

        return userId;
    }

    /**
     * Retrieves an account with the specified user ID and account type.
     *
     * @param db - The database or transaction object.
     * @param userId - The ID of the user whose account is to be retrieved.
     * @returns A promise that resolves to the account object if found, otherwise null.
     */
    static async getAccountByProviderId(
        db: DatabaseOrTransaction,
        accountType: Account['accountType'],
        providerId: string
    ): Promise<Account | null> {
        return db.transaction((tx) =>
            tx
                .select()
                .from(accounts)
                .where(and(eq(accounts.accountType, accountType), eq(accounts.providerAccountId, providerId)))
                .limit(1)
                .then((res) => res[0] ?? null)
        );
    }

    static async getGuestAccountAndUserByName(db: DatabaseOrTransaction, name: string) {
        return db.transaction((tx) =>
            tx
                .select()
                .from(accounts)
                .innerJoin(users, eq(accounts.userId, users.id))
                .where(and(eq(users.name, name), eq(accounts.accountType, 'GUEST')))
                .execute()
                .then((res) => {
                    return { users: res[0].users, accounts: res[0].accounts };
                })
        );
    }

    /**
     * Creates a new user and an associated account with the specified provider ID.
     *
     * @param db - The database or transaction object.
     * @param providerId - The provider account ID for the new account.
     * @returns A promise that resolves to the newly created account object.
     */
    static async registerUserAccount(
        db: DatabaseOrTransaction,
        accountType: Account['accountType'],
        providerId: string,
        name?: string,
        email?: string,
        avatar?: string
    ) {
        // ! TODO @KevinWu098
        // ! Auth uses hardcoded migration logic to handle cases in which stale userIDs
        // ! still contain non OIDC google ids. This is not correct and needs to be fixed.
        // ! Auth and operations upon users and accounts should not depend on localStorage. This is a hack.
        const oidcProviderId = providerId.startsWith('google_') ? providerId : `google_${providerId}`;
        if (accountType !== 'OIDC') {
            throw new Error('Invalid account type. Must be OIDC.');
        }

        // First check if an account with OIDC providerId already exists
        const existingAccount = await this.getAccountByProviderId(db, accountType, oidcProviderId);
        if (existingAccount && accountType === 'OIDC') {
            return { ...existingAccount, newUser: false };
        }

        const existingUser = email ? await UsersRDS.getUserByEmail(db, email) : null;

        if (!existingUser) {
            const result = await db
                .insert(users)
                .values({
                    avatar: avatar ?? '',
                    name: name,
                    email: email ?? '',
                })
                .returning({ userId: users.id })
                .then((res) => res[0]);
            const newUserId = result.userId;

            const account = await db
                .insert(accounts)
                .values({ userId: newUserId, providerAccountId: oidcProviderId, accountType })
                .returning()
                .then((res) => res[0]);

            return { ...account, newUser: true };
        }

        await db
            .update(users)
            .set({
                name: name,
                email: email ?? '',
                avatar: avatar ?? existingUser.avatar,
                lastUpdated: new Date(),
            })
            .where(eq(users.id, existingUser.id));

        const newAccount = await db
            .insert(accounts)
            .values({ userId: existingUser.id, providerAccountId: oidcProviderId, accountType })
            .returning()
            .then((res) => res[0]);

        return { ...newAccount, newUser: false };
    }

    static async getUserAndAccountBySessionToken(db: DatabaseOrTransaction, refreshToken: string) {
        return db.transaction((tx) =>
            tx
                .select()
                .from(sessions)
                .innerJoin(users, eq(sessions.userId, users.id))
                .innerJoin(accounts, eq(users.id, accounts.userId))
                .where(eq(sessions.refreshToken, refreshToken))
                .execute()
                .then((res) => {
                    return { users: res[0].users, accounts: res[0].accounts };
                })
        );
    }

    private static async getUserAndAccount(
        db: DatabaseOrTransaction,
        accountType: AccountType,
        providerAccountId: string
    ) {
        const res = await db
            .select()
            .from(accounts)
            .where(and(eq(accounts.accountType, accountType), eq(accounts.providerAccountId, providerAccountId)))
            .leftJoin(users, eq(accounts.userId, users.id))
            .limit(1);

        if (res.length === 0 || res[0].users === null || res[0].accounts === null) {
            return null;
        }

        return { user: res[0].users, account: res[0].accounts };
    }
}
