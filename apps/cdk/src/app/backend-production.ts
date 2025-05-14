import { App } from 'aws-cdk-lib';

import { waitForStackIdle } from '../lib/wait-for-stack-idle';
import { AantsStack } from '../stacks/aants';
import { BackendStack } from '../stacks/backend';

/**
 * Deploy the production backend.
 */
async function main() {
    const backendStackName = 'antalmanac-backend-production';
    const aantsStackName = 'antalmanac-aants-production';

    await Promise.all([waitForStackIdle(backendStackName), waitForStackIdle(aantsStackName)]);

    const app = new App({ autoSynth: true });

    new BackendStack(app, backendStackName, { env: { region: 'us-west-1' } });
    new AantsStack(app, aantsStackName, { env: { region: 'us-west-1' } });
}

main();
