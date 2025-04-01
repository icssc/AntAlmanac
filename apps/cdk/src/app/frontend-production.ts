import { App } from 'aws-cdk-lib';

import { waitForStackIdle } from '../lib/wait-for-stack-idle';
import { FrontendStack } from '../stacks/frontend';

async function main() {
    const stackName = 'antalmanac-frontend-production';

    await waitForStackIdle(stackName);

    const app = new App({ autoSynth: true });

    new FrontendStack(app, stackName, { env: { region: 'us-east-1' } });
}

main();
