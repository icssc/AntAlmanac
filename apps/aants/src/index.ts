/*
 * To run this script, use 'pnpm run aants'
 */

import { eq, and } from 'drizzle-orm';

import { db } from '../../backend/src/db/index';
import { users } from '../../backend/src/db/schema/auth/user';
import { subscriptions } from '../../backend/src/db/schema/subscription';
// import { aapiKey } from './env';

const BATCH_SIZE = 5;

// uncomment when AAPI endpoint is set up
// async function getUpdatedClasses(term: string, sections: string[]) {
//     try {
//         const url = new URL('https://anteaterapi.com/v2/rest/enrollmentChanges');
//         url.searchParams.append('term', term);
//         url.searchParams.append('sections', sections.join(','));

//         const response = await fetch(url.toString(), {
//             method: 'GET',
//             headers: {
//                 ...(aapiKey.parse(process.env) && { Authorization: `Bearer ${aapiKey.parse(process.env)}` }),
//             },
//         });

//         if (!response.ok) {
//             throw new Error(`HTTP error! Status: ${response.status}`);
//         }

//         const data = await response.json();
//         return data;
//     } catch (error: any) {
//         console.error('Error calling API:', error.message);
//     }
// }

function getUpdatedClassesDummy(term: string, sections: string[]) {
    const url = new URL('https://anteaterapi.com/v2/rest/enrollmentChanges');
    url.searchParams.append('term', term);
    url.searchParams.append('sections', sections.join(','));

    const response1 = {
        data: {
            courses: [
                {
                    deptCode: 'COMPSCI',
                    courseTitle: 'Algorithms',
                    courseNumber: 161,
                    sections: [
                        {
                            sectionCode: 101,
                            maxCapacity: 100,
                            numRequested: 50,
                            numOnWaitlist: 10,
                            numWaitlistCap: 20,
                            status: {
                                from: 'OPEN',
                                to: 'FULL',
                            },
                            numCurrentlyEnrolled: {
                                totalEnrolled: 60,
                                sectionEnrolled: 30,
                            },
                        },
                        {
                            sectionCode: 102,
                            maxCapacity: 100,
                            numRequested: 50,
                            numOnWaitlist: 10,
                            numWaitlistCap: 20,
                            status: {
                                from: 'WAITLISTED',
                                to: 'OPEN',
                            },
                            numCurrentlyEnrolled: {
                                totalEnrolled: 60,
                                sectionEnrolled: 30,
                            },
                        },
                    ],
                },
                {
                    deptCode: 'COMPSCI',
                    courseTitle: 'Operating Systems',
                    courseNumber: 111,
                    sections: [
                        {
                            sectionCode: 111,
                            maxCapacity: 100,
                            numRequested: 50,
                            numOnWaitlist: 10,
                            numWaitlistCap: 20,
                            status: {
                                from: 'OPEN',
                                to: 'FULL',
                            },
                            numCurrentlyEnrolled: {
                                totalEnrolled: 60,
                                sectionEnrolled: 30,
                            },
                        },
                    ],
                },
            ],
        },
    };

    const response2 = {
        data: {
            courses: [
                {
                    deptCode: 'BIO SCI',
                    courseTitle: 'DNA TO ORGANISMS',
                    courseNumber: 93,
                    sections: [
                        {
                            sectionCode: 222,
                            maxCapacity: 75,
                            numRequested: 85,
                            numOnWaitlist: 0,
                            numWaitlistCap: 10,
                            status: {
                                from: 'WAITLISTED',
                                to: 'FULL',
                            },
                            numCurrentlyEnrolled: {
                                totalEnrolled: 72,
                                sectionEnrolled: 0,
                            },
                        },
                    ],
                },
            ],
        },
    };

    if (term == '2025-WINTER') {
        return response1;
    } else if (term == '2025-SPRING') {
        return response2;
    } else {
        return response1;
    }
}

