import type { User } from '@packages/antalmanac-types';
import { accounts, type Account, type AccountType, users } from '@packages/db/src/schema';
import { and, eq } from 'drizzle-orm';

import type { DatabaseOrTransaction } from './rdsTypes';
import { getUserByEmail } from './usersRepo';

export async function getAccountByProviderId(
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

export async function getGuestAccountAndUserByName(db: DatabaseOrTransaction, name: string) {
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

export async function registerUserAccount(
    db: DatabaseOrTransaction,
    accountType: Account['accountType'],
    providerId: string,
    name?: string,
    email?: string,
    avatar?: string
) {
    const oidcProviderId = providerId.startsWith('google_') ? providerId : `google_${providerId}`;
    if (accountType !== 'OIDC') {
        throw new Error('Invalid account type. Must be OIDC.');
    }

    const existingAccount = await getAccountByProviderId(db, accountType, oidcProviderId);
    if (existingAccount && accountType === 'OIDC') {
        return { ...existingAccount, newUser: false };
    }

    const existingUser = email ? await getUserByEmail(db, email) : null;

    if (!existingUser) {
        const result = await db
            .insert(users)
            .values({
                avatar: avatar ?? '',
                name,
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
            name,
            email: email ?? '',
            avatar: avatar ?? (existingUser as User & { avatar?: string }).avatar,
            lastUpdated: new Date(),
        })
        .where(eq(users.id, (existingUser as User & { id: string }).id));

    const newAccount = await db
        .insert(accounts)
        .values({ userId: (existingUser as User & { id: string }).id, providerAccountId: oidcProviderId, accountType })
        .returning()
        .then((res) => res[0]);

    return { ...newAccount, newUser: false };
}

export async function getUserAndAccount(
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

export async function flagImportedUser(db: DatabaseOrTransaction, providerId: string) {
    try {
        const { users: user, accounts: account } = await getGuestAccountAndUserByName(db, providerId);
        if (user.imported) {
            return false;
        }

        await db.transaction((tx) =>
            tx.update(users).set({ imported: true }).where(eq(users.id, account.userId)).execute()
        );
        return true;
    } catch {
        return false;
    }
}
