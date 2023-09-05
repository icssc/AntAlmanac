# AntAlmanac CDK

# Infrastructure Summary
- Backend
  - Lambda that runs the backend
  - DynamoDB for schedule data
  - Route53 for routing requests from a domain to the backend
- Frontend
  - S3 bucket for hosting the frontend (for staging and dev, prod is hosted on GitHub pages)
  - Route53 for routing requests from a domain to the frontend

# Note About environment Variables
Env variables are used to determine what version of a stack to deploy.
- If 'PR_NUM' exists, we deploy the staging version of a stack
  - If 'API_SUB_DOMAIN' is not 'dev', we deploy a staging version of the backend
- Otherwise we deploy the production version of a stack

# Running Locally
_There is almost no reason to run this locally unless you are developing the CDK itself._
1. `pnpm run build`
2. Deploy relevant stacks with `cdk deploy <stack-name>`
 

# Insights

## Why are there so many files?
Deploying individual stacks on GitHub Actions across separate jobs is easier to manage.
It's easier to deploy the stacks in parallel and view their progress individually
through the GitHub UI.
