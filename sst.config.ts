/// <reference path="./.sst/platform/config.d.ts" />

function getDomain() {
    if ($app.stage === 'production') {
        return 'antalmanac.com';
    } else if ($app.stage === 'staging-shared') {
        return 'staging-shared.antalmanac.com';
    } else if ($app.stage.match(/^staging-(\d+)$/)) {
        const subdomainPrefix = $app.stage.replace('staging-', 'scheduler-');
        return `${subdomainPrefix}.antalmanac.com`;
    }

    throw new Error('Invalid stage');
}

const isPermanentStage = ['production', 'scheduler', 'staging-shared'];
const AANTS_STAGES = ['production', 'staging-1521'];

export default $config({
    app(input) {
        return {
            name: 'antalmanac',
            removal: isPermanentStage.includes(input?.stage) ? 'retain' : 'remove',
            protect: isPermanentStage.includes(input?.stage),
            home: 'aws',
        };
    },
    async run() {
        const domain = getDomain();
        const dbUrl = process.env.DB_URL;

        const router = new sst.aws.Router('AntAlmanacRouter', {
            domain: {
                name: domain,
                aliases: $app.stage === 'production' ? [`www.${domain}`] : undefined,
            },
            transform: {
                cachePolicy(_, opts) {
                    opts.id = '92d18877-845e-47e7-97e6-895382b1bf7c';
                },
            },
        });

        new sst.aws.Nextjs('Website', {
            path: 'apps/antalmanac',
            router: {
                instance: router,
                path: '/',
            },
            cachePolicy: '92d18877-845e-47e7-97e6-895382b1bf7c',
            environment: {
                DB_URL: dbUrl,
                MAPBOX_ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN,
                NEXT_PUBLIC_TILES_ENDPOINT: process.env.NEXT_PUBLIC_TILES_ENDPOINT,
                ANTEATER_API_KEY: process.env.ANTEATER_API_KEY,
                OIDC_CLIENT_ID: process.env.OIDC_CLIENT_ID,
                OIDC_ISSUER_URL: process.env.OIDC_ISSUER_URL,
                GOOGLE_REDIRECT_URI: `https://${domain}/auth`,
                NEXT_PUBLIC_BASE_URL: domain,
                NEXT_PUBLIC_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_PUBLIC_POSTHOG_KEY,
                PLANNER_CLIENT_API_KEY: process.env.PLANNER_CLIENT_API_KEY,
                STAGE: $app.stage,
            },
        });

        if (AANTS_STAGES.includes($app.stage)) {
            const emailDLQ = new sst.aws.Queue('EmailDLQ', {
                messageRetentionPeriod: '14 days',
            });

            const emailQueue = new sst.aws.Queue('EmailQueue', {
                visibilityTimeout: '3 minutes',
                messageRetentionPeriod: '14 days',
                dlq: {
                    queue: emailDLQ.arn,
                    retry: 3,
                },
            });

            const aantsLambda = new sst.aws.Function('AantsLambda', {
                handler: 'apps/aants/src/lambda.handler',
                timeout: '20 seconds', // TODO (@IsaacNguyen): Test how long AANTS takes to run and change accordingly
                memory: '512 MB',
                environment: {
                    DB_URL: dbUrl,
                    NODE_ENV: $app.stage === 'production' ? 'production' : 'development',
                    STAGE: $app.stage,
                    QUEUE_URL: emailQueue.url,
                },
                permissions: [
                    {
                        actions: ['sqs:SendMessage'],
                        resources: [emailQueue.arn],
                    },
                ],
            });

            const emailProcessorLambda = new sst.aws.Function('EmailProcessorLambda', {
                handler: 'apps/aants/src/emailProcessor.handler',
                timeout: '30 seconds',
                memory: '512 MB',
                reservedConcurrency: 1, // Only one execution at a time to respect rate limit
                environment: {
                    NODE_ENV: $app.stage === 'production' ? 'production' : 'development',
                    STAGE: $app.stage,
                },
                permissions: [
                    {
                        actions: ['ses:SendEmail', 'ses:SendTemplatedEmail'],
                        resources: [
                            'arn:aws:ses:us-east-2:990864464737:identity/icssc@uci.edu',
                            'arn:aws:ses:us-east-2:990864464737:identity/icssc.club',
                            'arn:aws:ses:us-east-2:990864464737:template/*',
                            'arn:aws:ses:us-east-2:990864464737:configuration-set/*',
                        ],
                    },
                    {
                        actions: ['sqs:ReceiveMessage', 'sqs:DeleteMessage', 'sqs:GetQueueAttributes'],
                        resources: [emailQueue.arn],
                    },
                ],
            });

            emailQueue.subscribe(emailProcessorLambda.arn, {
                batch: {
                    size: 14, // Match SES rate limit
                    window: '1.25 seconds', // Collect messages for up to 1 second
                    partialResponses: true, // Enable partial batch failure reporting
                },
            });

            new sst.aws.Cron('NotificationCronRule', {
                schedule: 'rate(5 minutes)', // AANTS runs every 5 minutes - TODO (@IsaacNguyen): Might change in future
                job: aantsLambda.arn,
            });
        }
    },
});
