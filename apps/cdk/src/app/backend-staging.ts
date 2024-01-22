import { App } from 'aws-cdk-lib';

import { BackendStack } from '../stacks/backend';
import { waitForStackIdle } from '../lib/wait-for-stack-idle';

async function main() {
    if (!process.env['PR_NUM']) {
        throw new Error('Staging deployment missing PR_NUM environment variable');
    }

    const stackName = `antalmanac-backend-staging-${process.env['PR_NUM']}`;

    await waitForStackIdle(stackName);

    const app = new App({ autoSynth: true });

    new BackendStack(app, stackName);
}

main();
