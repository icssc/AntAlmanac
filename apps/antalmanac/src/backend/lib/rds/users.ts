import type { ScheduleSaveState } from '@packages/antalmanac-types';
import { accounts, schedules, sessions, users, type User } from '@packages/db/src/schema';
import { and, eq, gt, sql } from 'drizzle-orm';

import { loadSchedules } from './helpers';
import { getCurrentSession } from './sessions';
import type { DatabaseOrTransaction } from './types';

/**
 * Retrieves a user by their ID from the database.
 */
export async function getUserById(db: DatabaseOrTransaction, userId: string) {
    return db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .then((res) => res[0]);
}

export async function getUserByEmail(db: DatabaseOrTransaction, email: string) {
    return db
        .select()
        .from(users)
        .where(sql`lower(${users.email}) = lower(${email.trim()})`)
        .limit(1)
        .then((res) => res[0]);
}

/**
 * Retrieves a guest user's publicly-shareable schedule data by their guest username.
 */
export async function getGuestScheduleByUsername(
    db: DatabaseOrTransaction,
    username: string
): Promise<(User & { userData: ScheduleSaveState }) | null> {
    const row = await db
        .select()
        .from(accounts)
        .innerJoin(users, eq(accounts.userId, users.id))
        .where(and(eq(accounts.accountType, 'GUEST'), eq(accounts.providerAccountId, username)))
        .limit(1)
        .then((res) => res[0] ?? null);

    if (!row) {
        return null;
    }

    const userId = row.users.id;

    const userSchedules = await loadSchedules(db, eq(schedules.userId, userId));

    const scheduleIndex = row.users.currentScheduleId
        ? userSchedules.findIndex((s) => s.id === row.users.currentScheduleId)
        : userSchedules.length;

    return {
        ...row.users,
        userData: {
            schedules: userSchedules,
            scheduleIndex,
        },
    };
}

/**
 * Retrieves a friend's user data, filtered to only schedules they have chosen to share with friends.
 */
export async function getUserFriendDataByUid(
    db: DatabaseOrTransaction,
    userId: string
): Promise<(User & { userData: ScheduleSaveState }) | null> {
    const user = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .then((res) => res[0]);

    if (!user) {
        return null;
    }

    const userSchedules = await loadSchedules(
        db,
        and(eq(schedules.userId, userId), eq(schedules.sharedWithFriends, true))!
    );

    return {
        ...user,
        userData: {
            schedules: userSchedules,
            scheduleIndex: 0,
        },
    };
}

/**
 * Resolves a session token to a userId, verifying the session is valid and not expired.
 * Returns null if the session is invalid or expired.
 */
export async function getUserIdBySessionToken(db: DatabaseOrTransaction, sessionToken: string): Promise<string | null> {
    const session = await getCurrentSession(db, sessionToken);
    if (!session || session.expires <= new Date()) return null;
    return session.userId;
}

/**
 * Flags the guest user with the given username as imported.
 *
 * @returns true if the user was successfully flagged, false if already flagged or not found.
 */
export async function flagImportedUser(db: DatabaseOrTransaction, username: string) {
    return db.transaction(async (tx) => {
        const row = await tx
            .select({ userId: users.id, imported: users.imported })
            .from(accounts)
            .innerJoin(users, eq(accounts.userId, users.id))
            .where(and(eq(accounts.accountType, 'GUEST'), eq(accounts.providerAccountId, username)))
            .limit(1)
            .then((res) => res[0] ?? null);

        if (!row || row.imported) {
            return false;
        }

        await tx.update(users).set({ imported: true }).where(eq(users.id, row.userId)).execute();
        return true;
    });
}

/**
 * Fetches user data associated with a valid session using a refresh token.
 */
export async function fetchUserDataWithSession(db: DatabaseOrTransaction, refreshToken: string) {
    const user = await db
        .select()
        .from(users)
        .leftJoin(sessions, eq(users.id, sessions.userId))
        .where(and(eq(sessions.refreshToken, refreshToken), gt(sessions.expires, new Date())))
        .then((res) => res[0]?.users);

    if (!user) {
        return null;
    }

    const userSchedules = await loadSchedules(db, eq(schedules.userId, user.id));

    const scheduleIndex = user.currentScheduleId
        ? userSchedules.findIndex((schedule) => schedule.id === user.currentScheduleId)
        : userSchedules.length;

    return {
        id: user.id,
        userData: {
            schedules: userSchedules,
            scheduleIndex,
        },
    };
}
