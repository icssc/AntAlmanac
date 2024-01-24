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

    const octokit = github.getOctokit(token);

    const repo = github.context.repo;
    const ref = github.context.ref;

    const response = await octokit.request('GET /repos/{owner}/{repo}/deployments', { ...repo, environment });

    const deploymentsWithPrefix = response.data.filter((deployment) => {
        if (typeof deployment.payload === 'string') {
            return deployment.payload.startsWith(name);
        }
        const deploymentName = deployment.payload[NAME_KEY];
        return typeof deploymentName === 'string' && deploymentName.startsWith(name);
    });

    await Promise.all(
        deploymentsWithPrefix.map(async (deployment) => {
            const response = await octokit.request('GET /repos/{owner}/{repo}/deployments/{deployment_id}/statuses', {
                deployment_id: deployment.id,
                state: 'success',
                ...repo,
            });

            const promises = response.data.map(async (activeDeployment) => {
                return octokit.request('POST /repos/{owner}/{repo}/deployments/{deployment_id}/statuses', {
                    deployment_id: activeDeployment.id,
                    state: INACTIVE_STATE,
                    ...repo,
                });
            });

            return await Promise.all(promises);
        })
    );

    let deploymentId = deploymentsWithPrefix[0].id;

    /**
     * If no other deployments had this prefix, then create a new one.
     */
    if (!deploymentsWithPrefix.length) {
        const response = await octokit.request('POST /repos/{owner}/{repo}/deployments', {
            ...repo,
            ref,
            environment,
            payload: {
                [NAME_KEY]: name,
            },
        });
        if (response.status !== 201) {
            throw new Error(`Failed to create deployment: ${response.status}`);
        } else {
            deploymentId = response.data.id;
        }
    }

    /**
     * Create a new deployment status.
     */
    await octokit.request('POST /repos/{owner}/{repo}/deployments/{deployment_id}/statuses', {
        ...repo,
        ref,
        environment,
        deployment_id: deploymentId,
        state: SUCCESS_STATE,
    });
}

main();
