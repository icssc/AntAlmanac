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

    await octokit.request('GET /repos/{owner}/{repo}/deployments', { ...repo, environment }).then(async (response) => {
        if (response.status !== 200) {
            return;
        }

        const deploymentsWithPrefix = response.data.filter((deployment) => {
            if (typeof deployment.payload === 'string') {
                return deployment.payload.startsWith(name);
            }
            const deploymentName = deployment.payload[NAME_KEY];
            return (
                typeof deploymentName === 'string' &&
                deploymentName.startsWith(name) &&
                deployment.sha !== github.context.sha
            );
        });

        await Promise.all(
            deploymentsWithPrefix.map(async (deployment) => {
                return octokit.request('POST /repos/{owner}/{repo}/deployments/{deployment_id}/statuses', {
                    deployment_id: deployment.id,
                    state: INACTIVE_STATE,
                    ...repo,
                });
            })
        );
    });

    const response = await octokit.request('POST /repos/{owner}/{repo}/deployments', {
        ...repo,
        ref: 'refs/heads/google-auth-devops',
        environment,
        payload: {
            [NAME_KEY]: name,
        },
        auto_merge: false,
        required_contexts: [],
    });

    if (response.status !== 201) {
        throw new Error('Could not create a deployment');
    }

    const deploymentId = response.data.id;

    await octokit.request('POST /repos/{owner}/{repo}/deployments/{deployment_id}/statuses', {
        ...repo,
        environment,
        deployment_id: deploymentId,
        state: SUCCESS_STATE,
        environment_url: url,
        auto_inactive: false,
    });
}

main();
