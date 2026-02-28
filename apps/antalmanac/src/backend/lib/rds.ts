// Removed duplicate and conflicting export of RDS, fixed import order and redundancies

import type { User, Notification } from '@packages/antalmanac-types';
import { Account, Session } from '@packages/db/src/schema';

import {
    getAccountByProviderId,
    getGuestAccountAndUserByName,
    registerUserAccount,
    flagImportedUser,
} from './accountsRepo';
import {
    retrieveNotifications,
    upsertNotification,
    updateAllNotifications,
    deleteNotification,
    deleteAllNotifications,
} from './notificationsRepo';
import type { DatabaseOrTransaction, Transaction } from './rdsTypes';
import { getUserDataByUid, upsertUserData } from './schedulesRepo';
import {
    getCurrentSession,
    createSession,
    removeSession,
    upsertSession,
    fetchUserDataWithSession,
    getUserAndAccountBySessionToken,
} from './sessionsRepo';
import { getUserById } from './usersRepo';

export class RDS {
    /**
     * Retrieves an account with the specified provider ID and account type.
     */
    static async getAccountByProviderId(
        db: DatabaseOrTransaction,
        accountType: Account['accountType'],
        providerId: string
    ): Promise<Account | null> {
        return getAccountByProviderId(db, accountType, providerId);
    }

    static async getGuestAccountAndUserByName(db: DatabaseOrTransaction, name: string) {
        return getGuestAccountAndUserByName(db, name);
    }

    /**
     * Retrieves a user by their ID from the database.
     */
    static async getUserById(db: DatabaseOrTransaction, userId: string) {
        return getUserById(db, userId);
    }

    /**
     * Creates a new user and an associated account with the specified provider ID.
     */
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

    /**
     * Does the same thing as `insertGuestUserData`, but also updates the user's schedules and courses if they exist.
     */
    static async upsertUserData(db: DatabaseOrTransaction, userData: User): Promise<string> {
        return upsertUserData(db, userData);
    }

    /**
     * Retrieves user data by user ID, including schedules and custom events.
     */
    static async getUserDataByUid(db: DatabaseOrTransaction, userId: string): Promise<User | null> {
        return getUserDataByUid(db, userId);
    }

    /**
     * Retrieves the current session from the database using the provided refresh token.
     */
    static async getCurrentSession(db: DatabaseOrTransaction, refreshToken: string): Promise<Session | null> {
        return getCurrentSession(db, refreshToken);
    }

    /**
     * Creates a new session for a user in the database.
     */
    static async createSession(tx: Transaction, userID: string): Promise<Session | null> {
        return createSession(tx, userID);
    }

    /**
     * Removes a session from the database for a given user and refresh token.
     */
    static async removeSession(db: DatabaseOrTransaction, userId: string, refreshToken: string | null) {
        return removeSession(db, userId, refreshToken);
    }

    /**
     * Upserts a session for a user. If a session with the given refresh token already exists,
     * it returns the current session. Otherwise, it creates a new session for the user.
     */
    static async upsertSession(
        db: DatabaseOrTransaction,
        userId: string,
        refreshToken?: string
    ): Promise<Session | null> {
        return upsertSession(db, userId, refreshToken);
    }

    /**
     * Fetches user data associated with a valid session using a refresh token.
     */
    static async fetchUserDataWithSession(db: DatabaseOrTransaction, refreshToken: string) {
        return fetchUserDataWithSession(db, refreshToken);
    }

    static async getUserAndAccountBySessionToken(db: DatabaseOrTransaction, refreshToken: string) {
        return getUserAndAccountBySessionToken(db, refreshToken);
    }

    /**
     * Flags a user as imported based on the provided provider ID.
     */
    static async flagImportedUser(db: DatabaseOrTransaction, providerId: string) {
        return flagImportedUser(db, providerId);
    }

    /**
     * Retrieves notifications associated with a specified user.
     */
    static async retrieveNotifications(db: DatabaseOrTransaction, userId: string) {
        return retrieveNotifications(db, userId);
    }

    /**
     * Upserts notification for a specified user.
     */
    static async upsertNotification(
        db: DatabaseOrTransaction,
        userId: string,
        notification: Notification,
        environmentValue?: string | null
    ) {
        return upsertNotification(db, userId, notification, environmentValue);
    }

    /**
     * Updates lastUpdatedStatus and lastCodes of ALL notifications with a shared sectionCode, year, and quarter.
     */
    static async updateAllNotifications(db: DatabaseOrTransaction, notification: Notification) {
        return updateAllNotifications(db, notification);
    }

    /**
     * Deletes a notification for a specified user.
     */
    static async deleteNotification(db: DatabaseOrTransaction, notification: Notification, userId: string) {
        return deleteNotification(db, notification, userId);
    }

    /**
     * Deletes ALL notifications for a specified user.
     */
    static async deleteAllNotifications(db: DatabaseOrTransaction, userId: string) {
        return deleteAllNotifications(db, userId);
    }
}
