import type { Notification, ScheduleSaveState } from '@packages/antalmanac-types';
import type { db } from '@packages/db';
import type * as schema from '@packages/db/src/schema';
import { type Account, type Session } from '@packages/db/src/schema';
import { ExtractTablesWithRelations } from 'drizzle-orm';
import type { PgTransaction, PgQueryResultHKT } from 'drizzle-orm/pg-core';

import { getAccountByProviderId, getUserAndAccountBySessionToken, registerUserAccount } from './rds/accounts';
import {
    deleteAllNotifications,
    deleteNotification,
    retrieveNotifications,
    updateAllNotifications,
    upsertNotification,
} from './rds/notification';
import { upsertUserData } from './rds/schedules';
import { createSession, getCurrentSession, removeSession, upsertSession } from './rds/sessions';
import {
    fetchUserDataWithSession,
    flagImportedUser,
    getGuestScheduleByUsername,
    getUserById,
    getUserByEmail,
} from './rds/users';

type Transaction = PgTransaction<PgQueryResultHKT, typeof schema, ExtractTablesWithRelations<typeof schema>>;
type DatabaseOrTransaction = Omit<typeof db, '$client'> | Transaction;

// biome-ignore lint/complexity/noStaticOnlyClass: todo
export class RDS {
    static async getAccountByProviderId(
        db: DatabaseOrTransaction,
        accountType: Account['accountType'],
        providerId: string
    ): Promise<Account | null> {
        return getAccountByProviderId(db, accountType, providerId);
    }

    static async getUserById(db: DatabaseOrTransaction, userId: string) {
        return getUserById(db, userId);
    }

    static async getUserByEmail(db: DatabaseOrTransaction, email: string) {
        return getUserByEmail(db, email);
    }

    static async registerUserAccount(
        db: DatabaseOrTransaction,
        accountType: Account['accountType'],
        providerId: string,
        name?: string,
        email?: string,
        avatar?: string
    ) {
        return registerUserAccount(db, accountType, providerId, name, email, avatar);
    }

    static async upsertUserData(
        db: DatabaseOrTransaction,
        userId: string,
        saveState: ScheduleSaveState
    ): Promise<{ userId: string; scheduleIdMap: Record<string, string> }> {
        return upsertUserData(db, userId, saveState);
    }

    static async getGuestScheduleByUsername(db: DatabaseOrTransaction, username: string) {
        const result = await getGuestScheduleByUsername(db, username);
        if (!result) return null;
        return {
            user: { imported: result.imported ?? false },
            userData: result.userData,
        };
    }

    static async getCurrentSession(db: DatabaseOrTransaction, refreshToken: string) {
        return getCurrentSession(db, refreshToken);
    }

    static async createSession(tx: Transaction, userID: string): Promise<Session | null> {
        return createSession(tx, userID);
    }

    static async removeSession(db: DatabaseOrTransaction, userId: string, refreshToken: string | null) {
        return removeSession(db, userId, refreshToken);
    }

    static async upsertSession(
        db: DatabaseOrTransaction,
        userId: string,
        refreshToken?: string
    ): Promise<Session | null> {
        return upsertSession(db, userId, refreshToken);
    }

    static async fetchUserDataWithSession(db: DatabaseOrTransaction, refreshToken: string) {
        return fetchUserDataWithSession(db, refreshToken);
    }

    static async getUserAndAccountBySessionToken(db: DatabaseOrTransaction, refreshToken: string) {
        return getUserAndAccountBySessionToken(db, refreshToken);
    }

    static async flagImportedUser(db: DatabaseOrTransaction, username: string) {
        return flagImportedUser(db, username);
    }

    static async retrieveNotifications(db: DatabaseOrTransaction, userId: string, environment: string) {
        return retrieveNotifications(db, userId, environment);
    }

    static async upsertNotification(
        db: DatabaseOrTransaction,
        userId: string,
        notification: Notification,
        environment: string
    ) {
        return upsertNotification(db, userId, notification, environment);
    }

    static async updateAllNotifications(db: DatabaseOrTransaction, notification: Notification, environment: string) {
        return updateAllNotifications(db, notification, environment);
    }

    static async deleteNotification(
        db: DatabaseOrTransaction,
        userId: string,
        sectionCode: string,
        term: string,
        environment: string
    ) {
        return deleteNotification(db, userId, sectionCode, term, environment);
    }

    static async deleteAllNotifications(db: DatabaseOrTransaction, userId: string, environment: string) {
        return deleteAllNotifications(db, userId, environment);
    }
}
