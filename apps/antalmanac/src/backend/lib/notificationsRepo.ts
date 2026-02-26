import type { Notification } from '@packages/antalmanac-types';
import { subscriptions } from '@packages/db/src/schema';
import { and, eq } from 'drizzle-orm';

import type { DatabaseOrTransaction } from './rdsTypes';

export async function retrieveNotifications(db: DatabaseOrTransaction, userId: string) {
    return db.transaction((tx) => tx.select().from(subscriptions).where(eq(subscriptions.userId, userId)));
}

export async function upsertNotification(
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
                environment,
            })
            .onConflictDoUpdate({
                target: [subscriptions.userId, subscriptions.sectionCode, subscriptions.year, subscriptions.quarter],
                set: {
                    notifyOnOpen: notification.notifyOn.notifyOnOpen,
                    notifyOnWaitlist: notification.notifyOn.notifyOnWaitlist,
                    notifyOnFull: notification.notifyOn.notifyOnFull,
                    notifyOnRestriction: notification.notifyOn.notifyOnRestriction,
                    lastUpdatedStatus: notification.lastUpdatedStatus,
                    lastCodes: notification.lastCodes,
                    environment,
                },
            })
    );
}

export async function updateAllNotifications(db: DatabaseOrTransaction, notification: Notification) {
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

export async function deleteNotification(db: DatabaseOrTransaction, notification: Notification, userId: string) {
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

export async function deleteAllNotifications(db: DatabaseOrTransaction, userId: string) {
    return db.transaction((tx) => tx.delete(subscriptions).where(eq(subscriptions.userId, userId)));
}
