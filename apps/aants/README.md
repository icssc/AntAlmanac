# AntAlmanac AANTS
This is the underlying code that manages how [AntAlmanac](https://antalmanac.com) handles and sends emails for class update notification subscriptions.  

# Functionality Summary
AANTS runs using a Lambda Function on a 5 minute timer (subject to change) via a CloudWatch Event. The code for this can be found under `apps/cdk/src/stacks/aants.ts`

## Class Information Gathering Protocol
- When the AANTS Lambda Function is triggered, it scrapes WebSoc directly for new class information.
    - Scraping only checks for classes that have notification subscriptions currently associated with them.
- After scraping, it compares the class statuses of the freshly gathered data with the class statuses of the data stored in our database.
    - Initial class statuses are gathered upon creation of the first notification subscription for a specific class. 
- For each class:
    - If it sees there is a difference (e.g. class is now OPEN when it was FULL in our database), it will trigger the notification sending protocol.
    - If there is no difference (e.g. class is OPEN and was reported as OPEN since the last scrape), then nothing occurs.

## Notification Sending Protocol
- For each class with a status update, AANTS checks every notification subscription associated with each class.
    - It will only choose to send emails to users who are subscribed to this type of update (e.g. users who signed up for OPEN class updates will only receive emails when the class becomes OPEN, not FULL or WAILISTED).
- Via AWS SES, emails are sent in batches of 450 (subject to change) to subscribed users.
- After a successful batch of sent emails, AANTS will update the status of the class in the database to match the newly scraped status.

# Email Template
- The email template for AANTS can be found under `scripts/createTemplate.ts`.
- It can be altered by changing the `TemplateContent` and running `pnpm run template` (assuming you have access to AntAlmanac's AWS account) 

