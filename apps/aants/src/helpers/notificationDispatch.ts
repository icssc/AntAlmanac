import { WebsocSection } from '@icssc/libwebsoc-next';

import { aantsEnvSchema } from '../env';

import { queueEmail } from './emailQueue';
import { User } from './subscriptionData';

export interface CourseDetails {
    sectionCode: string;
    instructor: string;
    days: string;
    hours: string;
    currentStatus: WebsocSection['status'];
    restrictionCodes: string;
    deptCode: string;
    courseNumber: string;
    courseTitle: string;
    courseType: string;
    quarter: string;
    year: string;
}

const BATCH_SIZE = 450;

const env = aantsEnvSchema.parse(process.env);

/**
 * Batches an array of course codes into smaller arrays based on a predefined BATCH_SIZE.
 * @param codes - An array of course codes to be batched.
 * @returns A 2D array, where each inner array is a batch of course codes.
 */
function batchCourseCodes(codes: string[]): string[][] {
    const batches = [];
    for (let i = 0; i < codes.length; i += BATCH_SIZE) {
        batches.push(codes.slice(i, i + BATCH_SIZE));
    }
    return batches;
}

/**
 * Returns a formatted timestamp string for the current date and time in PST/PDT.
 * @returns A string representing the current date and time in the format "HH:MM AM/PM on MM/DD/YYYY" in Pacific time.
 */
function getFormattedTime(): string {
    const now = new Date();
    const timeZone = 'America/Los_Angeles'; // PST/PDT

    return (
        new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZone,
        }).format(now) +
        ' on ' +
        new Intl.DateTimeFormat('en-US', {
            month: 'numeric',
            day: 'numeric',
            year: 'numeric',
            timeZone,
        }).format(now)
    );
}

/**
 * Sends batch notifications to users about a course status change.
 * @param courseDetails - An object containing details about the course.
 * @param users - An array of user objects.
 * @param statusChanged - A boolean indicating if the status has changed.
 * @param codesChanged - A boolean indicating if the restriction codes have changed.
 */
async function sendNotification(
    courseDetails: CourseDetails,
    users: User[],
    statusChanged: boolean,
    codesChanged: boolean
) {
    const {
        sectionCode,
        instructor,
        days,
        hours,
        currentStatus,
        restrictionCodes,
        deptCode,
        courseNumber,
        courseTitle,
        courseType,
        quarter,
        year,
    } = courseDetails;

    try {
        const parts = [];

        if (statusChanged) {
            const status = currentStatus === 'Waitl' ? 'WAITLISTED' : currentStatus;
            parts.push(`The class is now <strong>${status}</strong>`);
        }

        if (codesChanged) {
            parts.push(`The class now has restriction codes <strong>${restrictionCodes}</strong>`);
        }

        const notification = parts.map((p) => `- ${p}`).join('<br>');

        const time = getFormattedTime();

        // Add staging prefix to subject line if not in production
        const isStaging = env.NODE_ENV !== 'production';
        const stagingPrefix = isStaging ? '[SQS] [STAGING] ' : '';

        const usersWithEmail = users.filter((user): user is User & { email: string } => user.email !== null);

        // Send each email as a separate SQS message
        await Promise.all(
            usersWithEmail.map((user) =>
                queueEmail({
                    FromEmailAddress: 'no-reply@icssc.club',
                    TemplateName: 'CourseNotification',
                    Destination: {
                        ToAddresses: [user.email],
                    },
                    TemplateData: JSON.stringify({
                        notification: notification,
                        deptCode: deptCode,
                        courseNumber: courseNumber,
                        courseTitle: courseTitle,
                        courseType: courseType,
                        instructor: instructor,
                        days: days,
                        hours: hours,
                        time: time,
                        sectionCode: sectionCode,
                        userId: user.userId,
                        userName: user.userName,
                        quarter: quarter,
                        year: year,
                        stagingPrefix: stagingPrefix,
                    }),
                })
            )
        );

        return { queued: usersWithEmail.length };
    } catch (error) {
        console.error('Error sending bulk emails:', error);
        throw error;
    }
}

export { batchCourseCodes, sendNotification };
