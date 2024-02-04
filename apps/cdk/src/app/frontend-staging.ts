import { App } from 'aws-cdk-lib';

import { FrontendStack } from '../stacks/frontend';
import { waitForStackIdle } from '../lib/wait-for-stack-idle';

async function main() {
    if (!process.env['PR_NUM']) {
        throw new Error('Staging deployment missing PR_NUM environment variable');
    }

    const stackName = `antalmanac-frontend-staging-${process.env['PR_NUM']}`;

    await waitForStackIdle(stackName);

    const app = new App({ autoSynth: true });

    new FrontendStack(app, stackName);
}

main();
