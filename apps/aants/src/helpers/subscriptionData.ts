import { request, Term, Quarter, WebsocSection, WebsocResponse } from '@icssc/libwebsoc-next';
import { eq, and, or } from 'drizzle-orm';

import { db } from '../../../../packages/db/src/index';
import { users } from '../../../../packages/db/src/schema/auth/user';
import { subscriptions } from '../../../../packages/db/src/schema/subscription';

interface TermGrouping {
    [term: string]: string[];
}

interface ClassStatus {
    lastUpdatedStatus: WebsocSection['status'] | null;
    lastCodes: string | null;
}

export interface User {
    userName: string | null;
    email: string | null;
    userId: string | null;
}

/**
 * Fetches updated class information for specific section codes within a given term from WebSoc.
 * @param quarter - The academic quarter (e.g., "Fall", "Winter", "Spring", "Summer1", "Summer10wk", "Summer2").
 * @param year - The academic year (e.g., "2023").
 * @param sections - An array of section codes to fetch.
 * @returns A promise that resolves to the WebSoc response, or undefined if an error occurs.
 */
async function getUpdatedClasses(
    quarter: string,
    year: string,
    sections: string[]
): Promise<WebsocResponse | undefined> {
    try {
        const term: Term = {
            year: year,
            quarter: quarter as Quarter,
        };
        const response = await request(term, { sectionCodes: sections.join(',') });
        return response;
    } catch (error) {
        console.error('Error getting class information:', error);
    }
}

/**
 * Fetches and batches all unique section codes and their associated term information from the database.
 * @returns A promise that resolves to an object mapping terms to arrays of section codes, or undefined if an error occurs.
 */
async function getSubscriptionSectionCodes(): Promise<TermGrouping | undefined> {
    try {
        const result = await db
            .selectDistinct({
                sectionCode: subscriptions.sectionCode,
                quarter: subscriptions.quarter,
                year: subscriptions.year,
            })
            .from(subscriptions);

        // group together by year and quarter
        const groupedByTerm = result.reduce((acc: TermGrouping, { quarter, year, sectionCode }) => {
            if (quarter && year) {
                const term = `${quarter}-${year}`;
                if (!acc[term]) {
                    acc[term] = [];
                }
                acc[term].push(sectionCode);
            }
            return acc;
        }, {});

        return groupedByTerm;
    } catch (error) {
        console.error('Error getting subscriptions:', error);
    }
}

/**
 * Updates the subscription status for all users subscribed to a specific class section in the database.
 * @param year - The academic year of the subscription.
 * @param quarter - The academic quarter of the subscription.
 * @param sectionCode - The section code of the class.
 * @param lastUpdatedStatus - The new status of the class.
 * @param lastCodes - The new restriction codes of the class.
 */
async function updateSubscriptionStatus(
    year: string,
    quarter: string,
    sectionCode: string,
    lastUpdatedStatus: WebsocSection['status'],
    lastCodes: string
): Promise<void> {
    try {
        await db
            .update(subscriptions)
            .set({ lastUpdatedStatus: lastUpdatedStatus, lastCodes: lastCodes })
            .where(
                and(
                    eq(subscriptions.year, year),
                    eq(subscriptions.quarter, quarter),
                    eq(subscriptions.sectionCode, sectionCode)
                )
            );
    } catch (error) {
        console.error('Error updating subscription:', error);
    }
}

/**
 * Fetches the last updated status and restriction codes for a specific class section from the database.
 * This function makes the assumption that all class subscriptions always have the same status and restriction codes.
 * @param year - The academic year of the subscription.
 * @param quarter - The academic quarter of the subscription.
 * @param sectionCode - The section code of the class.
 * @returns A promise that resolves to the last updated status and restriction codes of a class section, or undefined if an error occurs.
 */
async function getLastUpdatedStatus(
    year: string,
    quarter: string,
    sectionCode: string
): Promise<ClassStatus | undefined> {
    try {
        const result = await db
            .select({
                lastUpdatedStatus: subscriptions.lastUpdatedStatus,
                lastCodes: subscriptions.lastCodes,
            })
            .from(subscriptions)
            .where(
                and(
                    eq(subscriptions.year, year),
                    eq(subscriptions.quarter, quarter),
                    eq(subscriptions.sectionCode, sectionCode)
                )
            )
            .limit(1);

        return result?.[0] as ClassStatus;
    } catch (error) {
        console.error('Error getting last updated status:', error);
    }
}

/**
 * Fetches all users who are subscribed to a specific class section and have enabled notifications
 * for the current type of status change (status and/or restriction codes changes)
 * @param quarter - The academic quarter of the subscription.
 * @param year - The academic year of the subscription.
 * @param sectionCode - The section code of the class.
 * @param status - The status of the class.
 * @param statusChanged - True if the class status has changed.
 * @param codesChanged - True if the class restriction codes have changed.
 * @returns A promise that resolves to an array of user information, or undefined if an error occurs.
 */

async function getUsers(
    quarter: string,
    year: string,
    sectionCode: string,
    status: WebsocSection['status'],
    statusChanged: boolean,
    codesChanged: boolean
): Promise<User[] | undefined> {
    try {
        const statusColumnMap: Record<WebsocSection['status'], any> = {
            OPEN: subscriptions.notifyOnOpen,
            Waitl: subscriptions.notifyOnWaitlist,
            FULL: subscriptions.notifyOnFull,
            NewOnly: null,
        };

        const statusColumn = statusColumnMap[status];

        const baseConditions = [
            eq(subscriptions.year, year),
            eq(subscriptions.quarter, quarter),
            eq(subscriptions.sectionCode, sectionCode),
        ];

        let notificationCondition;
        if (statusChanged === true && codesChanged === true) {
            if (statusColumn) {
                notificationCondition = or(eq(statusColumn, true), eq(subscriptions.notifyOnRestriction, true));
            } else {
                notificationCondition = eq(subscriptions.notifyOnRestriction, true);
            }
        } else if (statusChanged === true) {
            if (statusColumn) {
                notificationCondition = eq(statusColumn, true);
            } else {
                // TODO (@IsaacNguyen): Handle NewOnly status if that's something we want to support
                return [];
            }
        } else if (codesChanged === true) {
            notificationCondition = eq(subscriptions.notifyOnRestriction, true);
        }

        const allConditions = notificationCondition ? [...baseConditions, notificationCondition] : baseConditions;

        const result = await db
            .select({ userName: users.name, email: users.email, userId: users.id })
            .from(subscriptions)
            .innerJoin(users, eq(subscriptions.userId, users.id))
            .where(and(...allConditions));

        return result;
    } catch (error) {
        console.error('Error getting users:', error);
    }
}

export { getUpdatedClasses, getSubscriptionSectionCodes, updateSubscriptionStatus, getLastUpdatedStatus, getUsers };
