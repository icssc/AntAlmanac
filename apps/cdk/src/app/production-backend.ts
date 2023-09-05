import { App } from 'aws-cdk-lib';

import { BackendStack } from '../stacks/backend';
import { waitForStackIdle } from '../wait-for-stack-idle';

/**
 * Deploy the production backend.
 */
async function main() {
    const stackName = 'antalmanac-backend';

    await waitForStackIdle(stackName);

    const app = new App({ autoSynth: true });

    new BackendStack(app, stackName);
}

main();
