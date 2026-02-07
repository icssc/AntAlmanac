# Workflows

## Check and Deploy New Quarter

The `check_new_quarter.yml` workflow automatically checks if new quarter's Schedule of Classes are available and pushes an updated `deployed_terms.json` directly to the `main` branch to trigger the redeploy of the app.

### Permissions Setup

Because `main` is a protected branch, this workflow uses a specific setup to bypass those protections securely:

1.  **Deploy Key (`DEPLOY_KEY`)**:
    -   We use an SSH key enabled within the repository scope, which has **Write access**. Authorized by Kevin Wu.
    -   This key is stored as a secret and used by the `actions/checkout` step to authenticate as a specific "Deploy Key" actor (instead of the generic `GITHUB_TOKEN` which does not have permissions to push directly to the main branch).

2.  **GitHub Rulesets**:
    -   The repository uses **Rulesets** to protect `main`.
    -   The ruleset is configured with a **Bypass List**, which the deploy key is added to. This explicitly allows the deploy key actor to push without a PR.

**Reference**: [sbellone/release-workflow-example](https://github.com/sbellone/release-workflow-example)