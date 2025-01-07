/*
 * To run this script, use 'pnpm run aants'
 */

import { eq, and } from 'drizzle-orm';
import { db } from '../../backend/src/db/index';
import { subscriptions, lastUpdatedStatus, subscriptionTargetStatus } from '../../backend/src/db/schema/subscription';
import { aapiKey } from './env';

type Section = {
    sectionCode: number;
    maxCapacity: number;
    numRequested: number;
    numOnWaitlist: number;
    numWaitlistCap: number;
    status: {
        from: string;
        to: string;
    };
    numCurrentlyEnrolled: {
        totalEnrolled: number;
        sectionEnrolled: number;
    };
};

type Course = {
    deptCode: string;
    courseTitle: string;
    courseNumber: number;
    sections: Section[];
};

type LastUpdatedType = 'OPEN/WAITLISTED' | 'WAITLISTED/OPEN' | 'FULL/OPEN' | 'OPEN/FULL';

async function getUpdatedClasses(term: string, sections: string[]) {
    try {
        const url = new URL('https://anteaterapi.com/v2/rest/enrollmentChanges');
        url.searchParams.append('term', term);
        url.searchParams.append('sections', sections.join(','));

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                ...(aapiKey.parse(process.env) && { Authorization: `Bearer ${aapiKey.parse(process.env)}` }),
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error: any) {
        console.error('Error calling API:', error.message);
    }
}

async function getSubscriptionSectionCodes() {
    try {
        const result = await db
            .selectDistinct({
                sectionCode: subscriptions.sectionCode,
                term: subscriptions.term,
                lastUpdated: subscriptions.lastUpdated,
            })
            .from(subscriptions);

        // group together by term
        const groupedByTerm = result.reduce((acc: any, { term, sectionCode, lastUpdated }) => {
            if (!acc[term!]) {
                acc[term!] = [];
            }
            acc[term!].push({ sectionCode, lastUpdated });
            return acc;
        }, {});

        return groupedByTerm;
    } catch (error: any) {
        console.error('Error getting subscriptions:', error.message);
    }
}

async function updateSubscriptionStatus(term: string, sectionCode: number, lastUpdated: LastUpdatedType) {
    try {
        await db
            .update(subscriptions)
            .set({ lastUpdated: lastUpdated })
            .where(and(eq(subscriptions.term, term), eq(subscriptions.sectionCode, sectionCode)));
    } catch (error: any) {
        console.error('Error updating subscription:', error.message);
    }
}

// async function sendNotification(term: string, sectionCode: number) {}

async function main() {
    try {
        const subscriptions = await getSubscriptionSectionCodes();
        console.log(subscriptions);

        for (const term in subscriptions) {
            const sectionCodes = subscriptions[term].map((detail: any) => detail.sectionCode);
            console.log(sectionCodes);
            // const response = await getUpdatedClasses(term, sectionCodes);
            // response.data.courses.forEach((course: Course) => {
            //     course.sections.forEach(section => {
            //         const currentStatus = (section.status.from + '/' + section.status.to) as LastUpdatedType;
            //         if (subscriptions[term][section.sectionCode].lastUpdated !== currentStatus) {
            //             updateSubscriptionStatus(term, section.sectionCode, currentStatus);
            //             // send notifications if needed
            //         }
            //     });
            // });
        }
    } catch (error: any) {
        console.error('Error in main function:', error.message);
    } finally {
        process.exit(0); // This ensures the script exits after execution.
    }
}

main();
