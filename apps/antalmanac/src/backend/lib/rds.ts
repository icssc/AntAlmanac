import type { Notification, ScheduleSaveState } from '@packages/antalmanac-types';
import type { Quarter, Year } from '@packages/anteater-api/types';
import type { db } from '@packages/db';
import type * as schema from '@packages/db/src/schema';
import { type Account, type Session } from '@packages/db/src/schema';
import { ExtractTablesWithRelations } from 'drizzle-orm';
import type { PgTransaction, PgQueryResultHKT } from 'drizzle-orm/pg-core';

import { AccountsRDS } from './rds/accounts-rds';
import { FriendshipsRDS } from './rds/friendships-rds';
import { NotificationRDS } from './rds/notification-rds';
import { SchedulesRDS } from './rds/schedules-rds';
import { SessionsRDS } from './rds/sessions-rds';
import { UsersRDS } from './rds/users-rds';

type Transaction = PgTransaction<PgQueryResultHKT, typeof schema, ExtractTablesWithRelations<typeof schema>>;
type DatabaseOrTransaction = Omit<typeof db, '$client'> | Transaction;

// biome-ignore lint/complexity/noStaticOnlyClass: todo
export class RDS {
    static async getAccountByProviderId(
        db: DatabaseOrTransaction,
        accountType: Account['accountType'],
        providerId: string
    ): Promise<Account | null> {
        return AccountsRDS.getAccountByProviderId(db, accountType, providerId);
    }

    static async getUserById(db: DatabaseOrTransaction, userId: string) {
        return UsersRDS.getUserById(db, userId);
    }

    static async getUserByEmail(db: DatabaseOrTransaction, email: string) {
        return UsersRDS.getUserByEmail(db, email);
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

    static async upsertUserData(
        db: DatabaseOrTransaction,
        userId: string,
        saveState: ScheduleSaveState
    ): Promise<{ userId: string; scheduleIdMap: Record<string, string> }> {
        return SchedulesRDS.upsertUserData(db, userId, saveState);
    }

    static async getScheduleById(db: DatabaseOrTransaction, scheduleId: string) {
        return SchedulesRDS.getScheduleById(db, scheduleId);
    }

    static async getGuestScheduleByUsername(db: DatabaseOrTransaction, username: string) {
        return UsersRDS.getGuestScheduleByUsername(db, username);
    }

    static async getUserFriendDataByUid(db: DatabaseOrTransaction, userId: string) {
        return UsersRDS.getUserFriendDataByUid(db, userId);
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

    static async getUserIdBySessionToken(db: DatabaseOrTransaction, sessionToken: string): Promise<string | null> {
        return UsersRDS.getUserIdBySessionToken(db, sessionToken);
    }

    static async getFriendshipsBetween(db: DatabaseOrTransaction, userIdA: string, userIdB: string) {
        return FriendshipsRDS.getFriendshipsBetween(db, userIdA, userIdB);
    }

    static async insertFriendRequest(db: DatabaseOrTransaction, requesterId: string, addresseeId: string) {
        return FriendshipsRDS.insertFriendRequest(db, requesterId, addresseeId);
    }

    static async acceptFriendRequest(db: DatabaseOrTransaction, requesterId: string, addresseeId: string) {
        return FriendshipsRDS.acceptFriendRequest(db, requesterId, addresseeId);
    }

    static async getFriendshipsSent(db: DatabaseOrTransaction, userId: string) {
        return FriendshipsRDS.getFriendshipsSent(db, userId);
    }

    static async getFriendshipsReceived(db: DatabaseOrTransaction, userId: string) {
        return FriendshipsRDS.getFriendshipsReceived(db, userId);
    }

    static async getFriends(db: DatabaseOrTransaction, userId: string) {
        return FriendshipsRDS.getFriends(db, userId);
    }

    static async areFriends(db: DatabaseOrTransaction, viewerId: string, targetUserId: string): Promise<boolean> {
        return FriendshipsRDS.areFriends(db, viewerId, targetUserId);
    }

    static async getPendingFriendRequests(db: DatabaseOrTransaction, userId: string) {
        return FriendshipsRDS.getPendingFriendRequests(db, userId);
    }

    static async getSentPendingRequests(db: DatabaseOrTransaction, userId: string) {
        return FriendshipsRDS.getSentPendingRequests(db, userId);
    }

    static async deleteFriendship(db: DatabaseOrTransaction, callerId: string, otherUserId: string) {
        return FriendshipsRDS.deleteFriendship(db, callerId, otherUserId);
    }

    static async blockUser(db: DatabaseOrTransaction, userId: string, blockId: string) {
        return FriendshipsRDS.blockUser(db, userId, blockId);
    }

    static async getBlockedUsers(db: DatabaseOrTransaction, userId: string) {
        return FriendshipsRDS.getBlockedUsers(db, userId);
    }

    static async unblockUser(db: DatabaseOrTransaction, userId: string, blockId: string) {
        return FriendshipsRDS.unblockUser(db, userId, blockId);
    }

    static async getScheduleSharingStatuses(db: DatabaseOrTransaction, userId: string) {
        return SchedulesRDS.getScheduleSharingStatuses(db, userId);
    }

    static async toggleScheduleSharing(
        db: DatabaseOrTransaction,
        userId: string,
        scheduleId: string
    ): Promise<{ sharedWithFriends: boolean } | null> {
        return SchedulesRDS.toggleScheduleSharing(db, userId, scheduleId);
    }

    static async flagImportedUser(db: DatabaseOrTransaction, username: string) {
        return UsersRDS.flagImportedUser(db, username);
    }

    static async retrieveNotifications(db: DatabaseOrTransaction, userId: string, environment: string) {
        return NotificationRDS.retrieveNotifications(db, userId, environment);
    }

    static async upsertNotification(
        db: DatabaseOrTransaction,
        userId: string,
        notification: Notification,
        environment: string
    ) {
        return NotificationRDS.upsertNotification(db, userId, notification, environment);
    }

    static async updateAllNotifications(db: DatabaseOrTransaction, notification: Notification, environment: string) {
        return NotificationRDS.updateAllNotifications(db, notification, environment);
    }

    static async deleteNotification(
        db: DatabaseOrTransaction,
        userId: string,
        sectionCode: string,
        year: Year,
        quarter: Quarter,
        environment: string
    ) {
        return NotificationRDS.deleteNotification(db, userId, sectionCode, year, quarter, environment);
    }

    static async deleteAllNotifications(db: DatabaseOrTransaction, userId: string, environment: string) {
        return NotificationRDS.deleteAllNotifications(db, userId, environment);
    }
}
