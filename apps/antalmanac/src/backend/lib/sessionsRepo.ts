import type { User } from '@packages/antalmanac-types';
import {
    accounts,
    sessions,
    users,
    schedules,
    coursesInSchedule,
    customEvents,
    type Session,
} from '@packages/db/src/schema';
import { and, eq, gt } from 'drizzle-orm';

import type { DatabaseOrTransaction, Transaction } from './rdsTypes';
import { aggregateUserData } from './schedulesRepo';

export async function getCurrentSession(db: DatabaseOrTransaction, refreshToken: string): Promise<Session | null> {
    return db.transaction((tx) =>
        tx
            .select()
            .from(sessions)
            .where(eq(sessions.refreshToken, refreshToken))
            .then((res) => res[0] ?? null)
    );
}

export async function createSession(tx: Transaction, userID: string): Promise<Session | null> {
    return tx
        .insert(sessions)
        .values({
            userId: userID,
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        })
        .returning()
        .then((res) => res[0] ?? null);
}

export async function removeSession(db: DatabaseOrTransaction, userId: string, refreshToken: string | null) {
    if (refreshToken) {
        await db.delete(sessions).where(and(eq(sessions.userId, userId), eq(sessions.refreshToken, refreshToken)));
    }
}

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

async function getUserDataWithSession(tx: Transaction, refreshToken: string): Promise<User | null> {
    return tx
        .select()
        .from(users)
        .leftJoin(sessions, eq(users.id, sessions.userId))
        .where(and(eq(sessions.refreshToken, refreshToken), gt(sessions.expires, new Date())))
        .then((res) => res[0]?.users ?? null);
}

export async function fetchUserDataWithSession(
    db: DatabaseOrTransaction,
    refreshToken: string
): Promise<{ id: string; userData: User['userData'] } | null> {
    return db.transaction(async (tx) => {
        const user = await getUserDataWithSession(tx, refreshToken);

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

            const userSchedules = aggregateUserData(sectionResults, customEventResults);

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

export async function getUserAndAccountBySessionToken(db: DatabaseOrTransaction, refreshToken: string) {
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
