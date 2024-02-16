import { App } from 'aws-cdk-lib';

import { BackendStack } from '../stacks/backend';
import { waitForStackIdle } from '../lib/wait-for-stack-idle';

/**
 * When a new production backend is deployed, a development backend is also deployed
 * and used as the development default endpoint for local development and staging deployments.
 *
 * This development backend shadows/mirrors the production backend.
 * This endpoint is used by default during development and staging.
 *
 * Exceptions:
 * - Using the backend local development server on a separate port from the frontend, e.g. "localhost:3000"
 * - Using a staging backend deployment, e.g. "https://staging-123.api.antalmanac.com"
 *   A staging backend should only be deployed if the CDK or backend projects change in the pull request.
 */
async function main() {
    const stackName = 'antalmanac-backend-development';

    await waitForStackIdle(stackName);

    const app = new App({ autoSynth: true });

    new BackendStack(app, stackName, { env: { region: 'us-east-1' } });
}

main();
