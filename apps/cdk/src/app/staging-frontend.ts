import { App } from 'aws-cdk-lib';

import { FrontendStack } from '../stacks/frontend';

async function main() {
    if (!process.env.PR_NUM) {
        throw new Error('Staging deployment missing PR_NUM environment variable');
    }

    const app = new App({ autoSynth: true });

    new FrontendStack(app, `antalmanac-frontend-staging-${process.env.PR_NUM}`);
}

main();
