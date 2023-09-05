import { App } from 'aws-cdk-lib';

import { BackendStack } from '../stacks/backend';

async function main() {
    if (!process.env.PR_NUM) {
        throw new Error('Staging deployment missing PR_NUM environment variable');
    }

    const app = new App({ autoSynth: true });

    new BackendStack(app, `antalmanac-backend-staging-${process.env.PR_NUM}`);
}

main();
