import { SESv2Client, SendBulkEmailCommand } from '@aws-sdk/client-sesv2';
import { SQSEvent, SQSRecord } from 'aws-lambda';
import { BulkEmailInput } from './helpers/emailQueue';

const sesClient = new SESv2Client({});
const MAX_EMAILS_PER_SECOND = 14; // Current SES rate limit
const BATCH_DELAY_MS = 1000; // 1 second delay between batches

/**
 * Processes a single SQS record containing bulk email data.
 * Sends emails via SES with rate limiting to prevent throttling.
 * 
 * @param record - The SQS record containing the bulk email data
 */
async function processEmailRecord(record: SQSRecord): Promise<void> {
    try {
        const bulkEmailData: BulkEmailInput = JSON.parse(record.body);
        const { input } = bulkEmailData;
        const emailEntries = input.BulkEmailEntries;

        // Split emails into batches to respect rate limit 
        const batchSize = MAX_EMAILS_PER_SECOND;
        const batches: typeof emailEntries[] = [];

        for (let i = 0; i < emailEntries.length; i += batchSize) {
            batches.push(emailEntries.slice(i, i + batchSize));
        }

        // Process batches with rate limiting
        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
            
            const batchInput = {
                FromEmailAddress: input.FromEmailAddress,
                DefaultContent: input.DefaultContent,
                BulkEmailEntries: batch,
            };

            const command = new SendBulkEmailCommand(batchInput);
            await sesClient.send(command);

            // Add delay between batches for rate limiting
            if (i < batches.length - 1) {
                await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
            }
        }
    } catch (error) {
        console.error('Error processing email record:', error);
        throw error;
    }
}

/**
 * Lambda handler for processing SQS messages containing bulk email requests
 * 
 * @param event - The SQS event containing one or more records
 * @returns Promise that resolves when all records are processed
 */
export async function handler(event: SQSEvent) {
    // Process each SQS record (batch of emails) sequentially
    for (const record of event.Records) {
        try {
            await processEmailRecord(record);
        } catch (error) {
            // Throw to retry the entire batch (up to 3 times)
            throw error;
        }
    }
    
    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Success' }),
    };
}
