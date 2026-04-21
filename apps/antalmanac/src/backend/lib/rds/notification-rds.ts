import { Notification } from '@packages/antalmanac-types';
import { db } from '@packages/db/src/index';
import * as schema from '@packages/db/src/schema';
import { subscriptions } from '@packages/db/src/schema';
import { and, eq, ExtractTablesWithRelations } from 'drizzle-orm';
import { PgTransaction, PgQueryResultHKT } from 'drizzle-orm/pg-core';

type Transaction = PgTransaction<PgQueryResultHKT, typeof schema, ExtractTablesWithRelations<typeof schema>>;
type DatabaseOrTransaction = Omit<typeof db, '$client'> | Transaction;

export class NotificationRDS {
    /**
     * Retrieves notifications associated with a specified user
     *
     * @param db - The database or transaction object to use for the operation.
     * @param userId - The ID of the user for whom we're retrieving notifications.
     * @returns A promise that resolves to the notifications associated with a userId, or an empty array if not found.
     */
    static async retrieveNotifications(db: DatabaseOrTransaction, userId: string, _stage?: string) {
        return db.transaction((tx) => tx.select().from(subscriptions).where(eq(subscriptions.userId, userId)));
    }

    /**
     * Upserts notification for a specified user
     *
     * @param db - The database or transaction object to use for the operation.
     * @param userId - The ID of the user for whom we're upserting a notification.
     * @param notification - The notification object to upsert.
     * @param environment - "production" on production; staging instance + number on staging (e.g. "staging-1337").
     * @returns A promise that upserts the notification associated with a userId.
     */
    static async upsertNotification(
        db: DatabaseOrTransaction,
        userId: string,
        notification: Notification,
        environmentValue?: string | null
    ) {
        const environment = environmentValue ?? '';
        return db.transaction((tx) =>
            tx
                .insert(subscriptions)
                .values({
                    userId,
                    sectionCode: notification.sectionCode,
                    year: notification.term.split(' ')[0],
                    quarter: notification.term.split(' ')[1],
                    notifyOnOpen: notification.notifyOn.notifyOnOpen,
                    notifyOnWaitlist: notification.notifyOn.notifyOnWaitlist,
                    notifyOnFull: notification.notifyOn.notifyOnFull,
                    notifyOnRestriction: notification.notifyOn.notifyOnRestriction,
                    lastUpdatedStatus: notification.lastUpdatedStatus,
                    lastCodes: notification.lastCodes,
                    environment: environment,
                })
                .onConflictDoUpdate({
                    target: [
                        subscriptions.userId,
                        subscriptions.sectionCode,
                        subscriptions.year,
                        subscriptions.quarter,
                    ],
                    set: {
                        notifyOnOpen: notification.notifyOn.notifyOnOpen,
                        notifyOnWaitlist: notification.notifyOn.notifyOnWaitlist,
                        notifyOnFull: notification.notifyOn.notifyOnFull,
                        notifyOnRestriction: notification.notifyOn.notifyOnRestriction,
                        lastUpdatedStatus: notification.lastUpdatedStatus,
                        lastCodes: notification.lastCodes,
                        environment: environment,
                    },
                })
        );
    }

    /**
     * Updates lastUpdatedStatus and lastCodes of ALL notifications with a shared sectionCode, year, and quarter
     *
     * @param db - The database or transaction object to use for the operation.
     * @param notification - The notification object type we are updating.
     * @returns A promise that updates ALL notifications with a shared sectionCode, year, and quarter.
     */
    static async updateAllNotifications(db: DatabaseOrTransaction, notification: Notification, _stage?: string) {
        return db.transaction((tx) =>
            tx
                .update(subscriptions)
                .set({
                    lastUpdatedStatus: notification.lastUpdatedStatus,
                    lastCodes: notification.lastCodes,
                })
                .where(
                    and(
                        eq(subscriptions.sectionCode, notification.sectionCode),
                        eq(subscriptions.year, notification.term.split(' ')[0]),
                        eq(subscriptions.quarter, notification.term.split(' ')[1])
                    )
                )
        );
    }

    /**
     * Deletes a notification for a specified user
     *
     * @param db - The database or transaction object to use for the operation.
     * @param notification - The notification object type we are deleting.
     * @param userId - The ID of the user for whom we're deleting a notification.
     * @returns A promise that deletes a user's notification.
     */
    static async deleteNotification(
        db: DatabaseOrTransaction,
        notification: Notification,
        userId: string,
        _stage?: string
    ) {
        return db.transaction((tx) =>
            tx
                .delete(subscriptions)
                .where(
                    and(
                        eq(subscriptions.userId, userId),
                        eq(subscriptions.sectionCode, notification.sectionCode),
                        eq(subscriptions.year, notification.term.split(' ')[0]),
                        eq(subscriptions.quarter, notification.term.split(' ')[1])
                    )
                )
        );
    }

    /**
     * Deletes ALL notifications for a specified user
     *
     * @param db - The database or transaction object to use for the operation.
     * @param userId - The ID of the user for whom we're deleting all notifications.
     * @returns A promise that deletes all of a user's notifications.
     */
    static async deleteAllNotifications(db: DatabaseOrTransaction, userId: string, _stage?: string) {
        return db.transaction((tx) => tx.delete(subscriptions).where(eq(subscriptions.userId, userId)));
    }
}
