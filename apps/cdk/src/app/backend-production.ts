import { App } from 'aws-cdk-lib';

import { BackendStack } from '../stacks/backend';
import { waitForStackIdle } from '../lib/wait-for-stack-idle';

/**
 * Deploy the production backend.
 */
async function main() {
    const stackName = 'antalmanac-backend-production';

    await waitForStackIdle(stackName);

    const app = new App({ autoSynth: true });

    new BackendStack(app, stackName, { env: { region: 'us-west-1' } });
}

main();
