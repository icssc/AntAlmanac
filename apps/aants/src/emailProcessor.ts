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
async function processEmailRecords(records: SQSEvent['Records']): Promise<string[]> {
    const failures: string[] = [];
    
    for (const record of records) {
        try {
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
        } catch (error) {
            console.error(`Failed to send email for record ${record.messageId}:`, error);
            failures.push(record.messageId);
        }
    }
    
    return failures;
}

/**
 * Lambda handler for processing SQS messages containing individual email requests.
 * 
 * @param event - The SQS event containing up to 14 records (one email each)
 * @returns Partial batch response indicating which messages failed (will be retried)
 */
export async function handler(event: SQSEvent): Promise<SQSBatchResponse> {
    try {
        const failures = await processEmailRecords(event.Records);

        // Retry failed messages
        const batchItemFailures: SQSBatchItemFailure[] = failures.map((messageId) => ({
            itemIdentifier: messageId,
        }));

        return { batchItemFailures };
    } catch (error) {
        console.error('Error processing email records:', error);
        // Retry messages if error occurs
        return {
            batchItemFailures: event.Records.map((record) => ({
                itemIdentifier: record.messageId,
            })),
        };
    }
}