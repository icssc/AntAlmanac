# Workflows

## Check and Deploy New Quarter

The `check_new_quarter.yml` workflow runs hourly and checks whether a new quarter's Schedule of Classes is available or the section count of the latest term has changed. If either changed, it calls `deploy_production.yml` to redeploy the app with fresh term data.

The `get-latest-term` script reports the latest term and its section count. The workflow compares them with the last deployed state, a one-line file stored in the GitHub Actions cache under keys prefixed with `deployed-terms-`. Nothing is committed to the repo.

- If the cache entry is missing (for example, it was deleted or went unused for 7 days), the next run treats it as a change and redeploys once.
- If saving the new state fails, the `confirm-state-saved` job fails so the problem is visible. The deploy still runs.
- Deploys only run when the workflow runs on `main`.
- The state is saved before the deploy runs. If a deploy fails, use **Re-run failed jobs** to retry it. **Re-run all jobs** restores the state that was just saved, sees no change, and skips the deploy.
- To force a redeploy, delete the `deployed-terms-` entries under Actions → Caches, then run the workflow manually. `gh cache delete` removes one cache by its exact key or id, so delete each entry listed by `gh cache list`.

## Check and Update Department List

`check_departments.yml` is manual. It commits an updated `departments.json`. Because `main` is protected, a run that pushes to `main` checks out with the `DEPLOY_KEY` secret, an SSH deploy key with write access that is on the ruleset bypass list.
