import { User, Notification } from '@packages/antalmanac-types';
import { db } from '@packages/db/src/index';
import * as schema from '@packages/db/src/schema';
import { Account, Session } from '@packages/db/src/schema';
import { ExtractTablesWithRelations } from 'drizzle-orm';
import { PgTransaction, PgQueryResultHKT } from 'drizzle-orm/pg-core';

import { AccountsRDS } from './accounts-rds';
import { NotificationRDS } from './notification-rds';
import { SchedulesRDS } from './schedules-rds';
import { SessionsRDS } from './sessions-rds';
import { UsersRDS } from './users-rds';

type Transaction = PgTransaction<PgQueryResultHKT, typeof schema, ExtractTablesWithRelations<typeof schema>>;
type DatabaseOrTransaction = Omit<typeof db, '$client'> | Transaction;

export class RDS {
    static async getAccountByProviderId(
        db: DatabaseOrTransaction,
        accountType: Account['accountType'],
        providerId: string
    ): Promise<Account | null> {
        return AccountsRDS.getAccountByProviderId(db, accountType, providerId);
    }

    static async getGuestAccountAndUserByName(db: DatabaseOrTransaction, name: string) {
        return AccountsRDS.getGuestAccountAndUserByName(db, name);
    }

    static async getUserById(db: DatabaseOrTransaction, userId: string) {
        return UsersRDS.getUserById(db, userId);
    }

    static async getUserByEmail(db: DatabaseOrTransaction, email: string) {
        return UsersRDS.getUserByEmail(db, email);
    }

    static async getGoogleIdByUserId(db: DatabaseOrTransaction, userId: string): Promise<string | null> {
        return AccountsRDS.getGoogleIdByUserId(db, userId);
    }

    static async registerUserAccount(
        db: DatabaseOrTransaction,
        accountType: Account['accountType'],
        providerId: string,
        name?: string,
        email?: string,
        avatar?: string
    ) {
        return AccountsRDS.registerUserAccount(db, accountType, providerId, name, email, avatar);
    }

    static async upsertUserData(db: DatabaseOrTransaction, userData: User): Promise<string> {
        return SchedulesRDS.upsertUserData(db, userData);
    }

    static async getUserDataByUid(db: DatabaseOrTransaction, userId: string): Promise<User | null> {
        return UsersRDS.getUserDataByUid(db, userId);
    }

    static async getCurrentSession(db: DatabaseOrTransaction, refreshToken: string) {
        return SessionsRDS.getCurrentSession(db, refreshToken);
    }

    static async createSession(tx: Transaction, userID: string): Promise<Session | null> {
        return SessionsRDS.createSession(tx, userID);
    }

    static async removeSession(db: DatabaseOrTransaction, userId: string, refreshToken: string | null) {
        return SessionsRDS.removeSession(db, userId, refreshToken);
    }

    static async upsertSession(
        db: DatabaseOrTransaction,
        userId: string,
        refreshToken?: string
    ): Promise<Session | null> {
        return SessionsRDS.upsertSession(db, userId, refreshToken);
    }

    static async fetchUserDataWithSession(db: DatabaseOrTransaction, refreshToken: string) {
        return UsersRDS.fetchUserDataWithSession(db, refreshToken);
    }

    static async getUserAndAccountBySessionToken(db: DatabaseOrTransaction, refreshToken: string) {
        return AccountsRDS.getUserAndAccountBySessionToken(db, refreshToken);
    }

    static async flagImportedUser(db: DatabaseOrTransaction, providerId: string) {
        return UsersRDS.flagImportedUser(db, providerId);
    }

    static async retrieveNotifications(db: DatabaseOrTransaction, userId: string) {
        return NotificationRDS.retrieveNotifications(db, userId);
    }

    static async upsertNotification(
        db: DatabaseOrTransaction,
        userId: string,
        notification: Notification,
        environmentValue?: string | null
    ) {
        return NotificationRDS.upsertNotification(db, userId, notification, environmentValue);
    }

    static async updateAllNotifications(db: DatabaseOrTransaction, notification: Notification) {
        return NotificationRDS.updateAllNotifications(db, notification);
    }

    static async deleteNotification(db: DatabaseOrTransaction, notification: Notification, userId: string) {
        return NotificationRDS.deleteNotification(db, notification, userId);
    }

    static async deleteAllNotifications(db: DatabaseOrTransaction, userId: string) {
        return NotificationRDS.deleteAllNotifications(db, userId);
    }
}
