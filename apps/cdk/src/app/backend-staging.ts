import { App } from 'aws-cdk-lib';

import { waitForStackIdle } from '../lib/wait-for-stack-idle';
import { AantsStack } from '../stacks/aants';
import { BackendStack } from '../stacks/backend';

async function main() {
    if (!process.env['PR_NUM']) {
        throw new Error('Staging deployment missing PR_NUM environment variable');
    }

    const backendStackName = `antalmanac-backend-staging-${process.env['PR_NUM']}`;
    const aantsStackName = `antalmanac-aants-staging-${process.env['PR_NUM']}`;

    await Promise.all([waitForStackIdle(backendStackName), waitForStackIdle(aantsStackName)]);

    const app = new App({ autoSynth: true });

    new BackendStack(app, backendStackName, { env: { region: 'us-east-1' } });
    new AantsStack(app, aantsStackName, { env: { region: 'us-east-1' } });
}

main();
