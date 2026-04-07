import { db } from '@packages/db/src/index';
import * as schema from '@packages/db/src/schema';
import {
    accounts,
    coursesInSchedule,
    customEvents,
    schedules,
    Session,
    sessions,
    users,
} from '@packages/db/src/schema';
import { and, eq, ExtractTablesWithRelations, gt } from 'drizzle-orm';
import { PgTransaction, PgQueryResultHKT } from 'drizzle-orm/pg-core';

import { RDS } from './rds';

type Transaction = PgTransaction<PgQueryResultHKT, typeof schema, ExtractTablesWithRelations<typeof schema>>;
type DatabaseOrTransaction = Omit<typeof db, '$client'> | Transaction;

export class SessionsRDS {
    /**
     * Retrieves the current session from the database using the provided refresh token.
     *
     * @param db - The database or transaction object to use for the query.
     * @param refreshToken - The refresh token to search for in the sessions table.
     * @returns A promise that resolves to the current session object if found, or null if not found.
     */
    static async getCurrentSession(db: DatabaseOrTransaction, refreshToken: string) {
        return db.transaction((tx) =>
            tx
                .select()
                .from(sessions)
                .where(eq(sessions.refreshToken, refreshToken))
                .then((res) => res[0] ?? null)
        );
    }

    /**
     * Creates a new session for a user in the database.
     *
     * @param db - The database or transaction object to use for the operation.
     * @param userID - The ID of the user for whom the session is being created.
     * @returns A promise that resolves to the created session object or null if the creation failed.
     */
    static async createSession(tx: Transaction, userID: string): Promise<Session | null> {
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
     *
     * @param db - The database or transaction object to perform the operation.
     * @param userId - The ID of the user whose session is to be removed.
     * @param refreshToken - The refresh token of the session to be removed. If null, no action is taken.
     * @returns A promise that resolves when the session is removed.
     */
    static async removeSession(db: DatabaseOrTransaction, userId: string, refreshToken: string | null) {
        if (refreshToken) {
            await db.delete(sessions).where(and(eq(sessions.userId, userId), eq(sessions.refreshToken, refreshToken)));
        }
    }

    /**
     * Upserts a session for a user. If a session with the given refresh token already exists,
     * it returns the current session. Otherwise, it creates a new session for the user.
     *
     * @param db - The database or transaction object to use for the operation.
     * @param userId - The ID of the user for whom the session is being upserted.
     * @param refreshToken - The refresh token to check for an existing session.
     * @returns A promise that resolves to the current session if it exists, or a new session if it was created, or null if the operation fails.
     */
    static async upsertSession(
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
            return await SessionsRDS.createSession(tx, userId);
        });
    }

    private static async getUserDataWithSession(tx: Transaction, refreshToken: string) {
        return tx
            .select()
            .from(users)
            .leftJoin(sessions, eq(users.id, sessions.userId))
            .where(and(eq(sessions.refreshToken, refreshToken), gt(sessions.expires, new Date())))
            .then((res) => res[0].users);
    }

    /**
     * Fetches user data associated with a valid session using a refresh token.
     *
     * This function initiates a database transaction to retrieve user information
     * based on the provided refresh token. If a user is found, it gathers the user's
     * schedules and custom events, aggregates them, and determines the current schedule index.
     *
     * @param db - The database or transaction object to perform the operation.
     * @param refreshToken - The refresh token used to identify the session.
     * @returns A promise that resolves to an object containing the user's ID and user data,
     *          including schedules and the current schedule index, or null if no user is found.
     */
    static async fetchUserDataWithSession(db: DatabaseOrTransaction, refreshToken: string) {
        return db.transaction(async (tx) => {
            const user = await this.getUserDataWithSession(tx, refreshToken);

            if (user) {
                const sectionResults = await tx
                    .select()
                    .from(schedules)
                    .where(eq(schedules.userId, user.id))
                    .leftJoin(coursesInSchedule, eq(schedules.id, coursesInSchedule.scheduleId));

                const customEventResults = await tx
                    .select()
                    .from(schedules)
                    .where(eq(schedules.userId, user.id))
                    .leftJoin(customEvents, eq(schedules.id, customEvents.scheduleId));

                const userSchedules = RDS.aggregateUserData(sectionResults, customEventResults);

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
            return null;
        });
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
}
