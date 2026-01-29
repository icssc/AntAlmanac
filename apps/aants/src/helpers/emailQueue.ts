import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

const sqsClient = new SQSClient({});
const QUEUE_URL = process.env.EMAIL_QUEUE_URL;

export interface EmailRequest {
    FromEmailAddress: string;
    TemplateName: string;
    TemplateData: string;
    Destination: {
        ToAddresses: string[];
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
    if (!QUEUE_URL) {
        throw new Error('EMAIL_QUEUE_URL environment variable is not set');
    }

    try {
        const command = new SendMessageCommand({
            QueueUrl: QUEUE_URL,
            MessageBody: JSON.stringify(emailRequest),
        });

        await sqsClient.send(command);
    } catch (error) {
        console.error('Error queueing email to SQS:', error);
        throw error;
    }
}
