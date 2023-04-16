# AntAlmanac CDK

# Infrastructure Summary
- Backend
  - Lambda that runs the backend
  - DynamoDB for schedule data
  - Route53 for routing requests from a domain to the backend
- Frontend
  - S3 bucket for hosting the frontend
  - Route53 for routing requests from a domain to the frontend

# Note About Env Variables
Env variables are used to determine what version of a stack to deploy.
- If 'PR_NUM' exists, we deploy the staging version of a stack
  - If 'API_SUB_DOMAIN' is not 'dev', we deploy a staging version of the backend
- Otherwise we deploy the production version of a stack

# Running Locally
_There is almost no reason to run this locally unless you are developing the CDK itself._
1. `pnpm run build`
2. Deploy relevant stacks with `cdk deploy <stack-name>`
 