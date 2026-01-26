import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import { SQSEvent, SQSBatchResponse, SQSBatchItemFailure, SQSRecord } from 'aws-lambda';
import { EmailRequest } from './helpers/emailQueue';

const sesClient = new SESv2Client({});

/**
 * Processes SQS records containing individual email requests.
 * 
 * @param records - Array of SQS records, each containing one email request
 * @throws Error if processing fails
 */
async function processEmailRecord(record: SQSRecord): Promise<void> {
    const emailRequest: EmailRequest = JSON.parse(record.body);

    const command = new SendEmailCommand({
        FromEmailAddress: emailRequest.FromEmailAddress,
        Destination: emailRequest.Destination,
        Content: {
            Template: {
                TemplateName: emailRequest.TemplateName,
                TemplateData: emailRequest.TemplateData,
            },
        },
    });

    await sesClient.send(command);
}

/**
 * Lambda handler for processing SQS messages containing individual email requests.
 * 
 * @param event - The SQS event containing up to 14 records (one email each)
 * @returns Array of failed message IDs (will be retried)
 */
export async function handler(event: SQSEvent): Promise<SQSBatchResponse> {
    const batchItemFailures: SQSBatchItemFailure[] = [];

    for (const record of event.Records) {
        try {
            await processEmailRecord(record);
        } catch (error) {
            console.error(`Failed to send email for record ${record.messageId}:`, error);
            batchItemFailures.push({ itemIdentifier: record.messageId });
        }
    }

    return { batchItemFailures };
}