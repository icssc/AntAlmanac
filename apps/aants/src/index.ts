/*
 * To run this script, use 'pnpm run aants'
 */

import type { WebsocAPIResponse } from '@packages/antalmanac-types';
import { eq, and } from 'drizzle-orm';

import { db } from '../../backend/src/db/index';
import { users } from '../../backend/src/db/schema/auth/user';
import { subscriptions } from '../../backend/src/db/schema/subscription';

const BATCH_SIZE = 450;

type User = {
    userName: string | null;
};

// async function getUpdatedClasses(quarter: string, year: string, sections: string[]) {
//     try {
//         // const url = new URL('https://anteaterapi.com/v2/rest/enrollmentChanges');
//         const url = new URL('https://anteater-api-staging-125.icssc.workers.dev/v2/rest/enrollmentChanges');
//         const now = new Date().toISOString();
//         url.searchParams.append('quarter', quarter);
//         url.searchParams.append('year', year);
//         url.searchParams.append('sections', sections.join(','));
//         url.searchParams.append('since', now);
//         console.log(url.toString());

//         const response = await fetch(url.toString(), {
//             method: 'GET',
//             headers: {
//                 ...((process.env.ANTEATER_API_KEY) && { Authorization: `Bearer ${process.env.ANTEATER_API_KEY}` }),
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