async function getSubscriptionSectionCodes() {
    try {
        const result = await db
            .selectDistinct({
                sectionCode: subscriptions.sectionCode,
                term: subscriptions.term,
            })
            .from(subscriptions);

        // group together by term
        const groupedByTerm = result.reduce((acc: any, { term, sectionCode }) => {
            if (term) {
                if (!acc[term]) {
                    acc[term] = [];
                }
                acc[term].push({ sectionCode });
            }
            return acc;
        }, {});

        return groupedByTerm;
    } catch (error: any) {
        console.error('Error getting subscriptions:', error.message);
    }
}

async function updateSubscriptionStatus(term: string, sectionCode: number, lastUpdated: string) {
    try {
        await db
            .update(subscriptions)
            .set({ lastUpdated: lastUpdated })
            .where(and(eq(subscriptions.term, term), eq(subscriptions.sectionCode, sectionCode)));
    } catch (error: any) {
        console.error('Error updating subscription:', error.message);
    }
}

async function getLastUpdatedStatus(term: string, sectionCode: number) {
    try {
        const result = await db
            .select({ lastUpdated: subscriptions.lastUpdated })
            .from(subscriptions)
            .where(and(eq(subscriptions.term, term), eq(subscriptions.sectionCode, sectionCode)))
            .limit(1);

        return result;
    } catch (error: any) {
        console.error('Error getting last updated status:', error.message);
    }
}

async function batchCourseCodes(codes: string[]) {
    const batches = [];
    for (let i = 0; i < codes.length; i += BATCH_SIZE) {
        batches.push(codes.slice(i, i + BATCH_SIZE));
    }
    return batches;
}

async function sendNotification(
    term: string,
    sectionCode: number,
    status: string,
    deptCode: string,
    courseNumber: number,
    courseTitle: string
) {
    try {
        let result;
        if (status === 'OPEN') {
            result = await db
                .select({ userName: users.name })
                .from(subscriptions)
                .innerJoin(users, eq(subscriptions.userId, users.id))
                .where(
                    and(
                        eq(subscriptions.term, term),
                        eq(subscriptions.sectionCode, sectionCode),
                        eq(subscriptions.openStatus, true)
                    )
                );
        } else if (status === 'WAITLISTED') {
            result = await db
                .select({ userName: users.name })
                .from(subscriptions)
                .innerJoin(users, eq(subscriptions.userId, users.id))
                .where(
                    and(
                        eq(subscriptions.term, term),
                        eq(subscriptions.sectionCode, sectionCode),
                        eq(subscriptions.waitlistStatus, true)
                    )
                );
        } else if (status === 'FULL') {
            result = await db
                .select({ userName: users.name })
                .from(subscriptions)
                .innerJoin(users, eq(subscriptions.userId, users.id))
                .where(
                    and(
                        eq(subscriptions.term, term),
                        eq(subscriptions.sectionCode, sectionCode),
                        eq(subscriptions.fullStatus, true)
                    )
                );
        }

        console.log('NOTIFICATION FOR', deptCode, courseNumber, courseTitle, sectionCode, '\n', result, '\n');

        return result;
        // send notification
    } catch (error: any) {
        console.error('Error sending notification:', error.message);
    }
}

async function main() {
    try {
        const subscriptions = await getSubscriptionSectionCodes();
        for (const term in subscriptions) {
            // batch course codes
            const batches = await batchCourseCodes(subscriptions[term]);
            for (const batch of batches) {
                // const response = await getUpdatedClasses(term, sectionCodes);
                const response = getUpdatedClassesDummy(term, batch);
                for (const course of response.data.courses) {
                    for (const section of course.sections) {
                        const currentStatus = section.status.to;
                        const previousState = await getLastUpdatedStatus(term, section.sectionCode);
                        const previousStatus: string | null = previousState?.[0]?.lastUpdated || null;
                        if (previousStatus === currentStatus) {
                            continue;
                        }
                        // no functionality for codes yet
                        await sendNotification(
                            term,
                            section.sectionCode,
                            currentStatus,
                            course.deptCode,
                            course.courseNumber,
                            course.courseTitle
                        );
                        // send notification
                        await updateSubscriptionStatus(term, section.sectionCode, currentStatus);
                    }
                }
            }
        }
    } catch (error: any) {
        console.error('Error in managing subscription:', error.message);
    } finally {
        process.exit(0); // This ensures the script exits after execution.
    }
}

main();
