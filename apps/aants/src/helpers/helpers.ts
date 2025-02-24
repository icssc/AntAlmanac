import { SESv2Client, SendBulkEmailCommand } from '@aws-sdk/client-sesv2';
import { request, Term, Quarter } from '@icssc/libwebsoc-next';
import { eq, and, or } from 'drizzle-orm';

import { db } from '../../../backend/src/db/index';
import { users } from '../../../backend/src/db/schema/auth/user';
import { subscriptions } from '../../../backend/src/db/schema/subscription';

const BATCH_SIZE = 450;
const client = new SESv2Client({ region: 'us-east-2' });

type User = {
    userName: string;
    email: string;
};

async function getUpdatedClasses(quarter: string, year: string, sections: string[]) {
    try {
        const term: Term = {
            year: year,
            quarter: quarter as Quarter,
        };
        const response = await request(term, { sectionCodes: sections.join(',') });
        return response;
    } catch (error: any) {
        console.error('Error getting class information:', error.message);
    }
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
                acc[term].push(sectionCode);
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

function getFormattedTime() {
    const now = new Date();

    return (
        new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        }).format(now) +
        ' on ' +
        new Intl.DateTimeFormat('en-US', {
            month: 'numeric',
            day: 'numeric',
            year: 'numeric',
        }).format(now)
    );
}

async function sendNotification(
    sectionCode: number,
    instructor: string,
    days: string,
    hours: string,
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
        if (statusChanged) {
            notification += `- The class is now <strong>${status}</strong>`;
        }
        if (codesChanged) {
            notification += `\n- The class now has restriction codes <strong>${codes}</strong>`;
        }

        notification = notification.replace(/\n/g, '<br>');

        const time = getFormattedTime();

        const bulkEmailEntries = users.map((user) => ({
            Destination: {
                ToAddresses: [user.email],
            },
            ReplacementEmailContent: {
                ReplacementTemplate: {
                    ReplacementTemplateData: JSON.stringify({
                        userName: user.userName,
                        notification: notification,
                        deptCode: deptCode,
                        courseNumber: courseNumber,
                        courseTitle: courseTitle,
                        instructor: instructor,
                        days: days,
                        hours: hours,
                        time: time,
                        sectionCode: sectionCode,
                    }),
                },
            },
        }));

        const input = {
            FromEmailAddress: 'icssc@uci.edu',
            DefaultContent: {
                Template: {
                    TemplateName: 'CourseNotification',
                    TemplateData: JSON.stringify({
                        name: '',
                        notification: '',
                        deptCode: '',
                        courseNumber: '',
                        courseTitle: '',
                        instructor: '',
                        days: '',
                        hours: '',
                        time: '',
                        sectionCode: '',
                    }),
                },
            },
            BulkEmailEntries: bulkEmailEntries,
        };

        const command = new SendBulkEmailCommand(input);
        const response = await client.send(command);
        return response;
    } catch (error) {
        console.error('Error sending bulk emails:', error);
        throw error;
    }
}
export {
    getUpdatedClasses,
    getSubscriptionSectionCodes,
    updateSubscriptionStatus,
    getLastUpdatedStatus,
    batchCourseCodes,
    getUsers,
    getFormattedTime,
    sendNotification,
};
