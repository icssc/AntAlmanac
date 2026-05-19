import type { Notification } from '@packages/antalmanac-types';
import type { db } from '@packages/db';
import type * as schema from '@packages/db/src/schema';
import { subscriptions } from '@packages/db/src/schema';
import { buildConflictUpdateSet } from '@packages/db/src/utils';
import { and, eq, ExtractTablesWithRelations } from 'drizzle-orm';
import type { PgTransaction, PgQueryResultHKT } from 'drizzle-orm/pg-core';

type Transaction = PgTransaction<PgQueryResultHKT, typeof schema, ExtractTablesWithRelations<typeof schema>>;
type DatabaseOrTransaction = Omit<typeof db, '$client'> | Transaction;

/**
 * Retrieves notifications associated with a specified user and environment.
 */
export async function retrieveNotifications(db: DatabaseOrTransaction, userId: string, environment: string) {
    return db
        .select()
        .from(subscriptions)
        .where(and(eq(subscriptions.userId, userId), eq(subscriptions.environment, environment)));
}

/**
 * Upserts a notification for a specified user.
 */
export async function upsertNotification(
    db: DatabaseOrTransaction,
    userId: string,
    notification: Notification,
    environment: string
) {
    return db
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
            target: [
                subscriptions.userId,
                subscriptions.sectionCode,
                subscriptions.year,
                subscriptions.quarter,
                subscriptions.environment,
            ],
            set: buildConflictUpdateSet(subscriptions, {
                userId: 'keep',
                sectionCode: 'keep',
                year: 'keep',
                quarter: 'keep',
                environment: 'keep',
                notifyOnOpen: 'update',
                notifyOnWaitlist: 'update',
                notifyOnFull: 'update',
                notifyOnRestriction: 'update',
                lastUpdatedStatus: 'update',
                lastCodes: 'update',
                createdAt: 'keep',
                updatedAt: 'update',
            }),
        });
}

/**
 * Updates lastUpdatedStatus and lastCodes of ALL notifications with a shared
 * sectionCode, year, quarter, and environment.
 */
export async function updateAllNotifications(
    db: DatabaseOrTransaction,
    notification: Notification,
    environment: string
) {
    return db
        .update(subscriptions)
        .set({
            lastUpdatedStatus: notification.lastUpdatedStatus,
            lastCodes: notification.lastCodes,
        })
        .where(
            and(
                eq(subscriptions.sectionCode, notification.sectionCode),
                eq(subscriptions.year, notification.term.split(' ')[0]),
                eq(subscriptions.quarter, notification.term.split(' ')[1]),
                eq(subscriptions.environment, environment)
            )
        );
}

/**
 * Deletes a subscription row for the given user, section, term, and environment.
 */
export async function deleteNotification(
    db: DatabaseOrTransaction,
    userId: string,
    sectionCode: string,
    term: string,
    environment: string
) {
    return db
        .delete(subscriptions)
        .where(
            and(
                eq(subscriptions.userId, userId),
                eq(subscriptions.sectionCode, sectionCode),
                eq(subscriptions.year, term.split(' ')[0]),
                eq(subscriptions.quarter, term.split(' ')[1]),
                eq(subscriptions.environment, environment)
            )
        );
}

/**
 * Deletes ALL notifications for a specified user and environment.
 */
export async function deleteAllNotifications(db: DatabaseOrTransaction, userId: string, environment: string) {
    return db
        .delete(subscriptions)
        .where(and(eq(subscriptions.userId, userId), eq(subscriptions.environment, environment)));
}
