import { SESv2Client, SendBulkEmailCommand } from '@aws-sdk/client-sesv2';
import { WebsocSection } from '@icssc/libwebsoc-next';
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
    quarter: string;
    year: string;
}

const BATCH_SIZE = 450;
const client = new SESv2Client({ region: 'us-east-2' });

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
        quarter,
        year,
    } = courseDetails;

    try {
        let notification = ``;

        if (currentStatus === 'Waitl' && statusChanged) {
            notification += `- The class is now <strong>WAITLISTED</strong>`;
        } else if (statusChanged) {
            notification += `- The class is now <strong>${currentStatus}</strong>`;
        }
        if (codesChanged && statusChanged) {
            notification += `\n- The class now has restriction codes <strong>${restrictionCodes}</strong>`;
        } else if (codesChanged) {
            notification += `- The class now has restriction codes <strong>${restrictionCodes}</strong>`;
        }

        notification = notification.replace(/\n/g, '<br>');

        const time = getFormattedTime();
        
        // Add staging prefix to subject line if not in production
        const isStaging = process.env.NODE_ENV !== 'production';
        const stagingPrefix = isStaging ? '[STAGING] ' : '';

        const bulkEmailEntries = users
            .filter((user): user is User & { email: string } => user.email !== null)
            .map((user) => ({
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
                            userId: user.userId,
                            quarter: quarter,
                            year: year,
                            stagingPrefix: stagingPrefix,
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
                        userId: '',
                        quarter: '',
                        year: '',
                        stagingPrefix: '',
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

export { batchCourseCodes, sendNotification };
