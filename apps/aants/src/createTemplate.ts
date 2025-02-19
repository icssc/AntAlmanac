import { SESv2Client, CreateEmailTemplateCommand } from '@aws-sdk/client-sesv2'; // ES Module import

const client = new SESv2Client({ region: 'us-east-2' });

const input = {
    TemplateName: 'TestTemplate',
    TemplateContent: {
        Subject: 'Test Subject',
        Text: 'Testing.',
        Html: '<html><body><h1>Testing.</h1></body></html>',
    },
};

const command = new CreateEmailTemplateCommand(input);

async function createTemplate() {
    try {
        const response = await client.send(command);
        console.log('Template created successfully:', response);
    } catch (error) {
        console.error('Error creating template:', error);
    }
}

createTemplate();
