# AntAlmanac AANTS
This is the underlying code that manages how [AntAlmanac](https://antalmanac.com) handles and sends emails for class update notification subscriptions.  

# Functionality Summary
AANTS uses two Lambda functions, wired in `sst.config.ts`:

1. **Timer Lambda (AantsLambda)** – Runs on a 5 minute schedule (subject to change) via a CloudWatch Event. Scrapes WebSoc, detects status changes, and **queues** one SQS message per email to be sent.
2. **Email Processor Lambda (EmailProcessorLambda)** – Triggered by the SQS email queue. Receives batches of messages (up to 14 per invocation) and sends each email via AWS SES.

## Class Information Gathering Protocol
- When the Timer Lambda is triggered, it scrapes WebSoc directly for new class information.
    - Scraping only checks for classes that have notification subscriptions currently associated with them.
- After scraping, it compares the class statuses of the freshly gathered data with the class statuses of the data stored in our database.
    - Initial class statuses are gathered upon creation of the first notification subscription for a specific class. 
- For each class:
    - If it sees there is a difference (e.g. class is now OPEN when it was FULL in our database), it will trigger the notification sending protocol.
    - If there is no difference (e.g. class is OPEN and was reported as OPEN since the last scrape), then nothing occurs.

## Notification Sending Protocol
- For each class with a status update, AANTS checks every notification subscription associated with each class.
    - It will only choose to send emails to users who are subscribed to this type of update (e.g. users who signed up for OPEN class updates will only receive emails when the class becomes OPEN, not FULL or WAILISTED).
- Each email is **queued as a separate message** to an SQS queue (see `helpers/emailQueue.ts` and `helpers/notificationDispatch.ts`). The Timer Lambda does not send email directly.
- The **Email Processor Lambda** is subscribed to that queue. When messages arrive, it processes them in batches (up to 14 per invocation) and sends each email via AWS SES (`emailProcessor.ts`). Failed messages are reported as batch item failures for SQS retry.
- After the Timer Lambda has queued all emails for a class and updated the subscription status, it updates the class status in the database to match the newly scraped status.

## SQS Email Queue
- The email queue URL is provided via the `QUEUE_URL` environment variable (see `src/env.ts` and `.env.example`).
- One SQS message = one email request (template name, destination, template data). The Email Processor parses each message and calls SES to send the email.

# Email Template
- The email template for AANTS can be found under `scripts/createTemplate.ts`.
- It can be altered by changing the `TemplateContent` and running `pnpm run template` (assuming you have access to AntAlmanac's AWS account) 

