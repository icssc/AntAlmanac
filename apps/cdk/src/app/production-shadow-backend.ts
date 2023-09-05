import { App } from 'aws-cdk-lib';

import { BackendStack } from '../stacks/backend';

/**
 * When a new production backend is deployed, a "shadow" production backend is also deployed
 * and used as the development default endpoint for local development and staging deployments.
 *
 * Possible exceptions to using use the shadow backend:
 * - Using the local development backend, i.e. on a separate port from the frontned, e.g. "localhost:3000"
 * - Using a staging backend deployment, e.g. "https://staging-123.api.antalmanac.com"
 *   A staging backend should only be deployed if the CDK or backend projects change in the pull request.
 */
async function main() {
    const app = new App({ autoSynth: true });

    new BackendStack(app, 'antalmanac-shadow-backend');
}

main();
