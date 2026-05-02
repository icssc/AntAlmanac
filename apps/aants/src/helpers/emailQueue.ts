import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

import { aantsEnvSchema } from '../env';

const env = aantsEnvSchema.parse(process.env);
const sqsClient = new SQSClient({});

export interface EmailRequest {
    FromEmailAddress: string;
    Destination: {
        ToAddresses: string[];
    };
    /** Email content from React Email */
    Content: {
        Subject: string;
        Html: string;
        Text: string;
    };
    /** Context for logging */
    LogContext?: {
        deptCode: string;
        courseNumber: string;
        sectionCode: string;
        courseTitle: string;
    };
}

/**
 * Sends a single email request to SQS queue.
 * Each email becomes its own SQS message for individual processing.
 *
 * @param emailRequest - The email data to be queued
 * @returns Promise that resolves when the message is successfully sent to the queue
 */
export async function queueEmail(emailRequest: EmailRequest): Promise<void> {
    try {
        const command = new SendMessageCommand({
            QueueUrl: env.QUEUE_URL,
            MessageBody: JSON.stringify(emailRequest),
        });

        await sqsClient.send(command);
    } catch (error) {
        console.error('Error queueing email to SQS:', error);
        throw error;
    }
}