async function getSectionInformation(quarter: string, year: string, sectionCode: string) {
    try {
        const url = new URL('https://anteaterapi.com/v2/rest/websoc');
        url.searchParams.append('quarter', quarter);
        url.searchParams.append('year', year);
        url.searchParams.append('sectionCodes', sectionCode);

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                ...(process.env.ANTEATER_API_KEY && { Authorization: `Bearer ${process.env.ANTEATER_API_KEY}` }),
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

function getUpdatedClassesDummy(year: string, quarter: string, sections: string[]) {
    const url = new URL('https://anteaterapi.com/v2/rest/enrollmentChanges');
    const now = new Date().toISOString();
    url.searchParams.append('quarter', quarter);
    url.searchParams.append('year', year);
    url.searchParams.append('sections', sections.join(','));
    url.searchParams.append('since', now);

    const response1 = {
        ok: true,
        data: {
            sections: [
                {
                    sectionCode: '34250',
                    to: {
                        maxCapacity: '150',
                        status: 'OPEN',
                        numCurrentlyEnrolled: {
                            totalEnrolled: '150',
                            sectionEnrolled: '150',
                        },
                        numRequested: '0',
                        numOnWaitlist: '10',
                        numWaitlistCap: '20',
                        restrictionCodes: [],
                        updatedAt: '2025-01-10T09:20:15.372Z',
                    },
                },
                {
                    sectionCode: '35870',
                    to: {
                        maxCapacity: '100',
                        status: 'WAITLISTED',
                        numCurrentlyEnrolled: {
                            totalEnrolled: '100',
                            sectionEnrolled: '100',
                        },
                        numRequested: '0',
                        numOnWaitlist: '5',
                        numWaitlistCap: '20',
                        restrictionCodes: [],
                        updatedAt: '2025-01-11T08:30:15.372Z',
                    },
                },
                {
                    sectionCode: '34300',

                    to: {
                        maxCapacity: '200',
                        status: 'WAITLISTED',
                        numCurrentlyEnrolled: {
                            totalEnrolled: '180',
                            sectionEnrolled: '180',
                        },
                        numRequested: '0',
                        numOnWaitlist: '15',
                        numWaitlistCap: '30',
                        restrictionCodes: [],
                        updatedAt: '2025-01-12T10:15:15.372Z',
                    },
                },
            ],
        },
    };

    return response1;
}

async function getSubscriptionSectionCodes() {
    try {
        const result = await db
            .selectDistinct({
                sectionCode: subscriptions.sectionCode,
                quarter: subscriptions.quarter,
                year: subscriptions.year,
            })
            .from(subscriptions);

        // group together by year and quarter
        const groupedByTerm = result.reduce((acc: any, { quarter, year, sectionCode }) => {
            if (quarter && year) {
                const term = `${quarter}-${year}`;
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

async function updateSubscriptionStatus(year: string, quarter: string, sectionCode: number, lastUpdated: string) {
    try {
        await db
            .update(subscriptions)
            .set({ lastUpdated: lastUpdated })
            .where(
                and(
                    eq(subscriptions.year, year),
                    eq(subscriptions.quarter, quarter),
                    eq(subscriptions.sectionCode, sectionCode)
                )
            );
    } catch (error: any) {
        console.error('Error updating subscription:', error.message);
    }
}

async function getLastUpdatedStatus(year: string, quarter: string, sectionCode: number) {
    try {
        const result = await db
            .select({ lastUpdated: subscriptions.lastUpdated })
            .from(subscriptions)
            .where(
                and(
                    eq(subscriptions.year, year),
                    eq(subscriptions.quarter, quarter),
                    eq(subscriptions.sectionCode, sectionCode)
                )
            )
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

async function getUsers(quarter: string, year: string, sectionCode: number, status: string) {
    try {
        let result;
        if (status === 'OPEN') {
            result = await db
                .select({ userName: users.name, email: users.email })
                .from(subscriptions)
                .innerJoin(users, eq(subscriptions.userId, users.id))
                .where(
                    and(
                        eq(subscriptions.year, year),
                        eq(subscriptions.quarter, quarter),
                        eq(subscriptions.sectionCode, sectionCode),
                        eq(subscriptions.openStatus, true)
                    )
                );
        } else if (status === 'WAITLISTED') {
            result = await db
                .select({ userName: users.name, email: users.email })
                .from(subscriptions)
                .innerJoin(users, eq(subscriptions.userId, users.id))
                .where(
                    and(
                        eq(subscriptions.year, year),
                        eq(subscriptions.quarter, quarter),
                        eq(subscriptions.sectionCode, sectionCode),
                        eq(subscriptions.waitlistStatus, true)
                    )
                );
        } else if (status === 'FULL') {
            result = await db
                .select({ userName: users.name, email: users.email })
                .from(subscriptions)
                .innerJoin(users, eq(subscriptions.userId, users.id))
                .where(
                    and(
                        eq(subscriptions.year, year),
                        eq(subscriptions.quarter, quarter),
                        eq(subscriptions.sectionCode, sectionCode),
                        eq(subscriptions.fullStatus, true)
                    )
                );
        }
        return result;
    } catch (error: any) {
        console.error('Error getting users:', error.message);
    }
}

async function sendNotification(
    year: string,
    quarter: string,
    sectionCode: number,
    status: string,
    sectionInfo: WebsocAPIResponse,
    users: User[]
) {
    try {
        const deptCode = sectionInfo.data?.schools?.[0]?.departments?.[0]?.courses?.[0].deptCode;
        const courseNumber = sectionInfo.data?.schools?.[0]?.departments?.[0]?.courses?.[0].courseNumber;
        const courseTitle = sectionInfo.data?.schools?.[0]?.departments?.[0]?.courses?.[0].courseTitle;
        console.log(
            'notification for',
            deptCode,
            courseNumber,
            courseTitle,
            sectionCode,
            'in ',
            year,
            quarter,
            '\n',
            users,
            '\nclass is now: ',
            status,
            '\n'
        );
        // send notification
    } catch (error: any) {
        console.error('Error sending notification:', error.message);
    }
}

async function main() {
    try {
        const subscriptions = await getSubscriptionSectionCodes();
        for (const term in subscriptions) {
            const batches = await batchCourseCodes(subscriptions[term]);
            const [quarter, year] = term.split('-');
            for (const batch of batches) {
                const response = getUpdatedClassesDummy(quarter, year, batch);
                // const response = await getUpdatedClasses(quarter, year, batch);
                const sectionPromises = response.data.sections.map(async (section) => {
                    const currentStatus = section.to.status;
                    const previousState = await getLastUpdatedStatus(year, quarter, Number(section.sectionCode));
                    const previousStatus: string | null = previousState?.[0]?.lastUpdated || null;
                    if (previousStatus === currentStatus) return;

                    const [users, sectionInfo] = await Promise.all([
                        getUsers(quarter, year, Number(section.sectionCode), currentStatus),
                        getSectionInformation(quarter, year, section.sectionCode),
                    ]);

                    if (users && users.length > 0) {
                        await sendNotification(
                            year,
                            quarter,
                            Number(section.sectionCode),
                            currentStatus,
                            sectionInfo,
                            users
                        );
                    }
                    await updateSubscriptionStatus(year, quarter, Number(section.sectionCode), currentStatus);
                });
                await Promise.all(sectionPromises);
            }
        }
    } catch (error: any) {
        console.error('Error in managing subscription:', error.message);
    } finally {
        process.exit(0);
    }
}

main();
