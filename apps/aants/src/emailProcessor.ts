import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import { SQSEvent, SQSBatchResponse, SQSBatchItemFailure } from 'aws-lambda';
import { EmailRequest } from './helpers/emailQueue';

const sesClient = new SESv2Client({});

/**
 * Processes SQS records containing individual email requests.
 * 
 * @param records - Array of SQS records, each containing one email request
 * @returns Array of failed message IDs for partial batch response
 */
async function processEmailRecords(records: SQSEvent['Records']) {
    for (const record of records) {
        try {
            const emailRequest: EmailRequest = JSON.parse(record.body);

            const command = new SendEmailCommand({
                FromEmailAddress: emailRequest.FromEmailAddress,
                Destination: emailRequest.Destination,
                Content: {
                    Template: {
                        TemplateName: emailRequest.TemplateName,
                        TemplateData: emailRequest.ReplacementTemplateData,
                    },
                },
            });

            await sesClient.send(command);
        } catch (error) {
            console.error(`Failed to send email for record ${record.messageId}:`, error);
        }
    }
}

/**
 * Lambda handler for processing SQS messages containing individual email requests.
 * 
 * @param event - The SQS event containing up to 14 records (one email each)
 * @returns Partial batch response indicating which messages failed
 */
export async function handler(event: SQSEvent){
    try {
        await processEmailRecords(event.Records);

        return {
            statusCode: 200,
            body: JSON.stringify('Success'),
        };

    } catch (error) {
        console.error('Error processing email records:', error);
    }
}