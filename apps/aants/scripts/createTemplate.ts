/*
 *   To run this script, use 'pnpm run template'
 *
 *  NOTE: You have to delete the template from SES using "aws sesv2 delete-email-template --template-name CourseNotification --region us-east-2"
 */

import { CreateEmailTemplateCommand, SESv2Client } from '@aws-sdk/client-sesv2';

const client = new SESv2Client({ region: 'us-east-2' });

const input = {
    TemplateName: 'CourseNotification',
    TemplateContent: {
        Subject: '{{stagingPrefix}}{{deptCode}} {{courseNumber}} ({{courseType}}) had some enrollment changes!',
        Text: `Hi {{userName}}!
        Based on your notification subscriptions on AntAlmanac, the AntAlmanac team would like to notify you that the following class has had some enrollment changes as of {{time}}. 

        The changes are:
        {{notification}}

        Course Name: {{deptCode}} {{courseNumber}} - {{courseTitle}}
        Type: {{courseType}}
        Instructor: {{instructor}}
        Time Slot: {{days}} {{hours}}
        Section: {{sectionCode}}

        Click here to go to WebReg to enroll
        https://www.reg.uci.edu/registrar/soc/webreg.html?page=startUp&call=

        Do you no longer want to receive notifications for this course? Click here to go to AntAlmanac to manage your notification subscriptions.
        https://antalmanac.com/

        Best,
        The AntAlmanac Team`,
        Html: `<p>Hi <strong>{{userName}}</strong>!</p>

        <p>Based on your notification subscriptions on AntAlmanac, the AntAlmanac team would like to notify you that the following class has had some enrollment changes as of <strong>{{time}}</strong>.</p>
        <div>
            <p>The changes are:<br>{{notification}}</p>
        </div>
        <div>
            <p>Course Name: <strong>{{deptCode}}</strong> <strong>{{courseNumber}}</strong> - <strong>{{courseTitle}}</strong>
            <br>Type: <strong>{{courseType}}</strong>
            <br>Instructor: <strong>{{instructor}}</strong>
            <br>Time Slot: <strong>{{days}}</strong> <strong>{{hours}}</strong>
            <br>Section Code: <strong>{{sectionCode}}</strong></p>
        </div>

        <p><a href="https://www.reg.uci.edu/registrar/soc/webreg.html?page=startUp&call=">Click here to go to WebReg to enroll</a></p>

        <p><a href="https://antalmanac.com/unsubscribe/{{userId}}?sectionCode={{sectionCode}}&quarter={{quarter}}&year={{year}}&deptCode={{deptCode}}&courseNumber={{courseNumber}}&instructor={{instructor}}">
            Click here to unsubscribe from this course
        </a></p>

        <p><a href="https://antalmanac.com/unsubscribe/{{userId}}?sectionCode={{sectionCode}}&quarter={{quarter}}&year={{year}}&unsubscribeAll=true">
            Click here to unsubscribe from ALL courses
        </a></p>

        <p><a href="https://antalmanac.com/feedback">
            Click here to give feedback or report a bug
        </a></p>

        <p>Best,<br>
        The AntAlmanac Team</p>
`,
    },
};

const command = new CreateEmailTemplateCommand(input);

/**
 * Creates a new email template in SES named 'CourseNotification'.
 * This script will upload the template specified in the input object to SES.
 */
async function createTemplate() {
    try {
        const response = await client.send(command);
        console.log('Template created successfully:', response);
    } catch (error) {
        console.error('Error creating template:', error);
    }
}

createTemplate();
