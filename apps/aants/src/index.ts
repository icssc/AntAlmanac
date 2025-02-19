/*
 * To run this script, use 'pnpm run aants'
 */

// import { SES } from 'aws-sdk';
import { eq, and, or } from 'drizzle-orm';

import { db } from '../../backend/src/db/index';
import { users } from '../../backend/src/db/schema/auth/user';
import { subscriptions } from '../../backend/src/db/schema/subscription';

const BATCH_SIZE = 450;
// const ses = new SES({ region: 'us-east-1' });

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
//                 ...(process.env.ANTEATER_API_KEY && { Authorization: `Bearer ${process.env.ANTEATER_API_KEY}` }),
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
            courses: [
                {
                    id: 'I&CSCI139W',
                    title: 'CRITICAL WRITING',
                    department: 'I&C SCI',
                    courseNumber: '139W',
                    sections: [
                        {
                            sectionCode: '35870',
                            to: {
                                maxCapacity: '100',
                                status: 'WAITLISTED',
                                numCurrentlyEnrolled: {
                                    totalEnrolled: '0',
                                    sectionEnrolled: '',
                                },
                                numRequested: '0',
                                numOnWaitlist: '',
                                numWaitlistCap: '0',
                                numNewOnlyReserved: '0',
                                restrictionCodes: ['A,L'],
                                updatedAt: '2025-02-19T20:37:36.557Z',
                            },
                        },
                    ],
                },
                {
                    id: 'COMPSCI161',
                    title: 'DES&ANALYS OF ALGOR',
                    department: 'COMPSCI',
                    courseNumber: '161',
                    sections: [
                        {
                            sectionCode: '34250',
                            to: {
                                maxCapacity: '350',
                                status: 'OPEN',
                                numCurrentlyEnrolled: {
                                    totalEnrolled: '0',
                                    sectionEnrolled: '',
                                },
                                numRequested: '0',
                                numOnWaitlist: '0',
                                numWaitlistCap: '53',
                                numNewOnlyReserved: '0',
                                restrictionCodes: ['L'],
                                updatedAt: '2025-02-19T20:37:36.557Z',
                            },
                        },
                    ],
                },
            ],
        },
    };

    return response1;
}

// async function getSectionInformation(quarter: string, year: string, sectionCode: string) {
//     try {
//         const url = new URL('https://anteaterapi.com/v2/rest/websoc');
//         url.searchParams.append('quarter', quarter);
//         url.searchParams.append('year', year);
//         url.searchParams.append('sectionCodes', sectionCode);

//         const response = await fetch(url.toString(), {
//             method: 'GET',
//             headers: {
//                 ...(process.env.ANTEATER_API_KEY && { Authorization: `Bearer ${process.env.ANTEATER_API_KEY}` }),
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

async function updateSubscriptionStatus(
    year: string,
    quarter: string,
    sectionCode: number,
    lastUpdated: string,
    lastCodes: string
) {
    try {
        await db
            .update(subscriptions)
            .set({ lastUpdated: lastUpdated, lastCodes: lastCodes })
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
            .select({
                lastUpdated: subscriptions.lastUpdated,
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

async function getUsers(
    quarter: string,
    year: string,
    sectionCode: number,
    status: string,
    statusChanged: boolean,
    codesChanged: boolean
) {
    try {
        const statusColumnMap: Record<string, any> = {
            OPEN: subscriptions.openStatus,
            WAITLISTED: subscriptions.waitlistStatus,
            FULL: subscriptions.fullStatus,
        };

        const statusColumn = statusColumnMap[status];

        let query = db
            .select({ userName: users.name, email: users.email })
            .from(subscriptions)
            .innerJoin(users, eq(subscriptions.userId, users.id))
            .where(
                and(
                    eq(subscriptions.year, year),
                    eq(subscriptions.quarter, quarter),
                    eq(subscriptions.sectionCode, sectionCode)
                )
            )
            .$dynamic();

        if (statusChanged == true && codesChanged == true) {
            query = query.where(or(eq(statusColumn, true), eq(subscriptions.restrictionStatus, true)));
        } else if (statusChanged == true) {
            query = query.where(eq(statusColumn, true));
        } else if (codesChanged == true) {
            query = query.where(eq(subscriptions.restrictionStatus, true));
        }
        const result = await query;
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
    codes: string,
    deptCode: string,
    courseNumber: string,
    courseTitle: string,
    users: User[],
    statusChanged: boolean,
    codesChanged: boolean
) {
    try {
        let notification = ``;

        if (statusChanged == true) {
            notification += ` ${status}`;
        }
        if (codesChanged == true) {
            notification += ` with restriction codes: ${codes}`;
        }
        console.log(
            'notification for',
            deptCode,
            courseNumber,
            '(',
            courseTitle,
            ')',
            sectionCode,
            'in',
            year,
            quarter,
            '\n',
            users,
            '\nclass is now: ',
            notification,
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
        await Promise.all(
            Object.entries(subscriptions).map(async ([term, sectionCodes]) => {
                const [quarter, year] = term.split('-');
                const batches = await batchCourseCodes(sectionCodes);

                await Promise.all(
                    batches.map(async (batch) => {
                        const response = getUpdatedClassesDummy(quarter, year, batch);
                        // const response = await getUpdatedClasses(quarter, year, batch);

                        await Promise.all(
                            response.data.courses.map(async (course) => {
                                const { department: deptCode, courseNumber, title: courseTitle } = course;

                                await Promise.all(
                                    course.sections.map(async (section) => {
                                        const sectionCode = Number(section.sectionCode);
                                        const currentStatus = section.to.status;
                                        const currentCodes = section.to.restrictionCodes.join(',');

                                        const previousState = await getLastUpdatedStatus(year, quarter, sectionCode);
                                        const previousStatus = previousState?.[0]?.lastUpdated || null;
                                        const previousCodes = previousState?.[0]?.lastCodes || '';

                                        const changes = {
                                            statusChanged: previousStatus !== currentStatus,
                                            codesChanged: previousCodes !== currentCodes,
                                        };

                                        if (!changes.statusChanged && !changes.codesChanged) return;

                                        const users = await getUsers(
                                            quarter,
                                            year,
                                            sectionCode,
                                            currentStatus,
                                            changes.statusChanged,
                                            changes.codesChanged
                                        );

                                        // Run notification and status update in parallel if there are users
                                        if (users && users.length > 0) {
                                            await sendNotification(
                                                year,
                                                quarter,
                                                sectionCode,
                                                currentStatus,
                                                currentCodes,
                                                deptCode,
                                                courseNumber,
                                                courseTitle,
                                                users,
                                                changes.statusChanged,
                                                changes.codesChanged
                                            );
                                        }
                                        await updateSubscriptionStatus(
                                            year,
                                            quarter,
                                            sectionCode,
                                            currentStatus,
                                            currentCodes
                                        );
                                    })
                                );
                            })
                        );
                    })
                );
            })
        );
    } catch (error) {
        console.error('Error in managing subscription:', error instanceof Error ? error.message : String(error));
    } finally {
        process.exit(0);
    }
}

main();
