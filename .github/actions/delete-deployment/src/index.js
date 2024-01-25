// @ts-check

import core from '@actions/core';
import github from '@actions/github';

const NAME_KEY = 'name';
const INACTIVE_STATE = 'inactive';

async function main() {
    const token = core.getInput('GITHUB_TOKEN');
    const name = core.getInput('name');
    const environment = core.getInput('environment');

    const octokit = github.getOctokit(token);

    const repo = github.context.repo;

    await octokit
        .request('GET /repos/{owner}/{repo}/deployments', { ...repo, environment, per_page: 100 })
        .then(async (response) => {
            if (response.status !== 200) {
                return;
            }

            /**
             * Get existing deployments with the same name, but with a different deployment ID;
             * set them to inactive, then delete them.
             */
            const deploymentsWithPrefix = response.data.filter((deployment) => {
                /**
                 * Ignore deployments with a string payload.
                 */
                if (typeof deployment.payload === 'string') {
                    return false;
                }

                const deploymentName = deployment.payload[NAME_KEY];
                return typeof deploymentName === 'string' && deploymentName.startsWith(name);
            });

            /**
             * Set all deployments with the same name to inactive.
             */
            await Promise.all(
                deploymentsWithPrefix.map(async (deployment) => {
                    return await octokit.request('POST /repos/{owner}/{repo}/deployments/{deployment_id}/statuses', {
                        deployment_id: deployment.id,
                        state: INACTIVE_STATE,
                        ...repo,
                    });
                })
            );

            /**
             * Delete all deployments with the same name.
             */
            await Promise.all(
                deploymentsWithPrefix.map(async (deployment) => {
                    return await octokit.request('DELETE /repos/{owner}/{repo}/deployments/{deployment_id}', {
                        ...repo,
                        deployment_id: deployment.id,
                    });
                })
            );
        });
}

main();
