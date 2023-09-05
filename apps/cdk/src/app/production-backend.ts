import { App } from 'aws-cdk-lib';

import { BackendStack } from '../stacks/backend';

/**
 * Deploy the production backend.
 */
async function main() {
    const app = new App({ autoSynth: true });

    new BackendStack(app, 'antalmanac-backend');
}

main();
