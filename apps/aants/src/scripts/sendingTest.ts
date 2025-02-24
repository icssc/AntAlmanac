import { SESv2Client, SendBulkEmailCommand } from '@aws-sdk/client-sesv2';
import { request, Term } from '@icssc/libwebsoc-next';

const client = new SESv2Client({
    region: 'us-east-2',
});

type User = {
    userName: string;
    email: string;
};

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
            // DefaultEmailTags: [
            //     {
            //         Name: 'System',
            //         Value: 'CourseNotification'
            //     },
            //     {
            //         Name: 'Department',
            //         Value: deptCode
            //     }
            // ],
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

        // const input = {
        //     FromEmailAddress: 'icssc@uci.edu',
        //     Destination: {
        //         ToAddresses: [users.email],
        //     },
        //     Content: {
        //         Template: {
        //         TemplateName: 'CourseNotification',
        //         TemplateData: JSON.stringify({
        //             userName: users.userName,
        //             notification: notification,
        //             deptCode: deptCode,
        //             courseNumber: courseNumber,
        //             courseTitle: courseTitle,
        //             instructor: instructor,
        //             days: days,
        //             hours: hours,
        //             time: time,
        //             sectionCode: sectionCode,
        //         })
        //     }
        //     }
        // };
        // const command = new SendEmailCommand(input);
        const response = await client.send(command);
        console.log('Bulk emails sent successfully');

        return response;
    } catch (error) {
        console.error('Error sending bulk emails:', error);
        throw error;
    }
}

async function testWebsocRequest() {
    const term: Term = {
        year: '2025',
        quarter: 'Spring', // or any other valid quarter, like "Spring", "Fall"
    };

    const sectionCodes = ['21150'];
    // const sectionCodes = ["34250", "21150"];

    const users = [
        { email: 'isaachn@uci.edu', userName: 'John' },
        { email: 'isaachn@uci.edu', userName: 'Jane' },
        // { email: 'isaachn@uci.edu', userName: 'Alice'},
        // Add more users here
    ];

    const sectionCodesStr = sectionCodes.join(',');
    request(term, { sectionCodes: sectionCodesStr }) // Pass all section codes in one request
        .then((response) => {
            // Log all sections from the response
            response.schools.forEach((school) => {
                school.departments.forEach((department) => {
                    department.courses.forEach((course) => {
                        course.sections.forEach((section) => {
                            const { deptCode, courseNumber, courseTitle } = course;
                            const { sectionCode, instructors, meetings, status, restrictions } = section;
                            const instructor = instructors.join(', ');
                            sendNotification(
                                Number(sectionCode),
                                instructor,
                                meetings[0].days,
                                meetings[0].time,
                                status,
                                restrictions,
                                deptCode,
                                courseNumber,
                                courseTitle,
                                users,
                                true,
                                true
                            );
                            // console.log(deptCode, courseNumber, courseTitle, sectionCode, instructor, timeSlot, status);  // Log each section
                            // console.log(course)
                        });
                    });
                });
            });
        })
        .catch((error) => {
            console.error('Error fetching sections:', error);
        });
}

// Call the test function
testWebsocRequest();
