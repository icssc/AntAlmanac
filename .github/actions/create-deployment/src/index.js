// @ts-check

import core from '@actions/core';
import github from '@actions/github';

const NAME_KEY = 'name';
const INACTIVE_STATE = 'inactive';
const IN_PROGRESS_STATE = 'in_progress';
// const SUCCESS_STATE = 'success';

/**
 * @see https://docs.github.com/en/actions/learn-github-actions/variables#default-environment-variables
 */
const REGEX = {
    BRANCH: /refs\/heads\/(.*)/,
    TAG: /refs\/tags\/(.*)/,

    // If the above two fail to match, then use GITHUB_HEAD_REF instead of regex match.
    PULL_REQUEST: /refs\/pull\/(\d+)\/merge/,
};

/**
 * If triggered by PUSH or TAG, return a regex match.
 * For pull requests, use the head ref.
 *
 * @returns {string} Current branch the action is running for.
 */
function getBranchName() {
    const ref = process.env['GITHUB_REF'] ?? '';

    const branchMatch = REGEX.BRANCH.exec(ref);
    if (branchMatch) {
        return branchMatch[1] ?? '';
    }

    const tagMatch = REGEX.TAG.exec(ref);
    if (tagMatch) {
        return tagMatch[1] ?? '';
    }

    return process.env['GITHUB_HEAD_REF'] ?? '';
}

async function main() {
    const token = core.getInput('GITHUB_TOKEN');
    const name = core.getInput('name');
    const environment = core.getInput('environment');
    const url = core.getInput('url');
    const ref = getBranchName();

    const octokit = github.getOctokit(token);

    const repo = github.context.repo;

    octokit.log.info('Creating deployment...');

    const response = await octokit.request('POST /repos/{owner}/{repo}/deployments', {
        ...repo,
        ref,
        environment,
        payload: {
            [NAME_KEY]: name,
        },
        auto_merge: false,
        required_contexts: [],
    });

    octokit.log.info('Create deployment response: ', response);

    if (response.status !== 201) {
        throw new Error('Could not create a deployment');
    }

    const deploymentId = response.data.id;

    octokit.log.info('Creating deployment status as in-progress...');

    await octokit.request('POST /repos/{owner}/{repo}/deployments/{deployment_id}/statuses', {
        ...repo,
        environment,
        deployment_id: deploymentId,
        state: IN_PROGRESS_STATE,
        environment_url: url,
        auto_inactive: false,
    });

    octokit.log.info('Create deployment status response: ', response);

    core.setOutput('deployment_id', deploymentId);

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
                return (
                    typeof deploymentName === 'string' &&
                    deploymentName.startsWith(name) &&
                    deployment.id !== deploymentId
                );
            });

            octokit.log.info('Found deployments with the same name: ', deploymentsWithPrefix);
            octokit.log.info('Setting matching deployments to inactive');

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

            octokit.log.info('Deleting matching deployments');

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

            octokit.log.info('Done deleting matching deployments');
        });
}

main();
