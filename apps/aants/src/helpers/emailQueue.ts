import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

const sqsClient = new SQSClient({});

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
 * @param queueUrl - The URL of the SQS queue to send the message to
 * @param emailRequest - The email data to be queued
 * @returns Promise that resolves when the message is successfully sent to the queue
 */
export async function queueEmail(queueUrl: string, emailRequest: EmailRequest): Promise<void> {
    try {
        const command = new SendMessageCommand({
            QueueUrl: queueUrl,
            MessageBody: JSON.stringify(emailRequest),
        });

        await sqsClient.send(command);
    } catch (error) {
        console.error('Error queueing email to SQS:', error);
        throw error;
    }
}
