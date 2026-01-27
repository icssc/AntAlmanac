import { SESv2Client, GetEmailTemplateCommand } from '@aws-sdk/client-sesv2';

const sesClient = new SESv2Client({ region: 'us-east-2' });

async function checkTemplate() {
    try {
        const command = new GetEmailTemplateCommand({ TemplateName: 'CourseNotification' });
        const response = await sesClient.send(command);

        console.log('✅ Template exists:');
        console.log('Template Name:', response.TemplateName);
        console.log('Subject:', response.TemplateContent?.Subject);
        console.log('\nTemplate Content:', JSON.stringify(response.TemplateContent, null, 2));
    } catch (error: any) {
        if (error.name === 'NotFoundException') {
            console.error('❌ Template "CourseNotification" NOT FOUND!');
            console.error('You need to create the template first using the createTemplate script.');
        } else {
            console.error('Error checking template:', error);
        }
    }
}

checkTemplate();
