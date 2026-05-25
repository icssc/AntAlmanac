import { sessions, type Session } from '@packages/db/src/schema';
import { and, eq } from 'drizzle-orm';

import type { DatabaseOrTransaction, Transaction } from './types';

/**
 * Retrieves the current session from the database using the provided refresh token.
 */
export async function getCurrentSession(db: DatabaseOrTransaction, refreshToken: string) {
    return db
        .select()
        .from(sessions)
        .where(eq(sessions.refreshToken, refreshToken))
        .then((res) => res[0] ?? null);
}

/**
 * Creates a new session for a user in the database.
 */
export async function createSession(tx: Transaction, userID: string): Promise<Session | null> {
    return tx
        .insert(sessions)
        .values({
            userId: userID,
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        })
        .returning()
        .then((res) => res[0] ?? null);
}

/**
 * Removes a session from the database for a given user and refresh token.
 * If refreshToken is null, no action is taken.
 */
export async function removeSession(db: DatabaseOrTransaction, userId: string, refreshToken: string | null) {
    if (refreshToken) {
        await db.delete(sessions).where(and(eq(sessions.userId, userId), eq(sessions.refreshToken, refreshToken)));
    }
}

/**
 * Returns the existing session if the refresh token matches, otherwise creates a new one.
 */
export async function upsertSession(
    db: DatabaseOrTransaction,
    userId: string,
    refreshToken?: string
): Promise<Session | null> {
    return db.transaction(async (tx) => {
        const currentSession = await tx
            .select()
            .from(sessions)
            .where(eq(sessions.refreshToken, refreshToken ?? ''))
            .then((res) => res[0] ?? null);

        if (currentSession) return currentSession;
        return await createSession(tx, userId);
    });
}
