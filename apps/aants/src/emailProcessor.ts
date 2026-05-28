import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import type { SQSBatchItemFailure, SQSBatchResponse, SQSEvent, SQSRecord } from 'aws-lambda';

import { EmailRequest } from './helpers/emailQueue';

const sesClient = new SESv2Client({ region: 'us-east-2' });

/**
 * Processes SQS records containing individual email requests.
 *
 * @param records - Array of SQS records, each containing one email request
 * @throws Error if processing fails
 */
async function processEmailRecord(record: SQSRecord): Promise<void> {
    const emailRequest: EmailRequest = JSON.parse(record.body);
    const { Content, Destination, FromEmailAddress, LogContext } = emailRequest;
    const logPrefix = LogContext
        ? `${LogContext.deptCode} ${LogContext.courseNumber} ${LogContext.sectionCode} - ${LogContext.courseTitle}`
        : Content.Subject;

    console.log(`[EMAIL] Sending email for ${logPrefix} to ${Destination.ToAddresses[0]}`);

    const command = new SendEmailCommand({
        FromEmailAddress,
        Destination,
        Content: {
            Simple: {
                Subject: { Data: Content.Subject, Charset: 'UTF-8' },
                Body: {
                    Html: { Data: Content.Html, Charset: 'UTF-8' },
                    Text: { Data: Content.Text, Charset: 'UTF-8' },
                },
            },
        },
    });

    await sesClient.send(command);
    console.log(`[EMAIL] Successfully sent email for ${logPrefix} to ${Destination.ToAddresses[0]}`);
}

/**
 * Lambda handler for processing SQS messages containing individual email requests.
 *
 * @param event - The SQS event containing up to 14 records (one email each)
 * @returns Array of failed message IDs (will be retried)
 */
export async function handler(event: SQSEvent): Promise<SQSBatchResponse> {
    const batchItemFailures: SQSBatchItemFailure[] = [];
    console.log(`[EMAIL PROCESSOR] Processing ${event.Records.length} email(s) from SQS`);

    for (const record of event.Records) {
        try {
            await processEmailRecord(record);
        } catch (error) {
            const emailRequest: EmailRequest = JSON.parse(record.body);
            const logPrefix = emailRequest.LogContext
                ? `${emailRequest.LogContext.deptCode} ${emailRequest.LogContext.courseNumber} ${emailRequest.LogContext.sectionCode}`
                : emailRequest.Content.Subject;
            console.error(`[EMAIL ERROR] Failed to send email for ${logPrefix} (record ${record.messageId}):`, error);
            batchItemFailures.push({ itemIdentifier: record.messageId });
        }
    }

    const successCount = event.Records.length - batchItemFailures.length;
    console.log(`[EMAIL PROCESSOR] Completed: ${successCount} succeeded, ${batchItemFailures.length} failed`);
    return { batchItemFailures };
}
