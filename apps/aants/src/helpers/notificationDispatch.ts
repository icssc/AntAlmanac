import { SESv2Client, SendBulkEmailCommand } from '@aws-sdk/client-sesv2';
import { WebsocSection } from '@icssc/libwebsoc-next';

type User = {
    userName: string;
    email: string;
    userId: string;
};

const BATCH_SIZE = 450;
const client = new SESv2Client({ region: 'us-east-2' });

async function batchCourseCodes(codes: string[]) {
    const batches = [];
    for (let i = 0; i < codes.length; i += BATCH_SIZE) {
        batches.push(codes.slice(i, i + BATCH_SIZE));
    }
    return batches;
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
    status: WebsocSection['status'],
    codes: string,
    deptCode: string,
    courseNumber: string,
    courseTitle: string,
    users: User[],
    statusChanged: boolean,
    codesChanged: boolean,
    quarter: string,
    year: string
) {
    try {
        let notification = ``;

        if (status === 'Waitl') {
            notification += `- The class is now <strong>WAITLISTED</strong>`;
        } else if (statusChanged) {
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
                        userId: user.userId,
                        quarter: quarter,
                        year: year,
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
