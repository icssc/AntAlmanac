// @ts-check

import core from '@actions/core';
import github from '@actions/github';

const NAME_KEY = 'name';

const INACTIVE_STATE = 'inactive';
const SUCCESS_STATE = 'success';

async function main() {
    const token = core.getInput('GITHUB_TOKEN');
    const name = core.getInput('name');
    const environment = core.getInput('environment');
    const url = core.getInput('url');

    const octokit = github.getOctokit(token);

    const repo = github.context.repo;
    const ref = github.context.ref;

    // const response = await octokit.request('GET /repos/{owner}/{repo}/deployments', { ...repo, environment });

    // const deploymentsWithPrefix = response.data.filter((deployment) => {
    //     if (typeof deployment.payload === 'string') {
    //         return deployment.payload.startsWith(name);
    //     }
    //     const deploymentName = deployment.payload[NAME_KEY];
    //     return typeof deploymentName === 'string' && deploymentName.startsWith(name);
    // });

    // await Promise.all(
    //     deploymentsWithPrefix.map(async (deployment) => {
    //         console.log({ deployment });

    //         return octokit.request('POST /repos/{owner}/{repo}/deployments/{deployment_id}/statuses', {
    //             deployment_id: deployment.id,
    //             state: INACTIVE_STATE,
    //             ...repo,
    //         });
    //     })
    // );

    const response = await octokit.request('POST /repos/{owner}/{repo}/deployments', {
        ...repo,
        ref,
        environment,
        payload: {
            [NAME_KEY]: name,
        },
        description: 'This is a test deployment',
    });

    if (response.status !== 201) {
        throw new Error('Could not create a deployment');
    }

    const deploymentId = response.data.id;

    /**
     * Create a new deployment status.
     */
    await octokit.request('POST /repos/{owner}/{repo}/deployments/{deployment_id}/statuses', {
        ...repo,
        ref,
        environment,
        deployment_id: deploymentId,
        state: SUCCESS_STATE,
        log_url: url,
        environment_url: url,
        auto_inactive: false,
        description: 'This is a test deployment status',
    });
}

main();
