import type { WebsocAPIResponse, WebsocSection } from '@packages/anteater-api-types';
import { and, eq, inArray } from 'drizzle-orm';

import { db } from '../../../../packages/db/src/index';
import { type User as DbUser, users } from '../../../../packages/db/src/schema/auth/user';
import { type Subscription, subscriptions } from '../../../../packages/db/src/schema/subscription';

const ANTEATER_API_BASE_URL = 'https://anteaterapi.com/v2/rest/websoc';

interface AnteaterAPIResponse {
    ok: boolean;
    data?: WebsocAPIResponse;
    message?: string;
}

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
 * Fetches updated class information for specific section codes within a given term from AnteaterAPI.
 * @param quarter - The academic quarter (e.g., "Fall", "Winter", "Spring", "Summer1", "Summer10wk", "Summer2").
 * @param year - The academic year (e.g., "2023").
 * @param sections - An array of section codes to fetch.
 * @returns A promise that resolves to the WebSoc response, or undefined if an error occurs.
 */
async function getUpdatedClasses(
    quarter: string,
    year: string,
    sections: string[]
): Promise<WebsocAPIResponse | undefined> {
    try {
        const params = new URLSearchParams({
            year,
            quarter,
            sectionCodes: sections.join(','),
        });

        const response = await fetch(`${ANTEATER_API_BASE_URL}?${params.toString()}`);
        const json: AnteaterAPIResponse = await response.json();

        if (!json.ok) {
            console.error('AnteaterAPI error:', json.message);
            return undefined;
        }

        return json.data;
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
        const stage = process.env.STAGE!;
        const result = await db
            .selectDistinct({
                sectionCode: subscriptions.sectionCode,
                quarter: subscriptions.quarter,
                year: subscriptions.year,
            })
            .from(subscriptions)
            .where(eq(subscriptions.environment, stage));

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
 * Fetches the last updated status and restriction codes for multiple class sections from the database.
 * @param year - The academic year of the subscriptions.
 * @param quarter - The academic quarter of the subscriptions.
 * @param sectionCodes - Array of section codes to fetch.
 * @returns A map of sectionCode -> ClassStatus.
 */
async function getLastUpdatedStatus(
    year: string,
    quarter: string,
    sectionCodes: string[]
): Promise<Map<string, ClassStatus>> {
    const result = new Map<string, ClassStatus>();

    if (sectionCodes.length === 0) {
        return result;
    }

    try {
        const rows = await db
            .selectDistinct({
                sectionCode: subscriptions.sectionCode,
                lastUpdatedStatus: subscriptions.lastUpdatedStatus,
                lastCodes: subscriptions.lastCodes,
            })
            .from(subscriptions)
            .where(
                and(
                    eq(subscriptions.year, year),
                    eq(subscriptions.quarter, quarter),
                    inArray(subscriptions.sectionCode, sectionCodes)
                )
            );

        for (const row of rows) {
            result.set(row.sectionCode, {
                lastUpdatedStatus: row.lastUpdatedStatus as WebsocSection['status'] | null,
                lastCodes: row.lastCodes,
            });
        }
    } catch (error) {
        console.error('Error getting last updated status:', error);
    }

    return result;
}

export type SubscriptionWithUser = Pick<
    Subscription,
    'sectionCode' | 'notifyOnOpen' | 'notifyOnWaitlist' | 'notifyOnFull' | 'notifyOnRestriction'
> & {
    userId: DbUser['id'];
    userName: DbUser['name'];
    email: DbUser['email'];
};

/**
 * Fetches all subscriptions with user info for the given section codes.
 * @returns Map of sectionCode -> array of subscriptions with user info and notification preferences.
 */
async function getSubscriptionsForSections(
    year: string,
    quarter: string,
    sectionCodes: string[]
): Promise<Map<string, SubscriptionWithUser[]>> {
    const result = new Map<string, SubscriptionWithUser[]>();
    if (sectionCodes.length === 0) return result;

    try {
        const stage = process.env.STAGE!;
        const rows = await db
            .select({
                sectionCode: subscriptions.sectionCode,
                userId: users.id,
                userName: users.name,
                email: users.email,
                notifyOnOpen: subscriptions.notifyOnOpen,
                notifyOnWaitlist: subscriptions.notifyOnWaitlist,
                notifyOnFull: subscriptions.notifyOnFull,
                notifyOnRestriction: subscriptions.notifyOnRestriction,
            })
            .from(subscriptions)
            .innerJoin(users, eq(subscriptions.userId, users.id))
            .where(
                and(
                    eq(subscriptions.year, year),
                    eq(subscriptions.quarter, quarter),
                    eq(subscriptions.environment, stage),
                    inArray(subscriptions.sectionCode, sectionCodes)
                )
            );

        for (const row of rows) {
            const existing = result.get(row.sectionCode) || [];
            existing.push(row);
            result.set(row.sectionCode, existing);
        }
    } catch (error) {
        console.error('Error getting subscriptions for sections:', error);
    }

    return result;
}

/**
 * Filters subscriptions to find users who should be notified based on status and notification preferences.
 */
function filterUsersToNotify(
    subscriptionsForSection: SubscriptionWithUser[],
    status: WebsocSection['status'],
    statusChanged: boolean,
    codesChanged: boolean
): User[] {
    return subscriptionsForSection
        .filter((sub) => {
            if (statusChanged && codesChanged) {
                const statusMatch =
                    (status === 'OPEN' && sub.notifyOnOpen) ||
                    (status === 'Waitl' && sub.notifyOnWaitlist) ||
                    (status === 'FULL' && sub.notifyOnFull);
                return statusMatch || sub.notifyOnRestriction;
            } else if (statusChanged) {
                if (status === 'OPEN') return sub.notifyOnOpen;
                if (status === 'Waitl') return sub.notifyOnWaitlist;
                if (status === 'FULL') return sub.notifyOnFull;
                return false;
            } else if (codesChanged) {
                return sub.notifyOnRestriction;
            }
            return false;
        })
        .map((sub) => ({
            userId: sub.userId,
            userName: sub.userName,
            email: sub.email,
        }));
}

export {
    getUpdatedClasses,
    getSubscriptionSectionCodes,
    updateSubscriptionStatus,
    getLastUpdatedStatus,
    getSubscriptionsForSections,
    filterUsersToNotify,
};
