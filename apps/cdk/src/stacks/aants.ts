import { Stack, type StackProps, Duration } from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import type { Construct } from 'constructs';

import { aantsEnvSchema } from '../../../aants/src/env';

export class AantsStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const env = aantsEnvSchema.parse(process.env);

        const handler = new lambda.Function(this, 'notificationWorker', {
            runtime: lambda.Runtime.NODEJS_LATEST,
            code: lambda.Code.fromAsset('../aants/dist'),
            handler: 'lambda.handler',
            timeout: Duration.seconds(20), // TODO: Test how long it should take
            memorySize: 256,
            environment: {
                ...env,
            },
        });

        const eventRule = new events.Rule(this, 'notificationCronRule', {
            schedule: events.Schedule.cron({ minute: '5' }), // TODO: Might change in future
        });

        eventRule.addTarget(new targets.LambdaFunction(handler));
    }
}
